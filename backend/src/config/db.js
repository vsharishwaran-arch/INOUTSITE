import mysql from 'mysql2/promise';
import env from './env.js';

const DATABASE_URL = process.env.DATABASE_URL;

// Shared pool options (applied on top of connection config)
const poolOptions = {
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true,
  namedPlaceholders: true,
};

let pool;

if (DATABASE_URL) {
  // Railway / production: use the full connection URL
  console.log('Using DATABASE_URL for MySQL connection');
  pool = mysql.createPool({
    uri: DATABASE_URL,
    ...poolOptions,
  });
} else if (env.mysqlHost && env.mysqlUser && env.mysqlDatabase) {
  // Local development: fall back to individual MYSQL_* env vars
  console.log('Using local MySQL config (MYSQL_HOST / MYSQL_USER / MYSQL_DATABASE)');
  pool = mysql.createPool({
    host: env.mysqlHost,
    port: env.mysqlPort,
    user: env.mysqlUser,
    password: env.mysqlPassword,
    database: env.mysqlDatabase,
    ...poolOptions,
  });
} else {
  throw new Error(
    'Database configuration missing: set DATABASE_URL or MYSQL_HOST / MYSQL_USER / MYSQL_DATABASE env vars.',
  );
}

export { pool };