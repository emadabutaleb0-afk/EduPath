import fs from 'fs';
import path from 'path';

const srcSchema = path.resolve(process.cwd(), 'server', 'db', 'schema.sql');
const distDir = path.resolve(process.cwd(), 'dist');
const distDbDir = path.resolve(distDir, 'db');

if (fs.existsSync(srcSchema)) {
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }
  if (!fs.existsSync(distDbDir)) {
    fs.mkdirSync(distDbDir, { recursive: true });
  }

  // Copy to dist/schema.sql and dist/db/schema.sql
  fs.copyFileSync(srcSchema, path.resolve(distDir, 'schema.sql'));
  fs.copyFileSync(srcSchema, path.resolve(distDbDir, 'schema.sql'));
  console.log('✅ Copied schema.sql to dist/ and dist/db/ for reliable production deployment.');
}
