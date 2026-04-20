import { pool } from '../config/db.js';

async function migrate() {
  try {
    await pool.query(`ALTER TABLE products MODIFY COLUMN category VARCHAR(50) NOT NULL`);
    console.log('✅ products.category changed from ENUM to VARCHAR(50)');
  } catch (err) {
    if (err.message.includes("doesn't have the default")) {
      console.log('ℹ️  Column already VARCHAR or similar - no change needed.');
    } else {
      console.error('❌ Migration error:', err.message);
    }
  } finally {
    process.exit(0);
  }
}

migrate();
