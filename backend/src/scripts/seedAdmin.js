import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';

const ADMIN_EMAIL = 'admin@inout.com';
const ADMIN_PASSWORD = 'admin123';

async function seedAdmin() {
  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [ADMIN_EMAIL]);
    if (existing.length > 0) {
      await pool.query('UPDATE users SET role = ? WHERE email = ?', ['admin', ADMIN_EMAIL]);
      console.log(`Admin user already exists (${ADMIN_EMAIL}). Role set to admin.`);
    } else {
      const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
      await pool.query(
        `INSERT INTO users (first_name, last_name, email, phone, password_hash, role)
         VALUES (?, ?, ?, ?, ?, ?)`,
        ['Admin', 'User', ADMIN_EMAIL, '', hash, 'admin'],
      );
      console.log(`Admin user created: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
    }
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed admin:', error.message);
    process.exit(1);
  }
}

seedAdmin();
