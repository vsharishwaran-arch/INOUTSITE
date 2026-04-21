import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { pool } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';
import cloudinary from '../config/cloudinary.js';
import env from '../config/env.js';

const execFileAsync = promisify(execFile);
const useCloudinary = env.cloudinaryCloudName && env.cloudinaryApiKey && env.cloudinaryApiSecret;

function mapRow(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    videoUrl: row.video_url,
    thumbnailUrl: row.thumbnail_url || '',
    overlayText: row.overlay_text || '',
    price: row.price != null ? Number(row.price) : null,
    discountPrice: row.discount_price != null ? Number(row.discount_price) : null,
    sizes: row.sizes ? row.sizes.split(',').map(s => s.trim()).filter(Boolean) : [],
    productLink: row.product_link || '',
    likes: row.likes,
    views: row.views,
    sortOrder: row.sort_order,
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
  };
}

export const listVideos = asyncHandler(async (req, res) => {
  const isAdmin = req.user?.role === 'admin';
  const whereClause = isAdmin ? '' : 'WHERE is_active = TRUE';
  const [rows] = await pool.query(
    `SELECT * FROM shoppable_videos ${whereClause} ORDER BY sort_order ASC, created_at DESC`
  );
  res.json({ items: rows.map(mapRow) });
});

