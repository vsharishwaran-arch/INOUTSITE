import { pool } from '../config/db.js';

async function migrate() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS carousel_items (
        id INT PRIMARY KEY AUTO_INCREMENT,
        type ENUM('product', 'image', 'video') NOT NULL,
        product_id INT NULL,
        media_url VARCHAR(500) NULL,
        title VARCHAR(255) NOT NULL DEFAULT '',
        subtitle VARCHAR(255) NOT NULL DEFAULT '',
        link_url VARCHAR(500) NOT NULL DEFAULT '',
        sort_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_carousel_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);
    console.log('✓ Created carousel_items table');
  } catch (err) {
    if (err.code === 'ER_TABLE_EXISTS_ERROR') {
      console.log('Table carousel_items already exists, skipping.');
    } else {
      throw err;
    }
  } finally {
    await pool.end();
  }
}

migrate();
