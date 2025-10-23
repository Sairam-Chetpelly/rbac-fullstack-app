const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const compressMultipleImages = async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next();
  }

  try {
    const compressedFiles = [];

    for (const file of req.files) {
      // Only compress image files
      if (file.mimetype.startsWith('image/')) {
        const { filename, path: filePath } = file;
        const compressedFilename = `compressed-${filename.replace(/\.[^/.]+$/, '')}.jpg`;
        const compressedPath = path.join(path.dirname(filePath), compressedFilename);

        try {
          // Get image metadata to determine optimal compression
          const metadata = await sharp(filePath).metadata();
          const maxWidth = 1200;
          const maxHeight = 900;
          
          let quality = 85;
          if (file.size > 2 * 1024 * 1024) { // > 2MB
            quality = 70;
          } else if (file.size > 1 * 1024 * 1024) { // > 1MB
            quality = 80;
          }

          // Compress image with sharp
          await sharp(filePath)
            .resize(maxWidth, maxHeight, { 
              fit: 'inside',
              withoutEnlargement: true 
            })
            .jpeg({ 
              quality,
              progressive: true,
              mozjpeg: true
            })
            .toFile(compressedPath);

          // Delete original file
          fs.unlinkSync(filePath);

          // Update file info
          file.filename = compressedFilename;
          file.path = compressedPath;
          file.mimetype = 'image/jpeg';
          
          // Update file size
          const stats = fs.statSync(compressedPath);
          file.size = stats.size;
        } catch (compressionError) {
          console.error(`Error compressing image ${filename}:`, compressionError);
          // Keep original file if compression fails
        }
      }
      
      compressedFiles.push(file);
    }

    req.files = compressedFiles;
    next();
  } catch (error) {
    console.error('Multiple image compression error:', error);
    next();
  }
};

module.exports = compressMultipleImages;