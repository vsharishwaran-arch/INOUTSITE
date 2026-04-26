import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';
import env from '../config/env.js';
import { logger } from '../utils/logger.js';

// Use Cloudinary if configured, otherwise fall back to local storage
const useCloudinary = env.cloudinaryCloudName && env.cloudinaryApiKey && env.cloudinaryApiSecret;

function makeStorage(subfolder, resourceType = 'image') {
  if (useCloudinary) {
    logger.info(`Using Cloudinary storage for ${subfolder} (resource_type: ${resourceType})`);
    return new CloudinaryStorage({
      cloudinary,
      params: async (req, file) => {
        return {
          folder: `inout-fashion/${subfolder}`,
          resource_type: resourceType,
          overwrite: false,
        };
      },
      // Custom handler to construct full secure URL
      fileFilter: (req, file, cb) => cb(null, true),
    });
  }

  logger.info(`Using local disk storage for ${subfolder}`);
  // Fallback to local disk storage
  const dir = path.resolve(process.cwd(), 'uploads', subfolder);
  fs.mkdirSync(dir, { recursive: true });
  return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, dir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      const base = path.basename(file.originalname, ext)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      cb(null, `${base || 'file'}-${Date.now()}${ext}`);
    },
  });
}

function imageFilter(_req, file, callback) {
  if (!file.mimetype.startsWith('image/')) {
    return callback(new Error('Only image uploads are allowed'));
  }
  callback(null, true);
}

// Custom multer instance that enriches Cloudinary files with secure_url
const buildMulter = (storage, filter, limits) => {
  const multerInstance = multer({ storage, fileFilter: filter, limits });
  
  // Wrap the multer instance to post-process files
  return (fieldname, maxCount) => {
    return (req, res, next) => {
      const middleware = multerInstance.array(fieldname, maxCount);
      
      middleware(req, res, () => {
        // Post-process files to add secure_url
        if (req.files && Array.isArray(req.files)) {
          req.files = req.files.map(file => {
            // If using Cloudinary and no secure_url, construct it
            if (useCloudinary && !file.secure_url && file.public_id) {
              const secure_url = cloudinary.url(file.public_id, {
                resource_type: file.resource_type || 'image',
                secure: true,
                quality: 'auto',
                fetch_format: 'auto'
              });
              logger.info(`✅ Constructed Cloudinary URL: ${secure_url}`);
              return {
                ...file,
                secure_url,
                url: secure_url // Fallback
              };
            }
            return file;
          });
        }
        next();
      });
    };
  };
};

const buildUpload = (storage, filter, limits) => {
  const builder = buildMulter(storage, filter, limits);
  return {
    array: (fieldname, maxCount) => builder(fieldname, maxCount),
    single: (fieldname) => {
      const multerInstance = multer({ storage, fileFilter: filter, limits });
      return (req, res, next) => {
        const middleware = multerInstance.single(fieldname);
        middleware(req, res, () => {
          if (useCloudinary && req.file && !req.file.secure_url && req.file.public_id) {
            req.file.secure_url = cloudinary.url(req.file.public_id, {
              resource_type: req.file.resource_type || 'image',
              secure: true,
              quality: 'auto',
              fetch_format: 'auto'
            });
          }
          next();
        });
      };
    }
  };
};

export const uploadProductImage = buildUpload(makeStorage('products', 'image'), imageFilter, { fileSize: 5 * 1024 * 1024 });

export const uploadProductImages = buildUpload(makeStorage('products', 'image'), imageFilter, { fileSize: 5 * 1024 * 1024, files: 5 });

export const uploadContentImage = buildUpload(makeStorage('content', 'image'), imageFilter, { fileSize: 5 * 1024 * 1024 });

function videoFilter(_req, file, callback) {
  if (!file.mimetype.startsWith('video/')) {
    return callback(new Error('Only video uploads are allowed'));
  }
  callback(null, true);
}

export const uploadVideo = buildUpload(makeStorage('videos', 'video'), videoFilter, { fileSize: 200 * 1024 * 1024 });

export const uploadCarouselImage = buildUpload(makeStorage('carousel', 'image'), imageFilter, { fileSize: 5 * 1024 * 1024 });

export const uploadCarouselVideo = buildUpload(makeStorage('carousel', 'video'), videoFilter, { fileSize: 200 * 1024 * 1024 });