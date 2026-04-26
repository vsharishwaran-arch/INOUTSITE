import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { pool } from '../config/db.js';
import { HttpError } from '../utils/httpError.js';
import { mapProductRows } from '../utils/productMapper.js';
import { getCached, setCached, invalidateCache } from '../services/cache.service.js';
import { logger } from '../utils/logger.js';
import env from '../config/env.js';

// Helper function to convert uploaded file to proper URL
function getUploadedFileUrl(file, resourceType = 'image') {
  if (!file) return null;
  
  logger.info(`📸 File object: ${JSON.stringify({
    secure_url: file.secure_url,
    public_id: file.public_id,
    url: file.url,
    filename: file.filename,
    path: file.path,
    keys: Object.keys(file).slice(0, 10)
  })}`);
  
  // Cloudinary v4: secure_url is set directly
  if (file.secure_url) {
    logger.info(`✅ Using secure_url: ${file.secure_url}`);
    return file.secure_url;
  }
  
  // Fallback: try url property
  if (file.url) {
    logger.info(`✅ Using url: ${file.url}`);
    return file.url;
  }
  
  // Local storage fallback
  if (file.filename) {
    logger.info(`✅ Using local filename: /uploads/products/${file.filename}`);
    return `/uploads/products/${file.filename}`;
  }
  
  logger.error(`❌ No valid URL found in file object`);
  return null;
}

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
  logger.info(`📤 getNewImagePaths called`);
  logger.info(`📤 req.files: ${req.files ? `${req.files.length} files` : 'undefined'}`);
  
  if (req.files && req.files.length > 0) {
    logger.info(`📤 Processing ${req.files.length} files`);
    const paths = req.files.map((f, idx) => {
      logger.info(`📤 Processing file ${idx}`);
      const url = getUploadedFileUrl(f, 'image');
      if (!url) {
        throw new HttpError(500, 'Image upload failed - no URL returned from storage');
      }
      return url;
    });
    if (paths.length === 0) {
      throw new HttpError(500, 'Image upload failed - no files processed');
    }
    logger.info(`📤 Generated ${paths.length} image paths`);
    return paths;
  }
  logger.warn(`⚠️ No files found in req.files`);
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

  // Generate cache key based on filters
  const cacheKey = `products:list:${JSON.stringify(filters.sort())}:${JSON.stringify(params)}`;
  
  // Check cache first
  const cached = getCached(cacheKey);
  if (cached) {
    return res.json({ items: cached });
  }

  const products = await fetchProducts({
    whereClause: filters.length ? `WHERE ${filters.join(' AND ')}` : '',
    params,
  });

  // Cache for 5 minutes
  setCached(cacheKey, products, 5 * 60 * 1000);

  // DEBUG: Log first few products with image data
  if (products.length > 0) {
    const sample = products.slice(0, 3).map(p => ({
      id: p.id,
      name: p.name,
      image: p.image ? `✓ (${p.image.substring(0, 50)}...)` : '✗ NULL',
      images: p.images ? `✓ [${p.images.length} images]` : '✗ NULL',
    }));
    logger.info(`📦 listProducts: Returning ${products.length} products\n${JSON.stringify(sample, null, 2)}`);
  }

  res.json({ items: products });
}

export async function getProductById(req, res) {
  const cacheKey = `product:${req.params.id}`;
  
  // Check cache first
  const cached = getCached(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const products = await fetchProducts({
    whereClause: 'WHERE p.id = :id',
    params: { id: req.params.id },
  });

  const product = products[0];
  if (!product) {
    throw new HttpError(404, 'Product not found');
  }

  // Cache individual product for 10 minutes
  setCached(cacheKey, product, 10 * 60 * 1000);

  // DEBUG: Log product image data
  logger.info(`🔍 getProductById: ID=${product.id} | name="${product.name}" | image="${product.image ? '✓' : '✗'}" | images=[${product.images ? product.images.length : '✗'}] | image_val="${product.image ? product.image.substring(0, 60) : 'NULL'}"`);

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
  logger.info(`📤 CREATE PRODUCT: received request for "${data.name}"`);
  logger.info(`📤 req.files: ${JSON.stringify(req.files?.length || 0)} files`);
  
  const imagePaths = getNewImagePaths(req);
  logger.info(`📤 imagePaths from getNewImagePaths: ${JSON.stringify(imagePaths)}`);
  
  const sizeStock = parseSizeStock(req.body.sizeStock || {});

  if (imagePaths.length === 0) {
    logger.error('❌ No images provided');
    throw new HttpError(400, 'At least one product image is required');
  }

  // Validate image paths are valid URLs or paths
  imagePaths.forEach((path, idx) => {
    logger.info(`📤 Image ${idx}: ${path}`);
    if (typeof path !== 'string' || path.length === 0) {
      throw new HttpError(500, `Invalid image path at index ${idx}`);
    }
  });

  const primaryImage = imagePaths[0];
  const imagesJson = JSON.stringify(imagePaths);
  
  logger.info(`📤 Primary image: ${primaryImage}`);
  logger.info(`📤 Images JSON: ${imagesJson}`);

  // Verify JSON is valid and parseable
  try {
    JSON.parse(imagesJson);
  } catch (e) {
    throw new HttpError(500, 'Failed to serialize images data');
  }

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

  const createdProduct = products[0];
  if (!createdProduct) {
    throw new HttpError(500, 'Failed to retrieve created product from database');
  }

  // Verify images were persisted to database
  if (!createdProduct.images || createdProduct.images.length === 0) {
    logger.error('Image persistence failure', {
      insertedProductId,
      requestImagePaths: imagePaths,
      retrievedProduct: createdProduct,
    });
    throw new HttpError(500, 'Product created but images not persisted to database');
  }

  // Invalidate all product list caches on create
  invalidateCache('products:list:*');

  logger.info(`✅ PRODUCT CREATED: ID=${createdProduct.id}, images=${JSON.stringify(createdProduct.images)}`);
  
  res.status(201).json({ message: 'Product created successfully', product: createdProduct });
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
  
  // Validate final images
  if (!finalImages || finalImages.length === 0) {
    throw new HttpError(400, 'Product must have at least one image');
  }

  // Verify all final images are valid strings
  finalImages.forEach((img, idx) => {
    if (typeof img !== 'string' || img.length === 0) {
      throw new HttpError(500, `Invalid image at index ${idx} in finalImages`);
    }
  });

  const primaryImage = finalImages[0];
  const imagesJson = JSON.stringify(finalImages);

  // Verify JSON is valid and parseable
  try {
    JSON.parse(imagesJson);
  } catch (e) {
    throw new HttpError(500, 'Failed to serialize images data during update');
  }

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

  const updatedProduct = products[0];
  if (!updatedProduct) {
    throw new HttpError(500, 'Failed to retrieve updated product from database');
  }

  // Verify images were persisted to database
  if (!updatedProduct.images || updatedProduct.images.length === 0) {
    logger.error('Image persistence failure on update', {
      productId,
      sentImagePaths: finalImages,
      retrievedProduct: updatedProduct,
    });
    throw new HttpError(500, 'Product updated but images not persisted to database');
  }

  // Invalidate caches on update
  invalidateCache(`product:${productId}`, 'products:list:*');

  res.json({ message: 'Product updated successfully', product: updatedProduct });
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

  // Invalidate caches on delete
  invalidateCache(`product:${req.params.id}`, 'products:list:*');

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