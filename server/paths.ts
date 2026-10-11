import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Resolves a path relative to the project root or source directory safely,
 * whether running under development (tsx/vite) or production (dist/index.js bundle).
 */
export function resolveProjectPath(...segments: string[]): string {
  const candidates = [
    // 1. Relative to process.cwd() (the application root when starting with node / npm start)
    path.resolve(process.cwd(), ...segments),
    // 2. Relative to current file location (server/ or dist/)
    path.resolve(__dirname, ...segments),
    // 3. One level up from __dirname (e.g. when in dist/, look up into project root)
    path.resolve(__dirname, '..', ...segments),
    // 4. In server/ subfolder if looked from project root
    path.resolve(process.cwd(), 'server', ...segments)
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  // If file doesn't exist yet (e.g. creating simulated_db.json for the first time),
  // prefer project root path
  return path.resolve(process.cwd(), ...segments);
}

export function getSchemaSqlPath(): string {
  const candidates = [
    path.resolve(process.cwd(), 'server', 'db', 'schema.sql'),
    path.resolve(__dirname, 'db', 'schema.sql'),
    path.resolve(__dirname, 'schema.sql'),
    path.resolve(__dirname, '..', 'server', 'db', 'schema.sql')
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return candidates[0];
}

export function getSimulatedDbPath(): string {
  const candidates = [
    path.resolve(process.cwd(), 'server', 'db', 'simulated_db.json'),
    path.resolve(__dirname, 'db', 'simulated_db.json'),
    path.resolve(__dirname, 'simulated_db.json'),
    path.resolve(__dirname, '..', 'server', 'db', 'simulated_db.json')
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  const defaultPath = path.resolve(process.cwd(), 'server', 'db', 'simulated_db.json');
  const dir = path.dirname(defaultPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return defaultPath;
}
