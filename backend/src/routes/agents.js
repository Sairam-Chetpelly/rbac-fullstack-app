const express = require('express');
const { registerAgent, updateAgent, upload } = require('../controllers/agentController');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Compression middleware for agent files
const compressAgentFiles = async (req, res, next) => {
  if (!req.files) {
    return next();
  }

  try {
    const fileFields = ['panCardPhoto', 'aadhaarFile', 'gstFile', 'msmeFile', 'cancelledChequeFile'];
    
    for (const fieldName of fileFields) {
      if (req.files[fieldName] && req.files[fieldName][0]) {
        const file = req.files[fieldName][0];
        
        // Only compress image files
        if (file.mimetype.startsWith('image/')) {
          try {
            const { filename, path: filePath } = file;
            const compressedFilename = `compressed-${filename.replace(/\.[^/.]+$/, '')}.jpg`;
            const compressedPath = path.join(path.dirname(filePath), compressedFilename);

            let quality = 85;
            if (file.size > 2 * 1024 * 1024) {
              quality = 70;
            } else if (file.size > 1 * 1024 * 1024) {
              quality = 80;
            }

            await sharp(filePath)
              .resize(1200, 900, { 
                fit: 'inside',
                withoutEnlargement: true 
              })
              .jpeg({ 
                quality,
                progressive: true
              })
              .toFile(compressedPath);

            fs.unlinkSync(filePath);

            file.filename = compressedFilename;
            file.path = compressedPath;
            file.mimetype = 'image/jpeg';
            
            const stats = fs.statSync(compressedPath);
            file.size = stats.size;
          } catch (compressionError) {
            console.error(`Error compressing ${fieldName}:`, compressionError);
          }
        }
      }
    }
    
    next();
  } catch (error) {
    console.error('Agent file compression error:', error);
    next();
  }
};

router.post('/register', upload.fields([
  { name: 'panCardPhoto', maxCount: 1 },
  { name: 'gstFile', maxCount: 1 },
  { name: 'aadhaarFile', maxCount: 1 },
  { name: 'msmeFile', maxCount: 1 },
  { name: 'cancelledChequeFile', maxCount: 1 }
]), compressAgentFiles, registerAgent);

router.put('/:id', upload.fields([
  { name: 'panCardPhoto', maxCount: 1 },
  { name: 'gstFile', maxCount: 1 },
  { name: 'aadhaarFile', maxCount: 1 },
  { name: 'msmeFile', maxCount: 1 },
  { name: 'cancelledChequeFile', maxCount: 1 }
]), compressAgentFiles, updateAgent);

module.exports = router;