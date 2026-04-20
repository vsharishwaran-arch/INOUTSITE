import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { z } from 'zod';
import env from '../config/env.js';
import { pool } from '../config/db.js';
import { HttpError } from '../utils/httpError.js';
import { sendOtp } from '../services/sms.js';

function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
    },
    env.jwtSecret,
    { expiresIn: '7d' },
  );
}

function mapUser(row) {
  return {
    id: String(row.id),
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    role: row.role,
    address: row.address_line1,
    city: row.city,
    state: row.state,
    zipCode: row.zip_code,
  };
}

export async function register(req, res) {
  const schema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
    phone: z.string().optional().default(''),
  });

  const payload = schema.parse(req.body);
  const [existingRows] = await pool.query('SELECT id FROM users WHERE email = ?', [payload.email]);
  if (existingRows.length > 0) {
    throw new HttpError(409, 'An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(payload.password, 10);
  const [result] = await pool.query(
    `
      INSERT INTO users (first_name, last_name, email, phone, password_hash, role)
      VALUES (?, ?, ?, ?, ?, 'customer')
    `,
    [payload.firstName, payload.lastName, payload.email, payload.phone, passwordHash],
  );

  const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
  const user = mapUser(users[0]);
  res.status(201).json({ user, token: signToken(users[0]) });
}

export async function login(req, res) {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
  });

  const payload = schema.parse(req.body);
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [payload.email]);
  const user = rows[0];

  if (!user) {
    throw new HttpError(401, 'Invalid email or password');
  }

  const validPassword = await bcrypt.compare(payload.password, user.password_hash);
  if (!validPassword) {
    throw new HttpError(401, 'Invalid email or password');
  }

  res.json({ user: mapUser(user), token: signToken(user) });
}

export async function getProfile(req, res) {
  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.sub]);
  if (!rows[0]) {
    throw new HttpError(404, 'User not found');
  }

  res.json(mapUser(rows[0]));
}

export async function updateProfile(req, res) {
  const schema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(1),
    address: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    zipCode: z.string().min(1),
  });

  const payload = schema.parse(req.body);
  await pool.query(
    `
      UPDATE users
      SET first_name = ?, last_name = ?, email = ?, phone = ?,
          address_line1 = ?, city = ?, state = ?, zip_code = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    [
      payload.firstName,
      payload.lastName,
      payload.email,
      payload.phone,
      payload.address,
      payload.city,
      payload.state,
      payload.zipCode,
      req.user.sub,
    ],
  );

  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.sub]);
  res.json(mapUser(rows[0]));
}

// ── Admin: Get registered mobile ────────────────────────────────────────
export async function getAdminMobile(req, res) {
  const [rows] = await pool.query('SELECT admin_mobile FROM users WHERE id = ? AND role = ?', [req.user.sub, 'admin']);
  if (!rows[0]) throw new HttpError(404, 'Admin not found');
  res.json({ mobile: rows[0].admin_mobile || null });
}

// ── Admin: Register mobile (first time) ─────────────────────────────────
export async function registerAdminMobile(req, res) {
  const { mobile } = z.object({ mobile: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number') }).parse(req.body);

  const [rows] = await pool.query('SELECT admin_mobile FROM users WHERE id = ? AND role = ?', [req.user.sub, 'admin']);
  if (!rows[0]) throw new HttpError(404, 'Admin not found');

  await pool.query('UPDATE users SET admin_mobile = ? WHERE id = ?', [mobile, req.user.sub]);
  res.json({ message: 'Mobile number registered successfully' });
}

// ── Admin: Update mobile (requires current password) ────────────────────
export async function updateAdminMobile(req, res) {
  const { mobile, password } = z.object({
    mobile: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number'),
    password: z.string().min(1, 'Password is required'),
  }).parse(req.body);

  const [rows] = await pool.query('SELECT * FROM users WHERE id = ? AND role = ?', [req.user.sub, 'admin']);
  if (!rows[0]) throw new HttpError(404, 'Admin not found');

  const valid = await bcrypt.compare(password, rows[0].password_hash);
  if (!valid) throw new HttpError(401, 'Incorrect password');

  await pool.query('UPDATE users SET admin_mobile = ? WHERE id = ?', [mobile, req.user.sub]);
  res.json({ message: 'Mobile number updated successfully' });
}

// ── Admin: Request OTP for password change ──────────────────────────────
export async function requestAdminOtp(req, res) {
  const [rows] = await pool.query('SELECT admin_mobile FROM users WHERE id = ? AND role = ?', [req.user.sub, 'admin']);
  if (!rows[0]) throw new HttpError(404, 'Admin not found');
  if (!rows[0].admin_mobile) throw new HttpError(400, 'No mobile number registered. Please register a mobile number first.');

  // Generate 6-digit OTP
  const otp = crypto.randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  await pool.query(
    'UPDATE users SET admin_otp = ?, admin_otp_expires = ? WHERE id = ?',
    [otp, expiresAt, req.user.sub],
  );

  // Send OTP via Fast2SMS (falls back to console log if no API key)
  const smsResult = await sendOtp(rows[0].admin_mobile, otp);

  const response = {
    message: `OTP sent to +91 ${rows[0].admin_mobile.slice(0, 3)}****${rows[0].admin_mobile.slice(7)}`,
  };

  // In dev/console mode, include OTP in response so admin can test
  if (smsResult.devOtp) {
    response.devOtp = smsResult.devOtp;
    response.message += ' (Dev mode: check OTP below)';
  }

  res.json(response);
}

// ── Admin: Change password with OTP verification ────────────────────────
export async function changeAdminPassword(req, res) {
  const { otp, newPassword } = z.object({
    otp: z.string().length(6, 'OTP must be 6 digits'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  }).parse(req.body);

  const [rows] = await pool.query('SELECT * FROM users WHERE id = ? AND role = ?', [req.user.sub, 'admin']);
  if (!rows[0]) throw new HttpError(404, 'Admin not found');
  if (!rows[0].admin_otp) throw new HttpError(400, 'No OTP requested. Please request an OTP first.');

  // Check expiry
  if (new Date() > new Date(rows[0].admin_otp_expires)) {
    await pool.query('UPDATE users SET admin_otp = NULL, admin_otp_expires = NULL WHERE id = ?', [req.user.sub]);
    throw new HttpError(400, 'OTP has expired. Please request a new one.');
  }

  // Verify OTP (timing-safe comparison)
  if (!crypto.timingSafeEqual(Buffer.from(otp), Buffer.from(rows[0].admin_otp))) {
    throw new HttpError(401, 'Invalid OTP');
  }

  // Update password and clear OTP
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await pool.query(
    'UPDATE users SET password_hash = ?, admin_otp = NULL, admin_otp_expires = NULL WHERE id = ?',
    [passwordHash, req.user.sub],
  );

  res.json({ message: 'Password changed successfully' });
}