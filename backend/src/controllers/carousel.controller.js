import fs from 'fs';
import path from 'path';
import { pool } from '../config/db.js';
import { HttpError } from '../utils/httpError.js';
import env from '../config/env.js';

// Helper function to convert uploaded file to proper URL
function getUploadedFileUrl(file, resourceType = 'image') {
  if (!file) return null;
  
  // Cloudinary storage sets file.path as the public_id
  if (file.path && !file.path.startsWith('/uploads')) {
    // Build Cloudinary URL: https://res.cloudinary.com/{cloud_name}/video/upload/{public_id}
    return `https://res.cloudinary.com/${env.cloudinaryCloudName}/${resourceType}/upload/${file.path}`;
  }
  
  // Fallback for direct secure_url property
  if (file.secure_url) {
    return file.secure_url;
  }
  
  // Local storage fallback
  if (file.filename) {
    return `/uploads/carousel/${file.filename}`;
  }
  
  return null;
}

function removeUploadedFile(filePath) {
  if (!filePath || !filePath.startsWith('/uploads/')) return;
  const fullPath = path.resolve(process.cwd(), filePath.slice(1));
  fs.unlink(fullPath, () => {});
}

// ── List all carousel items (public) ──
export async function listCarouselItems(req, res) {
  const [rows] = await pool.query(`
    SELECT
      c.id, c.type, c.product_id, c.media_url, c.title, c.subtitle,
      c.link_url, c.sort_order,
      p.name   AS product_name,
      p.price  AS product_price,
      p.discount_price AS product_discount_price,
      p.image_path AS product_image
    FROM carousel_items c
    LEFT JOIN products p ON c.product_id = p.id
    ORDER BY c.sort_order ASC, c.id ASC
    LIMIT 6
  `);

  const items = rows.map(r => ({
    id: r.id,
    type: r.type,
    productId: r.product_id ? String(r.product_id) : null,
    mediaUrl: r.media_url || null,
    title: r.type === 'product' ? (r.product_name || r.title) : r.title,
    subtitle: r.type === 'product'
      ? `₹${r.product_discount_price || r.product_price}`
      : r.subtitle,
    image: r.type === 'product' ? (r.product_image || '') : (r.media_url || ''),
    linkUrl: r.type === 'product' ? `/product/${r.product_id}` : r.link_url,
    sortOrder: r.sort_order,
  }));

  res.json({ items });
}

// ── Add a product to carousel ──
export async function addProductToCarousel(req, res) {
  const { productId, sortOrder } = req.body;
  if (!productId) throw new HttpError(400, 'productId is required');

  await enforceLimit();

  const [existing] = await pool.query('SELECT id FROM products WHERE id = ?', [productId]);
  if (!existing[0]) throw new HttpError(404, 'Product not found');

  const [dup] = await pool.query(
    'SELECT id FROM carousel_items WHERE type = ? AND product_id = ?',
    ['product', productId],
  );
  if (dup[0]) throw new HttpError(400, 'Product already in carousel');

  await pool.query(
    'INSERT INTO carousel_items (type, product_id, sort_order) VALUES (?, ?, ?)',
    ['product', productId, sortOrder ?? 0],
  );

  res.status(201).json({ message: 'Product added to carousel' });
}

// ── Upload image to carousel ──
export async function addImageToCarousel(req, res) {
  if (!req.file) throw new HttpError(400, 'Image file is required');

  await enforceLimit();

  const mediaUrl = getUploadedFileUrl(req.file, 'image');
  if (!mediaUrl) throw new HttpError(500, 'Failed to generate image URL');
  const title = req.body.title || '';
  const subtitle = req.body.subtitle || '';
  const linkUrl = req.body.linkUrl || '';
  const sortOrder = req.body.sortOrder ?? 0;

  await pool.query(
    'INSERT INTO carousel_items (type, media_url, title, subtitle, link_url, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
    ['image', mediaUrl, title, subtitle, linkUrl, sortOrder],
  );

  res.status(201).json({ message: 'Image added to carousel' });
}

// ── Upload video to carousel ──
export async function addVideoToCarousel(req, res) {
  if (!req.file) throw new HttpError(400, 'Video file is required');

  await enforceLimit();

  const mediaUrl = getUploadedFileUrl(req.file, 'video');
  if (!mediaUrl) throw new HttpError(500, 'Failed to generate video URL');
  const title = req.body.title || '';
  const subtitle = req.body.subtitle || '';
  const linkUrl = req.body.linkUrl || '';
  const sortOrder = req.body.sortOrder ?? 0;

  await pool.query(
    'INSERT INTO carousel_items (type, media_url, title, subtitle, link_url, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
    ['video', mediaUrl, title, subtitle, linkUrl, sortOrder],
  );

  res.status(201).json({ message: 'Video added to carousel' });
}

// ── Update a carousel item ──
export async function updateCarouselItem(req, res) {
  const { id } = req.params;
  const [rows] = await pool.query('SELECT * FROM carousel_items WHERE id = ?', [id]);
  if (!rows[0]) throw new HttpError(404, 'Carousel item not found');

  const { title, subtitle, linkUrl, sortOrder } = req.body;
  await pool.query(
    'UPDATE carousel_items SET title = ?, subtitle = ?, link_url = ?, sort_order = ? WHERE id = ?',
    [title ?? rows[0].title, subtitle ?? rows[0].subtitle, linkUrl ?? rows[0].link_url, sortOrder ?? rows[0].sort_order, id],
  );

  res.json({ message: 'Carousel item updated' });
}

// ── Delete a carousel item ──
export async function deleteCarouselItem(req, res) {
  const { id } = req.params;
  const [rows] = await pool.query('SELECT * FROM carousel_items WHERE id = ?', [id]);
  if (!rows[0]) throw new HttpError(404, 'Carousel item not found');

  // Remove uploaded file if it's image/video
  if (rows[0].type !== 'product' && rows[0].media_url) {
    removeUploadedFile(rows[0].media_url);
  }

  await pool.query('DELETE FROM carousel_items WHERE id = ?', [id]);
  res.json({ message: 'Carousel item removed' });
}

// ── Reorder carousel items ──
export async function reorderCarousel(req, res) {
  const { order } = req.body; // [{id, sortOrder}]
  if (!Array.isArray(order)) throw new HttpError(400, 'order array is required');

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    for (const item of order) {
      await connection.query('UPDATE carousel_items SET sort_order = ? WHERE id = ?', [item.sortOrder, item.id]);
    }
    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }

  res.json({ message: 'Carousel reordered' });
}

async function enforceLimit() {
  const [rows] = await pool.query('SELECT COUNT(*) as cnt FROM carousel_items');
  if (rows[0].cnt >= 6) {
    throw new HttpError(400, 'Maximum 6 carousel items allowed. Remove one first.');
  }
}
