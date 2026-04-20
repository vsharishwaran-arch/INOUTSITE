import { z } from 'zod';
import { createPaymentIntent } from '../services/payment.service.js';

export async function createIntent(req, res) {
  const schema = z.object({
    amount: z.coerce.number().positive(),
    paymentMethod: z.enum(['upi', 'cod']),
    customerEmail: z.string().email().optional(),
  });

  const payload = schema.parse(req.body);
  const paymentIntent = await createPaymentIntent({
    amount: payload.amount,
    receipt: `receipt_${Date.now()}`,
    notes: {
      paymentMethod: payload.paymentMethod,
      customerEmail: payload.customerEmail || '',
    },
  });

  res.status(201).json(paymentIntent);
}