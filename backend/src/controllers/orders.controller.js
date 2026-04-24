import { z } from 'zod';
import { pool } from '../config/db.js';
import { verifyPaymentSignature } from '../services/payment.service.js';
import { HttpError } from '../utils/httpError.js';
import { logger } from '../utils/logger.js';

const checkoutSchema = z.object({
  paymentMethod: z.enum(['upi', 'cod']),
  paymentProvider: z.string().min(1),
  paymentOrderId: z.string().min(1),
  paymentReference: z.string().min(1),
  paymentSignature: z.string().optional(),
  items: z.array(z.object({
    productId: z.coerce.number().int().positive(),
    quantity: z.coerce.number().int().positive(),
    size: z.enum(['S', 'M', 'L', 'XL']),
  })).min(1),
  shipping: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(1),
    address: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    zipCode: z.string().min(1),
  }),
  couponCode: z.string().optional(),
});

export async function createOrder(req, res) {
  const payload = checkoutSchema.parse(req.body);

  // DUPLICATE PAYMENT PREVENTION: Check if this razorpay order_id already exists
  if (payload.paymentOrderId) {
    const [existing] = await pool.query(
      'SELECT id FROM orders WHERE payment_order_id = ?',
      [payload.paymentOrderId],
    );
    if (existing.length > 0) {
      logger.warn('Duplicate payment attempt', { paymentOrderId: payload.paymentOrderId });
      throw new HttpError(409, 'This payment has already been processed');
    }
  }

  // Skip payment verification for COD orders
  if (payload.paymentMethod !== 'cod') {
    if (!verifyPaymentSignature({
      orderId: payload.paymentOrderId,
      paymentId: payload.paymentReference,
      signature: payload.paymentSignature,
    })) {
      throw new HttpError(400, 'Payment verification failed');
    }
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const orderItems = [];
    let subtotal = 0;

    for (const item of payload.items) {
      const [rows] = await connection.query(
        `
          SELECT p.id, p.name, p.price, p.image_path, inv.stock
          FROM products p
          INNER JOIN product_inventory inv ON inv.product_id = p.id
          WHERE p.id = ? AND inv.size = ?
          FOR UPDATE
        `,
        [item.productId, item.size],
      );

      const product = rows[0];
      if (!product) {
        throw new HttpError(404, `Product ${item.productId} with size ${item.size} not found`);
      }
      if (Number(product.stock) < item.quantity) {
        throw new HttpError(400, `Only ${product.stock} items left for ${product.name} (${item.size})`);
      }

      const lineTotal = Number(product.price) * item.quantity;
      subtotal += lineTotal;
      orderItems.push({
        ...item,
        productName: product.name,
        imagePath: product.image_path,
        unitPrice: Number(product.price),
        lineTotal,
      });
    }

    const shippingAmount = subtotal > 200 ? 0 : 15;

    // Coupon discount
    let discountAmount = 0;
    let couponCode = null;
    if (payload.couponCode) {
      const [couponRows] = await connection.query(
        'SELECT * FROM coupons WHERE code = ? AND is_active = TRUE FOR UPDATE',
        [payload.couponCode],
      );
      const coupon = couponRows[0];
      if (coupon) {
        const now = new Date();
        const validStart = !coupon.starts_at || new Date(coupon.starts_at) <= now;
        const validEnd = !coupon.expires_at || new Date(coupon.expires_at) >= now;
        const validUses = !coupon.max_uses || coupon.used_count < coupon.max_uses;
        const validMin = subtotal >= Number(coupon.min_order_amount);

        if (validStart && validEnd && validUses && validMin) {
          if (coupon.type === 'percentage') {
            discountAmount = Math.round((subtotal * Number(coupon.value)) / 100 * 100) / 100;
          } else {
            discountAmount = Math.min(Number(coupon.value), subtotal);
          }
          couponCode = coupon.code;
          await connection.query('UPDATE coupons SET used_count = used_count + 1 WHERE id = ?', [coupon.id]);
        }
      }
    }

    const totalAmount = subtotal + shippingAmount - discountAmount;

    const [orderResult] = await connection.query(
      `
        INSERT INTO orders (
          user_id,
          guest_email,
          guest_phone,
          status,
          payment_status,
          payment_method,
          payment_provider,
          payment_order_id,
          payment_reference,
          subtotal,
          shipping_amount,
          discount_amount,
          coupon_code,
          total_amount,
          shipping_first_name,
          shipping_last_name,
          shipping_address,
          shipping_city,
          shipping_state,
          shipping_zip_code
        )
        VALUES (?, ?, ?, 'processing', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        req.user?.sub || null,
        payload.shipping.email,
        payload.shipping.phone,
        payload.paymentMethod === 'cod' ? 'pending' : 'paid',
        payload.paymentMethod,
        payload.paymentProvider,
        payload.paymentOrderId,
        payload.paymentReference,
        subtotal,
        shippingAmount,
        discountAmount,
        couponCode,
        totalAmount,
        payload.shipping.firstName,
        payload.shipping.lastName,
        payload.shipping.address,
        payload.shipping.city,
        payload.shipping.state,
        payload.shipping.zipCode,
      ],
    );

    for (const item of orderItems) {
      await connection.query(
        `
          INSERT INTO order_items (
            order_id,
            product_id,
            product_name,
            image_path,
            size,
            quantity,
            unit_price,
            line_total
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          orderResult.insertId,
          item.productId,
          item.productName,
          item.imagePath,
          item.size,
          item.quantity,
          item.unitPrice,
          item.lineTotal,
        ],
      );

      await connection.query(
        'UPDATE product_inventory SET stock = stock - ? WHERE product_id = ? AND size = ?',
        [item.quantity, item.productId, item.size],
      );
    }

    await connection.commit();

    logger.info('Order created', {
      orderId: orderResult.insertId,
      paymentOrderId: payload.paymentOrderId,
      totalAmount,
      itemCount: orderItems.length,
    });

    res.status(201).json({
      message: 'Order created successfully',
      orderId: String(orderResult.insertId),
      subtotal,
      shippingAmount,
      discountAmount,
      couponCode,
      totalAmount,
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function getOrderById(req, res) {
  const [orderRows] = await pool.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
  const order = orderRows[0];
  if (!order) {
    throw new HttpError(404, 'Order not found');
  }
  const isAdmin = req.user?.role === 'admin';
  const isOwner = req.user?.sub && order.user_id && String(order.user_id) === String(req.user.sub);
  if (!isAdmin && !isOwner) {
    throw new HttpError(403, 'You are not allowed to access this order');
  }

  const [itemRows] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [req.params.id]);
  res.json({
    id: String(order.id),
    status: order.status,
    paymentStatus: order.payment_status,
    paymentMethod: order.payment_method,
    subtotal: Number(order.subtotal),
    shippingAmount: Number(order.shipping_amount),
    discountAmount: Number(order.discount_amount || 0),
    couponCode: order.coupon_code || null,
    totalAmount: Number(order.total_amount),
    shipping: {
      firstName: order.shipping_first_name,
      lastName: order.shipping_last_name,
      address: order.shipping_address,
      city: order.shipping_city,
      state: order.shipping_state,
      zipCode: order.shipping_zip_code,
      email: order.guest_email,
      phone: order.guest_phone,
    },
    items: itemRows.map((item) => ({
      productId: String(item.product_id),
      productName: item.product_name,
      image: item.image_path,
      size: item.size,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unit_price),
      lineTotal: Number(item.line_total),
    })),
  });
}

export async function listOrders(req, res) {
  const [rows] = await pool.query(
    `
      SELECT id, status, payment_status, payment_method, subtotal, shipping_amount, total_amount,
             guest_email, guest_phone, shipping_first_name, shipping_last_name, created_at
      FROM orders
      ORDER BY created_at DESC
    `,
  );

  res.json({
    items: rows.map((row) => ({
      id: String(row.id),
      status: row.status,
      paymentStatus: row.payment_status,
      paymentMethod: row.payment_method,
      subtotal: Number(row.subtotal),
      shippingAmount: Number(row.shipping_amount),
      totalAmount: Number(row.total_amount),
      customerName: `${row.shipping_first_name} ${row.shipping_last_name}`,
      email: row.guest_email,
      phone: row.guest_phone,
      createdAt: row.created_at,
    })),
  });
}

export async function updateOrderStatus(req, res) {
  const schema = z.object({
    status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'cancelled', 'delivered']),
  });
  const payload = schema.parse(req.body);

  const [result] = await pool.query(
    'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [payload.status, req.params.id],
  );

  if (result.affectedRows === 0) {
    throw new HttpError(404, 'Order not found');
  }

  res.json({ message: 'Order status updated successfully', status: payload.status });
}

