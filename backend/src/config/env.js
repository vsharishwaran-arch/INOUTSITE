import dotenv from 'dotenv';

dotenv.config();

const env = {
  port: Number(process.env.PORT || 4000),
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'dev_secret_change_me',
  paymentProvider: process.env.PAYMENT_PROVIDER || 'demo',
  paymentCurrency: process.env.PAYMENT_CURRENCY || 'USD',
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || '',
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || '',
  fast2smsApiKey: process.env.FAST2SMS_API_KEY || '',
  smsProvider: process.env.SMS_PROVIDER || '',
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || '',
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || '',
};

export default env;