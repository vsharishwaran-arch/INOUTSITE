import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';

const hash = await bcrypt.hash('admin123', 10);
await pool.query('UPDATE users SET password_hash = ? WHERE email = ?', [hash, 'admin@inout.com']);
const [rows] = await pool.query('SELECT email, role FROM users WHERE email = ?', ['admin@inout.com']);
console.log('Password reset for:', rows[0]);
process.exit(0);
