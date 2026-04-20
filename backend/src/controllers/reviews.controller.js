import { z } from 'zod';
import { pool } from '../config/db.js';
import { HttpError } from '../utils/httpError.js';

export async function listPublicReviews(req, res) {
  const limit = Math.min(Number(req.query.limit) || 4, 20);
  const [rows] = await pool.query(
    `SELECT r.id, r.customer_name, r.rating, r.comment, r.created_at,
            COALESCE(r.product_name, p.name) AS product_name
     FROM reviews r
     LEFT JOIN products p ON p.id = r.product_id
     WHERE r.is_approved = 1
     ORDER BY r.created_at DESC
     LIMIT ?`,
    [limit],
  );
  res.json({ items: rows.map(r => ({
    id: String(r.id),
    customerName: r.customer_name,
    rating: Number(r.rating),
    comment: r.comment,
    productName: r.product_name || '',
    createdAt: r.created_at,
  })) });
}

export async function listReviews(req, res) {
  const productId = req.query.productId;
  const approved = req.query.approved;

  let whereClause = '';
  const params = [];

  const conditions = [];
  if (productId) {
    conditions.push('r.product_id = ?');
    params.push(productId);
  }
  if (approved !== undefined) {
    conditions.push('r.is_approved = ?');
    params.push(approved === 'true' ? 1 : 0);
  }
  if (conditions.length) whereClause = `WHERE ${conditions.join(' AND ')}`;

  const [rows] = await pool.query(
    `SELECT r.*, r.product_name AS custom_product_name, COALESCE(r.product_name, p.name) AS product_name
     FROM reviews r
     LEFT JOIN products p ON p.id = r.product_id
     ${whereClause}
     ORDER BY r.created_at DESC`,
    params,
  );

  res.json({
    items: rows.map(mapReview),
  });
}

export async function approveReview(req, res) {
  const [result] = await pool.query(
    'UPDATE reviews SET is_approved = TRUE WHERE id = ?',
    [req.params.id],
  );
  if (result.affectedRows === 0) throw new HttpError(404, 'Review not found');
  res.json({ message: 'Review approved' });
}

export async function deleteReview(req, res) {
  const [result] = await pool.query('DELETE FROM reviews WHERE id = ?', [req.params.id]);
  if (result.affectedRows === 0) throw new HttpError(404, 'Review not found');
  res.json({ message: 'Review deleted' });
}

export async function createReview(req, res) {
  const schema = z.object({
    productId: z.coerce.number().int().positive(),
    customerName: z.string().min(1),
    customerEmail: z.string().email(),
    rating: z.coerce.number().int().min(1).max(5),
    comment: z.string().optional().default(''),
  });

  const data = schema.parse(req.body);

  const [result] = await pool.query(
    `INSERT INTO reviews (product_id, customer_name, customer_email, rating, comment)
     VALUES (?, ?, ?, ?, ?)`,
    [data.productId, data.customerName, data.customerEmail, data.rating, data.comment],
  );

  res.status(201).json({ message: 'Review submitted for moderation', reviewId: String(result.insertId) });
}

export async function updateReview(req, res) {
  const { id } = req.params;
  const { customerName, rating, comment, productName } = req.body;
  const [result] = await pool.query(
    `UPDATE reviews SET
       customer_name = COALESCE(?, customer_name),
       rating = COALESCE(?, rating),
       comment = COALESCE(?, comment),
       product_name = COALESCE(?, product_name)
     WHERE id = ?`,
    [customerName ?? null, rating ?? null, comment ?? null, productName ?? null, id],
  );
  if (result.affectedRows === 0) throw new HttpError(404, 'Review not found');
  res.json({ message: 'Review updated' });
}

export async function adminCreateReview(req, res) {
  const schema = z.object({
    customerName: z.string().min(1),
    rating: z.coerce.number().int().min(1).max(5),
    comment: z.string().optional().default(''),
    productName: z.string().optional().default(''),
  });
  const data = schema.parse(req.body);
  // Insert with NULL product_id (admin-created, no product link required)
  const [result] = await pool.query(
    `INSERT INTO reviews (product_id, product_name, customer_name, customer_email, rating, comment, is_approved)
     VALUES (NULL, ?, ?, ?, ?, ?, 1)`,
    [data.productName || null, data.customerName, 'admin@inoutfashion.in', data.rating, data.comment],
  );
  res.status(201).json({ message: 'Review created', reviewId: String(result.insertId) });
}

function mapReview(row) {
  return {
    id: String(row.id),
    productId: String(row.product_id),
    productName: row.product_name || '',
    customProductName: row.custom_product_name || '',
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    rating: Number(row.rating),
    comment: row.comment,
    isApproved: Boolean(row.is_approved),
    createdAt: row.created_at,
  };
}
