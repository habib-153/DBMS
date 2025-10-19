
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { cloudinaryUpload } from './cloudinary.config';
import { Request } from 'express';

// Define the MulterFile type used below
type MulterFile = {
  fieldname: string;
  originalname: string;
  mimetype: string;
  [key: string]: unknown;
};

const removeExtension = (filename: string) => {
  return filename.split('.').slice(0, -1).join('.');
};
const storage = new CloudinaryStorage({
  cloudinary: cloudinaryUpload,
  params: (req: Request, file: MulterFile) => ({
    public_id:
      Math.random().toString(36).substring(2) +
      '-' +
      Date.now() +
      '-' +
      file.fieldname +
      '-' +
      removeExtension(file.originalname),
    resource_type: file.mimetype.startsWith('video/') ? 'video' : 'image',
  }),
});

export const multerUpload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for uploads (we'll compress before uploading)
  },
  fileFilter: (req, file, cb) => {
    // Accept images and videos
    if (
      file.mimetype.startsWith('image/') ||
      file.mimetype.startsWith('video/')
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed!'));
    }
  },
});
