import crypto from 'crypto';
import Razorpay from 'razorpay';
import env from '../config/env.js';

const razorpayClient = env.razorpayKeyId && env.razorpayKeySecret
  ? new Razorpay({
      key_id: env.razorpayKeyId,
      key_secret: env.razorpayKeySecret,
    })
  : null;

export async function createPaymentIntent({ amount, receipt, notes = {} }) {
  if (env.paymentProvider === 'razorpay' && razorpayClient) {
    const order = await razorpayClient.orders.create({
      amount: Math.round(amount * 100),
      currency: env.paymentCurrency,
      receipt,
      notes,
    });

    return {
      provider: 'razorpay',
      keyId: env.razorpayKeyId,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
    };
  }

  return {
    provider: 'demo',
    orderId: `demo_${Date.now()}`,
    amount,
    currency: env.paymentCurrency,
    receipt,
  };
}

export function verifyPaymentSignature({ orderId, paymentId, signature }) {
  if (env.paymentProvider !== 'razorpay' || !razorpayClient) {
    return true;
  }

  const expectedSignature = crypto
    .createHmac('sha256', env.razorpayKeySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return expectedSignature === signature;
}