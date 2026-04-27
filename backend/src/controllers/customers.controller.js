import { pool } from '../config/db.js';

export async function listCustomers(req, res) {
  // Derive customer list from order data + users table
  const [rows] = await pool.query(`
    SELECT
      COALESCE(u.id, 0) AS userId,
      COALESCE(u.first_name, o.shipping_first_name) AS firstName,
      COALESCE(u.last_name, o.shipping_last_name) AS lastName,
      o.guest_email AS email,
      COALESCE(u.phone, o.guest_phone) AS phone,
      COUNT(DISTINCT o.id) AS totalOrders,
      SUM(o.total_amount) AS totalSpent,
      MAX(o.created_at) AS lastOrderDate,
      MIN(o.created_at) AS firstOrderDate
    FROM orders o
    LEFT JOIN users u ON u.id = o.user_id
    GROUP BY u.id, o.guest_email, u.first_name, u.last_name, o.shipping_first_name, o.shipping_last_name, u.phone, o.guest_phone
    ORDER BY totalSpent DESC
  `);

  res.json({
    items: rows.map((row) => ({
      userId: row.userId ? String(row.userId) : null,
      firstName: row.firstName,
      lastName: row.lastName,
      email: row.email,
      phone: row.phone,
      totalOrders: Number(row.totalOrders),
      totalSpent: Number(row.totalSpent),
      lastOrderDate: row.lastOrderDate,
      firstOrderDate: row.firstOrderDate,
    })),
  });
}

export async function getCustomerOrders(req, res) {
  const email = req.params.email;

  const [rows] = await pool.query(
    `SELECT id, status, payment_status, total_amount, created_at
     FROM orders WHERE guest_email = ? ORDER BY created_at DESC`,
    [email],
  );

  res.json({
    items: rows.map((row) => ({
      id: String(row.id),
      status: row.status,
      paymentStatus: row.payment_status,
      totalAmount: Number(row.total_amount),
      createdAt: row.created_at,
    })),
  });
}
