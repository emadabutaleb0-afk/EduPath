import fs from 'fs';
import { pool, setDBMode } from './db.js';
import { seedDatabase } from './seed.js';
import { getSchemaSqlPath } from '../paths.js';

let isInitialized = false;

export async function initializeDatabase() {
  if (isInitialized) return;
  isInitialized = true;

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.log('ℹ️ No DATABASE_URL configured. Skipping PostgreSQL initialization.');
    return;
  }

  console.log('🔌 Checking PostgreSQL Database connection...');
  let client;
  try {
    client = await pool.connect();
    console.log('✅ Connection to PostgreSQL established successfully!');

    // Check if the schema tables exist by checking if 'users' table exists
    const checkTableQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `;
    const res = await client.query(checkTableQuery);
    const tablesExist = res.rows[0].exists;

    if (!tablesExist) {
      console.log('📂 Users table does not exist. Initializing schema tables...');
      
      // Read schema file from reliable path helper
      const schemaPath = getSchemaSqlPath();
      if (!fs.existsSync(schemaPath)) {
        throw new Error(`schema.sql not found at path: ${schemaPath}`);
      }
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');

      // Execute SQL schema
      console.log('Running DDL transactions...');
      await client.query(schemaSql);
      console.log('✅ Database schema tables created successfully.');

      // Run seeding
      console.log('Running data seeder...');
      await seedDatabase(client);
      console.log('🎉 PostgreSQL Database fully initialized and seeded!');
    } else {
      console.log('ℹ️ PostgreSQL database tables are already initialized. Running safe incremental migrations...');
      
      // 1. Ensure password_hash exists on users
      await client.query(`
        ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
      `);

      // 2. Ensure platform_customizations table exists
      await client.query(`
        CREATE TABLE IF NOT EXISTS platform_customizations (
            key VARCHAR(100) PRIMARY KEY,
            value TEXT NOT NULL
        );
      `);

      // 3. Ensure student_teacher_enrollments table exists
      await client.query(`
        CREATE TABLE IF NOT EXISTS student_teacher_enrollments (
            student_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
            teacher_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
            subject VARCHAR(255) NOT NULL,
            enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
            PRIMARY KEY (student_id, teacher_id, subject)
        );
        CREATE INDEX IF NOT EXISTS idx_ste_student ON student_teacher_enrollments(student_id);
      `);

      // 4. Ensure cheating_flags table allows confirmed and dismissed statuses
      try {
        await client.query(`
          ALTER TABLE cheating_flags DROP CONSTRAINT IF EXISTS cheating_flags_status_check;
          ALTER TABLE cheating_flags ADD CONSTRAINT cheating_flags_status_check 
            CHECK (status IN ('pending', 'reviewed', 'cleared', 'confirmed', 'dismissed'));
        `);
      } catch (err: any) {
        console.warn('Cheating flags status constraint update notice:', err.message);
      }

      console.log('✅ Incremental database migrations verified.');
    }
  } catch (error: any) {
    console.error('❌ Failed to connect to or initialize PostgreSQL database:', error.message);
    if (process.env.NODE_ENV === 'production') {
      console.error('🚨 FATAL: PostgreSQL connection failed in production mode.');
    } else {
      console.warn('⚠️ Switching system driver back to local simulated JSON mode for development safety.');
      setDBMode('mock');
    }
  } finally {
    if (client) {
      client.release();
    }
  }
}
