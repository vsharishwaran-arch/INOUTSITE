import { pool } from '../config/db.js';

await pool.execute(`
  CREATE TABLE IF NOT EXISTS shoppable_videos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    video_url VARCHAR(1000) NOT NULL,
    thumbnail_url VARCHAR(1000),
    overlay_text VARCHAR(120) DEFAULT 'Comment "7"',
    price DECIMAL(10,2),
    discount_price DECIMAL(10,2),
    sizes VARCHAR(100) DEFAULT 'S,M,L,XL',
    product_link VARCHAR(500),
    likes INT NOT NULL DEFAULT 0,
    views INT NOT NULL DEFAULT 0,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )
`);

console.log('shoppable_videos table created/verified OK');
process.exit(0);
