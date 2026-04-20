import { pool } from '../config/db.js';

async function run() {
  // Create table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS homepage_content (
      id INT PRIMARY KEY AUTO_INCREMENT,
      section VARCHAR(50) NOT NULL,
      key_name VARCHAR(100) NOT NULL,
      value LONGTEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_homepage_section_key (section, key_name)
    )
  `);

  const slides = JSON.stringify([
    { badge: '🔥 HOT RIGHT NOW', title: ['Hoodies That Hit', 'Different'], description: 'Oversized. Premium. Made for the modern gentleman.', cta: 'Shop Hoodies', ctaLink: '/shop', image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200', saveBadge: 'SAVE 65%', saveSub: 'Limited sizes left — order now' },
    { badge: '⭐ NEW ARRIVAL', title: ['Fresh Styles', 'Just Dropped'], description: 'New arrivals every week. Be the first to wear it.', cta: 'Shop New Arrivals', ctaLink: '/new-arrivals', image: 'https://images.unsplash.com/photo-1617724748068-691efeeaf542?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200', saveBadge: 'NEW IN', saveSub: 'Spring / Summer 2026 Collection' },
    { badge: '🏆 BESTSELLER', title: ['Most Loved', 'Picks'], description: 'Trusted by thousands. Premium quality at unbeatable prices.', cta: 'Shop Best Sellers', ctaLink: '/best-sellers', image: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200', saveBadge: 'TOP RATED', saveSub: 'Most purchased this month' },
  ]);

  const rows = [
    ['announcement', 'items', JSON.stringify(['FREE SHIPPING ON ORDERS OVER ₹200', 'DAILY NEW LAUNCHES', '9+ YEARS TRUSTED BRAND', '100% GENUINE PRODUCTS', '30-DAY EASY RETURNS', 'EXCLUSIVE MEMBERS OFFER — SIGN UP TODAY'])],
    ['usp', 'items', JSON.stringify([{ iconName: 'Truck', label: 'Free Shipping', sub: 'Orders over ₹200' }, { iconName: 'RefreshCw', label: 'Easy Returns', sub: '30-day policy' }, { iconName: 'ShieldCheck', label: 'Authentic Quality', sub: 'Premium fabrics' }, { iconName: 'Package', label: 'Secure Packaging', sub: 'Every order' }])],
    ['offer', 'title', "Today's Offer — Up to 70% Off"],
    ['offer', 'subtitle', 'Offer ends at 10 PM tonight'],
    ['offer', 'endHour', '22'],
    ['hero', 'slides', slides],
  ];

  for (const [section, key_name, value] of rows) {
    await pool.query(
      'INSERT IGNORE INTO homepage_content (section, key_name, value) VALUES (?, ?, ?)',
      [section, key_name, value]
    );
  }

  const [result] = await pool.query('SELECT COUNT(*) as c FROM homepage_content');
  console.log('homepage_content rows:', result[0].c);
  process.exit(0);
}

run().catch(e => { console.error(e.message); process.exit(1); });
