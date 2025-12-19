import multer from 'multer';
import { type Request } from 'express';
import { mkdirSync } from 'fs';

// Ensure directories exist
mkdirSync(process.env.UPLOAD_DIR ? `${process.env.UPLOAD_DIR}/photos` : './public/photos', { recursive: true });

// Configure local storage for photos
const photoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_DIR ? `${process.env.UPLOAD_DIR}/photos` : './public/photos');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `photos-${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});



// File filter to allow only specific image types
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  try {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Only JPEG, PNG, and GIF are allowed.`));
    }
  } catch (error) {
    cb(error instanceof Error ? error : new Error('Error in file filter'));
  }
};

// Multer middleware for photo uploads
export const uploadPhoto = multer({
  storage: photoStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});