export async function myOrders(req, res) {
  const userId = req.user?.sub;
  if (!userId) {
    throw new HttpError(401, 'Authentication required');
  }

  const [rows] = await pool.query(
    `
      SELECT o.id, o.status, o.payment_status, o.payment_method, o.subtotal,
             o.shipping_amount, o.total_amount, o.guest_email, o.guest_phone,
             o.shipping_first_name, o.shipping_last_name, o.created_at
      FROM orders o
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
    `,
    [userId],
  );

  const orderIds = rows.map((r) => r.id);
  let itemsByOrder = {};
  if (orderIds.length > 0) {
    const [itemRows] = await pool.query(
      `SELECT * FROM order_items WHERE order_id IN (${orderIds.map(() => '?').join(',')})`,
      orderIds,
    );
    for (const item of itemRows) {
      if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
      itemsByOrder[item.order_id].push({
        productId: String(item.product_id),
        productName: item.product_name,
        image: item.image_path,
        size: item.size,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unit_price),
        lineTotal: Number(item.line_total),
      });
    }
  }

  res.json({
    items: rows.map((row) => ({
      id: String(row.id),
      status: row.status,
      paymentStatus: row.payment_status,
      paymentMethod: row.payment_method,
      subtotal: Number(row.subtotal),
      shippingAmount: Number(row.shipping_amount),
      totalAmount: Number(row.total_amount),
      customerName: `${row.shipping_first_name} ${row.shipping_last_name}`,
      email: row.guest_email,
      phone: row.guest_phone,
      createdAt: row.created_at,
      items: itemsByOrder[row.id] || [],
    })),
  });
}

export async function updatePaymentStatus(req, res) {
  const schema = z.object({
    paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded']),
  });
  const payload = schema.parse(req.body);

  const [result] = await pool.query(
    'UPDATE orders SET payment_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [payload.paymentStatus, req.params.id],
  );

  if (result.affectedRows === 0) {
    throw new HttpError(404, 'Order not found');
  }

  res.json({ message: 'Payment status updated successfully', paymentStatus: payload.paymentStatus });
}

export async function bulkUpdateOrderStatus(req, res) {
  const schema = z.object({
    orderIds: z.array(z.coerce.number().int().positive()).min(1),
    status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'cancelled', 'delivered']),
  });
  const payload = schema.parse(req.body);

  const placeholders = payload.orderIds.map(() => '?').join(',');
  const [result] = await pool.query(
    `UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`,
    [payload.status, ...payload.orderIds],
  );

  res.json({
    message: `Updated ${result.affectedRows} orders to "${payload.status}"`,
    affectedRows: result.affectedRows,
  });
}