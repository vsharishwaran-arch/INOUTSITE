import { z } from 'zod';
import { pool } from '../config/db.js';
import { HttpError } from '../utils/httpError.js';
import { getCached, setCached, invalidateCache } from '../services/cache.service.js';
import { logger } from '../utils/logger.js';

export async function listPublicReviews(req, res) {
  const limit = Math.min(Number(req.query.limit) || 4, 20);
  const cacheKey = `reviews:public:${limit}`;
  
  try {
    logger.info(`⭐ Fetching public reviews (limit: ${limit})`);
    
    // Check cache first
    const cached = getCached(cacheKey);
    if (cached) {
      logger.info(`✅ Returning cached reviews (${cached.length} items)`);
      return res.json({ items: cached });
    }

    // Simplified query to debug any issues
    let rows;
    try {
      const result = await pool.query(
        `SELECT r.id, r.customer_name, r.rating, r.comment, r.created_at,
                COALESCE(r.product_name, p.name) AS product_name
         FROM reviews r
         LEFT JOIN products p ON p.id = r.product_id
         WHERE r.is_approved = true
         ORDER BY r.created_at DESC
         LIMIT $1`,
        [limit],
      );
      rows = result[0];
    } catch (queryErr) {
      logger.error(`❌ Query failed: ${queryErr.message}`);
      // Try simpler query to debug
      const simpleResult = await pool.query(
        `SELECT id, customer_name, rating, comment, created_at FROM reviews WHERE is_approved = true ORDER BY created_at DESC LIMIT $1`,
        [limit],
      );
      rows = simpleResult[0];
    }

    logger.info(`✅ Retrieved ${rows.length} public reviews from DB`);

    const items = rows.map(r => ({
      id: String(r.id),
      customerName: r.customer_name,
      rating: Number(r.rating),
      comment: r.comment,
      productName: r.product_name || '',
      createdAt: r.created_at,
    }));

    // Cache for 15 minutes
    setCached(cacheKey, items, 15 * 60 * 1000);
    logger.info(`✅ Cached ${items.length} reviews`);

    res.json({ items });
  } catch (err) {
    logger.error(`❌ Public reviews list error: ${err.message}`);
    logger.error(`❌ Stack: ${err.stack}`);
    throw err;
  }
}

export async function listReviews(req, res) {
  const productId = req.query.productId;
  const approved = req.query.approved;

  let whereClause = '';
  const params = [];
  let paramIndex = 1;

  const conditions = [];
  if (productId) {
    conditions.push(`r.product_id = $${paramIndex++}`);
    params.push(productId);
  }
  if (approved !== undefined) {
    conditions.push(`r.is_approved = $${paramIndex++}`);
    params.push(approved === 'true');
  }
  if (conditions.length) whereClause = `WHERE ${conditions.join(' AND ')}`;

  try {
    logger.info(`📋 Fetching reviews: productId=${productId}, approved=${approved}`);
    
    const [rows] = await pool.query(
      `SELECT r.id, r.product_id, r.product_name, r.customer_name, r.customer_email, r.rating, r.comment, r.is_approved, r.created_at,
              COALESCE(r.product_name, p.name) AS resolved_product_name
       FROM reviews r
       LEFT JOIN products p ON p.id = r.product_id
       ${whereClause}
       ORDER BY r.created_at DESC`,
      params,
    );

    logger.info(`✅ Retrieved ${rows.length} reviews`);

    const items = rows.map(row => {
      const mapped = mapReview(row);
      // If review doesn't have a product_name but we resolved one from products table, use it
      if (!mapped.productName && row.resolved_product_name) {
        mapped.productName = row.resolved_product_name;
      }
      return mapped;
    });

    res.json({ items });
  } catch (err) {
    logger.error(`❌ Reviews list error: ${err.message}`);
    logger.error(`❌ Stack: ${err.stack}`);
    throw err;
  }
}

export async function approveReview(req, res) {
  try {
    logger.info(`✅ Approving review ${req.params.id}`);
    const [result] = await pool.query(
      'UPDATE reviews SET is_approved = true WHERE id = $1',
      [req.params.id],
    );
    if (result.affectedRows === 0) {
      logger.warn(`⚠️ Review ${req.params.id} not found`);
      throw new HttpError(404, 'Review not found');
    }
    
    // Invalidate public reviews cache
    invalidateCache('reviews:public:*');
    logger.info(`✅ Review ${req.params.id} approved and cache invalidated`);
    
    res.json({ message: 'Review approved' });
  } catch (err) {
    logger.error(`❌ Approve review error: ${err.message}`);
    throw err;
  }
}

