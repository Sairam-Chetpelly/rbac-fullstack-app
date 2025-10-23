const multer = require('multer');
const path = require('path');
const fs = require('fs');
const compressImage = require('./imageCompression');
const compressMultipleImages = require('./imageCompressionMultiple');

// Universal storage configuration
const createStorage = (uploadDir = 'uploads/general') => {
  return multer.diskStorage({
    destination: function (req, file, cb) {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });
};

// Universal multer configuration
const createUpload = (uploadDir, options = {}) => {
  const defaultOptions = {
    storage: createStorage(uploadDir),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB default
      files: 10
    },
    fileFilter: function (req, file, cb) {
      const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|gif|webp/;
      const allowedMimeTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedMimeTypes.includes(file.mimetype);
      
      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error(`File type not allowed: ${file.originalname}. Only images, PDFs, and Word documents are supported.`));
      }
    },
    ...options
  };
  
  return multer(defaultOptions);
};

// Pre-configured upload instances
const uploads = {
  // Single file upload with compression
  single: (fieldName, uploadDir = 'uploads/general') => [
    createUpload(uploadDir).single(fieldName),
    compressImage
  ],
  
  // Multiple files upload with compression
  multiple: (fieldName, maxCount = 10, uploadDir = 'uploads/general') => [
    createUpload(uploadDir).array(fieldName, maxCount),
    compressMultipleImages
  ],
  
  // Any files upload with compression
  any: (uploadDir = 'uploads/general') => [
    createUpload(uploadDir).any(),
    compressMultipleImages
  ],
  
  // Fields upload with compression
  fields: (fields, uploadDir = 'uploads/general') => [
    createUpload(uploadDir).fields(fields),
    compressMultipleImages
  ]
};

module.exports = { createUpload, uploads };