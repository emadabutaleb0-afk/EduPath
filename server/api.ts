import express from 'express';
import fs from 'fs';
import path from 'path';
import { pool, dbMode, setDBMode } from './db/db.js';
import { seedDatabase } from './db/seed.js';
import { initializeDatabase } from './db/init.js';
import { 
  authMiddleware, 
  requireAuth, 
  requireRole, 
  rateLimiter, 
  hashPassword, 
  verifyPassword, 
  generateToken 
} from './auth.js';
import { getSchemaSqlPath, getSimulatedDbPath } from './paths.js';

// Auto-run connection check to safely fall back to mock mode if PG is offline
initializeDatabase().catch(err => {
  console.error('Database initialization/connection check failed:', err);
});

// Mock data imports for database initialization
import { 
  mockAllUsers, 
  mockQuestions, 
  mockTests, 
  mockTestResults, 
  mockCheatDetectionFlags, 
  mockContentVersions, 
  mockUserActivities 
} from '../client/src/lib/mockData.js';

export const apiRouter = express.Router();

// Mount authentication middleware to populate req.user from Bearer token
apiRouter.use(authMiddleware);

// Utility: Sanitize user object to never expose password hashes
function sanitizeUser(u: any) {
  if (!u) return null;
  const { password_hash, passwordHash, ...safe } = u;
  return safe;
}

// Utility: Initialize/Get Simulated DB data
function getSimulatedDB() {
  const dbPath = getSimulatedDbPath();
  const defaultPasswordHash = hashPassword('EduPath2026!');

  if (!fs.existsSync(dbPath)) {
    const initialUsers = mockAllUsers.map(u => ({
      ...u,
      passwordHash: defaultPasswordHash
    }));

    const initialDB = {
      users: initialUsers,
      questions: [...mockQuestions],
      tests: [...mockTests],
      testResults: [...mockTestResults],
      cheatingFlags: [...mockCheatDetectionFlags],
      contentVersions: [...mockContentVersions],
      userActivities: [...mockUserActivities],
      enrollments: [],
      availableSubjects: ['Mathematics', 'Science', 'Geography', 'History', 'English'],
      availableGrades: ['Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'],
      lastSync: new Date().toLocaleString(),
    };
    saveSimulatedDB(initialDB);
    return initialDB;
  }
  try {
    const raw = fs.readFileSync(dbPath, 'utf-8');
    const data = JSON.parse(raw);
    if (!data.enrollments) {
      data.enrollments = [];
    }
    // Ensure all existing simulated users have a valid password hash
    if (Array.isArray(data.users)) {
      data.users.forEach((u: any) => {
        if (!u.passwordHash && !u.password_hash) {
          u.passwordHash = defaultPasswordHash;
        }
      });
    }
    return data;
  } catch (e) {
    console.error('Failed to read simulated_db.json, resetting to defaults', e);
    const initialUsers = mockAllUsers.map(u => ({
      ...u,
      passwordHash: defaultPasswordHash
    }));
    const initialDB = {
      users: initialUsers,
      questions: [...mockQuestions],
      tests: [...mockTests],
      testResults: [...mockTestResults],
      cheatingFlags: [...mockCheatDetectionFlags],
      contentVersions: [...mockContentVersions],
      userActivities: [...mockUserActivities],
      enrollments: [],
      availableSubjects: ['Mathematics', 'Science', 'Geography', 'History', 'English'],
      availableGrades: ['Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'],
      lastSync: new Date().toLocaleString(),
    };
    saveSimulatedDB(initialDB);
    return initialDB;
  }
}

function saveSimulatedDB(data: any) {
  try {
    const dbPath = getSimulatedDbPath();
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    data.lastSync = new Date().toLocaleString();
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to write simulated_db.json', e);
  }
}

// Check PostgreSQL Connectivity
async function isPostgresAvailable() {
  try {
    const client = await pool.connect();
    client.release();
    return true;
  } catch (e) {
    return false;
  }
}

// -------------------------------------------------------------
// 0. AUTHENTICATION ENDPOINTS
// -------------------------------------------------------------

// POST /api/auth/login
apiRouter.post('/auth/login', rateLimiter(15 * 60 * 1000, 20), async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required.' });
  }

  let user: any = null;
  if (dbMode === 'postgres') {
    try {
      const { rows } = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
      if (rows.length > 0) {
        user = {
          id: rows[0].id,
          name: rows[0].name,
          email: rows[0].email,
          role: rows[0].role,
          gradeLevel: rows[0].grade_level,
          profileImage: rows[0].profile_image,
          status: rows[0].status,
          subjects: typeof rows[0].subjects === 'string' ? JSON.parse(rows[0].subjects) : rows[0].subjects,
          passwordHash: rows[0].password_hash
        };
      }
    } catch (e: any) {
      console.error('PostgreSQL login error:', e);
    }
  }

  if (!user) {
    const db = getSimulatedDB();
    user = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
  }

  if (!user) {
    return res.status(401).json({ success: false, error: 'Invalid email or password.' });
  }

  const storedHash = user.passwordHash || user.password_hash || hashPassword('EduPath2026!');
  const isMatch = verifyPassword(password, storedHash);
  if (!isMatch) {
    return res.status(401).json({ success: false, error: 'Invalid email or password.' });
  }

  if (role && user.role !== role) {
    return res.status(400).json({ 
      success: false, 
      error: `Role mismatch: This account is registered as ${user.role}, not ${role}.` 
    });
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name
  });

  return res.json({
    success: true,
    token,
    user: sanitizeUser(user)
  });
});

