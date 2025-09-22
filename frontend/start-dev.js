const { spawn } = require('child_process');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

const port = process.env.PORT || 3000;

console.log(`Starting Next.js dev server on port ${port}`);

const child = spawn('npx', ['next', 'dev', '-p', port], {
  stdio: 'inherit',
  shell: true
});

child.on('error', (error) => {
  console.error('Error starting dev server:', error);
});