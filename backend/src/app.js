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
app.use(cors({ origin: env.clientOrigin, credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

app.use('/api', apiRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;