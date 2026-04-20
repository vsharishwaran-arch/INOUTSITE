import { pool } from '../config/db.js';

const products = [
  {
    id: 1,
    name: 'Classic White Oxford Shirt',
    price: 89,
    category: 'casual',
    image: 'https://images.unsplash.com/photo-1617724757497-79b54c5444d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwbW9kZWwlMjBjYXN1YWwlMjB3ZWFyJTIwY2xvdGhpbmd8ZW58MXx8fHwxNzc2MTg3OTQyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Essential white Oxford button-down for the modern man. Premium cotton construction with a tailored fit for versatile styling.',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 15,
    isBestSeller: true,
  },
  {
    id: 2,
    name: 'Essential Crew Neck Tee',
    price: 45,
    category: 'casual',
    image: 'https://images.unsplash.com/photo-1617724748068-691efeeaf542?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw0fHxmYXNoaW9uJTIwbW9kZWwlMjBjYXN1YWwlMjB3ZWFyJTIwY2xvdGhpbmd8ZW58MXx8fHwxNzc2MTg3OTQyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Wardrobe staple in premium cotton. Clean lines, perfect fit, built to last. The foundation of every man\'s casual style.',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 8,
    isBestSeller: true,
    isNewArrival: true,
  },
  {
    id: 3,
    name: 'Olive Field Jacket',
    price: 195,
    category: 'casual',
    image: 'https://images.unsplash.com/photo-1761891873744-eb181eb1334a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw4fHxmYXNoaW9uJTIwbW9kZWwlMjBjYXN1YWwlMjB3ZWFyJTIwY2xvdGhpbmd8ZW58MXx8fHwxNzc2MTg3OTQyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Military-inspired utility jacket in rich olive. Functional pockets, durable construction, timeless American style.',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 12,
    isNewArrival: true,
  },
  {
    id: 4,
    name: 'Denim Work Shirt',
    price: 98,
    category: 'casual',
    image: 'https://images.unsplash.com/photo-1642597610928-0c483ca2824e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw1fHxmYXNoaW9uJTIwbW9kZWwlMjBjYXN1YWwlMjB3ZWFyJTIwY2xvdGhpbmd8ZW58MXx8fHwxNzc2MTg3OTQyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Rugged denim shirt built for the modern workweek. Classic Western-inspired design with contemporary fit.',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 20,
    isBestSeller: true,
  },
  {
    id: 5,
    name: 'Henley Long Sleeve',
    price: 68,
    category: 'casual',
    image: 'https://images.unsplash.com/photo-1763499389959-f9e8d93f99ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxmYXNoaW9uJTIwbW9kZWwlMjBjYXN1YWwlMjB3ZWFyJTIwY2xvdGhpbmd8ZW58MXx8fHwxNzc2MTg3OTQyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Classic henley in heavyweight cotton. Casual sophistication with a button placket and comfortable fit.',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 3,
    isNewArrival: true,
  },
  {
    id: 6,
    name: 'Varsity Bomber Jacket',
    price: 185,
    category: 'casual',
    image: 'https://images.unsplash.com/photo-1774413768880-ab6ac8eb5d43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw5fHxmYXNoaW9uJTIwbW9kZWwlMjBjYXN1YWwlMjB3ZWFyJTIwY2xvdGhpbmd8ZW58MXx8fHwxNzc2MTg3OTQyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Heritage-inspired bomber with modern updates. Premium wool blend with leather sleeves for authentic varsity style.',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 0,
  },
  {
    id: 7,
    name: 'Executive Double-Breasted Suit',
    price: 599,
    category: 'formal',
    image: 'https://images.unsplash.com/photo-1768696082783-4313d98341ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb3JtYWwlMjBzdWl0JTIwbWVuc3dlYXIlMjBmYXNoaW9ufGVufDF8fHx8MTc3NjE4Nzk0M3ww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Power dressing redefined. Double-breasted silhouette in pure wool with peak lapels. Command attention in the boardroom.',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 6,
    isBestSeller: true,
  },
  {
    id: 8,
    name: 'Emerald Occasion Suit',
    price: 645,
    category: 'formal',
    image: 'https://images.unsplash.com/photo-1768489038903-b9f420a81b8d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxmb3JtYWwlMjBzdWl0JTIwbWVuc3dlYXIlMjBmYXNoaW9ufGVufDF8fHx8MTc3NjE4Nzk0M3ww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Bold emerald tailoring for the confident man. Italian-inspired cut with contemporary attitude. Make your statement.',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 4,
    isNewArrival: true,
  },
  {
    id: 9,
    name: 'Navy Worsted Wool Suit',
    price: 525,
    category: 'formal',
    image: 'https://images.unsplash.com/photo-1775831726606-3d98ebefb57a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxmb3JtYWwlMjBzdWl0JTIwbWVuc3dlYXIlMjBmYXNoaW9ufGVufDF8fHx8MTc3NjE4Nzk0M3ww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'The essential navy suit every man needs. Timeless elegance meets modern fit. From meetings to weddings.',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 10,
    isBestSeller: true,
  },
  {
    id: 10,
    name: 'Charcoal Slim Fit Suit',
    price: 565,
    category: 'formal',
    image: 'https://images.unsplash.com/photo-1754577060025-9b0831bdc554?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw0fHxmb3JtYWwlMjBzdWl0JTIwbWVuc3dlYXIlMjBmYXNoaW9ufGVufDF8fHx8MTc3NjE4Nzk0M3ww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Modern slim fit in versatile charcoal. Italian Super 120s wool with clean lines. Professional excellence.',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 7,
    isNewArrival: true,
  },
  {
    id: 11,
    name: 'Heritage Windowpane Suit',
    price: 685,
    category: 'formal',
    image: 'https://images.unsplash.com/photo-1775257796082-b04722efcc4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw4fHxmb3JtYWwlMjBzdWl0JTIwbWVuc3dlYXIlMjBmYXNoaW9ufGVufDF8fHx8MTc3NjE4Nzk0M3ww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Distinguished windowpane check for the discerning gentleman. Classic British tailoring with refined details.',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 5,
  },
  {
    id: 12,
    name: 'Tech Urban Bomber',
    price: 225,
    category: 'streetwear',
    image: 'https://images.unsplash.com/photo-1660486044177-45cd45bb5e99?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHJlZXR3ZWFyJTIwdXJiYW4lMjBmYXNoaW9uJTIwY2xvdGhpbmd8ZW58MXx8fHwxNzc2MTg3OTQzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Contemporary bomber in technical fabric. Water-resistant, packable, street-ready. Modern utility meets urban style.',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 11,
    isBestSeller: true,
  },
  {
    id: 13,
    name: 'Raw Denim Joggers',
    price: 145,
    category: 'streetwear',
    image: 'https://images.unsplash.com/photo-1593369758024-00212a1a928f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw0fHxzdHJlZXR3ZWFyJTIwdXJiYW4lMjBmYXNoaW9uJTIwY2xvdGhpbmd8ZW58MXx8fHwxNzc2MTg3OTQzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Selvedge denim reimagined as joggers. Japanese fabric with modern athletic cut. Street meets craft.',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 14,
    isNewArrival: true,
  },
  {
    id: 14,
    name: 'Oversized Drop Shoulder Hoodie',
    price: 165,
    category: 'streetwear',
    image: 'https://images.unsplash.com/photo-1760126130338-4e6c9043ee2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw1fHxzdHJlZXR3ZWFyJTIwdXJiYW4lMjBmYXNoaW9uJTIwY2xvdGhpbmd8ZW58MXx8fHwxNzc2MTg3OTQzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Statement piece in heavyweight cotton. Relaxed oversized fit with dropped shoulders. Essential streetwear staple.',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 9,
    isBestSeller: true,
    isNewArrival: true,
  },
  {
    id: 15,
    name: 'Urban Layering Set',
    price: 215,
    category: 'streetwear',
    image: 'https://images.unsplash.com/photo-1771736824768-ad662e6e0672?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw2fHxzdHJlZXR3ZWFyJTIwdXJiYW4lMjBmYXNoaW9uJTIwY2xvdGhpbmd8ZW58MXx8fHwxNzc2MTg3OTQzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Complete coordinated outfit for the urban explorer. Layered pieces designed to work together. Street culture elevated.',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 6,
  },
  {
    id: 16,
    name: 'Tactical Cargo System',
    price: 185,
    category: 'streetwear',
    image: 'https://images.unsplash.com/photo-1698601413112-7d9733b2df49?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw3fHxzdHJlZXR3ZWFyJTIwdXJiYW4lMjBmYXNoaW9uJTIwY2xvdGhpbmd8ZW58MXx8fHwxNzc2MTg3OTQzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Military-inspired cargo pants with modern updates. Reinforced ripstop fabric, multi-pocket design. Form follows function.',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 8,
  },
];