export const createVideo = asyncHandler(async (req, res) => {
  const { title, description, videoUrl, thumbnailUrl, overlayText, price, discountPrice, sizes, productLink, sortOrder } = req.body;

  if (!title || !videoUrl) {
    throw new HttpError(400, 'title and videoUrl are required');
  }

  const sizesStr = Array.isArray(sizes) ? sizes.join(',') : (sizes || 'S,M,L,XL');

  const [result] = await pool.execute(
    `INSERT INTO shoppable_videos
      (title, description, video_url, thumbnail_url, overlay_text, price, discount_price, sizes, product_link, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      title,
      description || '',
      videoUrl,
      thumbnailUrl || '',
      overlayText || 'Comment "7"',
      price != null ? Number(price) : null,
      discountPrice != null ? Number(discountPrice) : null,
      sizesStr,
      productLink || '',
      sortOrder != null ? Number(sortOrder) : 0,
    ]
  );

  const [rows] = await pool.query('SELECT * FROM shoppable_videos WHERE id = ?', [result.insertId]);
  res.status(201).json(mapRow(rows[0]));
});

export const updateVideo = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const [existing] = await pool.query('SELECT id FROM shoppable_videos WHERE id = ?', [id]);
  if (!existing.length) throw new HttpError(404, 'Video not found');

  const fields = [];
  const values = [];

  const set = (col, val) => { fields.push(`${col} = ?`); values.push(val); };

  if (req.body.title !== undefined) set('title', req.body.title);
  if (req.body.description !== undefined) set('description', req.body.description);
  if (req.body.videoUrl !== undefined) set('video_url', req.body.videoUrl);
  if (req.body.thumbnailUrl !== undefined) set('thumbnail_url', req.body.thumbnailUrl);
  if (req.body.overlayText !== undefined) set('overlay_text', req.body.overlayText);
  if (req.body.price !== undefined) set('price', req.body.price != null ? Number(req.body.price) : null);
  if (req.body.discountPrice !== undefined) set('discount_price', req.body.discountPrice != null ? Number(req.body.discountPrice) : null);
  if (req.body.sizes !== undefined) {
    const sizesStr = Array.isArray(req.body.sizes) ? req.body.sizes.join(',') : req.body.sizes;
    set('sizes', sizesStr);
  }
  if (req.body.productLink !== undefined) set('product_link', req.body.productLink);
  if (req.body.sortOrder !== undefined) set('sort_order', Number(req.body.sortOrder));
  if (req.body.isActive !== undefined) set('is_active', req.body.isActive ? 1 : 0);
  if (req.body.likes !== undefined) set('likes', Number(req.body.likes));
  if (req.body.views !== undefined) set('views', Number(req.body.views));

  if (!fields.length) throw new HttpError(400, 'No fields to update');

  values.push(id);
  await pool.execute(`UPDATE shoppable_videos SET ${fields.join(', ')} WHERE id = ?`, values);

  const [rows] = await pool.query('SELECT * FROM shoppable_videos WHERE id = ?', [id]);
  res.json(mapRow(rows[0]));
});

export const deleteVideo = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const [existing] = await pool.query('SELECT id FROM shoppable_videos WHERE id = ?', [id]);
  if (!existing.length) throw new HttpError(404, 'Video not found');
  await pool.execute('DELETE FROM shoppable_videos WHERE id = ?', [id]);
  res.json({ message: 'Video deleted' });
});

export const incrementViews = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await pool.execute('UPDATE shoppable_videos SET views = views + 1 WHERE id = ?', [id]);
  res.json({ ok: true });
});

export const uploadVideoFile = asyncHandler(async (req, res) => {
  if (!req.file) throw new HttpError(400, 'No video file provided');
  // Cloudinary: file has secure_url property
  // Local storage: file has filename property
  const url = req.file.secure_url || `/uploads/videos/${req.file.filename}`;
  res.json({ url });
});

/**
 * POST /videos/download-instagram
 * Accepts { url } — an Instagram reel/post URL.
 * Uses yt-dlp to download the video locally, then uploads to Cloudinary if configured.
 * Returns { url: Cloudinary URL or '/uploads/videos/ig-xxx.mp4' }.
 */
export const downloadInstagramVideo = asyncHandler(async (req, res) => {
  const { url } = req.body;
  if (!url) throw new HttpError(400, 'url is required');

  const match = url.match(/instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/);
  if (!match) throw new HttpError(400, 'Invalid Instagram URL');

  const shortcode = match[1];
  const dir = path.resolve(process.cwd(), 'uploads', 'videos');
  fs.mkdirSync(dir, { recursive: true });

  const filename = `ig-${shortcode}-${Date.now()}.mp4`;
  const outputPath = path.join(dir, filename);

  try {
    await execFileAsync('yt-dlp', [
      '--no-warnings',
      '--no-check-certificates',
      '-f', 'mp4/best',
      '--merge-output-format', 'mp4',
      '-o', outputPath,
      url,
    ], { timeout: 120_000 });
  } catch (err) {
    // yt-dlp may exit with code 1 due to harmless stderr warnings (e.g. urllib3)
    // even when the download itself succeeded — so check file first.
    if (!fs.existsSync(outputPath)) {
      const msg = err.stderr || err.message || '';
      if (/private|login|restricted/i.test(msg)) {
        throw new HttpError(422, 'This Instagram reel is private or restricted. Please download it manually and upload the MP4 file instead.');
      }
      if (/ENOENT/.test(msg) || /spawn/.test(msg)) {
        throw new HttpError(502, 'Auto-download is not available on this server. Please download the reel manually and upload the MP4 file instead.');
      }
      throw new HttpError(502, `Failed to download Instagram video: ${msg.slice(0, 300)}`);
    }
  }

  if (!fs.existsSync(outputPath)) {
    throw new HttpError(502, 'Download completed but video file was not found. Please upload the MP4 manually.');
  }

  try {
    if (useCloudinary) {
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(outputPath, {
        resource_type: 'video',
        folder: 'inout-fashion/videos',
        quality: 'auto',
      });
      // Delete local file after uploading
      fs.unlink(outputPath, () => {});
      res.json({ url: result.secure_url });
    } else {
      // Fallback to local storage
      res.json({ url: `/uploads/videos/${filename}` });
    }
  } catch (cloudinaryErr) {
    // If Cloudinary upload fails, fall back to local
    console.error('Cloudinary upload failed, using local storage:', cloudinaryErr.message);
    res.json({ url: `/uploads/videos/${filename}` });
  }
});
