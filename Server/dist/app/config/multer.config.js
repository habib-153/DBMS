"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.multerUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const cloudinary_config_1 = require("./cloudinary.config");
const removeExtension = (filename) => {
    return filename.split('.').slice(0, -1).join('.');
};
const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_config_1.cloudinaryUpload,
    params: (req, file) => ({
        public_id: Math.random().toString(36).substring(2) +
            '-' +
            Date.now() +
            '-' +
            file.fieldname +
            '-' +
            removeExtension(file.originalname),
        resource_type: file.mimetype.startsWith('video/') ? 'video' : 'image',
    }),
});
exports.multerUpload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit for uploads (we'll compress before uploading)
    },
    fileFilter: (req, file, cb) => {
        // Accept images and videos
        if (file.mimetype.startsWith('image/') ||
            file.mimetype.startsWith('video/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image and video files are allowed!'));
        }
    },
});