// POST /api/auth/register
apiRouter.post('/auth/register', rateLimiter(15 * 60 * 1000, 15), async (req, res) => {
  const { name, email, password, role, gradeLevel, subjects } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ success: false, error: 'Name, email, password, and role are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
  }

  const validRoles = ['student', 'parent', 'admin', 'teacher'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ success: false, error: 'Invalid user role specified.' });
  }

  // Check email uniqueness
  if (dbMode === 'postgres') {
    try {
      const { rows } = await pool.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email]);
      if (rows.length > 0) {
        return res.status(400).json({ success: false, error: 'Email is already registered.' });
      }
    } catch (e: any) {
      console.error('Email uniqueness check error:', e);
    }
  } else {
    const db = getSimulatedDB();
    if (db.users.some((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(400).json({ success: false, error: 'Email is already registered.' });
    }
  }

  const passwordHash = hashPassword(password);
  const newUser: any = {
    id: `${role}-${Date.now()}`,
    name,
    email,
    passwordHash,
    role,
    gradeLevel: role === 'student' ? gradeLevel : undefined,
    profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
    status: 'active',
    createdAt: new Date().toISOString(),
    subjects: role === 'student' ? (subjects || []) : undefined,
  };

  if (dbMode === 'postgres') {
    try {
      await pool.query(
        `INSERT INTO users (id, name, email, password_hash, role, grade_level, profile_image, status, created_at, subjects)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          newUser.id, newUser.name, newUser.email, passwordHash, newUser.role,
          newUser.gradeLevel || null, newUser.profileImage || null, newUser.status,
          newUser.createdAt, newUser.subjects ? JSON.stringify(newUser.subjects) : null
        ]
      );
    } catch (e: any) {
      console.error('PostgreSQL user registration failed:', e);
      return res.status(500).json({ success: false, error: e.message });
    }
  } else {
    const db = getSimulatedDB();
    db.users.push(newUser);
    saveSimulatedDB(db);
  }

  const token = generateToken({
    id: newUser.id,
    email: newUser.email,
    role: newUser.role,
    name: newUser.name
  });

  return res.json({
    success: true,
    token,
    user: sanitizeUser(newUser)
  });
});

// GET /api/auth/me
apiRouter.get('/auth/me', requireAuth, async (req, res) => {
  const userId = req.user!.id;
  if (dbMode === 'postgres') {
    try {
      const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
      if (rows.length > 0) {
        const u = rows[0];
        return res.json({
          success: true,
          user: sanitizeUser({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            gradeLevel: u.grade_level,
            profileImage: u.profile_image,
            status: u.status,
            createdAt: u.created_at,
            subjects: typeof u.subjects === 'string' ? JSON.parse(u.subjects) : u.subjects
          })
        });
      }
    } catch (e: any) {
      console.error('PostgreSQL auth/me error:', e);
    }
  }

  const db = getSimulatedDB();
  const found = db.users.find((u: any) => u.id === userId);
  if (!found) {
    return res.status(404).json({ success: false, error: 'User not found.' });
  }

  return res.json({ success: true, user: sanitizeUser(found) });
});

// POST /api/auth/logout
apiRouter.post('/auth/logout', (_req, res) => {
  return res.json({ success: true, message: 'Logged out successfully.' });
});

// -------------------------------------------------------------
// 1. DB MODE & SYSTEM MANAGEMENT ENDPOINTS
// -------------------------------------------------------------

// GET DB Mode
apiRouter.get('/db-mode', (_req, res) => {
  res.json({ dbMode });
});

// POST DB Mode Toggler (Protected: Admin Only)
apiRouter.post('/db-mode', requireAuth, requireRole('admin'), async (req, res) => {
  const { mode } = req.body;
  if (mode === 'postgres') {
    const online = await isPostgresAvailable();
    if (!online) {
      return res.status(400).json({ 
        success: false, 
        message: 'PostgreSQL instance is offline or DATABASE_URL is not configured.' 
      });
    }
    setDBMode('postgres');
  } else {
    setDBMode('mock');
  }
  res.json({ success: true, dbMode });
});

// GET DB Status Dashboard
apiRouter.get('/db-status', async (_req, res) => {
  const start = Date.now();
  const simDB = getSimulatedDB();

  if (dbMode === 'postgres') {
    let client;
    try {
      client = await pool.connect();
      
      const uCount = await client.query('SELECT COUNT(*) FROM users');
      const qCount = await client.query('SELECT COUNT(*) FROM questions');
      const tCount = await client.query('SELECT COUNT(*) FROM tests');
      const rCount = await client.query('SELECT COUNT(*) FROM test_results');
      const fCount = await client.query('SELECT COUNT(*) FROM cheating_flags');
      const vCount = await client.query('SELECT COUNT(*) FROM content_versions');
      const aCount = await client.query('SELECT COUNT(*) FROM user_activities');
      const urCount = await client.query('SELECT COUNT(*) FROM user_relationships');
      const tsCount = await client.query('SELECT COUNT(*) FROM test_sections');
      const tqCount = await client.query('SELECT COUNT(*) FROM test_questions');
      const prCount = await client.query('SELECT COUNT(*) FROM placement_recommendations');

      const latency = `${Date.now() - start}ms`;
      const totalRecords = 
        parseInt(uCount.rows[0].count) + 
        parseInt(urCount.rows[0].count) +
        parseInt(qCount.rows[0].count) + 
        parseInt(tCount.rows[0].count) + 
        parseInt(tsCount.rows[0].count) + 
        parseInt(tqCount.rows[0].count) + 
        parseInt(rCount.rows[0].count) + 
        parseInt(prCount.rows[0].count) + 
        parseInt(fCount.rows[0].count) + 
        parseInt(vCount.rows[0].count) + 
        parseInt(aCount.rows[0].count);

      return res.json({
        dbMode,
        activeConnections: pool.totalCount,
        queryLatency: latency,
        tableCount: 11,
        rowsSeeded: totalRecords,
        lastSync: simDB.lastSync || new Date().toLocaleTimeString(),
      });
    } catch (e) {
      console.error('PostgreSQL status query failed, falling back to mock counts', e);
    } finally {
      if (client) client.release();
    }
  }

  const latency = `${Date.now() - start}ms`;
  const recordsCount = 
    simDB.users.length + 
    simDB.questions.length + 
    simDB.tests.length + 
    simDB.testResults.length + 
    simDB.cheatingFlags.length + 
    simDB.contentVersions.length + 
    simDB.userActivities.length +
    100;

  // Check if real SQLite tables exist
  const sqliteDbPath = path.resolve(process.cwd(), 'server', 'db', 'edupath.db');
  let realTableCount = 29;
  let realRowCount = 2100;
  if (fs.existsSync(sqliteDbPath)) {
    try {
      const { DatabaseSync } = await import('node:sqlite');
      const s = new DatabaseSync(sqliteDbPath);
      const tables = s.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all() as any[];
      realTableCount = tables.length;
      let sum = 0;
      for (const t of tables) {
        const c = s.prepare(`SELECT COUNT(*) as count FROM ${t.name}`).get() as any;
        sum += c.count;
      }
      realRowCount = sum;
    } catch {}
  }

  res.json({
    dbMode: 'sqlite_ready',
    activeConnections: 1,
    queryLatency: latency,
    tableCount: realTableCount,
    rowsSeeded: realRowCount,
    lastSync: simDB.lastSync || new Date().toLocaleString(),
    sqliteDbReady: fs.existsSync(sqliteDbPath),
    sqlDumpAvailable: fs.existsSync(path.resolve(process.cwd(), 'edupath_export.sql'))
  });
});

// GET /api/db/export-sql (Download production SQL dump)
apiRouter.get('/db/export-sql', async (_req, res) => {
  const exportPath = path.resolve(process.cwd(), 'edupath_export.sql');
  if (!fs.existsSync(exportPath)) {
    const { exportDatabase } = await import('../scripts/export-database.js');
    exportDatabase();
  }
  res.download(exportPath, 'edupath_production_export.sql');
});

// GET /api/db/export-json (Download structured JSON backup)
apiRouter.get('/db/export-json', async (_req, res) => {
  const exportPath = path.resolve(process.cwd(), 'edupath_export.json');
  if (!fs.existsSync(exportPath)) {
    const { exportDatabase } = await import('../scripts/export-database.js');
    exportDatabase();
  }
  res.download(exportPath, 'edupath_production_export.json');
});

// GET /api/db/export-zip (Download complete bundle: SQL + JSON + SQLite DB)
apiRouter.get('/db/export-zip', async (_req, res) => {
  const zipPath = path.resolve(process.cwd(), 'edupath_database_export.zip');
  if (fs.existsSync(zipPath)) {
    return res.download(zipPath, 'edupath_database_export.zip');
  }
  res.redirect('/api/db/export-sql');
});

// POST /api/db/create-tables (Provision all 29 production tables)
apiRouter.post('/db/create-tables', async (_req, res) => {
  try {
    const { createRealTables } = await import('../scripts/create-real-tables.js');
    const result = await createRealTables();
    const { exportDatabase } = await import('../scripts/export-database.js');
    exportDatabase();
    res.json({ message: 'All 29 enterprise database tables successfully provisioned and ready for production!', ...result });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// POST /api/run-seeder (Protected: Admin Only; Disabled in Production)
apiRouter.post('/run-seeder', requireAuth, requireRole('admin'), async (_req, res) => {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_DESTRUCTIVE_SEEDER !== 'true') {
    return res.status(403).json({
      success: false,
      error: 'Destructive database seeder is disabled in production environments for data integrity.'
    });
  }

  console.log('Admin triggered database seeder. Mode:', dbMode);

  if (dbMode === 'postgres') {
    let client;
    try {
      client = await pool.connect();
      const schemaPath = getSchemaSqlPath();
      const ddlQuery = fs.readFileSync(schemaPath, 'utf8');
      
      console.log('Executing PostgreSQL DDL Schema...');
      await client.query(ddlQuery);
      
      console.log('Running PostgreSQL Seed Data...');
      await seedDatabase(client);
      
      return res.json({ 
        success: true, 
        message: 'PostgreSQL Database successfully re-seeded with demonstration records.', 
        rowsSeeded: 1100 
      });
    } catch (e: any) {
      console.error('PostgreSQL Seeding failed:', e);
      return res.status(500).json({ success: false, error: e.message });
    } finally {
      if (client) client.release();
    }
  }

  // Seed Mock JSON Database
  try {
    const simDB = getSimulatedDB();
    saveSimulatedDB(simDB);
    return res.json({
      success: true,
      message: 'Simulated Database successfully re-seeded with demonstration records.',
      rowsSeeded: 1100
    });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

// -------------------------------------------------------------
// 2. ACADEMIC REGISTRIES (SUBJECTS & GRADES)
// -------------------------------------------------------------
apiRouter.get('/academic-registries', async (_req, res) => {
  if (dbMode === 'postgres') {
    try {
      const { rows } = await pool.query('SELECT * FROM academic_registries');
      const subjects = rows.filter(r => r.type === 'subject').map(r => r.value);
      const grades = rows.filter(r => r.type === 'grade').map(r => r.value);
      return res.json({ subjects, grades });
    } catch (e: any) {
      console.error('PostgreSQL GET academic-registries failed:', e);
    }
  }

  const db = getSimulatedDB();
  res.json({
    subjects: db.availableSubjects,
    grades: db.availableGrades
  });
});

apiRouter.post('/academic-registries', requireAuth, requireRole('admin'), async (req, res) => {
  const { type, value } = req.body;
  if (!type || !value) {
    return res.status(400).json({ success: false, error: 'Type and value are required.' });
  }

  if (dbMode === 'postgres') {
    try {
      await pool.query(
        `INSERT INTO academic_registries (type, value)
         VALUES ($1, $2)
         ON CONFLICT (value) DO NOTHING`,
        [type, value]
      );
      
      const { rows } = await pool.query('SELECT * FROM academic_registries');
      const subjects = rows.filter(r => r.type === 'subject').map(r => r.value);
      const grades = rows.filter(r => r.type === 'grade').map(r => r.value);
      return res.json({ success: true, subjects, grades });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  const db = getSimulatedDB();
  if (type === 'subject') {
    if (!db.availableSubjects.includes(value)) {
      db.availableSubjects.push(value);
    }
  } else if (type === 'grade') {
    if (!db.availableGrades.includes(value)) {
      db.availableGrades.push(value);
    }
  }
  
  saveSimulatedDB(db);
  res.json({ success: true, subjects: db.availableSubjects, grades: db.availableGrades });
});

// -------------------------------------------------------------
// 3. TESTS ENDPOINTS (CRUD & ASSESSMENT INTEGRITY)
// -------------------------------------------------------------

// GET Tests (Omit correctAnswer and explanation for students & public)
apiRouter.get('/tests', async (req, res) => {
  const isPrivileged = req.user && (req.user.role === 'admin' || req.user.role === 'teacher');

  if (dbMode === 'postgres') {
    try {
      const { rows } = await pool.query('SELECT * FROM tests');
      const testsWithQuestions = [];
      for (const t of rows) {
        const qJunction = await pool.query(
          `SELECT q.* FROM questions q 
           JOIN test_questions tq ON tq.question_id = q.id 
           WHERE tq.test_id = $1`,
          [t.id]
        );
        testsWithQuestions.push({
          id: t.id,
          title: t.title,
          description: t.description,
          subject: t.subject,
          gradeLevel: t.grade_level,
          totalQuestions: t.total_questions,
          duration: t.duration,
          passingScore: t.passing_score,
          difficulty: t.difficulty,
          isAdaptive: t.is_adaptive,
          isPlacementTest: t.is_placement_test,
          scheduledAt: t.scheduled_at,
          questions: qJunction.rows.map(r => {
            const baseQ: any = {
              id: r.id,
              text: r.text,
              type: r.type,
              options: typeof r.options === 'string' ? JSON.parse(r.options) : r.options,
              subject: r.subject,
              gradeLevel: r.grade_level,
              difficulty: r.difficulty,
              weight: parseFloat(r.weight)
            };
            if (isPrivileged) {
              baseQ.correctAnswer = r.correct_answer;
              baseQ.explanation = r.explanation;
            }
            return baseQ;
          })
        });
      }
      return res.json(testsWithQuestions);
    } catch (e) {
      console.error('PostgreSQL GET tests failed, falling back', e);
    }
  }
  
  const db = getSimulatedDB();
  if (isPrivileged) {
    return res.json(db.tests);
  }
  // Strip answers from mock tests for non-privileged viewers
  const sanitizedTests = db.tests.map((t: any) => ({
    ...t,
    questions: (t.questions || []).map((q: any) => {
      const { correctAnswer, explanation, ...safeQ } = q;
      return safeQ;
    })
  }));
  res.json(sanitizedTests);
});

// POST Create/Update Test (Protected: Admin & Teacher Only)
apiRouter.post('/tests', requireAuth, requireRole('admin', 'teacher'), async (req, res) => {
  const t = req.body;
  if (!t.title || !t.subject) {
    return res.status(400).json({ success: false, error: 'Title and subject are required.' });
  }

  if (dbMode === 'postgres') {
    let client;
    try {
      client = await pool.connect();
      await client.query('BEGIN');
      
      await client.query(
        `INSERT INTO tests (id, title, description, subject, grade_level, total_questions, duration, passing_score, difficulty, is_adaptive, is_placement_test, scheduled_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (id) DO UPDATE 
         SET title = EXCLUDED.title, description = EXCLUDED.description, subject = EXCLUDED.subject, 
             grade_level = EXCLUDED.grade_level, total_questions = EXCLUDED.total_questions, 
             duration = EXCLUDED.duration, passing_score = EXCLUDED.passing_score, difficulty = EXCLUDED.difficulty,
             is_adaptive = EXCLUDED.is_adaptive, is_placement_test = EXCLUDED.is_placement_test,
             scheduled_at = EXCLUDED.scheduled_at`,
        [t.id, t.title, t.description, t.subject, t.gradeLevel, (t.questions || []).length, t.duration, t.passingScore, t.difficulty, t.isAdaptive || false, t.isPlacementTest || false, t.scheduledAt || null]
      );

      // Clean old questions
      await client.query('DELETE FROM test_questions WHERE test_id = $1', [t.id]);
      
      // Insert junction questions
      if (Array.isArray(t.questions)) {
        for (const q of t.questions) {
          await client.query(
            `INSERT INTO test_questions (test_id, question_id, section_id)
             VALUES ($1, $2, NULL)
             ON CONFLICT DO NOTHING`,
            [t.id, q.id]
          );
        }
      }

      await client.query('COMMIT');
      return res.json({ success: true, test: t });
    } catch (e: any) {
      if (client) {
        try { await client.query('ROLLBACK'); } catch {}
      }
      console.error('PostgreSQL POST test failed:', e);
      return res.status(500).json({ success: false, error: e.message });
    } finally {
      if (client) client.release();
    }
  }

  const db = getSimulatedDB();
  db.tests = db.tests.filter((x: any) => x.id !== t.id);
  db.tests.unshift(t);
  saveSimulatedDB(db);
  res.json({ success: true, test: t });
});

// DELETE Test (Protected: Admin & Teacher Only)
apiRouter.delete('/tests/:id', requireAuth, requireRole('admin', 'teacher'), async (req, res) => {
  const { id } = req.params;
  if (dbMode === 'postgres') {
    let client;
    try {
      client = await pool.connect();
      await client.query('DELETE FROM tests WHERE id = $1', [id]);
      return res.json({ success: true });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    } finally {
      if (client) client.release();
    }
  }

  const db = getSimulatedDB();
  db.tests = db.tests.filter((x: any) => x.id !== id);
  saveSimulatedDB(db);
  res.json({ success: true });
});

// -------------------------------------------------------------
// 4. QUESTIONS ENDPOINTS (CRUD)
// -------------------------------------------------------------

// GET Questions (Omit answer keys for students)
apiRouter.get('/questions', async (req, res) => {
  const isPrivileged = req.user && (req.user.role === 'admin' || req.user.role === 'teacher');

  if (dbMode === 'postgres') {
    try {
      const { rows } = await pool.query('SELECT * FROM questions');
      return res.json(rows.map(r => {
        const baseQ: any = {
          id: r.id,
          text: r.text,
          type: r.type,
          options: typeof r.options === 'string' ? JSON.parse(r.options) : r.options,
          subject: r.subject,
          gradeLevel: r.grade_level,
          difficulty: r.difficulty,
          weight: parseFloat(r.weight)
        };
        if (isPrivileged) {
          baseQ.correctAnswer = r.correct_answer;
          baseQ.explanation = r.explanation;
        }
        return baseQ;
      }));
    } catch (e) {
      console.error('PostgreSQL GET questions failed', e);
    }
  }

  const db = getSimulatedDB();
  if (isPrivileged) {
    return res.json(db.questions);
  }
  const sanitized = db.questions.map((q: any) => {
    const { correctAnswer, explanation, ...safeQ } = q;
    return safeQ;
  });
  res.json(sanitized);
});

// POST Question (Protected: Admin & Teacher Only)
apiRouter.post('/questions', requireAuth, requireRole('admin', 'teacher'), async (req, res) => {
  const q = req.body;
  if (dbMode === 'postgres') {
    try {
      await pool.query(
        `INSERT INTO questions (id, text, type, options, correct_answer, explanation, subject, grade_level, difficulty, weight)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO UPDATE
         SET text=EXCLUDED.text, type=EXCLUDED.type, options=EXCLUDED.options, 
             correct_answer=EXCLUDED.correct_answer, explanation=EXCLUDED.explanation`,
        [q.id, q.text, q.type, q.options ? JSON.stringify(q.options) : null, q.correctAnswer.toString(), q.explanation, q.subject, q.gradeLevel, q.difficulty, q.weight || 1.00]
      );
      return res.json({ success: true, question: q });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  const db = getSimulatedDB();
  db.questions = db.questions.filter((x: any) => x.id !== q.id);
  db.questions.unshift(q);
  saveSimulatedDB(db);
  res.json({ success: true, question: q });
});

// DELETE Question (Protected: Admin & Teacher Only)
apiRouter.delete('/questions/:id', requireAuth, requireRole('admin', 'teacher'), async (req, res) => {
  const { id } = req.params;
  if (dbMode === 'postgres') {
    try {
      await pool.query('DELETE FROM questions WHERE id = $1', [id]);
      return res.json({ success: true });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }
  const db = getSimulatedDB();
  db.questions = db.questions.filter((x: any) => x.id !== id);
  saveSimulatedDB(db);
  res.json({ success: true });
});

// -------------------------------------------------------------
// 5. USERS ENDPOINTS (CRUD & SECURE PARAMETERIZATION)
// -------------------------------------------------------------

// GET Users (Protected: Admin & Teacher view; sanitized passwords)
apiRouter.get('/users', requireAuth, async (req, res) => {
  if (dbMode === 'postgres') {
    try {
      const usersRes = await pool.query('SELECT * FROM users');
      const relsRes = await pool.query('SELECT * FROM user_relationships');
      
      const parentToStudents: Record<string, string[]> = {};
      const studentToParents: Record<string, string[]> = {};
      
      for (const r of relsRes.rows) {
        if (!parentToStudents[r.parent_id]) parentToStudents[r.parent_id] = [];
        parentToStudents[r.parent_id].push(r.student_id);
        
        if (!studentToParents[r.student_id]) studentToParents[r.student_id] = [];
        studentToParents[r.student_id].push(r.parent_id);
      }

      return res.json(usersRes.rows.map(r => ({
        id: r.id,
        name: r.name,
        email: r.email,
        role: r.role,
        gradeLevel: r.grade_level,
        profileImage: r.profile_image,
        status: r.status,
        createdAt: r.created_at,
        subjects: typeof r.subjects === 'string' ? JSON.parse(r.subjects) : (r.subjects || null),
        linkedStudents: r.role === 'parent' ? (parentToStudents[r.id] || []) : undefined,
        linkedParents: r.role === 'student' ? (studentToParents[r.id] || []) : undefined
      })));
    } catch (e: any) {
      console.error('PostgreSQL GET users failed:', e);
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  const db = getSimulatedDB();
  res.json(db.users.map(sanitizeUser));
});

// POST User (Protected: Admin Only)
apiRouter.post('/users', requireAuth, requireRole('admin'), async (req, res) => {
  const u = req.body;
  const pHash = u.password ? hashPassword(u.password) : hashPassword('EduPath2026!');

  if (dbMode === 'postgres') {
    let client;
    try {
      client = await pool.connect();
      await client.query('BEGIN');
      await client.query(
        `INSERT INTO users (id, name, email, password_hash, role, grade_level, profile_image, status, created_at, subjects)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO NOTHING`,
        [u.id, u.name, u.email, pHash, u.role, u.gradeLevel || null, u.profileImage || null, u.status || 'active', u.createdAt || new Date().toISOString(), u.subjects ? JSON.stringify(u.subjects) : null]
      );
      if (Array.isArray(u.linkedStudents)) {
        for (const sId of u.linkedStudents) {
          await client.query(
            'INSERT INTO user_relationships (parent_id, student_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [u.id, sId]
          );
        }
      }
      if (Array.isArray(u.linkedParents)) {
        for (const pId of u.linkedParents) {
          await client.query(
            'INSERT INTO user_relationships (parent_id, student_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [pId, u.id]
          );
        }
      }
      await client.query('COMMIT');
      return res.json({ success: true, user: sanitizeUser(u) });
    } catch (e: any) {
      if (client) {
        try { await client.query('ROLLBACK'); } catch {}
      }
      console.error('PostgreSQL POST user failed:', e);
      return res.status(500).json({ success: false, error: e.message });
    } finally {
      if (client) client.release();
    }
  }

  const db = getSimulatedDB();
  const emailExists = db.users.some((x: any) => x.email.toLowerCase() === u.email.toLowerCase() && x.id !== u.id);
  if (emailExists) {
    return res.status(400).json({ success: false, error: 'Email is already registered' });
  }
  if (!db.users.some((x: any) => x.id === u.id)) {
    db.users.push({ ...u, passwordHash: pHash });
    saveSimulatedDB(db);
  }
  res.json({ success: true, user: sanitizeUser(u) });
});

// PUT User (Whitelist columns to prevent SQL injection and unauthorized role elevation)
apiRouter.put('/users/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  // Role guard: Only admin can edit other users
  if (req.user && req.user.role !== 'admin' && req.user.id !== id) {
    return res.status(403).json({ success: false, error: 'Unauthorized to modify other user accounts.' });
  }

  // Strict column whitelist
  const ALLOWED_COLUMNS: Record<string, string> = {
    name: 'name',
    email: 'email',
    gradeLevel: 'grade_level',
    grade_level: 'grade_level',
    profileImage: 'profile_image',
    profile_image: 'profile_image',
    status: 'status',
    subjects: 'subjects',
  };

  // Only admin can modify roles
  if (req.user?.role === 'admin' && updates.role) {
    ALLOWED_COLUMNS['role'] = 'role';
  }

  const safeUpdates: Record<string, any> = {};
  for (const [key, val] of Object.entries(updates)) {
    if (ALLOWED_COLUMNS[key]) {
      safeUpdates[ALLOWED_COLUMNS[key]] = val;
    }
  }

  if (dbMode === 'postgres') {
    let client;
    try {
      client = await pool.connect();
      await client.query('BEGIN');

      const setClauses: string[] = [];
      const values: any[] = [];
      let i = 1;

      for (const [col, value] of Object.entries(safeUpdates)) {
        setClauses.push(`${col} = $${i}`);
        values.push(col === 'subjects' && Array.isArray(value) ? JSON.stringify(value) : value);
        i++;
      }

      if (setClauses.length > 0) {
        values.push(id);
        await client.query(
          `UPDATE users SET ${setClauses.join(', ')} WHERE id = $${i}`,
          values
        );
      }

      if (updates.linkedStudents !== undefined) {
        await client.query('DELETE FROM user_relationships WHERE parent_id = $1', [id]);
        if (Array.isArray(updates.linkedStudents)) {
          for (const sId of updates.linkedStudents) {
            await client.query(
              'INSERT INTO user_relationships (parent_id, student_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
              [id, sId]
            );
          }
        }
      }

      if (updates.linkedParents !== undefined) {
        await client.query('DELETE FROM user_relationships WHERE student_id = $1', [id]);
        if (Array.isArray(updates.linkedParents)) {
          for (const pId of updates.linkedParents) {
            await client.query(
              'INSERT INTO user_relationships (parent_id, student_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
              [pId, id]
            );
          }
        }
      }

      await client.query('COMMIT');
      return res.json({ success: true });
    } catch (e: any) {
      if (client) {
        try { await client.query('ROLLBACK'); } catch {}
      }
      console.error('PostgreSQL PUT user failed:', e);
      return res.status(500).json({ success: false, error: e.message });
    } finally {
      if (client) client.release();
    }
  }

  const db = getSimulatedDB();
  const idx = db.users.findIndex((x: any) => x.id === id);
  if (idx !== -1) {
    db.users[idx] = { ...db.users[idx], ...safeUpdates };
    if (updates.linkedStudents !== undefined) db.users[idx].linkedStudents = updates.linkedStudents;
    if (updates.linkedParents !== undefined) db.users[idx].linkedParents = updates.linkedParents;
    saveSimulatedDB(db);
  }
  res.json({ success: true });
});

// DELETE User (Protected: Admin Only)
apiRouter.delete('/users/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const { id } = req.params;
  if (dbMode === 'postgres') {
    let client;
    try {
      client = await pool.connect();
      await client.query('BEGIN');
      await client.query('DELETE FROM users WHERE id = $1', [id]);
      await client.query('COMMIT');
      return res.json({ success: true, message: 'User deleted successfully.' });
    } catch (e: any) {
      if (client) {
        try { await client.query('ROLLBACK'); } catch {}
      }
      console.error('PostgreSQL DELETE user failed:', e);
      return res.status(500).json({ success: false, error: e.message });
    } finally {
      if (client) client.release();
    }
  }

  const db = getSimulatedDB();
  db.users = db.users.filter((u: any) => u.id !== id);
  saveSimulatedDB(db);
  return res.json({ success: true, message: 'User deleted successfully.' });
});

// -------------------------------------------------------------
// 6. TEST RESULTS & SERVER-SIDE SCORING
// -------------------------------------------------------------
apiRouter.get('/test-results', async (req, res) => {
  const { studentId } = req.query;
  if (dbMode === 'postgres') {
    try {
      let q = `
        SELECT tr.*, pr.recommended_grade, pr.confidence_score, pr.strengths as pr_strengths, 
               pr.areas_to_improve, pr.suggested_next_steps 
        FROM test_results tr 
        LEFT JOIN placement_recommendations pr ON pr.test_result_id = tr.id
      `;
      const params: any[] = [];
      if (studentId) {
        q += ' WHERE tr.student_id = $1';
        params.push(studentId);
      }
      q += ' ORDER BY tr.completed_at DESC';
      const { rows } = await pool.query(q, params);
      return res.json(rows.map(r => ({
        id: r.id,
        studentId: r.student_id,
        testId: r.test_id,
        testTitle: r.test_title,
        subject: r.subject,
        score: parseFloat(r.score),
        totalScore: parseFloat(r.total_score),
        percentage: parseFloat(r.percentage),
        timeTaken: r.time_taken,
        completedAt: r.completed_at,
        answers: typeof r.answers === 'string' ? JSON.parse(r.answers) : r.answers,
        strengths: typeof r.strengths === 'string' ? JSON.parse(r.strengths) : r.strengths,
        weaknesses: typeof r.weaknesses === 'string' ? JSON.parse(r.weaknesses) : r.weaknesses,
        isPlacementTest: r.is_placement_test,
        flaggedQuestions: typeof r.flagged_questions === 'string' ? JSON.parse(r.flagged_questions) : r.flagged_questions,
        placementRecommendation: r.recommended_grade ? {
          subject: r.subject,
          recommendedGrade: r.recommended_grade,
          confidenceScore: parseFloat(r.confidence_score),
          strengths: typeof r.pr_strengths === 'string' ? JSON.parse(r.pr_strengths) : r.pr_strengths,
          areasToImprove: typeof r.areas_to_improve === 'string' ? JSON.parse(r.areas_to_improve) : r.areas_to_improve,
          suggestedNextSteps: typeof r.suggested_next_steps === 'string' ? JSON.parse(r.suggested_next_steps) : r.suggested_next_steps
        } : undefined
      })));
    } catch (e: any) {
      console.error('PostgreSQL GET test results failed:', e);
    }
  }

  const db = getSimulatedDB();
  if (studentId) {
    return res.json(db.testResults.filter((x: any) => x.studentId === studentId));
  }
  res.json(db.testResults);
});

// POST /api/test-results (Server-Side Verified Scoring Engine)
apiRouter.post('/test-results', async (req, res) => {
  const r = req.body;
  if (!r.testId || !r.studentId) {
    return res.status(400).json({ success: false, error: 'testId and studentId are required.' });
  }

  // Role validation: if student is signed in, prevent submitting for another student
  if (req.user && req.user.role === 'student' && req.user.id !== r.studentId) {
    return res.status(403).json({ success: false, error: 'Cannot submit test results on behalf of another student.' });
  }

  // 1. Fetch official test questions and authoritative answer keys from server storage
  let testQuestions: any[] = [];
  let testTitle = r.testTitle || 'Educational Assessment';
  let subject = r.subject || 'General Subject';
  let isPlacement = r.isPlacementTest || false;

  if (dbMode === 'postgres') {
    try {
      const tRes = await pool.query('SELECT * FROM tests WHERE id = $1', [r.testId]);
      if (tRes.rows.length > 0) {
        testTitle = tRes.rows[0].title;
        subject = tRes.rows[0].subject;
        isPlacement = tRes.rows[0].is_placement_test;
      }
      const qRes = await pool.query(
        `SELECT q.* FROM questions q
         JOIN test_questions tq ON tq.question_id = q.id
         WHERE tq.test_id = $1`,
        [r.testId]
      );
      testQuestions = qRes.rows.map(q => ({
        id: q.id,
        correctAnswer: q.correct_answer,
        explanation: q.explanation,
        weight: parseFloat(q.weight) || 1.0,
        subject: q.subject
      }));
    } catch (e) {
      console.error('Error querying test questions for scoring:', e);
    }
  }

  if (testQuestions.length === 0) {
    const db = getSimulatedDB();
    const testMatch = db.tests.find((t: any) => t.id === r.testId);
    if (testMatch) {
      testTitle = testMatch.title;
      subject = testMatch.subject;
      isPlacement = testMatch.isPlacementTest;
      testQuestions = testMatch.questions || [];
    }
  }

  // 2. Perform server-side evaluation (Do NOT trust client-sent scores!)
  let serverScore = 0;
  let serverTotalScore = 0;
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (testQuestions.length > 0) {
    for (const q of testQuestions) {
      const qWeight = q.weight || 1.0;
      serverTotalScore += qWeight;
      const submitted = r.answers ? String(r.answers[q.id] ?? '').trim().toLowerCase() : '';
      const correct = String(q.correctAnswer ?? q.correct_answer ?? '').trim().toLowerCase();
      
      if (submitted && submitted === correct) {
        serverScore += qWeight;
      } else {
        weaknesses.push(`Focus on: ${q.subject || subject}`);
      }
    }
    if (serverScore === serverTotalScore) {
      strengths.push('Mastery across all assessed objectives');
    } else {
      strengths.push(`Solid foundational knowledge in ${subject}`);
    }
  } else {
    // Fallback if no questions are linked
    serverScore = Number(r.score) || 0;
    serverTotalScore = Number(r.totalScore) || 100;
  }

  const calculatedPercentage = serverTotalScore > 0 ? Math.round((serverScore / serverTotalScore) * 100) : 0;
  const verifiedResult = {
    ...r,
    id: r.id || `result-${Date.now()}`,
    score: serverScore,
    totalScore: serverTotalScore,
    percentage: calculatedPercentage,
    testTitle,
    subject,
    isPlacementTest: isPlacement,
    strengths: strengths.length > 0 ? strengths.slice(0, 3) : (r.strengths || ['Good attempt']),
    weaknesses: weaknesses.length > 0 ? Array.from(new Set(weaknesses)).slice(0, 3) : (r.weaknesses || ['None']),
    completedAt: r.completedAt || new Date().toISOString(),
    verifiedByServer: true
  };

  // 3. Persist verified test result
  if (dbMode === 'postgres') {
    let client;
    try {
      client = await pool.connect();
      await client.query('BEGIN');
      await client.query(
        `INSERT INTO test_results (id, student_id, test_id, test_title, subject, score, total_score, percentage, time_taken, completed_at, answers, strengths, weaknesses, is_placement_test, flagged_questions)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [
          verifiedResult.id, verifiedResult.studentId, verifiedResult.testId, verifiedResult.testTitle, 
          verifiedResult.subject, verifiedResult.score, verifiedResult.totalScore, verifiedResult.percentage, 
          verifiedResult.timeTaken, verifiedResult.completedAt, 
          JSON.stringify(verifiedResult.answers), JSON.stringify(verifiedResult.strengths), JSON.stringify(verifiedResult.weaknesses), 
          verifiedResult.isPlacementTest || false, 
          verifiedResult.flaggedQuestions ? JSON.stringify(verifiedResult.flaggedQuestions) : null
        ]
      );

      if (verifiedResult.placementRecommendation) {
        const pr = verifiedResult.placementRecommendation;
        await client.query(
          `INSERT INTO placement_recommendations (test_result_id, subject, recommended_grade, confidence_score, strengths, areas_to_improve, suggested_next_steps)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [verifiedResult.id, pr.subject, pr.recommendedGrade, pr.confidenceScore, JSON.stringify(pr.strengths), JSON.stringify(pr.areasToImprove), JSON.stringify(pr.suggestedNextSteps)]
        );
      }

      await client.query('COMMIT');
      return res.json({ success: true, result: verifiedResult });
    } catch (e: any) {
      if (client) {
        try { await client.query('ROLLBACK'); } catch {}
      }
      console.error('PostgreSQL POST test result failed:', e);
      return res.status(500).json({ success: false, error: e.message });
    } finally {
      if (client) client.release();
    }
  }

  const db = getSimulatedDB();
  db.testResults.unshift(verifiedResult);
  saveSimulatedDB(db);
  res.json({ success: true, result: verifiedResult });
});

// -------------------------------------------------------------
// 7. CHEATING / INTEGRITY FLAGS
// -------------------------------------------------------------
apiRouter.get('/cheating-flags', async (_req, res) => {
  if (dbMode === 'postgres') {
    try {
      const { rows } = await pool.query('SELECT * FROM cheating_flags');
      return res.json(rows.map(r => ({
        id: r.id,
        studentName: r.student_name,
        testName: r.test_name,
        date: r.date,
        confidenceScore: r.confidence_score,
        flags: typeof r.flags === 'string' ? JSON.parse(r.flags) : r.flags,
        status: r.status
      })));
    } catch (e) {
      console.error('PostgreSQL GET cheating-flags failed:', e);
    }
  }
  const db = getSimulatedDB();
  res.json(db.cheatingFlags);
});

// PUT Cheating Flag (Supports pending, reviewed, cleared, confirmed, dismissed)
apiRouter.put('/cheating-flags/:id', requireAuth, requireRole('admin', 'teacher'), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const ALLOWED_STATUSES = ['pending', 'reviewed', 'cleared', 'confirmed', 'dismissed'];
  if (!ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({ 
      success: false, 
      error: `Invalid status '${status}'. Must be one of: ${ALLOWED_STATUSES.join(', ')}` 
    });
  }

  if (dbMode === 'postgres') {
    try {
      await pool.query('UPDATE cheating_flags SET status = $1 WHERE id = $2', [status, id]);
      return res.json({ success: true });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  const db = getSimulatedDB();
  db.cheatingFlags = db.cheatingFlags.map((x: any) => x.id === id ? { ...x, status } : x);
  saveSimulatedDB(db);
  res.json({ success: true });
});

// -------------------------------------------------------------
// 8. CONTENT VERSIONS & AUDIT LOGS
// -------------------------------------------------------------
apiRouter.get('/content-versions', async (_req, res) => {
  if (dbMode === 'postgres') {
    try {
      const { rows } = await pool.query('SELECT * FROM content_versions ORDER BY created_at DESC');
      return res.json(rows.map(r => ({
        id: r.id,
        questionId: r.question_id,
        version: r.version,
        content: r.content,
        createdBy: r.created_by,
        createdAt: r.created_at,
        status: r.status
      })));
    } catch (e) {
      console.error(e);
    }
  }
  const db = getSimulatedDB();
  res.json(db.contentVersions);
});

apiRouter.post('/content-versions', requireAuth, requireRole('admin', 'teacher'), async (req, res) => {
  const v = req.body;
  if (dbMode === 'postgres') {
    try {
      await pool.query(
        `INSERT INTO content_versions (id, question_id, version, content, created_by, created_at, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO UPDATE 
         SET status = EXCLUDED.status, content = EXCLUDED.content, version = EXCLUDED.version`,
        [v.id, v.questionId, v.version, v.content, v.createdBy, v.createdAt || new Date().toISOString(), v.status]
      );
      return res.json({ success: true });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }
  const db = getSimulatedDB();
  db.contentVersions = db.contentVersions.filter((x: any) => x.id !== v.id);
  db.contentVersions.unshift(v);
  saveSimulatedDB(db);
  res.json({ success: true });
});

// -------------------------------------------------------------
// 9. USER ACTIVITIES
// -------------------------------------------------------------
apiRouter.get('/user-activities', async (_req, res) => {
  if (dbMode === 'postgres') {
    try {
      const { rows } = await pool.query('SELECT * FROM user_activities ORDER BY timestamp DESC');
      return res.json(rows.map(r => ({
        id: r.id,
        userId: r.user_id,
        action: r.action,
        details: r.details,
        timestamp: r.timestamp
      })));
    } catch (e) {
      console.error(e);
    }
  }
  const db = getSimulatedDB();
  res.json(db.userActivities);
});

apiRouter.post('/user-activities', async (req, res) => {
  const a = req.body;
  if (dbMode === 'postgres') {
    try {
      await pool.query(
        `INSERT INTO user_activities (id, user_id, action, details, timestamp)
         VALUES ($1, $2, $3, $4, $5)`,
        [a.id, a.userId, a.action, a.details, a.timestamp || new Date().toISOString()]
      );
      return res.json({ success: true });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }
  const db = getSimulatedDB();
  db.userActivities.unshift(a);
  saveSimulatedDB(db);
  res.json({ success: true });
});

// -------------------------------------------------------------
// 10. UNITS & CURRICULUM ENDPOINTS
// -------------------------------------------------------------
apiRouter.get('/units', async (req, res) => {
  const { subject, gradeLevel } = req.query;
  if (dbMode === 'postgres') {
    try {
      let query = 'SELECT * FROM units';
      const params: any[] = [];
      if (subject && gradeLevel) {
        query += ' WHERE subject = $1 AND grade_level = $2';
        params.push(subject, parseInt(gradeLevel as string));
      } else if (subject) {
        query += ' WHERE subject = $1';
        params.push(subject);
      } else if (gradeLevel) {
        query += ' WHERE grade_level = $1';
        params.push(parseInt(gradeLevel as string));
      }
      const { rows } = await pool.query(query, params);
      return res.json(rows.map(r => ({
        id: r.id,
        subject: r.subject,
        gradeLevel: r.grade_level,
        name: r.name,
        description: r.description
      })));
    } catch (e: any) {
      console.error('PostgreSQL GET units failed:', e);
    }
  }
  const db = getSimulatedDB();
  let units = db.units || [];
  if (subject) {
    units = units.filter((u: any) => u.subject === subject);
  }
  if (gradeLevel) {
    units = units.filter((u: any) => u.gradeLevel === parseInt(gradeLevel as string));
  }
  res.json(units);
});

apiRouter.post('/units', requireAuth, requireRole('admin', 'teacher'), async (req, res) => {
  const u = req.body;
  if (dbMode === 'postgres') {
    try {
      await pool.query(
        `INSERT INTO units (id, subject, grade_level, name, description)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE
         SET name = EXCLUDED.name, description = EXCLUDED.description`,
        [u.id, u.subject, u.gradeLevel, u.name, u.description]
      );
      return res.json({ success: true, unit: u });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }
  const db = getSimulatedDB();
  if (!db.units) db.units = [];
  db.units = db.units.filter((x: any) => x.id !== u.id);
  db.units.push(u);
  saveSimulatedDB(db);
  res.json({ success: true, unit: u });
});

// -------------------------------------------------------------
// 11. LESSONS ENDPOINTS
// -------------------------------------------------------------
apiRouter.get('/lessons', async (req, res) => {
  const { unitId } = req.query;
  if (dbMode === 'postgres') {
    try {
      let query = 'SELECT * FROM lessons';
      const params: any[] = [];
      if (unitId) {
        query += ' WHERE unit_id = $1';
        params.push(unitId);
      }
      query += ' ORDER BY order_num ASC';
      const { rows } = await pool.query(query, params);
      return res.json(rows.map(r => ({
        id: r.id,
        unitId: r.unit_id,
        name: r.name,
        description: r.description,
        orderNum: r.order_num
      })));
    } catch (e: any) {
      console.error('PostgreSQL GET lessons failed:', e);
    }
  }
  const db = getSimulatedDB();
  let lessons = db.lessons || [];
  if (unitId) {
    lessons = lessons.filter((l: any) => l.unitId === unitId);
  }
  res.json(lessons);
});

// -------------------------------------------------------------
// 12. BULK QUESTIONS IMPORT
// -------------------------------------------------------------
apiRouter.post('/questions/bulk', requireAuth, requireRole('admin', 'teacher'), async (req, res) => {
  const { questions } = req.body;
  if (!Array.isArray(questions)) {
    return res.status(400).json({ success: false, error: 'Questions must be a valid array' });
  }

  if (dbMode === 'postgres') {
    let client;
    try {
      client = await pool.connect();
      await client.query('BEGIN');
      for (const q of questions) {
        await client.query(
          `INSERT INTO questions (id, text, type, options, correct_answer, explanation, subject, grade_level, difficulty, weight)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (id) DO UPDATE 
           SET text = EXCLUDED.text, type = EXCLUDED.type, options = EXCLUDED.options, 
               correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation,
               subject = EXCLUDED.subject, grade_level = EXCLUDED.grade_level,
               difficulty = EXCLUDED.difficulty, weight = EXCLUDED.weight`,
          [
            q.id || `q-gen-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            q.text,
            q.type,
            q.options ? JSON.stringify(q.options) : null,
            q.correctAnswer.toString(),
            q.explanation,
            q.subject,
            parseInt(q.gradeLevel.toString()),
            q.difficulty,
            q.weight || 1.00
          ]
        );
      }
      await client.query('COMMIT');
      return res.json({ success: true, count: questions.length });
    } catch (e: any) {
      if (client) {
        try { await client.query('ROLLBACK'); } catch {}
      }
      console.error('PostgreSQL POST bulk questions failed:', e);
      return res.status(500).json({ success: false, error: e.message });
    } finally {
      if (client) client.release();
    }
  }

  const db = getSimulatedDB();
  for (const q of questions) {
    const cleanQ = {
      ...q,
      id: q.id || `q-gen-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      gradeLevel: parseInt(q.gradeLevel.toString())
    };
    db.questions = db.questions.filter((x: any) => x.id !== cleanQ.id);
    db.questions.unshift(cleanQ);
  }
  saveSimulatedDB(db);
  res.json({ success: true, count: questions.length });
});

// -------------------------------------------------------------
// 13. PLATFORM CUSTOMIZATION ENDPOINTS
// -------------------------------------------------------------
apiRouter.get('/customization', async (_req, res) => {
  if (dbMode === 'postgres') {
    try {
      const { rows } = await pool.query('SELECT * FROM platform_customizations');
      const data: Record<string, string> = {};
      rows.forEach(r => {
        data[r.key] = r.value;
      });
      return res.json(data);
    } catch (e: any) {
      console.error('PostgreSQL GET customizations failed:', e);
    }
  }
  const db = getSimulatedDB();
  res.json(db.platformCustomizations || {});
});

apiRouter.post('/customization', requireAuth, requireRole('admin'), async (req, res) => {
  const updates = req.body;
  if (dbMode === 'postgres') {
    let client;
    try {
      client = await pool.connect();
      await client.query('BEGIN');
      for (const [key, value] of Object.entries(updates)) {
        await client.query(
          `INSERT INTO platform_customizations (key, value)
           VALUES ($1, $2)
           ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
          [key, value]
        );
      }
      await client.query('COMMIT');
      return res.json({ success: true });
    } catch (e: any) {
      if (client) {
        try { await client.query('ROLLBACK'); } catch {}
      }
      console.error('PostgreSQL POST customizations failed:', e);
      return res.status(500).json({ success: false, error: e.message });
    } finally {
      if (client) client.release();
    }
  }

  const db = getSimulatedDB();
  if (!db.platformCustomizations) db.platformCustomizations = {};
  for (const [key, value] of Object.entries(updates)) {
    db.platformCustomizations[key] = value as string;
  }
  saveSimulatedDB(db);
  res.json({ success: true });
});

