import { z } from 'zod';
import { pool } from '../config/db.js';
import { HttpError } from '../utils/httpError.js';

export async function listCoupons(req, res) {
  const [rows] = await pool.query('SELECT * FROM coupons ORDER BY created_at DESC');
  res.json({
    items: rows.map(mapCoupon),
  });
}

export async function getCouponById(req, res) {
  const [rows] = await pool.query('SELECT * FROM coupons WHERE id = ?', [req.params.id]);
  if (!rows[0]) throw new HttpError(404, 'Coupon not found');
  res.json(mapCoupon(rows[0]));
}

export async function createCoupon(req, res) {
  const data = couponSchema.parse(req.body);

  const [existing] = await pool.query('SELECT id FROM coupons WHERE code = ?', [data.code.toUpperCase()]);
  if (existing.length > 0) throw new HttpError(409, 'Coupon code already exists');

  const [result] = await pool.query(
    `INSERT INTO coupons (code, type, value, min_order_amount, max_uses, is_active, starts_at, expires_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.code.toUpperCase(),
      data.type,
      data.value,
      data.minOrderAmount,
      data.maxUses || null,
      data.isActive,
      data.startsAt || null,
      data.expiresAt || null,
    ],
  );

  const [rows] = await pool.query('SELECT * FROM coupons WHERE id = ?', [result.insertId]);
  res.status(201).json({ message: 'Coupon created', coupon: mapCoupon(rows[0]) });
}

export async function updateCoupon(req, res) {
  const data = couponSchema.parse(req.body);

  const [result] = await pool.query(
    `UPDATE coupons SET code = ?, type = ?, value = ?, min_order_amount = ?, max_uses = ?,
     is_active = ?, starts_at = ?, expires_at = ? WHERE id = ?`,
    [
      data.code.toUpperCase(),
      data.type,
      data.value,
      data.minOrderAmount,
      data.maxUses || null,
      data.isActive,
      data.startsAt || null,
      data.expiresAt || null,
      req.params.id,
    ],
  );

  if (result.affectedRows === 0) throw new HttpError(404, 'Coupon not found');

  const [rows] = await pool.query('SELECT * FROM coupons WHERE id = ?', [req.params.id]);
  res.json({ message: 'Coupon updated', coupon: mapCoupon(rows[0]) });
}

export async function deleteCoupon(req, res) {
  const [result] = await pool.query('DELETE FROM coupons WHERE id = ?', [req.params.id]);
  if (result.affectedRows === 0) throw new HttpError(404, 'Coupon not found');
  res.json({ message: 'Coupon deleted' });
}

export async function validateCoupon(req, res) {
  const { code, subtotal } = req.body;
  if (!code) throw new HttpError(400, 'Coupon code is required');

  const [rows] = await pool.query('SELECT * FROM coupons WHERE code = ? AND is_active = TRUE', [code.toUpperCase()]);
  const coupon = rows[0];
  if (!coupon) throw new HttpError(404, 'Invalid coupon code');

  const now = new Date();
  if (coupon.starts_at && new Date(coupon.starts_at) > now) throw new HttpError(400, 'Coupon is not yet active');
  if (coupon.expires_at && new Date(coupon.expires_at) < now) throw new HttpError(400, 'Coupon has expired');
  if (coupon.max_uses && coupon.used_count >= coupon.max_uses) throw new HttpError(400, 'Coupon usage limit reached');
  if (subtotal && Number(subtotal) < Number(coupon.min_order_amount)) {
    throw new HttpError(400, `Minimum order amount is ₹${Number(coupon.min_order_amount).toFixed(2)}`);
  }

  let discount = 0;
  if (coupon.type === 'percentage') {
    discount = Math.round((Number(subtotal || 0) * Number(coupon.value)) / 100 * 100) / 100;
  } else {
    discount = Math.min(Number(coupon.value), Number(subtotal || 0));
  }

  res.json({
    valid: true,
    code: coupon.code,
    type: coupon.type,
    value: Number(coupon.value),
    discount,
  });
}

// ── Helpers ──
const couponSchema = z.object({
  code: z.string().min(2).max(50),
  type: z.enum(['percentage', 'fixed']),
  value: z.coerce.number().positive(),
  minOrderAmount: z.coerce.number().min(0).default(0),
  maxUses: z.coerce.number().int().positive().nullable().optional(),
  isActive: z.coerce.boolean().default(true),
  startsAt: z.string().nullable().optional(),
  expiresAt: z.string().nullable().optional(),
});

function mapCoupon(row) {
  return {
    id: String(row.id),
    code: row.code,
    type: row.type,
    value: Number(row.value),
    minOrderAmount: Number(row.min_order_amount),
    maxUses: row.max_uses ? Number(row.max_uses) : null,
    usedCount: Number(row.used_count),
    isActive: Boolean(row.is_active),
    startsAt: row.starts_at,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
  };
}
