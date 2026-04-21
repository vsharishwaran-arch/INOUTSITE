import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { pool } from '../config/db.js';
import { HttpError } from '../utils/httpError.js';
import { mapProductRows } from '../utils/productMapper.js';

function removeUploadedImage(imagePath) {
  // Only remove local files (for backward compatibility)
  // Cloudinary URLs are handled automatically
  if (!imagePath || !imagePath.startsWith('/uploads/')) return;
  const fullPath = path.resolve(process.cwd(), imagePath.slice(1));
  fs.unlink(fullPath, () => {});
}

const SIZE_KEYS = ['S', 'M', 'L', 'XL'];

function parseBoolean(value) {
  return value === true || value === 'true' || value === '1' || value === 1;
}

function parseSizeStock(rawValue) {
  const value = typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue;
  const sizeStock = {};

  for (const size of SIZE_KEYS) {
    const stock = Number(value?.[size] ?? 0);
    if (!Number.isFinite(stock) || stock < 0) {
      throw new HttpError(400, `Invalid stock value for size ${size}`);
    }
    sizeStock[size] = stock;
  }

  return sizeStock;
}

function getNewImagePaths(req) {
  if (req.files && req.files.length > 0) {
    // Cloudinary: files have secure_url property
    // Local storage: files have filename property
    return req.files.map(f => f.secure_url || `/uploads/products/${f.filename}`);
  }
  return [];
}

async function fetchProducts({ whereClause = '', params = {} } = {}) {
  const [rows] = await pool.query(
    `
      SELECT
        p.id,
        p.name,
        p.price,
        p.category,
        p.description,
        p.image_path,
        p.images_json,
        p.is_new_arrival,
        p.is_best_seller,
        p.is_on_offer,
        p.is_carousel,
        p.sku,
        p.discount_price,
        p.tags,
        p.wash_care,
        p.sleeve,
        p.pattern,
        p.package_contents,
        p.net_quantity,
        p.material,
        p.fit_type,
        p.shipping_info,
        p.return_policy,
        p.social_proof_count,
        p.social_proof_24hrs,
        p.is_trending,
        p.stats_customers,
        p.stats_orders,
        p.stats_stores,
        p.created_at,
        i.size,
        i.stock
      FROM products p
      LEFT JOIN product_inventory i ON i.product_id = p.id
      ${whereClause}
      ORDER BY p.created_at DESC, p.id DESC
    `,
    params,
  );

  return mapProductRows(rows);
}

export async function listProducts(req, res) {
  const filters = [];
  const params = {};

  if (req.query.category) {
    filters.push('p.category = :category');
    params.category = req.query.category;
  }
  if (req.query.isNewArrival === 'true') {
    filters.push('p.is_new_arrival = true');
  }
  if (req.query.isBestSeller === 'true') {
    filters.push('p.is_best_seller = true');
  }
  if (req.query.isOnOffer === 'true') {
    filters.push('p.is_on_offer = true');
  }
  if (req.query.search) {
    filters.push('(p.name LIKE :search OR p.description LIKE :search OR p.category LIKE :search)');
    params.search = `%${req.query.search}%`;
  }

  const products = await fetchProducts({
    whereClause: filters.length ? `WHERE ${filters.join(' AND ')}` : '',
    params,
  });

  res.json({ items: products });
}

export async function getProductById(req, res) {
  const products = await fetchProducts({
    whereClause: 'WHERE p.id = :id',
    params: { id: req.params.id },
  });

  const product = products[0];
  if (!product) {
    throw new HttpError(404, 'Product not found');
  }

  res.json(product);
}

