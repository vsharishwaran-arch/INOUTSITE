import { pool } from '../config/db.js';

async function run() {
  const connection = await pool.getConnection();
  try {
    // Add is_on_offer column if not exists
    const [cols] = await connection.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = 'is_on_offer'`,
    );
    if (cols.length === 0) {
      await connection.query(
        `ALTER TABLE products ADD COLUMN is_on_offer BOOLEAN NOT NULL DEFAULT FALSE AFTER is_best_seller`,
      );
      console.log('✓ Added is_on_offer column to products');
    } else {
      console.log('✓ is_on_offer column already exists');
    }
  } finally {
    connection.release();
    await pool.end();
  }
}

run().catch((e) => { console.error(e.message); process.exit(1); });
