import fs from 'fs/promises';
import path from 'path';
import app from './app.js';
import env from './config/env.js';
import { pool } from './config/db.js';

/**
 * Run the PostgreSQL schema.sql file on startup.
 * All tables use CREATE TABLE IF NOT EXISTS, so this is safe to run repeatedly.
 * Splits on ; to execute each statement individually (pg doesn't support multi-statement strings).
 */
async function ensureSchema() {
  const schemaPath = path.resolve(process.cwd(), 'src', 'sql', 'schema.sql');
  const schemaSql = await fs.readFile(schemaPath, 'utf8');

  // Split on semicolons, strip comment lines, filter blank statements
  const statements = schemaSql
    .split(';')
    .map(s =>
      s.split('\n')
        .filter(line => !line.trim().startsWith('--'))
        .join('\n')
        .trim()
    )
    .filter(s => s.length > 0);

  for (const statement of statements) {
    await pool.query(statement);
  }

  console.log('Schema applied successfully');
}

async function fixSequences() {
  const tables = ['products', 'users', 'orders', 'order_items', 'carts', 'cart_items', 'coupons', 'reviews', 'carousel_items', 'shoppable_videos'];
  for (const table of tables) {
    try {
      const [rows] = await pool.query(`SELECT MAX(id) as max_id FROM ${table}`);
      const max = rows[0]?.max_id;
      if (max) {
        await pool.query(`SELECT setval('${table}_id_seq', ${max})`);
      }
    } catch (err) {
      // Silently skip if sequence fix fails (table might not have sequences)
      console.log(`Skipping sequence fix for ${table}`);
    }
  }
}

async function fixReviewsTable() {
  try {
    // Check if product_id is currently NOT NULL
    const [columns] = await pool.query(`
      SELECT column_name, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'reviews' AND column_name = 'product_id'
    `);

    if (columns.length === 0) {
      console.log('reviews table does not exist - skipping migration');
      return;
    }

    const isNullable = columns[0].is_nullable === 'YES';

    if (isNullable) {
      console.log('reviews.product_id is already nullable - skipping migration');
      return;
    }

    console.log('Migrating reviews table: making product_id nullable...');
    
    // Alter product_id to allow NULL
    await pool.query('ALTER TABLE reviews ALTER COLUMN product_id DROP NOT NULL');
    console.log(' product_id is now nullable');

    // Drop the old foreign key constraint
    try {
      await pool.query('ALTER TABLE reviews DROP CONSTRAINT fk_review_product');
      console.log(' Old foreign key constraint dropped');
    } catch (err) {
      // Constraint might not exist or have different name
      console.log('Note: Could not drop old constraint (may not exist)');
    }

    // Add the new foreign key constraint with ON DELETE SET NULL
    try {
      await pool.query(`
        ALTER TABLE reviews
        ADD CONSTRAINT fk_review_product
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
      `);
      console.log(' New foreign key constraint added');
    } catch (err) {
      // Constraint might already exist
      console.log('Note: Could not add new constraint (may already exist)');
    }

    console.log(' Reviews table migration completed');
  } catch (error) {
    console.error('Failed to migrate reviews table:', error.message);
    // Don't fail startup - this is a non-critical migration
  }
}

async function start() {
  try {
    await pool.query('SELECT 1');
    console.log('Database connected successfully');
    await ensureSchema();
    await fixSequences();
    await fixReviewsTable();
    app.listen(env.port, () => {
      console.log(`API server listening on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error('Failed to start backend server');
    console.error(error);
    process.exit(1);
  }
}

start();