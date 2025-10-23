const fs = require('fs');
const path = require('path');

// Files that need to be updated
const filesToUpdate = [
  'frontend/pages/customer/applications/view/[id].js',
  'frontend/pages/country-visa-types.js',
  'frontend/pages/country-terms-conditions/view/[id].js',
  'frontend/pages/applications/view/[id].js',
  'frontend/pages/applications/edit/[id].js',
  'frontend/pages/applications.js',
  'frontend/pages/visa-types/[id].js',
  'frontend/pages/countries/view/[id].js',
  'frontend/pages/country-visa-types/view/[id].js',
  'frontend/pages/form-builder/index.js',
  'frontend/pages/visa-application/terms/[visaTypeId].js',
  'frontend/pages/visa-application/form/[visaTypeId].js',
  'frontend/pages/country-terms-conditions.js'
];

// Pattern to find and replace
const oldPattern = /\$\{process\.env\.NEXT_PUBLIC_API_BASE_URL\?\.replace\('\/api', ''\) \|\| 'http:\/\/localhost:5000'\}\/uploads\/countries\/\$\{([^}]+)\}/g;

const newPattern = (match, imagePath) => {
  return `\${(() => {
                  if (${imagePath}?.startsWith('http')) {
                    return ${imagePath};
                  }
                  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api', '') || 'https://api.oneworldvisa.in';
                  return \`\${baseUrl}/uploads/countries/\${${imagePath}}\`;
                })()}`;
};

filesToUpdate.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;
    
    content = content.replace(oldPattern, newPattern);
    
    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`Updated: ${filePath}`);
    } else {
      console.log(`No changes needed: ${filePath}`);
    }
  } else {
    console.log(`File not found: ${filePath}`);
  }
});

console.log('Image URL update complete!');