import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DatabaseSync } from 'node:sqlite';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function sqlVal(val: any): string {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return String(val);
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  if (typeof val === 'object') {
    return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
  }
  return `'${String(val).replace(/'/g, "''")}'`;
}

export function exportDatabase() {
  console.log('=============================================================================');
  console.log('📦 EduPath Complete Enterprise Database Exporter (29 Tables)');
  console.log('=============================================================================\n');

  const dbPath = path.resolve(process.cwd(), 'server', 'db', 'edupath.db');
  if (!fs.existsSync(dbPath)) {
    throw new Error(`SQLite database not found at ${dbPath}. Please run db:create-tables first.`);
  }

  const sqlite = new DatabaseSync(dbPath);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const nowFormatted = new Date().toUTCString();

  const allTables = [
    'academic_registries',
    'users',
    'user_relationships',
    'student_teacher_enrollments',
    'units',
    'lessons',
    'lesson_materials',
    'questions',
    'tests',
    'test_sections',
    'test_questions',
    'test_results',
    'placement_recommendations',
    'cheating_flags',
    'lesson_bookings',
    'transactions',
    'student_passes',
    'achievements',
    'user_achievements',
    'student_stats',
    'leaderboard_entries',
    'notifications',
    'learning_goals',
    'content_versions',
    'flagged_content',
    'announcements',
    'api_keys',
    'user_activities',
    'platform_customizations'
  ];

  // Read schema.sql for the DDL definition
  const schemaPath = path.resolve(process.cwd(), 'server', 'db', 'schema.sql');
  let ddl = '';
  if (fs.existsSync(schemaPath)) {
    ddl = fs.readFileSync(schemaPath, 'utf8');
  }

  // -------------------------------------------------------------------------
  // 1. GENERATE PRODUCTION SQL DUMP (PostgreSQL 14+ Compliant)
  // -------------------------------------------------------------------------
  console.log('📝 Generating production SQL dump from all 29 relational tables...');

  let sql = `-- =============================================================================\n`;
  sql += `-- EduPath Enterprise Production Database Dump\n`;
  sql += `-- Export Timestamp: ${nowFormatted}\n`;
  sql += `-- Tables: ${allTables.length} Production Entities\n`;
  sql += `-- Compatible with: PostgreSQL 14+, Neon, Supabase, AWS RDS, GCP Cloud SQL\n`;
  sql += `-- =============================================================================\n\n`;

  sql += `BEGIN;\n\n`;
  sql += ddl ? `${ddl}\n\n` : '';

  sql += `-- =============================================================================\n`;
  sql += `-- PRODUCTION TABLE DATA INSERTS\n`;
  sql += `-- =============================================================================\n\n`;

  const jsonData: Record<string, any[]> = {};
  let totalExportedRows = 0;

  for (const table of allTables) {
    const rows = sqlite.prepare(`SELECT * FROM ${table}`).all() as any[];
    jsonData[table] = rows;
    totalExportedRows += rows.length;

    sql += `-- -----------------------------------------------------------------------------\n`;
    sql += `-- Table: ${table} (${rows.length} rows)\n`;
    sql += `-- -----------------------------------------------------------------------------\n`;

    if (rows.length === 0) {
      sql += `-- No rows to insert\n\n`;
      continue;
    }

    const columns = Object.keys(rows[0]);
    for (const r of rows) {
      const values = columns.map(c => sqlVal(r[c]));
      sql += `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${values.join(', ')}) ON CONFLICT DO NOTHING;\n`;
    }
    sql += `\n`;
  }

  sql += `COMMIT;\n\n`;
  sql += `-- End of EduPath Production Database Dump\n`;

  // Write SQL files to targets
  const sqlTargets = [
    path.resolve(process.cwd(), 'edupath_export.sql'),
    path.resolve(process.cwd(), 'server', 'db', 'export.sql'),
    path.resolve(process.cwd(), '..', 'edupath_export.sql'),
    path.resolve(process.cwd(), 'backups', `edupath_backup_${timestamp}.sql`)
  ];

  fs.mkdirSync(path.resolve(process.cwd(), 'backups'), { recursive: true });

  for (const target of sqlTargets) {
    try {
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, sql, 'utf-8');
      console.log(`  💾 SQL Dump saved: ${target}`);
    } catch (e: any) {
      console.warn(`  Warning saving to ${target}:`, e.message);
    }
  }

  // -------------------------------------------------------------------------
  // 2. GENERATE STRUCTURED JSON EXPORT
  // -------------------------------------------------------------------------
  console.log('\n📝 Generating structured JSON backup...');
  const jsonExport = {
    metadata: {
      platform: 'EduPath Enterprise',
      exportedAt: nowFormatted,
      version: '2.0.0',
      totalTables: allTables.length,
      totalRows: totalExportedRows
    },
    tables: jsonData
  };

  const jsonStr = JSON.stringify(jsonExport, null, 2);
  const jsonTargets = [
    path.resolve(process.cwd(), 'edupath_export.json'),
    path.resolve(process.cwd(), 'server', 'db', 'export.json'),
    path.resolve(process.cwd(), '..', 'edupath_export.json'),
    path.resolve(process.cwd(), 'backups', `edupath_backup_${timestamp}.json`)
  ];

  for (const target of jsonTargets) {
    try {
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, jsonStr, 'utf-8');
      console.log(`  💾 JSON Dump saved: ${target}`);
    } catch (e: any) {
      console.warn(`  Warning saving to ${target}:`, e.message);
    }
  }

  console.log('\n=============================================================================');
  console.log('🎉 Production Database Export Complete!');
  console.log(`   Total Tables: ${allTables.length}`);
  console.log(`   Total Rows:   ${totalExportedRows}`);
  console.log(`   SQL File:     edupath_export.sql (${(Buffer.byteLength(sql) / 1024).toFixed(1)} KB)`);
  console.log(`   JSON File:    edupath_export.json (${(Buffer.byteLength(jsonStr) / 1024).toFixed(1)} KB)`);
  console.log('=============================================================================');

  return { success: true, totalTables: allTables.length, totalRows: totalExportedRows };
}

// Allow direct execution
if (process.argv[1] && process.argv[1].endsWith('export-database.ts')) {
  try {
    exportDatabase();
  } catch (e) {
    console.error('Export failed:', e);
    process.exit(1);
  }
}