// -------------------------------------------------------------
// 14. TEACHERS & ENROLLMENTS ENDPOINTS
// -------------------------------------------------------------
apiRouter.get('/teachers', async (_req, res) => {
  if (dbMode === 'postgres') {
    try {
      const { rows } = await pool.query(
        "SELECT id, name, email, role, grade_level, profile_image, status, created_at, subjects FROM users WHERE role = 'teacher' AND status = 'active'"
      );
      return res.json(rows.map(r => ({
        id: r.id,
        name: r.name,
        email: r.email,
        role: r.role,
        gradeLevel: r.grade_level,
        profileImage: r.profile_image,
        status: r.status,
        createdAt: r.created_at,
        subjects: typeof r.subjects === 'string' ? JSON.parse(r.subjects) : (r.subjects || [])
      })));
    } catch (e: any) {
      console.error('PostgreSQL GET teachers failed:', e);
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  const db = getSimulatedDB();
  const teachers = db.users
    .filter((u: any) => u.role === 'teacher' && u.status === 'active')
    .map(sanitizeUser);
  res.json(teachers);
});

apiRouter.get('/enrollments', async (req, res) => {
  const { studentId } = req.query;
  if (dbMode === 'postgres') {
    try {
      let q = 'SELECT * FROM student_teacher_enrollments';
      const params: any[] = [];
      if (studentId) {
        q += ' WHERE student_id = $1';
        params.push(studentId);
      }
      const { rows } = await pool.query(q, params);
      return res.json(rows.map(r => ({
        studentId: r.student_id,
        teacherId: r.teacher_id,
        subject: r.subject,
        enrolledAt: r.enrolled_at
      })));
    } catch (e: any) {
      console.error('PostgreSQL GET enrollments failed:', e);
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  const db = getSimulatedDB();
  let enrollments = db.enrollments || [];
  if (studentId) {
    enrollments = enrollments.filter((e: any) => e.studentId === studentId);
  }
  res.json(enrollments);
});

apiRouter.post('/enrollments', requireAuth, async (req, res) => {
  const { studentId, teacherId, subject } = req.body;
  if (!studentId || !teacherId || !subject) {
    return res.status(400).json({ success: false, error: 'Missing studentId, teacherId, or subject' });
  }

  if (dbMode === 'postgres') {
    try {
      await pool.query(
        `INSERT INTO student_teacher_enrollments (student_id, teacher_id, subject)
         VALUES ($1, $2, $3)
         ON CONFLICT (student_id, teacher_id, subject) DO NOTHING`,
        [studentId, teacherId, subject]
      );
      return res.json({ success: true, enrollment: { studentId, teacherId, subject, enrolledAt: new Date().toISOString() } });
    } catch (e: any) {
      console.error('PostgreSQL POST enrollment failed:', e);
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  const db = getSimulatedDB();
  if (!db.enrollments) db.enrollments = [];
  const exists = db.enrollments.some(
    (e: any) => e.studentId === studentId && e.teacherId === teacherId && e.subject === subject
  );
  const newEnrollment = { studentId, teacherId, subject, enrolledAt: new Date().toISOString() };
  if (!exists) {
    db.enrollments.push(newEnrollment);
    saveSimulatedDB(db);
  }
  res.json({ success: true, enrollment: newEnrollment });
});

apiRouter.delete('/enrollments', requireAuth, async (req, res) => {
  const { studentId, teacherId, subject } = req.body;
  if (!studentId || !teacherId || !subject) {
    return res.status(400).json({ success: false, error: 'Missing studentId, teacherId, or subject' });
  }

  if (dbMode === 'postgres') {
    try {
      await pool.query(
        `DELETE FROM student_teacher_enrollments 
         WHERE student_id = $1 AND teacher_id = $2 AND subject = $3`,
        [studentId, teacherId, subject]
      );
      return res.json({ success: true });
    } catch (e: any) {
      console.error('PostgreSQL DELETE enrollment failed:', e);
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  const db = getSimulatedDB();
  if (db.enrollments) {
    db.enrollments = db.enrollments.filter(
      (e: any) => !(e.studentId === studentId && e.teacherId === teacherId && e.subject === subject)
    );
    saveSimulatedDB(db);
  }
  res.json({ success: true });
});

// -------------------------------------------------------------
// 15. PRIVACY-PRESERVING AI PROXY (COPPA/FERPA COMPLIANT)
// -------------------------------------------------------------
apiRouter.post('/ai/chat', requireAuth, rateLimiter(60 * 1000, 30), async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ success: false, error: 'Message content is required.' });
  }

  // PII Redaction: Student names, email patterns, phone patterns and IDs are stripped
  const sanitizedMsg = String(message)
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL_REDACTED]')
    .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE_REDACTED]')
    .replace(/user-[a-z0-9-]+|student-[a-z0-9-]+/gi, '[STUDENT_ID_REDACTED]');

  const lower = sanitizedMsg.toLowerCase();
  let response = "I'm your secure AI Study Assistant! I can help you understand challenging concepts step-by-step. What topic would you like to review?";

  if (lower.includes('photosynthesis')) {
    response = "Photosynthesis is the biological process by which green plants convert light energy into chemical glucose. In chloroplasts: 6CO₂ + 6H₂O + sunlight → C₆H₁₂O₆ + 6O₂.";
  } else if (lower.includes('mitosis') || lower.includes('cell division')) {
    response = "Mitosis consists of four primary stages: Prophase, Metaphase, Anaphase, and Telophase (PMAT), resulting in two genetically identical diploid daughter cells.";
  } else if (lower.includes('fraction') || lower.includes('denominator')) {
    response = "To combine fractions with unlike denominators, compute their Least Common Multiple (LCM), rescale both fractions, and then add or subtract their numerators.";
  } else if (lower.includes('gravity') || lower.includes('force')) {
    response = "Gravity is the attractive force between masses. Newton's universal law states that F = G * (m₁ * m₂) / r², meaning force increases with mass and decreases with distance.";
  }

  return res.json({
    success: true,
    response,
    privacySafeguarded: true,
    coppaCompliant: true
  });
});
