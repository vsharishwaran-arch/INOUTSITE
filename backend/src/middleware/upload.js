import fs from 'fs';
import path from 'path';
import multer from 'multer';

function makeStorage(subfolder) {
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

export const uploadProductImage = multer({
  storage: makeStorage('products'),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadProductImages = multer({
  storage: makeStorage('products'),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
});

export const uploadContentImage = multer({
  storage: makeStorage('content'),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

function videoFilter(_req, file, callback) {
  if (!file.mimetype.startsWith('video/')) {
    return callback(new Error('Only video uploads are allowed'));
  }
  callback(null, true);
}

export const uploadVideo = multer({
  storage: makeStorage('videos'),
  fileFilter: videoFilter,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200 MB
});

export const uploadCarouselImage = multer({
  storage: makeStorage('carousel'),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadCarouselVideo = multer({
  storage: makeStorage('carousel'),
  fileFilter: videoFilter,
  limits: { fileSize: 200 * 1024 * 1024 },
});