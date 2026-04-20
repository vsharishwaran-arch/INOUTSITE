import { pool } from '../config/db.js';

async function migrate() {
  try {
    await pool.query('ALTER TABLE products ADD COLUMN is_carousel BOOLEAN NOT NULL DEFAULT FALSE');
    console.log('✓ Added is_carousel column to products table');
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log('Column is_carousel already exists, skipping.');
    } else {
      throw err;
    }
  } finally {
    await pool.end();
  }
}

migrate();
