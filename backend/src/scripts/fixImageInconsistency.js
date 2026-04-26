/**
 * IMAGE CONSISTENCY FIX SCRIPT
 * 
 * Diagnoses and fixes image data inconsistencies:
 * - Old products: image_path set, images_json may be empty
 * - New products: images_json set, image_path may be empty
 * 
 * This script ensures all products have both fields populated correctly
 */

import { pool } from '../config/db.js';

async function diagnoseImageInconsistencies() {
  console.log('🔍 Starting image consistency diagnosis...\n');

  const [products] = await pool.query(`
    SELECT 
      id, 
      name, 
      image_path, 
      images_json,
      CHAR_LENGTH(image_path) as image_path_len,
      CHAR_LENGTH(images_json) as images_json_len,
      created_at
    FROM products
    ORDER BY created_at DESC
  `);

  const issues = {
    missing_both: [],
    only_image_path: [],
    only_images_json: [],
    both_set: [],
    total: products.length,
  };

  let sampleData = [];

  for (const product of products) {
    const hasImagePath = !!product.image_path && product.image_path.trim();
    const hasImagesJson = !!product.images_json && product.images_json.trim();

    if (!hasImagePath && !hasImagesJson) {
      issues.missing_both.push(product.id);
    } else if (hasImagePath && !hasImagesJson) {
      issues.only_image_path.push(product.id);
    } else if (!hasImagePath && hasImagesJson) {
      issues.only_images_json.push(product.id);
    } else {
      issues.both_set.push(product.id);
    }

    // Collect sample for logging
    if (sampleData.length < 5) {
      sampleData.push({
        id: product.id,
        name: product.name.substring(0, 40),
        image_path: hasImagePath ? '✓' : '✗',
        images_json: hasImagesJson ? '✓' : '✗',
        created_at: product.created_at,
      });
    }
  }

  console.log('📊 DIAGNOSIS RESULTS:\n');
  console.log(`Total Products: ${issues.total}`);
  console.log(`✓ Both image_path AND images_json set: ${issues.both_set.length}`);
  console.log(`⚠️  Only image_path (old format): ${issues.only_image_path.length}`);
  console.log(`⚠️  Only images_json (new format): ${issues.only_images_json.length}`);
  console.log(`❌ Missing BOTH image_path and images_json: ${issues.missing_both.length}`);

  console.log('\n📋 SAMPLE DATA:');
  console.table(sampleData);

  return issues;
}

async function fixImageInconsistencies() {
  console.log('\n🔧 Starting image consistency fix...\n');

  try {
    // Fix 1: For products with only image_path (old format)
    // Copy image_path into images_json as a single-element array
    await pool.query(`
      UPDATE products
      SET images_json = jsonb_build_array(image_path)::text
      WHERE (images_json IS NULL 
        OR images_json = ''
        OR images_json = '[]'
        OR images_json = 'null')
        AND image_path IS NOT NULL 
        AND image_path <> ''
    `);

    console.log(`✓ Fixed products with only image_path`);

    // Fix 2: For products with images_json but no image_path
    // Set image_path to the first image in the JSON array
    const [products] = await pool.query(`
      SELECT id, images_json
      FROM products
      WHERE (image_path IS NULL OR image_path = '')
        AND images_json IS NOT NULL 
        AND images_json <> ''
        AND images_json <> '[]'
        AND images_json <> 'null'
    `);

    let fixedCount = 0;
    for (const product of products) {
      try {
        const images = Array.isArray(product.images_json) ? product.images_json : JSON.parse(product.images_json);
        if (Array.isArray(images) && images.length > 0) {
          const firstImage = images[0];
          if (typeof firstImage === 'string' && firstImage.length > 0) {
            await pool.query(
              'UPDATE products SET image_path = ? WHERE id = ?',
              [firstImage, product.id]
            );
            fixedCount++;
          }
        }
      } catch (e) {
        console.error(`❌ Failed to parse images_json for product ${product.id}: ${e.message}`);
      }
    }

    console.log(`✓ Fixed ${fixedCount} products with only images_json`);

    // Fix 3: Validate and repair any invalid JSON
    const [invalidJson] = await pool.query(`
      SELECT id, images_json FROM products
      WHERE images_json IS NOT NULL 
        AND images_json <> ''
        AND images_json <> '[]'
        AND images_json <> 'null'
    `);

    let validatedCount = 0;
    let repairCount = 0;

    for (const product of invalidJson) {
      try {
        const parsed = Array.isArray(product.images_json) ? product.images_json : JSON.parse(product.images_json);
        if (Array.isArray(parsed)) {
          validatedCount++;
        }
      } catch (e) {
        console.warn(`⚠️  Invalid JSON in product ${product.id}`);
        
        // Try to repair: if image_path exists, reset images_json to array
        const [record] = await pool.query(
          'SELECT image_path FROM products WHERE id = ?',
          [product.id]
        );
        
        if (record[0]?.image_path && record[0].image_path.length > 0) {
          await pool.query(
            'UPDATE products SET images_json = ? WHERE id = ?',
            [JSON.stringify([record[0].image_path]), product.id]
          );
          repairCount++;
          console.log(`✓ Repaired product ${product.id}`);
        }
      }
    }

    console.log(`✓ Validated ${validatedCount} products with valid JSON`);
    console.log(`✓ Repaired ${repairCount} products with invalid JSON`);
  } catch (error) {
    throw error;
  }
}

async function verifyFix() {
  console.log('\n✅ VERIFICATION - Checking after fix...\n');

  const [verify] = await pool.query(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN image_path IS NOT NULL AND image_path <> '' AND 
               images_json IS NOT NULL AND images_json <> '' 
          THEN 1 ELSE 0 END) as both_set,
      SUM(CASE WHEN (image_path IS NULL OR image_path = '') 
          THEN 1 ELSE 0 END) as missing_image_path,
      SUM(CASE WHEN (images_json IS NULL OR images_json = '') 
          THEN 1 ELSE 0 END) as missing_images_json
    FROM products
  `);

  const stats = verify[0];
  console.log(`Total Products: ${parseInt(stats.total)}`);
  console.log(`Both image_path AND images_json: ${parseInt(stats.both_set) || 0}`);
  console.log(`Missing image_path: ${parseInt(stats.missing_image_path) || 0}`);
  console.log(`Missing images_json: ${parseInt(stats.missing_images_json) || 0}`);

  if (parseInt(stats.missing_image_path) == 0 && parseInt(stats.missing_images_json) == 0) {
    console.log('\n✅ ALL PRODUCTS NOW HAVE BOTH FIELDS SET!');
  } else {
    console.log('\n⚠️  Some products still have missing fields');
  }
}

async function main() {
  try {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  IMAGE CONSISTENCY DIAGNOSIS & FIX SCRIPT');
    console.log('═══════════════════════════════════════════════════════════════\n');

    // Step 1: Diagnose
    const issues = await diagnoseImageInconsistencies();

    // Step 2: Fix
    if (issues.only_image_path.length > 0 || issues.only_images_json.length > 0) {
      await fixImageInconsistencies();
    } else {
      console.log('\n✓ No inconsistencies found, all products properly configured');
    }

    // Step 3: Verify
    await verifyFix();

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('  SCRIPT COMPLETED ✓');
    console.log('═══════════════════════════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
