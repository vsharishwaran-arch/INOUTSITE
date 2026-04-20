import path from 'path';
import fs from 'fs';
import { pool } from '../config/db.js';
import { HttpError } from '../utils/httpError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const VALID_SECTIONS = ['hero', 'announcement', 'usp', 'offer', 'categories'];

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

  // Upsert each key
  for (const [key_name, value] of entries) {
    await pool.query(
      `INSERT INTO homepage_content (section, key_name, value)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE value = VALUES(value), updated_at = CURRENT_TIMESTAMP`,
      [section, key_name, String(value)],
    );
  }

  res.json({ success: true, section, updated: entries.length });
});

// ── POST /api/content/upload ──────────────────────────────────────────────
// Accepts a single image file (field name: "image")
// Returns { path: '/uploads/content/filename.ext' }
export const handleContentImageUpload = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new HttpError(400, 'No image file provided (field name must be "image")');
  }
  const imagePath = `/uploads/content/${req.file.filename}`;
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
