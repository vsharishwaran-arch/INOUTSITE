import path from 'path';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import env from './config/env.js';
import apiRoutes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin(origin, callback) {
    // Allow requests with no origin (curl, mobile apps, server-to-server)
    if (!origin) return callback(null, true);
    // Allow the configured production origin
    if (origin === env.clientOrigin) return callback(null, true);
    // Allow any Vercel preview deployment for this project
    if (/https:\/\/inoutsite(-[a-z0-9]+)*-vsharishwaran-2571s-projects\.vercel\.app$/.test(origin)) return callback(null, true);
    // Allow Netlify deploy previews
    if (/https:\/\/[a-z0-9-]+--inoutsite\.netlify\.app$/.test(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

app.use('/api', apiRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;