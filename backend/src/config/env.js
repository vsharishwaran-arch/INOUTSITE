import dotenv from 'dotenv';

dotenv.config();

const env = {
  port: Number(process.env.PORT || 4000),
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  mysqlHost: process.env.MYSQL_HOST || 'localhost',
  mysqlPort: Number(process.env.MYSQL_PORT || 3306),
  mysqlUser: process.env.MYSQL_USER || 'root',
  mysqlPassword: process.env.MYSQL_PASSWORD || '',
  mysqlDatabase: process.env.MYSQL_DATABASE || 'clothing_store',
  jwtSecret: process.env.JWT_SECRET || 'dev_secret_change_me',
  paymentProvider: process.env.PAYMENT_PROVIDER || 'demo',
  paymentCurrency: process.env.PAYMENT_CURRENCY || 'USD',
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || '',
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || '',
  fast2smsApiKey: process.env.FAST2SMS_API_KEY || '',
  smsProvider: process.env.SMS_PROVIDER || '',
};

export default env;