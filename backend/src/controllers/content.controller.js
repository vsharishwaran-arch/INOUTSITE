import path from 'path';
import fs from 'fs';
import { pool } from '../config/db.js';
import { HttpError } from '../utils/httpError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import env from '../config/env.js';
import { logger } from '../utils/logger.js';

const VALID_SECTIONS = ['hero', 'announcement', 'usp', 'offer', 'categories'];

// Helper function to convert uploaded file to proper URL
function getUploadedFileUrl(file, resourceType = 'image') {
  if (!file) return null;
  
  logger.info(`🖼️ Processing content image file: ${JSON.stringify({
    filename: file.filename,
    secure_url: file.secure_url?.substring(0, 50),
    url: file.url?.substring(0, 50),
    public_id: file.public_id,
    originalname: file.originalname
  })}`);
  
  // Try Cloudinary properties in order of preference
  const possibleUrls = [
    file.secure_url,           // Cloudinary secure HTTPS URL
    file.url,                  // Cloudinary fallback URL
    file.path,                 // Sometimes Cloudinary uses path
    file.location,             // AWS S3 style
  ].filter(Boolean);
  
  if (possibleUrls.length > 0) {
    const selectedUrl = possibleUrls[0];
    logger.info(`✅ Using Cloudinary content image URL: ${selectedUrl}`);
    return selectedUrl;
  }
  
  // Local storage fallback
  if (file.filename) {
    const localPath = `/uploads/content/${file.filename}`;
    logger.info(`✅ Using local content filename: ${localPath}`);
    return localPath;
  }
  
  logger.error(`❌ No valid content image URL found. File: ${JSON.stringify(file)}`);
  return null;
}

// ── GET /api/content ──────────────────────────────────────────────────────
// Returns all sections as { section: { key: value } }
export const getAllContent = asyncHandler(async (_req, res) => {
  const [rows] = await pool.query(
    'SELECT section, key_name, value FROM homepage_content ORDER BY section, key_name',
  );
  const result = {};
  for (const row of rows) {
    if (!result[row.section]) result[row.section] = {};
    result[row.section][row.key_name] = row.value;
  }

  // HERO: Parse slides and ensure image field is always populated
  if (result.hero?.slides) {
    try {
      const slides = JSON.parse(result.hero.slides);
      logger.info(`🎨 Parsed hero slides: ${slides.length} slides`);
      
      // Map each slide to ensure image field is always present and valid
      const mappedSlides = slides.map((slide, idx) => {
        // Extract image from either image or images array
        const imageUrl = slide.image || (Array.isArray(slide.images) && slide.images[0]) || null;
        
        if (!imageUrl) {
          logger.warn(`⚠️ Hero slide ${idx} missing image field`);
        } else {
          logger.info(`✅ Hero slide ${idx} image: ${imageUrl.substring(0, 50)}...`);
        }

        return {
          ...slide,
          image: imageUrl || '' // Ensure image field always exists
        };
      });

      result.hero.slides = JSON.stringify(mappedSlides);
    } catch (e) {
      logger.error(`❌ Failed to parse hero slides JSON: ${e.message}`);
    }
  }

  // CATEGORIES: Parse items and ensure image field is always populated
  if (result.categories?.items) {
    try {
      const items = JSON.parse(result.categories.items);
      logger.info(`🏷️ Parsed categories: ${items.length} items`);
      
      // Map each category to ensure image field is always present and valid
      const mappedItems = items.map((item, idx) => {
        if (!item.image) {
          logger.warn(`⚠️ Category ${item.slug} missing image field`);
        } else {
          logger.info(`✅ Category ${item.slug} image: ${item.image.substring(0, 50)}...`);
        }

        return {
          ...item,
          image: item.image || '' // Ensure image field always exists
        };
      });

      result.categories.items = JSON.stringify(mappedItems);
    } catch (e) {
      logger.error(`❌ Failed to parse categories JSON: ${e.message}`);
    }
  }

  res.json(result);
});

