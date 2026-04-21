import fs from 'fs/promises';
import path from 'path';
import app from './app.js';
import env from './config/env.js';
import { pool } from './config/db.js';

/**
 * Run the PostgreSQL schema.sql file on startup.
 * All tables use CREATE TABLE IF NOT EXISTS, so this is safe to run repeatedly.
 * Splits on ; to execute each statement individually (pg doesn't support multi-statement strings).
 */
async function ensureSchema() {
  const schemaPath = path.resolve(process.cwd(), 'src', 'sql', 'schema.sql');
  const schemaSql = await fs.readFile(schemaPath, 'utf8');

  // Split on semicolons, strip comment lines, filter blank statements
  const statements = schemaSql
    .split(';')
    .map(s =>
      s.split('\n')
        .filter(line => !line.trim().startsWith('--'))
        .join('\n')
        .trim()
    )
    .filter(s => s.length > 0);

  for (const statement of statements) {
    await pool.query(statement);
  }

  console.log('Schema applied successfully');
}

async function fixSequences() {
  const tables = ['products', 'users', 'orders', 'order_items', 'carts', 'cart_items', 'coupons', 'reviews', 'carousel_items', 'shoppable_videos'];
  for (const table of tables) {
    const [rows] = await pool.query(`SELECT MAX(id) as max_id FROM ${table}`);
    const max = rows[0]?.max_id;
    if (max) {
      await pool.query(`SELECT setval('${table}_id_seq', ${max})`);
    }
  }
}

async function start() {
  try {
    await pool.query('SELECT 1');
    console.log('Database connected successfully');
    await ensureSchema();
    await fixSequences();
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