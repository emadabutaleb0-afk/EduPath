import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DatabaseSync } from 'node:sqlite';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to find existing data sources
function getBaseData() {
  const possiblePaths = [
    path.resolve(process.cwd(), 'server', 'db', 'simulated_db.json'),
    path.resolve(__dirname, '..', 'server', 'db', 'simulated_db.json'),
    path.resolve(__dirname, '..', '..', 'server', 'db', 'simulated_db.json'),
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      try {
        return JSON.parse(fs.readFileSync(p, 'utf-8'));
      } catch (e) {
        console.error('Error reading JSON DB from', p, e);
      }
    }
  }
  return {};
}

export async function createRealTables() {
  console.log('=============================================================================');
  console.log('🚀 EduPath Enterprise Production Database Provisioning Engine (29 Tables)');
  console.log('=============================================================================\n');

  const base = getBaseData();

  // -------------------------------------------------------------------------
  // 1. SETUP SQLITE PRODUCTION-GRADE DATABASE (.db on disk)
  // -------------------------------------------------------------------------
  const primaryDbPath = path.resolve(process.cwd(), 'server', 'db', 'edupath.db');
  fs.mkdirSync(path.dirname(primaryDbPath), { recursive: true });

  if (fs.existsSync(primaryDbPath)) {
    try { fs.unlinkSync(primaryDbPath); } catch {}
  }

  console.log(`📁 Provisioning SQLite database file at:`);
  console.log(`   ${primaryDbPath}`);

  const sqlite = new DatabaseSync(primaryDbPath);
  sqlite.exec('PRAGMA foreign_keys = OFF;');

  console.log('\n🔨 Executing DDL for all 29 Enterprise Schema Tables...');

  sqlite.exec(`
    -- 1. Academic Registries
    CREATE TABLE IF NOT EXISTS academic_registries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL CHECK (type IN ('subject', 'grade')),
      value TEXT UNIQUE NOT NULL
    );

    -- 2. Users Table
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      role TEXT NOT NULL CHECK (role IN ('student', 'parent', 'admin', 'teacher')),
      grade_level INTEGER,
      profile_image TEXT,
      status TEXT DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'inactive', 'suspended')),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      subjects TEXT
    );

    -- 3. Parent-Student Relationships
    CREATE TABLE IF NOT EXISTS user_relationships (
      parent_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      PRIMARY KEY (parent_id, student_id)
    );

    -- 4. Student Teacher Enrollments
    CREATE TABLE IF NOT EXISTS student_teacher_enrollments (
      student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      teacher_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      subject TEXT NOT NULL,
      enrolled_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      PRIMARY KEY (student_id, teacher_id, subject)
    );

    -- 5. Units
    CREATE TABLE IF NOT EXISTS units (
      id TEXT PRIMARY KEY,
      subject TEXT NOT NULL,
      grade_level INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    -- 6. Lessons
    CREATE TABLE IF NOT EXISTS lessons (
      id TEXT PRIMARY KEY,
      unit_id TEXT NOT NULL REFERENCES units(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      order_num INTEGER NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    -- 7. Lesson Materials
    CREATE TABLE IF NOT EXISTS lesson_materials (
      id TEXT PRIMARY KEY,
      lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
      type TEXT NOT NULL CHECK (type IN ('video', 'document', 'quiz', 'link')),
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      details TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    -- 8. Questions
    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('mcq', 'trueFalse', 'openEnded')),
      options TEXT,
      correct_answer TEXT NOT NULL,
      explanation TEXT NOT NULL,
      subject TEXT NOT NULL,
      grade_level INTEGER NOT NULL,
      difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
      weight REAL DEFAULT 1.00 NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    -- 9. Tests
    CREATE TABLE IF NOT EXISTS tests (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      subject TEXT NOT NULL,
      grade_level INTEGER NOT NULL,
      total_questions INTEGER NOT NULL,
      duration INTEGER NOT NULL,
      passing_score INTEGER NOT NULL,
      difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
      is_adaptive INTEGER DEFAULT 0 NOT NULL,
      is_placement_test INTEGER DEFAULT 0 NOT NULL,
      scheduled_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    -- 10. Test Sections
    CREATE TABLE IF NOT EXISTS test_sections (
      id TEXT PRIMARY KEY,
      test_id TEXT NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      duration INTEGER
    );

    -- 11. Test Questions Junction
    CREATE TABLE IF NOT EXISTS test_questions (
      test_id TEXT NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
      question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
      section_id TEXT REFERENCES test_sections(id) ON DELETE SET NULL,
      PRIMARY KEY (test_id, question_id)
    );

    -- 12. Test Results
    CREATE TABLE IF NOT EXISTS test_results (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      test_id TEXT NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
      test_title TEXT NOT NULL,
      subject TEXT NOT NULL,
      score REAL NOT NULL,
      total_score REAL NOT NULL,
      percentage REAL NOT NULL,
      time_taken INTEGER NOT NULL,
      completed_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      answers TEXT NOT NULL,
      strengths TEXT NOT NULL,
      weaknesses TEXT NOT NULL,
      is_placement_test INTEGER DEFAULT 0 NOT NULL,
      flagged_questions TEXT
    );

    -- 13. Placement Recommendations
    CREATE TABLE IF NOT EXISTS placement_recommendations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      test_result_id TEXT NOT NULL REFERENCES test_results(id) ON DELETE CASCADE,
      subject TEXT NOT NULL,
      recommended_grade INTEGER NOT NULL,
      confidence_score REAL NOT NULL,
      strengths TEXT NOT NULL,
      areas_to_improve TEXT NOT NULL,
      suggested_next_steps TEXT NOT NULL
    );

    -- 14. Cheating & Academic Integrity Flags
    CREATE TABLE IF NOT EXISTS cheating_flags (
      id TEXT PRIMARY KEY,
      student_name TEXT NOT NULL,
      test_name TEXT NOT NULL,
      date TEXT NOT NULL,
      confidence_score INTEGER NOT NULL,
      flags TEXT NOT NULL,
      status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'reviewed', 'cleared', 'confirmed', 'dismissed')),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    -- 15. Lesson Bookings (Live Tutoring)
    CREATE TABLE IF NOT EXISTS lesson_bookings (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      student_name TEXT NOT NULL,
      teacher_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      teacher_name TEXT NOT NULL,
      teacher_avatar TEXT,
      subject TEXT NOT NULL,
      lesson_title TEXT NOT NULL,
      scheduled_date TEXT NOT NULL,
      scheduled_time TEXT NOT NULL,
      duration_minutes INTEGER DEFAULT 45 NOT NULL,
      status TEXT DEFAULT 'scheduled' NOT NULL CHECK (status IN ('scheduled', 'live', 'completed', 'cancelled')),
      amount_paid REAL DEFAULT 0.00 NOT NULL,
      payment_method TEXT DEFAULT 'card' NOT NULL,
      transaction_id TEXT,
      meeting_url TEXT,
      curriculum_lesson_id TEXT,
      checkpoint_test_id TEXT,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    -- 16. Financial Transactions Ledger
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      user_name TEXT NOT NULL,
      booking_id TEXT REFERENCES lesson_bookings(id) ON DELETE SET NULL,
      type TEXT NOT NULL CHECK (type IN ('lesson_single', 'monthly_pass', 'annual_pass', 'refund')),
      amount REAL NOT NULL,
      currency TEXT DEFAULT 'USD' NOT NULL,
      status TEXT DEFAULT 'succeeded' NOT NULL CHECK (status IN ('succeeded', 'pending', 'refunded', 'failed')),
      payment_method TEXT NOT NULL,
      card_last4 TEXT,
      description TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    -- 17. Student Passes
    CREATE TABLE IF NOT EXISTS student_passes (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      plan_name TEXT NOT NULL,
      remaining_credits INTEGER DEFAULT 0 NOT NULL,
      total_credits INTEGER DEFAULT 0 NOT NULL,
      valid_until TEXT NOT NULL,
      status TEXT DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'expired', 'exhausted')),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    -- 18. Achievements Master Catalog
    CREATE TABLE IF NOT EXISTS achievements (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      icon TEXT NOT NULL,
      rarity TEXT DEFAULT 'common' NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
      points INTEGER DEFAULT 10 NOT NULL,
      criteria TEXT
    );

    -- 19. User Achievements
    CREATE TABLE IF NOT EXISTS user_achievements (
      student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      achievement_id TEXT NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
      unlocked_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      PRIMARY KEY (student_id, achievement_id)
    );

    -- 20. Student Stats
    CREATE TABLE IF NOT EXISTS student_stats (
      student_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      level INTEGER DEFAULT 1 NOT NULL,
      xp INTEGER DEFAULT 0 NOT NULL,
      total_xp INTEGER DEFAULT 0 NOT NULL,
      current_streak INTEGER DEFAULT 0 NOT NULL,
      longest_streak INTEGER DEFAULT 0 NOT NULL,
      last_test_date TEXT,
      total_tests_taken INTEGER DEFAULT 0 NOT NULL,
      average_score REAL DEFAULT 0.00 NOT NULL,
      subject_mastery TEXT,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    -- 21. Leaderboard Records
    CREATE TABLE IF NOT EXISTS leaderboard_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      season TEXT DEFAULT 'current' NOT NULL,
      student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      rank INTEGER NOT NULL,
      total_xp INTEGER DEFAULT 0 NOT NULL,
      average_score REAL DEFAULT 0.00 NOT NULL,
      tests_taken INTEGER DEFAULT 0 NOT NULL,
      streak INTEGER DEFAULT 0 NOT NULL,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    -- 22. Notifications Inbox
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL CHECK (type IN ('test_available', 'result_ready', 'achievement', 'streak_reminder', 'booking_confirmed', 'system')),
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      icon TEXT,
      read INTEGER DEFAULT 0 NOT NULL,
      action_url TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    -- 23. Learning Goals
    CREATE TABLE IF NOT EXISTS learning_goals (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      subject TEXT NOT NULL,
      target_percentage REAL NOT NULL,
      current_percentage REAL DEFAULT 0.00 NOT NULL,
      deadline TEXT NOT NULL,
      achieved INTEGER DEFAULT 0 NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    -- 24. Content Versions
    CREATE TABLE IF NOT EXISTS content_versions (
      id TEXT PRIMARY KEY,
      question_id TEXT NOT NULL,
      version INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_by TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      status TEXT DEFAULT 'approved' NOT NULL CHECK (status IN ('draft', 'approved', 'retired'))
    );

    -- 25. Flagged Content
    CREATE TABLE IF NOT EXISTS flagged_content (
      id TEXT PRIMARY KEY,
      content_id TEXT NOT NULL,
      content_type TEXT NOT NULL CHECK (content_type IN ('question', 'test', 'user', 'review')),
      reason TEXT NOT NULL,
      flagged_by TEXT NOT NULL,
      flagged_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
      resolution TEXT
    );

    -- 26. Announcements
    CREATE TABLE IF NOT EXISTS announcements (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      audience TEXT DEFAULT 'all' NOT NULL CHECK (audience IN ('all', 'students', 'parents', 'teachers', 'admins')),
      created_by TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      expires_at TEXT,
      status TEXT DEFAULT 'published' NOT NULL CHECK (status IN ('draft', 'published', 'archived'))
    );

    -- 27. API Keys
    CREATE TABLE IF NOT EXISTS api_keys (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      key_hash TEXT NOT NULL,
      status TEXT DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'revoked')),
      permissions TEXT NOT NULL,
      last_used_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    -- 28. User Activity Logs
    CREATE TABLE IF NOT EXISTS user_activities (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      action TEXT NOT NULL,
      details TEXT NOT NULL,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    -- 29. Platform Customizations
    CREATE TABLE IF NOT EXISTS platform_customizations (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  console.log('✅ SQLite schema tables created.');

  // Create Indexes
  sqlite.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_questions_subject ON questions(subject);
    CREATE INDEX IF NOT EXISTS idx_tests_subject ON tests(subject);
    CREATE INDEX IF NOT EXISTS idx_test_results_student ON test_results(student_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_student ON lesson_bookings(student_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_teacher ON lesson_bookings(teacher_id);
    CREATE INDEX IF NOT EXISTS idx_tx_user ON transactions(user_id);
    CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_activities_user ON user_activities(user_id);
    CREATE INDEX IF NOT EXISTS idx_lb_rank ON leaderboard_entries(rank);
  `);

  // -------------------------------------------------------------------------
  // 2. POPULATE PRODUCTION DATA IN HIGH-SPEED TRANSACTION
  // -------------------------------------------------------------------------
  console.log('📥 Populating real tables with initial production dataset...');
  sqlite.exec('BEGIN TRANSACTION;');

  // 1. Academic Registries
  const insReg = sqlite.prepare('INSERT OR IGNORE INTO academic_registries (type, value) VALUES (?, ?)');
  const defaultSubjects = ['Mathematics', 'Science', 'Geography', 'History', 'English', 'Computer Science', 'Physics', 'Biology'];
  const defaultGrades = ['Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];
  for (const s of defaultSubjects) insReg.run('subject', s);
  for (const g of defaultGrades) insReg.run('grade', g);

  // 2. Users
  const insUser = sqlite.prepare(`
    INSERT OR REPLACE INTO users (id, name, email, password_hash, role, grade_level, profile_image, status, created_at, subjects)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const users = base.users || [];
  for (const u of users) {
    insUser.run(
      u.id,
      u.name,
      u.email,
      u.passwordHash || '$2a$10$eO0B6U1KvZ8YpQeY695bOu0nF/Y1e9YxM4G.o5B19dZ/aT9Zz.a2u', // default hashed password
      u.role,
      u.gradeLevel || null,
      u.profileImage || null,
      u.status || 'active',
      u.createdAt || new Date().toISOString(),
      u.subjects ? JSON.stringify(u.subjects) : null
    );
  }

  // 3. Parent-Student Relationships
  const insRel = sqlite.prepare('INSERT OR IGNORE INTO user_relationships (parent_id, student_id) VALUES (?, ?)');
  const parents = users.filter((u: any) => u.role === 'parent');
  const students = users.filter((u: any) => u.role === 'student');
  const teachers = users.filter((u: any) => u.role === 'teacher');

  if (parents.length > 0 && students.length > 0) {
    for (let i = 0; i < Math.min(100, students.length * 2); i++) {
      const s = students[i % students.length];
      const p = parents[i % parents.length];
      insRel.run(p.id, s.id);
    }
  }

  // 4. Enrollments
  const insEnr = sqlite.prepare(`
    INSERT OR REPLACE INTO student_teacher_enrollments (student_id, teacher_id, subject, enrolled_at)
    VALUES (?, ?, ?, ?)
  `);
  const teacherId = teachers[0]?.id || 'teacher-001';
  for (let i = 0; i < Math.min(30, students.length); i++) {
    insEnr.run(students[i].id, teacherId, 'Mathematics', new Date().toISOString());
  }

  // 5. Units
  const insUnit = sqlite.prepare('INSERT OR REPLACE INTO units (id, subject, grade_level, name, description) VALUES (?, ?, ?, ?, ?)');
  for (const u of (base.units || [])) {
    insUnit.run(u.id, u.subject, u.gradeLevel || 4, u.name, u.description || '');
  }

  // 6. Lessons
  const insLesson = sqlite.prepare('INSERT OR REPLACE INTO lessons (id, unit_id, name, description, order_num) VALUES (?, ?, ?, ?, ?)');
  for (const l of (base.lessons || [])) {
    insLesson.run(l.id, l.unitId, l.name, l.description || '', l.orderNum || 1);
  }

  // 7. Lesson Materials
  const insMat = sqlite.prepare('INSERT OR REPLACE INTO lesson_materials (id, lesson_id, type, title, url, details) VALUES (?, ?, ?, ?, ?, ?)');
  for (const m of (base.lessonMaterials || [])) {
    insMat.run(m.id, m.lessonId, m.type || 'video', m.title, m.url || '', m.details || null);
  }

  // 8. Questions
  const insQ = sqlite.prepare(`
    INSERT OR REPLACE INTO questions (id, text, type, options, correct_answer, explanation, subject, grade_level, difficulty, weight)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const q of (base.questions || [])) {
    insQ.run(
      q.id,
      q.text,
      q.type,
      q.options ? (typeof q.options === 'string' ? q.options : JSON.stringify(q.options)) : null,
      String(q.correctAnswer ?? ''),
      q.explanation || '',
      q.subject,
      q.gradeLevel || 4,
      q.difficulty || 'medium',
      q.weight || 1.00
    );
  }

  // 9. Tests & 10. Sections & 11. Test Questions
  const insTest = sqlite.prepare(`
    INSERT OR REPLACE INTO tests (id, title, description, subject, grade_level, total_questions, duration, passing_score, difficulty, is_adaptive, is_placement_test, scheduled_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insSec = sqlite.prepare('INSERT OR REPLACE INTO test_sections (id, test_id, name, description, duration) VALUES (?, ?, ?, ?, ?)');
  const insTQ = sqlite.prepare('INSERT OR IGNORE INTO test_questions (test_id, question_id, section_id) VALUES (?, ?, ?)');

  for (const t of (base.tests || [])) {
    insTest.run(
      t.id,
      t.title,
      t.description,
      t.subject,
      t.gradeLevel || 4,
      t.totalQuestions || (t.questions ? t.questions.length : 10),
      t.duration || 30,
      t.passingScore || 70,
      t.difficulty || 'medium',
      t.isAdaptive ? 1 : 0,
      t.isPlacementTest ? 1 : 0,
      t.scheduledAt || null
    );

    if (t.isPlacementTest) {
      const secId = `sec-${t.id}-1`;
      insSec.run(secId, t.id, 'Section A: Diagnostics', 'Fundamental diagnostic assessment module.', 15);
    }

    if (Array.isArray(t.questions)) {
      for (const q of t.questions) {
        insTQ.run(t.id, q.id, t.isPlacementTest ? `sec-${t.id}-1` : null);
      }
    }
  }

  // 12. Test Results & 13. Recommendations
  const insRes = sqlite.prepare(`
    INSERT OR REPLACE INTO test_results (id, student_id, test_id, test_title, subject, score, total_score, percentage, time_taken, completed_at, answers, strengths, weaknesses, is_placement_test, flagged_questions)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insRec = sqlite.prepare(`
    INSERT OR IGNORE INTO placement_recommendations (test_result_id, subject, recommended_grade, confidence_score, strengths, areas_to_improve, suggested_next_steps)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const studentIds = new Set(students.map((s: any) => s.id));
  const testIds = new Set((base.tests || []).map((t: any) => t.id));

  for (const r of (base.testResults || [])) {
    const validStudentId = studentIds.has(r.studentId) ? r.studentId : (students[0]?.id || 'student-001');
    const validTestId = testIds.has(r.testId) ? r.testId : (base.tests[0]?.id || 'test-1');

    insRes.run(
      r.id,
      validStudentId,
      validTestId,
      r.testTitle || 'Diagnostic Test',
      r.subject || 'Mathematics',
      r.score || 0,
      r.totalScore || 100,
      r.percentage || 0,
      r.timeTaken || 1200,
      r.completedAt || new Date().toISOString(),
      typeof r.answers === 'string' ? r.answers : JSON.stringify(r.answers || {}),
      typeof r.strengths === 'string' ? r.strengths : JSON.stringify(r.strengths || []),
      typeof r.weaknesses === 'string' ? r.weaknesses : JSON.stringify(r.weaknesses || []),
      r.isPlacementTest ? 1 : 0,
      r.flaggedQuestions ? (typeof r.flaggedQuestions === 'string' ? r.flaggedQuestions : JSON.stringify(r.flaggedQuestions)) : null
    );

    if (r.placementRecommendation) {
      const rec = r.placementRecommendation;
      insRec.run(
        r.id,
        rec.subject || r.subject || 'Mathematics',
        rec.recommendedGrade || 7,
        rec.confidenceScore || 0.85,
        JSON.stringify(rec.strengths || []),
        JSON.stringify(rec.areasToImprove || []),
        JSON.stringify(rec.suggestedNextSteps || [])
      );
    }
  }

  // 14. Cheating Flags
  const insFlag = sqlite.prepare(`
    INSERT OR REPLACE INTO cheating_flags (id, student_name, test_name, date, confidence_score, flags, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const userMap = new Map(users.map((u: any) => [u.id, u.name]));
  const testMap = new Map((base.tests || []).map((t: any) => [t.id, t.title]));

  for (const f of (base.cheatingFlags || [])) {
    const studentName = f.studentName || userMap.get(f.studentId) || 'Student Reviewer';
    const testName = f.testName || testMap.get(f.testId) || 'Proctored Assessment';
    const reason = f.reasoning || 'Unusual test progression speed observed.';
    const flags = f.flags ? (typeof f.flags === 'string' ? f.flags : JSON.stringify(f.flags)) : JSON.stringify([reason]);
    insFlag.run(f.id, studentName, testName, f.flaggedAt || f.date || new Date().toISOString(), f.confidenceScore || 80, flags, f.status || 'pending');
  }

  // 15. Lesson Bookings
  const insBooking = sqlite.prepare(`
    INSERT OR REPLACE INTO lesson_bookings (id, student_id, student_name, teacher_id, teacher_name, teacher_avatar, subject, lesson_title, scheduled_date, scheduled_time, duration_minutes, status, amount_paid, payment_method, transaction_id, meeting_url, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (let i = 0; i < Math.min(15, students.length); i++) {
    const s = students[i];
    const t = teachers[i % teachers.length] || { id: 'teacher-001', name: 'Dr. Sarah Connor' };
    insBooking.run(
      `booking-${100 + i}`,
      s.id,
      s.name,
      t.id,
      t.name,
      'https://api.dicebear.com/7.x/avataaars/svg?seed=' + t.id,
      'Mathematics',
      'Advanced Algebraic Problem Solving',
      '2026-10-15',
      '10:30 AM',
      45,
      i === 0 ? 'live' : (i < 3 ? 'scheduled' : 'completed'),
      49.99,
      'card',
      `tx-${1000 + i}`,
      'https://meet.google.com/edupath-live-' + (100 + i),
      'Focusing on quadratic equations and graph factorization.'
    );
  }

  // 16. Transactions Ledger
  const insTx = sqlite.prepare(`
    INSERT OR REPLACE INTO transactions (id, user_id, user_name, booking_id, type, amount, currency, status, payment_method, card_last4, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (let i = 0; i < Math.min(25, students.length); i++) {
    const s = students[i];
    insTx.run(
      `tx-${1000 + i}`,
      s.id,
      s.name,
      i < 15 ? `booking-${100 + i}` : null,
      i % 3 === 0 ? 'monthly_pass' : 'lesson_single',
      i % 3 === 0 ? 129.00 : 49.99,
      'USD',
      'succeeded',
      'Visa / Stripe',
      '4242',
      i % 3 === 0 ? 'EduPath All-Access Monthly Pass' : 'Single 1-on-1 Tutoring Session'
    );
  }

  // 17. Student Passes
  const insPass = sqlite.prepare(`
    INSERT OR REPLACE INTO student_passes (id, student_id, plan_name, remaining_credits, total_credits, valid_until, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  for (let i = 0; i < Math.min(15, students.length); i++) {
    const s = students[i];
    insPass.run(
      `pass-${100 + i}`,
      s.id,
      'Premium Learner Monthly',
      4,
      8,
      '2026-11-30T23:59:59.000Z',
      'active'
    );
  }

  // 18. Achievements Catalog
  const insAch = sqlite.prepare('INSERT OR REPLACE INTO achievements (id, name, description, icon, rarity, points, criteria) VALUES (?, ?, ?, ?, ?, ?, ?)');
  const defaultAchievements = [
    { id: 'ach-first-test', name: 'First Milestone', desc: 'Completed your very first diagnostic exam.', icon: '🎯', rarity: 'common', pts: 20 },
    { id: 'ach-perfect-score', name: 'Flawless Century', desc: 'Achieved a perfect 100% on a placement assessment.', icon: '💯', rarity: 'legendary', pts: 100 },
    { id: 'ach-7-day-streak', name: 'Consistency Master', desc: 'Maintained a 7-day continuous learning streak.', icon: '🔥', rarity: 'rare', pts: 50 },
    { id: 'ach-math-expert', name: 'Math Prodigy', desc: 'Mastered 5 advanced mathematics units with >90% score.', icon: '📐', rarity: 'epic', pts: 75 },
    { id: 'ach-speed-demon', name: 'Rapid Learner', desc: 'Completed a 20-question test in under 10 minutes with >85% accuracy.', icon: '⚡', rarity: 'rare', pts: 40 }
  ];
  for (const a of defaultAchievements) {
    insAch.run(a.id, a.name, a.desc, a.icon, a.rarity, a.pts, JSON.stringify({ category: 'learning' }));
  }

  // 19. User Achievements
  const insUserAch = sqlite.prepare('INSERT OR IGNORE INTO user_achievements (student_id, achievement_id, unlocked_at) VALUES (?, ?, ?)');
  for (let i = 0; i < Math.min(20, students.length); i++) {
    const s = students[i];
    insUserAch.run(s.id, 'ach-first-test', new Date().toISOString());
    if (i % 2 === 0) insUserAch.run(s.id, 'ach-7-day-streak', new Date().toISOString());
  }

  // 20. Student Stats
  const insStats = sqlite.prepare(`
    INSERT OR REPLACE INTO student_stats (student_id, level, xp, total_xp, current_streak, longest_streak, last_test_date, total_tests_taken, average_score, subject_mastery)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (let i = 0; i < students.length; i++) {
    const s = students[i];
    insStats.run(
      s.id,
      Math.floor(i / 5) + 1,
      (i * 120) % 500,
      1200 + i * 150,
      (i % 12) + 1,
      Math.max((i % 12) + 1, 14),
      new Date().toISOString(),
      5 + (i % 15),
      78.5 + (i % 20),
      JSON.stringify({ Mathematics: 85, Science: 90, English: 80 })
    );
  }

  // 21. Leaderboard Records
  const insLb = sqlite.prepare(`
    INSERT INTO leaderboard_entries (season, student_id, rank, total_xp, average_score, tests_taken, streak)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  for (let i = 0; i < Math.min(25, students.length); i++) {
    const s = students[i];
    insLb.run('Season 2026-Fall', s.id, i + 1, 4500 - i * 120, 96.5 - i * 0.8, 25 - i, 15 - Math.floor(i / 2));
  }

  // 22. Notifications
  const insNotif = sqlite.prepare(`
    INSERT OR REPLACE INTO notifications (id, user_id, type, title, message, icon, read, action_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (let i = 0; i < Math.min(20, students.length); i++) {
    const s = students[i];
    insNotif.run(
      `notif-${100 + i}`,
      s.id,
      'test_available',
      'New Adaptive Diagnostic Ready',
      'Your teacher assigned a new Mathematics assessment.',
      'book',
      i % 2,
      '/tests'
    );
  }

  // 23. Learning Goals
  const insGoal = sqlite.prepare(`
    INSERT OR REPLACE INTO learning_goals (id, student_id, subject, target_percentage, current_percentage, deadline, achieved)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  for (let i = 0; i < Math.min(15, students.length); i++) {
    const s = students[i];
    insGoal.run(
      `goal-${100 + i}`,
      s.id,
      'Mathematics',
      90.0,
      82.5,
      '2026-11-15T00:00:00.000Z',
      0
    );
  }

  // 24. Content Versions
  const insVer = sqlite.prepare('INSERT OR REPLACE INTO content_versions (id, question_id, version, content, created_by, created_at, status) VALUES (?, ?, ?, ?, ?, ?, ?)');
  for (const v of (base.contentVersions || [])) {
    insVer.run(v.id, v.questionId, v.version || 1, v.content || '', v.createdBy || 'Curriculum Admin', v.createdAt || new Date().toISOString(), v.status || 'approved');
  }

  // 25. Flagged Content
  const insFlagContent = sqlite.prepare('INSERT OR REPLACE INTO flagged_content (id, content_id, content_type, reason, flagged_by, flagged_at, status, resolution) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  insFlagContent.run('flag-c-001', 'q-005', 'question', 'Ambiguous option choice in question text', 'teacher-001', new Date().toISOString(), 'reviewed', 'Updated explanation text');

  // 26. Announcements
  const insAnn = sqlite.prepare('INSERT OR REPLACE INTO announcements (id, title, content, audience, created_by, created_at, status) VALUES (?, ?, ?, ?, ?, ?, ?)');
  insAnn.run('ann-001', 'Welcome to EduPath 2026/2027 Academic Year!', 'We are thrilled to roll out our adaptive learning journey and live classroom hub.', 'all', 'admin-001', new Date().toISOString(), 'published');
  insAnn.run('ann-002', 'Placement Diagnostics Deadline', 'All students must complete their initial diagnostic assessments by Friday.', 'students', 'admin-001', new Date().toISOString(), 'published');

  // 27. API Keys
  const insKey = sqlite.prepare('INSERT OR REPLACE INTO api_keys (id, name, key_hash, status, permissions) VALUES (?, ?, ?, ?, ?)');
  insKey.run('key-001', 'Google Classroom Sync Integration', 'edupath_sk_live_9981827491749', 'active', JSON.stringify(['read:students', 'read:grades', 'write:enrollments']));

  // 28. User Activities
  const insAct = sqlite.prepare('INSERT OR REPLACE INTO user_activities (id, user_id, action, details, timestamp) VALUES (?, ?, ?, ?, ?)');
  for (const a of (base.userActivities || [])) {
    const validUserId = userMap.has(a.userId) ? a.userId : (users[0]?.id || 'student-001');
    insAct.run(a.id, validUserId, a.action || 'viewed_lesson', a.details || 'Interacted with curriculum module', a.timestamp || new Date().toISOString());
  }

  // 29. Platform Customizations
  const insCust = sqlite.prepare('INSERT OR REPLACE INTO platform_customizations (key, value) VALUES (?, ?)');
  const defaultCustomizations: Record<string, string> = {
    platformName: 'EduPath Enterprise Learning Platform',
    primaryColor: '#6366f1',
    accentColor: '#10b981',
    heroTitle: 'Transforming Education With Adaptive AI & Live Tutoring',
    heroSubtitle: 'Personalized curriculum diagnostics, 1-on-1 certified educator sessions, and intelligent mastery tracking.',
    contactEmail: 'support@edupath.org'
  };
  for (const [k, v] of Object.entries(defaultCustomizations)) {
    insCust.run(k, v);
  }

  sqlite.exec('COMMIT;');
  sqlite.exec('PRAGMA foreign_keys = ON;');

  // -------------------------------------------------------------------------
  // 3. VERIFY ALL 29 PRODUCTION TABLES
  // -------------------------------------------------------------------------
  console.log('\n📊 Enterprise Database Tables Verification:');
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

  const results: Record<string, number> = {};
  let totalRows = 0;
  for (const table of allTables) {
    const row = sqlite.prepare(`SELECT COUNT(*) as count FROM ${table}`).get() as any;
    results[table] = row.count;
    totalRows += row.count;
    console.log(`  ✓ ${table.padEnd(30)} : ${String(row.count).padStart(4, ' ')} records`);
  }
  console.log(`\n🎉 Total Rows in SQLite Relational Database: ${totalRows} across all ${allTables.length} tables.`);

  // Mirror SQLite DB to root workspace
  const mirrorPaths = [
    path.resolve(process.cwd(), 'edupath.db'),
    path.resolve(process.cwd(), '..', 'edupath.db')
  ];
  for (const mp of mirrorPaths) {
    try {
      fs.copyFileSync(primaryDbPath, mp);
      console.log(`  📋 Copied SQLite DB to: ${mp}`);
    } catch {}
  }

  // -------------------------------------------------------------------------
  // 4. CHECK & PROVISION POSTGRESQL TABLES (IF DATABASE_URL CONFIGURED)
  // -------------------------------------------------------------------------
  console.log('\n-----------------------------------------------------------------------------');
  console.log('🔌 Checking PostgreSQL Enterprise Connection...');
  const pgUrl = process.env.DATABASE_URL;

  if (pgUrl) {
    const pool = new pg.Pool({ connectionString: pgUrl, connectionTimeoutMillis: 2000 });
    let pgClient;
    try {
      pgClient = await pool.connect();
      console.log('✅ PostgreSQL connection established!');
      console.log('Running enterprise DDL transactions and migrations on PostgreSQL...');

      const schemaSqlPath = path.resolve(process.cwd(), 'server', 'db', 'schema.sql');
      if (fs.existsSync(schemaSqlPath)) {
        const ddl = fs.readFileSync(schemaSqlPath, 'utf8');
        await pgClient.query(ddl);
        console.log('✅ All 29 PostgreSQL schema tables created successfully!');
      }
    } catch (err: any) {
      console.log(`⚠️ PostgreSQL server is currently offline (${err.message}).`);
      console.log('   All 29 production tables are created, validated, and ready in SQLite (edupath.db).');
      console.log('   To deploy to PostgreSQL / Cloud, execute the generated edupath_export.sql file!');
    } finally {
      if (pgClient) pgClient.release();
      await pool.end();
    }
  }

  console.log('\n=============================================================================');
  console.log('✅ Production Database Ready For Deployment!');
  console.log('=============================================================================');

  return { success: true, tableCount: allTables.length, totalRows, results };
}

// Allow direct execution
if (process.argv[1] && process.argv[1].endsWith('create-real-tables.ts')) {
  createRealTables().catch(err => {
    console.error('Fatal error provisioning tables:', err);
    process.exit(1);
  });
}
