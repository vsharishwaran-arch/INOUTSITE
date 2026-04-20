import { pool } from '../config/db.js';

export async function getDashboardStats(req, res) {
  const [[orderStats]] = await pool.query(`
    SELECT
      COUNT(*) AS totalOrders,
      COALESCE(SUM(total_amount), 0) AS totalRevenue,
      COALESCE(SUM(CASE WHEN status IN ('pending', 'processing') THEN 1 ELSE 0 END), 0) AS pendingOrders,
      COALESCE(SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END), 0) AS deliveredOrders,
      COALESCE(SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END), 0) AS cancelledOrders,
      COALESCE(SUM(discount_amount), 0) AS totalDiscounts
    FROM orders
  `);

  const [[productStats]] = await pool.query(`
    SELECT
      COUNT(*) AS totalProducts
    FROM products
  `);

  const [[inventoryStats]] = await pool.query(`
    SELECT
      COALESCE(SUM(stock), 0) AS totalStock,
      COUNT(CASE WHEN stock = 0 THEN 1 END) AS outOfStockSizes,
      COUNT(CASE WHEN stock > 0 AND stock <= 5 THEN 1 END) AS lowStockSizes
    FROM product_inventory
  `);

  const [[customerStats]] = await pool.query(`
    SELECT COUNT(DISTINCT guest_email) AS totalCustomers FROM orders
  `);

  res.json({
    totalOrders: Number(orderStats.totalOrders),
    totalRevenue: Number(orderStats.totalRevenue),
    pendingOrders: Number(orderStats.pendingOrders),
    deliveredOrders: Number(orderStats.deliveredOrders),
    cancelledOrders: Number(orderStats.cancelledOrders),
    totalDiscounts: Number(orderStats.totalDiscounts),
    totalProducts: Number(productStats.totalProducts),
    inactiveProducts: Number(productStats.inactiveProducts),
    totalStock: Number(inventoryStats.totalStock),
    outOfStockSizes: Number(inventoryStats.outOfStockSizes),
    lowStockSizes: Number(inventoryStats.lowStockSizes),
    totalCustomers: Number(customerStats.totalCustomers),
  });
}

export async function getRevenueChart(req, res) {
  const days = Number(req.query.days) || 30;

  const [rows] = await pool.query(`
    SELECT
      DATE(created_at) AS date,
      COUNT(*) AS orders,
      COALESCE(SUM(total_amount), 0) AS revenue
    FROM orders
    WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `, [days]);

  res.json({
    items: rows.map((row) => ({
      date: row.date,
      orders: Number(row.orders),
      revenue: Number(row.revenue),
    })),
  });
}

export async function getBestSellers(req, res) {
  const limit = Number(req.query.limit) || 10;

  const [rows] = await pool.query(`
    SELECT
      oi.product_id,
      oi.product_name,
      oi.image_path,
      SUM(oi.quantity) AS totalSold,
      SUM(oi.line_total) AS totalRevenue,
      COUNT(DISTINCT oi.order_id) AS orderCount
    FROM order_items oi
    INNER JOIN orders o ON o.id = oi.order_id AND o.status != 'cancelled'
    GROUP BY oi.product_id, oi.product_name, oi.image_path
    ORDER BY totalSold DESC
    LIMIT ?
  `, [limit]);

  res.json({
    items: rows.map((row) => ({
      productId: String(row.product_id),
      productName: row.product_name,
      image: row.image_path,
      totalSold: Number(row.totalSold),
      totalRevenue: Number(row.totalRevenue),
      orderCount: Number(row.orderCount),
    })),
  });
}

export async function getOrdersByStatus(req, res) {
  const [rows] = await pool.query(`
    SELECT status, COUNT(*) AS count
    FROM orders
    GROUP BY status
  `);

  const result = {};
  for (const row of rows) {
    result[row.status] = Number(row.count);
  }

  res.json(result);
}