function distributeStock(total, sizes) {
  if (sizes.length === 0) return {};

  const base = Math.floor(total / sizes.length);
  let remainder = total % sizes.length;
  const distribution = {};

  for (const size of sizes) {
    distribution[size] = base + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder -= 1;
  }

  return distribution;
}

async function seed() {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    for (const product of products) {
      await connection.query(
        `
          INSERT INTO products (id, name, price, category, description, image_path, is_new_arrival, is_best_seller)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            price = VALUES(price),
            category = VALUES(category),
            description = VALUES(description),
            image_path = VALUES(image_path),
            is_new_arrival = VALUES(is_new_arrival),
            is_best_seller = VALUES(is_best_seller),
            updated_at = CURRENT_TIMESTAMP
        `,
        [
          product.id,
          product.name,
          product.price,
          product.category,
          product.description,
          product.image,
          Boolean(product.isNewArrival),
          Boolean(product.isBestSeller),
        ],
      );

      await connection.query('DELETE FROM product_inventory WHERE product_id = ?', [product.id]);
      const sizeStock = distributeStock(product.stock, product.sizes);
      for (const size of product.sizes) {
        await connection.query(
          'INSERT INTO product_inventory (product_id, size, stock) VALUES (?, ?, ?)',
          [product.id, size, sizeStock[size]],
        );
      }
    }

    await connection.commit();
    console.log(`Seeded ${products.length} products successfully.`);
  } catch (error) {
    await connection.rollback();
    console.error('Failed to seed products');
    console.error(error);
    process.exitCode = 1;
  } finally {
    connection.release();
    await pool.end();
  }
}

seed();