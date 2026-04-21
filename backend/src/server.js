import fs from 'fs/promises';
import path from 'path';
import app from './app.js';
import env from './config/env.js';
import { pool } from './config/db.js';

async function ensureSchema() {
  const schemaPath = path.resolve(process.cwd(), 'src', 'sql', 'schema.sql');
  const schemaSql = await fs.readFile(schemaPath, 'utf8');
  await pool.query(schemaSql);

  // ── Users table migrations ───────────────────────────────────────────
  const [userColumns] = await pool.query('SHOW COLUMNS FROM users');
  const userFields = new Set(userColumns.map((column) => column.Field));

  const userMigrations = [
    ['first_name',    "ALTER TABLE users ADD COLUMN first_name VARCHAR(100) NOT NULL DEFAULT ''"],
    ['last_name',     "ALTER TABLE users ADD COLUMN last_name VARCHAR(100) NOT NULL DEFAULT ''"],
    ['phone',         "ALTER TABLE users ADD COLUMN phone VARCHAR(40) DEFAULT ''"],
    ['password_hash', "ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) NOT NULL DEFAULT ''"],
    ['role',          "ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'customer'"],
    ['address_line1', "ALTER TABLE users ADD COLUMN address_line1 VARCHAR(255) DEFAULT ''"],
    ['city',          "ALTER TABLE users ADD COLUMN city VARCHAR(100) DEFAULT ''"],
    ['state',         "ALTER TABLE users ADD COLUMN state VARCHAR(100) DEFAULT ''"],
    ['zip_code',      "ALTER TABLE users ADD COLUMN zip_code VARCHAR(20) DEFAULT ''"],
    ['updated_at',    'ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'],
  ];
  for (const [column, migrateQuery] of userMigrations) {
    if (!userFields.has(column)) {
      await pool.query(migrateQuery);
    }
  }
  // Copy legacy name → first_name if first_name is empty and name column exists
  if (userFields.has('name')) {
    await pool.query("UPDATE users SET first_name = name WHERE (first_name IS NULL OR first_name = '') AND name IS NOT NULL AND name != ''");
  }
  // Copy legacy password → password_hash if password_hash is empty and password column exists
  if (userFields.has('password')) {
    await pool.query("UPDATE users SET password_hash = password WHERE (password_hash IS NULL OR password_hash = '') AND password IS NOT NULL AND password != ''");
  }

  // ── Products table migrations ────────────────────────────────────────
  const [productColumns] = await pool.query('SHOW COLUMNS FROM products');
  const productFields = new Set(productColumns.map((column) => column.Field));

  if (!productFields.has('image_path')) {
    await pool.query('ALTER TABLE products ADD COLUMN image_path VARCHAR(500) NULL AFTER description');
  }
  if (!productFields.has('updated_at')) {
    await pool.query('ALTER TABLE products ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
  }
  if (!productFields.has('is_new_arrival')) {
    await pool.query('ALTER TABLE products ADD COLUMN is_new_arrival BOOLEAN NOT NULL DEFAULT FALSE');
  }
  if (!productFields.has('is_best_seller')) {
    await pool.query('ALTER TABLE products ADD COLUMN is_best_seller BOOLEAN NOT NULL DEFAULT FALSE');
  }
  // Clean up: hard-delete any soft-deleted products and drop is_active column
  if (productFields.has('is_active')) {
    await pool.query('DELETE FROM products WHERE is_active = FALSE');
    await pool.query('ALTER TABLE products DROP COLUMN is_active');
  }
  if (!productFields.has('sku')) {
    await pool.query("ALTER TABLE products ADD COLUMN sku VARCHAR(100) DEFAULT ''");
  }
  if (!productFields.has('discount_price')) {
    await pool.query('ALTER TABLE products ADD COLUMN discount_price DECIMAL(10,2) DEFAULT NULL');
  }
  if (!productFields.has('tags')) {
    await pool.query("ALTER TABLE products ADD COLUMN tags VARCHAR(500) DEFAULT ''");
  }
  if (productFields.has('image')) {
    await pool.query("UPDATE products SET image_path = image WHERE (image_path IS NULL OR image_path = '') AND image IS NOT NULL");
  }

  // ── Coupons table ────────────────────────────────────────────────────
  await pool.query(`
    CREATE TABLE IF NOT EXISTS coupons (
      id INT PRIMARY KEY AUTO_INCREMENT,
      code VARCHAR(50) NOT NULL UNIQUE,
      type ENUM('percentage', 'fixed') NOT NULL DEFAULT 'percentage',
      value DECIMAL(10,2) NOT NULL,
      min_order_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
      max_uses INT DEFAULT NULL,
      used_count INT NOT NULL DEFAULT 0,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      starts_at TIMESTAMP NULL,
      expires_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ── Reviews table ────────────────────────────────────────────────────
  await pool.query(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INT PRIMARY KEY AUTO_INCREMENT,
      product_id INT NOT NULL,
      customer_name VARCHAR(200) NOT NULL,
      customer_email VARCHAR(255) NOT NULL,
      rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
      comment TEXT,
      is_approved BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_review_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `);

  // ── Orders table migrations ──────────────────────────────────────────
  const [orderColumns] = await pool.query('SHOW COLUMNS FROM orders');
  const orderFields = new Set(orderColumns.map((column) => column.Field));

  const orderMigrations = [
    ['guest_email',        "ALTER TABLE orders ADD COLUMN guest_email VARCHAR(255) NOT NULL DEFAULT ''"],
    ['guest_phone',        "ALTER TABLE orders ADD COLUMN guest_phone VARCHAR(40) NOT NULL DEFAULT ''"],
    ['payment_method',     "ALTER TABLE orders ADD COLUMN payment_method VARCHAR(30) NOT NULL DEFAULT 'card'"],
    ['payment_provider',   "ALTER TABLE orders ADD COLUMN payment_provider VARCHAR(50) NOT NULL DEFAULT 'demo'"],
    ['payment_order_id',   "ALTER TABLE orders ADD COLUMN payment_order_id VARCHAR(255) NOT NULL DEFAULT ''"],
    ['payment_reference',  "ALTER TABLE orders ADD COLUMN payment_reference VARCHAR(255) NOT NULL DEFAULT ''"],
    ['subtotal',           'ALTER TABLE orders ADD COLUMN subtotal DECIMAL(10,2) NOT NULL DEFAULT 0'],
    ['shipping_amount',    'ALTER TABLE orders ADD COLUMN shipping_amount DECIMAL(10,2) NOT NULL DEFAULT 0'],
    ['shipping_first_name',"ALTER TABLE orders ADD COLUMN shipping_first_name VARCHAR(100) NOT NULL DEFAULT ''"],
    ['shipping_last_name', "ALTER TABLE orders ADD COLUMN shipping_last_name VARCHAR(100) NOT NULL DEFAULT ''"],
    ['shipping_address',   "ALTER TABLE orders ADD COLUMN shipping_address VARCHAR(255) NOT NULL DEFAULT ''"],
    ['shipping_city',      "ALTER TABLE orders ADD COLUMN shipping_city VARCHAR(100) NOT NULL DEFAULT ''"],
    ['shipping_state',     "ALTER TABLE orders ADD COLUMN shipping_state VARCHAR(100) NOT NULL DEFAULT ''"],
    ['shipping_zip_code',  "ALTER TABLE orders ADD COLUMN shipping_zip_code VARCHAR(20) NOT NULL DEFAULT ''"],
    ['updated_at',         'ALTER TABLE orders ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'],
    ['discount_amount',    'ALTER TABLE orders ADD COLUMN discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0'],
    ['coupon_code',        "ALTER TABLE orders ADD COLUMN coupon_code VARCHAR(50) DEFAULT NULL"],
  ];

  for (const [column, migrateQuery] of orderMigrations) {
    if (!orderFields.has(column)) {
      await pool.query(migrateQuery);
    }
  }

  // ── Order items table migrations ─────────────────────────────────────
  const [orderItemColumns] = await pool.query('SHOW COLUMNS FROM order_items');
  const orderItemFields = new Set(orderItemColumns.map((column) => column.Field));

  const orderItemMigrations = [
    ['product_name', "ALTER TABLE order_items ADD COLUMN product_name VARCHAR(255) NOT NULL DEFAULT ''"],
    ['image_path',   "ALTER TABLE order_items ADD COLUMN image_path VARCHAR(500) NOT NULL DEFAULT ''"],
    ['size',         "ALTER TABLE order_items ADD COLUMN size VARCHAR(10) NOT NULL DEFAULT ''"],
    ['unit_price',   'ALTER TABLE order_items ADD COLUMN unit_price DECIMAL(10,2) NOT NULL DEFAULT 0'],
    ['line_total',   'ALTER TABLE order_items ADD COLUMN line_total DECIMAL(10,2) NOT NULL DEFAULT 0'],
  ];

  for (const [column, migrateQuery] of orderItemMigrations) {
    if (!orderItemFields.has(column)) {
      await pool.query(migrateQuery);
    }
  }
}

async function start() {
  try {
    await pool.query('SELECT 1');
    console.log('Database connected successfully');
    await ensureSchema();
    app.listen(env.port, () => {
      console.log(`API server listening on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error('Failed to start backend server');
    console.error(error);
    process.exit(1);
  }
}

start();