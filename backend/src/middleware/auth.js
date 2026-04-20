import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import { HttpError } from '../utils/httpError.js';

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(new HttpError(401, 'Authentication required'));
  }

  try {
    const token = authHeader.slice(7);
    const payload = jwt.verify(token, env.jwtSecret);
    req.user = payload;
    next();
  } catch (error) {
    next(new HttpError(401, 'Invalid or expired token'));
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return next(new HttpError(403, 'Admin access required'));
  }
  next();
}