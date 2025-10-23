const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const compressImage = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    // Only compress image files
    if (!req.file.mimetype.startsWith('image/')) {
      return next();
    }

    const { filename, path: filePath } = req.file;
    const compressedFilename = `compressed-${filename.replace(/\.[^/.]+$/, '')}.jpg`;
    const compressedPath = path.join(path.dirname(filePath), compressedFilename);

    // Get image metadata to determine optimal compression
    const metadata = await sharp(filePath).metadata();
    const maxWidth = 1200;
    const maxHeight = 900;
    
    let quality = 85;
    if (req.file.size > 2 * 1024 * 1024) { // > 2MB
      quality = 70;
    } else if (req.file.size > 1 * 1024 * 1024) { // > 1MB
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

    // Update req.file with compressed file info
    req.file.filename = compressedFilename;
    req.file.path = compressedPath;
    req.file.mimetype = 'image/jpeg';
    
    // Update file size
    const stats = fs.statSync(compressedPath);
    req.file.size = stats.size;

    next();
  } catch (error) {
    console.error('Image compression error:', error);
    next();
  }
};

module.exports = compressImage;