// ── GET /api/content/:section ─────────────────────────────────────────────
export const getSectionContent = asyncHandler(async (req, res) => {
  const { section } = req.params;
  if (!VALID_SECTIONS.includes(section)) {
    throw new HttpError(400, `Invalid section. Valid: ${VALID_SECTIONS.join(', ')}`);
  }
  const [rows] = await pool.query(
    'SELECT key_name, value FROM homepage_content WHERE section = ?',
    [section],
  );
  const result = {};
  for (const row of rows) {
    result[row.key_name] = row.value;
  }

  // HERO: Parse slides and ensure image field is always populated
  if (section === 'hero' && result.slides) {
    try {
      const slides = JSON.parse(result.slides);
      logger.info(`🎨 Parsed hero slides (getSectionContent): ${slides.length} slides`);
      
      // Map each slide to ensure image field is always present and valid
      const mappedSlides = slides.map((slide, idx) => {
        // Extract image from either image or images array
        const imageUrl = slide.image || (Array.isArray(slide.images) && slide.images[0]) || null;
        
        if (!imageUrl) {
          logger.warn(`⚠️ Hero slide ${idx} missing image field`);
        } else {
          logger.info(`✅ Hero slide ${idx} image: ${imageUrl.substring(0, 50)}...`);
        }

        return {
          ...slide,
          image: imageUrl || '' // Ensure image field always exists
        };
      });

      result.slides = JSON.stringify(mappedSlides);
    } catch (e) {
      logger.error(`❌ Failed to parse hero slides JSON: ${e.message}`);
    }
  }

  // CATEGORIES: Parse items and ensure image field is always populated
  if (section === 'categories' && result.items) {
    try {
      const items = JSON.parse(result.items);
      logger.info(`🏷️ Parsed categories (getSectionContent): ${items.length} items`);
      
      // Map each category to ensure image field is always present and valid
      const mappedItems = items.map((item, idx) => {
        if (!item.image) {
          logger.warn(`⚠️ Category ${item.slug} missing image field`);
        } else {
          logger.info(`✅ Category ${item.slug} image: ${item.image.substring(0, 50)}...`);
        }

        return {
          ...item,
          image: item.image || '' // Ensure image field always exists
        };
      });

      result.items = JSON.stringify(mappedItems);
    } catch (e) {
      logger.error(`❌ Failed to parse categories JSON: ${e.message}`);
    }
  }

  res.json(result);
});

// ── PUT /api/content/:section ─────────────────────────────────────────────
// Body: flat object { key_name: value, ... }
// Upserts each key for the given section.
export const updateSectionContent = asyncHandler(async (req, res) => {
  const { section } = req.params;
  if (!VALID_SECTIONS.includes(section)) {
    throw new HttpError(400, `Invalid section. Valid: ${VALID_SECTIONS.join(', ')}`);
  }

  const body = req.body;
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new HttpError(400, 'Request body must be a plain key-value object');
  }

  const entries = Object.entries(body).filter(([, v]) => v !== undefined);
  if (entries.length === 0) {
    throw new HttpError(400, 'No fields provided to update');
  }

  // Upsert each key (PostgreSQL ON CONFLICT syntax)
  for (const [key_name, value] of entries) {
    await pool.query(
      `INSERT INTO homepage_content (section, key_name, value)
       VALUES (?, ?, ?)
       ON CONFLICT (section, key_name) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP`,
      [section, key_name, String(value)],
    );
  }

  res.json({ success: true, section, updated: entries.length });
});

// ── POST /api/content/upload ──────────────────────────────────────────────
// Accepts a single image file (field name: "image")
// Returns { path: Cloudinary URL or '/uploads/content/filename.ext' }
export const handleContentImageUpload = asyncHandler(async (req, res) => {
  logger.info(`🖼️ Content image upload called`);
  logger.info(`🖼️ req.file exists: ${req.file ? 'yes' : 'no'}`);
  
  if (!req.file) {
    logger.error(`❌ No image file provided`);
    throw new HttpError(400, 'No image file provided (field name must be "image")');
  }
  
  logger.info(`🖼️ Processing uploaded content image: ${JSON.stringify({
    filename: req.file.filename,
    secure_url: req.file.secure_url?.substring(0, 50),
    url: req.file.url?.substring(0, 50),
    mimetype: req.file.mimetype
  })}`);
  
  const imagePath = getUploadedFileUrl(req.file, 'image');
  if (!imagePath) {
    logger.error(`❌ Content image upload failed - unable to generate URL`);
    throw new HttpError(500, 'Failed to generate image URL');
  }
  
  logger.info(`✅ Successfully uploaded content image: ${imagePath}`);
  res.status(201).json({ path: imagePath });
});

// ── DELETE /api/content/image ─────────────────────────────────────────────
// Body: { path: '/uploads/content/filename.ext' }
// Removes the file from disk (only content uploads, not products)
export const deleteContentImage = asyncHandler(async (req, res) => {
  const { path: filePath } = req.body;
  if (!filePath || typeof filePath !== 'string') {
    throw new HttpError(400, 'path is required');
  }
  if (!filePath.startsWith('/uploads/content/')) {
    throw new HttpError(403, 'Can only delete files under /uploads/content/');
  }
  const fullPath = path.resolve(process.cwd(), filePath.slice(1));
  fs.unlink(fullPath, () => {}); // fire and forget — file may not exist
  res.json({ success: true });
});
