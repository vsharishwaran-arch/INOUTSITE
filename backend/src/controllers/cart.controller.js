import { z } from 'zod';
import { pool } from '../config/db.js';
import { HttpError } from '../utils/httpError.js';

async function ensureCart(cartId) {
  await pool.query(
    `
      INSERT INTO carts (id)
      VALUES (?)
      ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP
    `,
    [cartId],
  );
}

async function getCartSummary(cartId) {
  const [rows] = await pool.query(
    `
      SELECT
        ci.cart_id,
        ci.product_id,
        ci.size,
        ci.quantity,
        p.name,
        p.price,
        p.image_path,
        p.category,
        inv.stock AS available_stock
      FROM cart_items ci
      INNER JOIN products p ON p.id = ci.product_id
      LEFT JOIN product_inventory inv ON inv.product_id = ci.product_id AND inv.size = ci.size
      WHERE ci.cart_id = ?
      ORDER BY ci.created_at DESC
    `,
    [cartId],
  );

  const items = rows.map((row) => ({
    productId: String(row.product_id),
    size: row.size,
    quantity: Number(row.quantity),
    name: row.name,
    price: Number(row.price),
    image: row.image_path,
    category: row.category,
    availableStock: Number(row.available_stock || 0),
    lineTotal: Number(row.price) * Number(row.quantity),
  }));

  return {
    cartId,
    items,
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: items.reduce((sum, item) => sum + item.lineTotal, 0),
  };
}

export async function getCart(req, res) {
  const cartId = req.params.cartId;
  await ensureCart(cartId);
  res.json(await getCartSummary(cartId));
}

export async function addCartItem(req, res) {
  const schema = z.object({
    productId: z.coerce.number().int().positive(),
    size: z.enum(['S', 'M', 'L', 'XL']),
    quantity: z.coerce.number().int().positive(),
  });

  const cartId = req.params.cartId;
  const payload = schema.parse(req.body);

  await ensureCart(cartId);

  const [[inventory]] = await pool.query(
    'SELECT stock FROM product_inventory WHERE product_id = ? AND size = ?',
    [payload.productId, payload.size],
  );

  if (!inventory) {
    throw new HttpError(404, 'Selected size is not available');
  }
  if (Number(inventory.stock) < payload.quantity) {
    throw new HttpError(400, 'Requested quantity exceeds stock');
  }

  await pool.query(
    `
      INSERT INTO cart_items (cart_id, product_id, size, quantity)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE quantity = VALUES(quantity), updated_at = CURRENT_TIMESTAMP
    `,
    [cartId, payload.productId, payload.size, payload.quantity],
  );

  res.status(201).json(await getCartSummary(cartId));
}

export async function updateCartItem(req, res) {
  const schema = z.object({
    quantity: z.coerce.number().int().min(0),
  });

  const cartId = req.params.cartId;
  const { productId, size } = req.params;
  const payload = schema.parse(req.body);

  if (payload.quantity === 0) {
    await pool.query('DELETE FROM cart_items WHERE cart_id = ? AND product_id = ? AND size = ?', [cartId, productId, size]);
    return res.json(await getCartSummary(cartId));
  }

  const [[inventory]] = await pool.query(
    'SELECT stock FROM product_inventory WHERE product_id = ? AND size = ?',
    [productId, size],
  );

  if (!inventory || Number(inventory.stock) < payload.quantity) {
    throw new HttpError(400, 'Requested quantity exceeds stock');
  }

  await pool.query(
    'UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE cart_id = ? AND product_id = ? AND size = ?',
    [payload.quantity, cartId, productId, size],
  );

  res.json(await getCartSummary(cartId));
}

export async function deleteCartItem(req, res) {
  const { cartId, productId, size } = req.params;
  await pool.query('DELETE FROM cart_items WHERE cart_id = ? AND product_id = ? AND size = ?', [cartId, productId, size]);
  res.json(await getCartSummary(cartId));
}

export async function clearCart(req, res) {
  await pool.query('DELETE FROM cart_items WHERE cart_id = ?', [req.params.cartId]);
  res.json(await getCartSummary(req.params.cartId));
}