export async function deleteReview(req, res) {
  try {
    logger.info(`🗑️ Deleting review ${req.params.id}`);
    const [result] = await pool.query('DELETE FROM reviews WHERE id = $1', [req.params.id]);
    if (result.affectedRows === 0) {
      logger.warn(`⚠️ Review ${req.params.id} not found`);
      throw new HttpError(404, 'Review not found');
    }
    logger.info(`✅ Review ${req.params.id} deleted`);
    res.json({ message: 'Review deleted' });
  } catch (err) {
    logger.error(`❌ Delete review error: ${err.message}`);
    throw err;
  }
}

export async function createReview(req, res) {
  try {
    logger.info(`📝 Creating new review`);
    const schema = z.object({
      productId: z.coerce.number().int().positive(),
      customerName: z.string().min(1),
      customerEmail: z.string().email(),
      rating: z.coerce.number().int().min(1).max(5),
      comment: z.string().optional().default(''),
    });

    const data = schema.parse(req.body);
    logger.info(`✅ Review data validated`);

    const [result] = await pool.query(
      `INSERT INTO reviews (product_id, customer_name, customer_email, rating, comment)
       VALUES ($1, $2, $3, $4, $5)`,
      [data.productId, data.customerName, data.customerEmail, data.rating, data.comment],
    );

    // Invalidate public reviews cache when new review is added (even if not approved yet)
    invalidateCache('reviews:public:*');
    logger.info(`✅ Review created with ID ${result.insertId}`);

    res.status(201).json({ message: 'Review submitted for moderation', reviewId: String(result.insertId) });
  } catch (err) {
    logger.error(`❌ Create review error: ${err.message}`);
    throw err;
  }
}

export async function updateReview(req, res) {
  try {
    const { id } = req.params;
    logger.info(`✏️ Updating review ${id}`);
    const { customerName, rating, comment, productName } = req.body;
    const [result] = await pool.query(
      `UPDATE reviews SET
         customer_name = COALESCE($1, customer_name),
         rating = COALESCE($2, rating),
         comment = COALESCE($3, comment),
         product_name = COALESCE($4, product_name)
       WHERE id = $5`,
      [customerName ?? null, rating ?? null, comment ?? null, productName ?? null, id],
    );
    if (result.affectedRows === 0) {
      logger.warn(`⚠️ Review ${id} not found`);
      throw new HttpError(404, 'Review not found');
    }
    logger.info(`✅ Review ${id} updated`);
    res.json({ message: 'Review updated' });
  } catch (err) {
    logger.error(`❌ Update review error: ${err.message}`);
    throw err;
  }
}

export async function adminCreateReview(req, res) {
  try {
    logger.info(`👨‍💼 Admin creating review`);
    const schema = z.object({
      customerName: z.string().min(1),
      rating: z.coerce.number().int().min(1).max(5),
      comment: z.string().optional().default(''),
      productName: z.string().optional().default(''),
    });
    const data = schema.parse(req.body);
    logger.info(`✅ Admin review data validated`);
    
    // Insert with NULL product_id (admin-created, no product link required)
    const [result] = await pool.query(
      `INSERT INTO reviews (product_id, product_name, customer_name, customer_email, rating, comment, is_approved)
       VALUES (NULL, $1, $2, $3, $4, $5, true)`,
      [data.productName || null, data.customerName, 'admin@inoutfashion.in', data.rating, data.comment],
    );
    logger.info(`✅ Admin review created with ID ${result.insertId}`);
    res.status(201).json({ message: 'Review created', reviewId: String(result.insertId) });
  } catch (err) {
    logger.error(`❌ Admin create review error: ${err.message}`);
    throw err;
  }
}

function mapReview(row) {
  return {
    id: String(row.id),
    productId: row.product_id ? String(row.product_id) : null,
    productName: row.product_name || '',
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    rating: Number(row.rating),
    comment: row.comment,
    isApproved: Boolean(row.is_approved),
    createdAt: row.created_at,
  };
}