export async function createProduct(req, res) {
  const schema = z.object({
    name: z.string().min(2),
    price: z.coerce.number().positive(),
    category: z.string().min(1),
    description: z.string().min(10),
  });

  const data = schema.parse(req.body);
  const imagePaths = getNewImagePaths(req);
  const sizeStock = parseSizeStock(req.body.sizeStock || {});

  if (imagePaths.length === 0) {
    throw new HttpError(400, 'At least one product image is required');
  }

  const primaryImage = imagePaths[0];
  const imagesJson = JSON.stringify(imagePaths);

  let insertedProductId = null;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [result] = await connection.query(
      `
        INSERT INTO products
          (name, price, category, description, image_path, images_json,
           is_new_arrival, is_best_seller, is_on_offer, is_carousel, sku, discount_price, tags,
           wash_care, sleeve, pattern, package_contents, net_quantity,
           material, fit_type, shipping_info, return_policy,
           social_proof_count, social_proof_24hrs, is_trending,
           stats_customers, stats_orders, stats_stores)
        VALUES
          (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        data.name,
        data.price,
        data.category,
        data.description,
        primaryImage,
        imagesJson,
        parseBoolean(req.body.isNewArrival),
        parseBoolean(req.body.isBestSeller),
        parseBoolean(req.body.isOnOffer),
        parseBoolean(req.body.isCarousel),
        req.body.sku || '',
        req.body.discountPrice ? Number(req.body.discountPrice) : null,
        req.body.tags || '',
        req.body.washCare || '',
        req.body.sleeve || '',
        req.body.pattern || '',
        req.body.packageContents || '',
        req.body.netQuantity ? Number(req.body.netQuantity) : null,
        req.body.material || '',
        req.body.fitType || '',
        req.body.shippingInfo || '',
        req.body.returnPolicy || '',
        req.body.socialProofCount ? Number(req.body.socialProofCount) : 855,
        req.body.socialProof24hrs ? Number(req.body.socialProof24hrs) : 9,
        parseBoolean(req.body.isTrending),
        req.body.statsCustomers || '3M+',
        req.body.statsOrders || '2L+',
        req.body.statsStores || '5+',
      ],
    );
    insertedProductId = result.insertId;

    for (const [size, stock] of Object.entries(sizeStock)) {
      await connection.query(
        'INSERT INTO product_inventory (product_id, size, stock) VALUES (?, ?, ?)',
        [insertedProductId, size, stock],
      );
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  const products = await fetchProducts({
    whereClause: 'WHERE p.id = :id',
    params: { id: insertedProductId },
  });

  res.status(201).json({ message: 'Product created successfully', product: products[0] });
}

export async function updateProduct(req, res) {
  const productId = req.params.id;
  const schema = z.object({
    name: z.string().min(2),
    price: z.coerce.number().positive(),
    category: z.string().min(1),
    description: z.string().min(10),
  });

  const existingProducts = await fetchProducts({
    whereClause: 'WHERE p.id = :id',
    params: { id: productId },
  });

  if (!existingProducts[0]) {
    throw new HttpError(404, 'Product not found');
  }

  const data = schema.parse(req.body);
  const sizeStock = parseSizeStock(req.body.sizeStock || existingProducts[0].sizeStock || {});

  // Build combined image list: kept existing + newly uploaded
  const keptImages = (() => {
    try {
      const parsed = JSON.parse(req.body.existingImages || '[]');
      // Normalize to bare paths: strip any http://host prefix so comparison
      // works whether the frontend sent full URLs or bare /uploads/... paths
      return parsed.map(img => {
        try { return new URL(img).pathname; } catch { return img; }
      });
    } catch { return []; }
  })();
  const newPaths = getNewImagePaths(req);
  const allImages = [...keptImages, ...newPaths];

  // Fall back to existing product images if nothing provided
  const finalImages = allImages.length > 0 ? allImages : (existingProducts[0].images || [existingProducts[0].image]);
  const primaryImage = finalImages[0] || existingProducts[0].image;
  const imagesJson = JSON.stringify(finalImages);

  // Remove images that were dropped (only local /uploads/ paths)
  const oldImages = existingProducts[0].images || [existingProducts[0].image];
  for (const oldImg of oldImages) {
    if (oldImg && !keptImages.includes(oldImg)) {
      removeUploadedImage(oldImg);
    }
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query(
      `
        UPDATE products
        SET name = ?, price = ?, category = ?, description = ?, image_path = ?, images_json = ?,
            is_new_arrival = ?, is_best_seller = ?, is_on_offer = ?, is_carousel = ?, sku = ?, discount_price = ?, tags = ?,
            wash_care = ?, sleeve = ?, pattern = ?, package_contents = ?, net_quantity = ?,
            material = ?, fit_type = ?, shipping_info = ?, return_policy = ?,
            social_proof_count = ?, social_proof_24hrs = ?, is_trending = ?,
            stats_customers = ?, stats_orders = ?, stats_stores = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      [
        data.name,
        data.price,
        data.category,
        data.description,
        primaryImage,
        imagesJson,
        parseBoolean(req.body.isNewArrival),
        parseBoolean(req.body.isBestSeller),
        parseBoolean(req.body.isOnOffer),
        parseBoolean(req.body.isCarousel),
        req.body.sku || '',
        req.body.discountPrice ? Number(req.body.discountPrice) : null,
        req.body.tags || '',
        req.body.washCare || '',
        req.body.sleeve || '',
        req.body.pattern || '',
        req.body.packageContents || '',
        req.body.netQuantity ? Number(req.body.netQuantity) : null,
        req.body.material || '',
        req.body.fitType || '',
        req.body.shippingInfo || '',
        req.body.returnPolicy || '',
        req.body.socialProofCount ? Number(req.body.socialProofCount) : 855,
        req.body.socialProof24hrs ? Number(req.body.socialProof24hrs) : 9,
        parseBoolean(req.body.isTrending),
        req.body.statsCustomers || '3M+',
        req.body.statsOrders || '2L+',
        req.body.statsStores || '5+',
        productId,
      ],
    );

    await connection.query('DELETE FROM product_inventory WHERE product_id = ?', [productId]);
    for (const [size, stock] of Object.entries(sizeStock)) {
      await connection.query(
        'INSERT INTO product_inventory (product_id, size, stock) VALUES (?, ?, ?)',
        [productId, size, stock],
      );
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  const products = await fetchProducts({
    whereClause: 'WHERE p.id = :id',
    params: { id: productId },
  });
  res.json({ message: 'Product updated successfully', product: products[0] });
}

export async function deleteProduct(req, res) {
  const [rows] = await pool.query('SELECT image_path FROM products WHERE id = ?', [req.params.id]);
  if (!rows[0]) {
    throw new HttpError(404, 'Product not found');
  }

  // Hard delete: remove from DB (order_items.product_id will be SET NULL, order history preserved)
  await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);

  // Remove the image file
  removeUploadedImage(rows[0].image_path);

  res.json({ message: 'Product deleted successfully' });
}

export async function getCarouselProducts(req, res) {
  const products = await fetchProducts({
    whereClause: 'WHERE p.is_carousel = true',
  });
  res.json({ items: products });
}

export async function toggleCarousel(req, res) {
  const productId = req.params.id;
  const { isCarousel } = req.body;

  const [rows] = await pool.query('SELECT id FROM products WHERE id = ?', [productId]);
  if (!rows[0]) {
    throw new HttpError(404, 'Product not found');
  }

  // Enforce max 5 carousel products
  if (isCarousel) {
    const [countRows] = await pool.query(
      'SELECT COUNT(*) as cnt FROM products WHERE is_carousel = true AND id != ?',
      [productId],
    );
    if (countRows[0].cnt >= 5) {
      throw new HttpError(400, 'Maximum 5 carousel products allowed. Remove one first.');
    }
  }

  await pool.query('UPDATE products SET is_carousel = ? WHERE id = ?', [!!isCarousel, productId]);

  res.json({ message: isCarousel ? 'Added to carousel' : 'Removed from carousel' });
}