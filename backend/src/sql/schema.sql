CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(40),
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
  admin_mobile VARCHAR(15),
  admin_otp VARCHAR(10),
  admin_otp_expires DATETIME,
  address_line1 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  zip_code VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  category ENUM('casual', 'formal', 'streetwear') NOT NULL,
  description TEXT NOT NULL,
  image_path VARCHAR(500) NOT NULL,
  is_new_arrival BOOLEAN NOT NULL DEFAULT FALSE,
  is_best_seller BOOLEAN NOT NULL DEFAULT FALSE,
  is_carousel BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_inventory (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  size ENUM('S', 'M', 'L', 'XL') NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  UNIQUE KEY unique_product_size (product_id, size),
  CONSTRAINT fk_inventory_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS carts (
  id VARCHAR(64) PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cart_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  cart_id VARCHAR(64) NOT NULL,
  product_id INT NOT NULL,
  size ENUM('S', 'M', 'L', 'XL') NOT NULL,
  quantity INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_cart_item (cart_id, product_id, size),
  CONSTRAINT fk_cart_item_cart FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
  CONSTRAINT fk_cart_item_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NULL,
  guest_email VARCHAR(255) NOT NULL,
  guest_phone VARCHAR(40) NOT NULL,
  status ENUM('pending', 'processing', 'shipped', 'cancelled', 'delivered') NOT NULL DEFAULT 'pending',
  payment_status ENUM('pending', 'paid', 'failed') NOT NULL DEFAULT 'pending',
  payment_method ENUM('upi', 'cod') NOT NULL,
  payment_provider VARCHAR(50) NOT NULL,
  payment_order_id VARCHAR(255) NOT NULL,
  payment_reference VARCHAR(255) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  shipping_amount DECIMAL(10, 2) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  shipping_first_name VARCHAR(100) NOT NULL,
  shipping_last_name VARCHAR(100) NOT NULL,
  shipping_address VARCHAR(255) NOT NULL,
  shipping_city VARCHAR(100) NOT NULL,
  shipping_state VARCHAR(100) NOT NULL,
  shipping_zip_code VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  product_id INT NULL,
  product_name VARCHAR(255) NOT NULL,
  image_path VARCHAR(500) NOT NULL,
  size ENUM('S', 'M', 'L', 'XL') NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  line_total DECIMAL(10, 2) NOT NULL,
  CONSTRAINT fk_order_item_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_item_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- ── Homepage Dynamic Content ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS homepage_content (
  id INT PRIMARY KEY AUTO_INCREMENT,
  section VARCHAR(50) NOT NULL,
  key_name VARCHAR(100) NOT NULL,
  value LONGTEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_homepage_section_key (section, key_name)
);

-- Seed default homepage content (INSERT IGNORE skips on re-run)
INSERT IGNORE INTO homepage_content (section, key_name, value) VALUES
('announcement', 'items', '["FREE SHIPPING ON ORDERS OVER ₹200","DAILY NEW LAUNCHES","9+ YEARS TRUSTED BRAND","100% GENUINE PRODUCTS","30-DAY EASY RETURNS","EXCLUSIVE MEMBERS OFFER — SIGN UP TODAY"]'),
('usp', 'items', '[{"iconName":"Truck","label":"Free Shipping","sub":"Orders over ₹200"},{"iconName":"RefreshCw","label":"Easy Returns","sub":"30-day policy"},{"iconName":"ShieldCheck","label":"Authentic Quality","sub":"Premium fabrics"},{"iconName":"Package","label":"Secure Packaging","sub":"Every order"}]'),
('offer', 'title', 'Today''s Offer — Up to 70% Off'),
('offer', 'subtitle', 'Offer ends at 10 PM tonight'),
('offer', 'endHour', '22'),
('hero', 'slides', '[{"badge":"🔥 HOT RIGHT NOW","title":["Hoodies That Hit","Different"],"description":"Oversized. Premium. Made for the modern gentleman.","cta":"Shop Hoodies","ctaLink":"/shop","image":"https://images.unsplash.com/photo-1552346154-21d32810aba3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200","saveBadge":"SAVE 65%","saveSub":"Limited sizes left — order now"},{"badge":"⭐ NEW ARRIVAL","title":["Fresh Styles","Just Dropped"],"description":"New arrivals every week. Be the first to wear it.","cta":"Shop New Arrivals","ctaLink":"/new-arrivals","image":"https://images.unsplash.com/photo-1617724748068-691efeeaf542?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200","saveBadge":"NEW IN","saveSub":"Spring / Summer 2026 Collection"},{"badge":"🏆 BESTSELLER","title":["Most Loved","Picks"],"description":"Trusted by thousands. Premium quality at unbeatable prices.","cta":"Shop Best Sellers","ctaLink":"/best-sellers","image":"https://images.unsplash.com/photo-1603252109303-2751441dd157?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200","saveBadge":"TOP RATED","saveSub":"Most purchased this month"}]');