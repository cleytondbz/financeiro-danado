import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

try {
  // Rename dist/index.js to dist/api.js
  const indexPath = path.join(__dirname, 'dist', 'index.js');
  const apiPath = path.join(__dirname, 'dist', 'api.js');
  
  if (fs.existsSync(indexPath)) {
    fs.renameSync(indexPath, apiPath);
    console.log('✓ Renamed dist/index.js to dist/api.js');
  }

  // Copy index.mjs to dist/index.js
  const indexMjsPath = path.join(__dirname, 'index.mjs');
  const distIndexPath = path.join(__dirname, 'dist', 'index.js');
  
  if (fs.existsSync(indexMjsPath)) {
    fs.copyFileSync(indexMjsPath, distIndexPath);
    console.log('✓ Copied index.mjs to dist/index.js');
  }

  console.log('✓ Build post-processing completed successfully');
} catch (error) {
  console.error('✗ Error during build post-processing:', error.message);
  process.exit(1);
}
