-- =============================================================================
-- EduPath Enterprise Production Database Schema (PostgreSQL 14+)
-- Complete relational architecture with full constraints, cascading keys,
-- indexes, JSONB payloads, and audit trails.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0. CLEANUP (Reverse Dependency Drop)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS platform_customizations CASCADE;
DROP TABLE IF EXISTS user_activities CASCADE;
DROP TABLE IF EXISTS api_keys CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS flagged_content CASCADE;
DROP TABLE IF EXISTS content_versions CASCADE;
DROP TABLE IF EXISTS learning_goals CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS leaderboard_entries CASCADE;
DROP TABLE IF EXISTS student_stats CASCADE;
DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS student_passes CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS lesson_bookings CASCADE;
DROP TABLE IF EXISTS student_teacher_enrollments CASCADE;
DROP TABLE IF EXISTS cheating_flags CASCADE;
DROP TABLE IF EXISTS placement_recommendations CASCADE;
DROP TABLE IF EXISTS test_results CASCADE;
DROP TABLE IF EXISTS test_questions CASCADE;
DROP TABLE IF EXISTS test_sections CASCADE;
DROP TABLE IF EXISTS tests CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS lesson_materials CASCADE;
DROP TABLE IF EXISTS lessons CASCADE;
DROP TABLE IF EXISTS units CASCADE;
DROP TABLE IF EXISTS user_relationships CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS academic_registries CASCADE;

-- -----------------------------------------------------------------------------
-- 1. ACADEMIC & USER IDENTITY DOMAIN
-- -----------------------------------------------------------------------------

-- Academic Registries (Supported Subjects & Grades)
CREATE TABLE IF NOT EXISTS academic_registries (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL CHECK (type IN ('subject', 'grade')),
    value VARCHAR(255) UNIQUE NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ar_type ON academic_registries(type);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'parent', 'admin', 'teacher')),
    grade_level INT,
    profile_image TEXT,
    status VARCHAR(20) DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    subjects JSONB
);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_grade ON users(grade_level);

-- Parent-Student Relationships
CREATE TABLE IF NOT EXISTS user_relationships (
    parent_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
    student_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (parent_id, student_id)
);
CREATE INDEX IF NOT EXISTS idx_ur_parent ON user_relationships(parent_id);
CREATE INDEX IF NOT EXISTS idx_ur_student ON user_relationships(student_id);

-- Student Teacher Class Enrollments
CREATE TABLE IF NOT EXISTS student_teacher_enrollments (
    student_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
    teacher_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(255) NOT NULL,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (student_id, teacher_id, subject)
);
CREATE INDEX IF NOT EXISTS idx_ste_student ON student_teacher_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_ste_teacher ON student_teacher_enrollments(teacher_id);

-- -----------------------------------------------------------------------------
-- 2. CURRICULUM & LESSONS DOMAIN
-- -----------------------------------------------------------------------------

-- Units Table
CREATE TABLE IF NOT EXISTS units (
    id VARCHAR(50) PRIMARY KEY,
    subject VARCHAR(100) NOT NULL,
    grade_level INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_units_subject ON units(subject);
CREATE INDEX IF NOT EXISTS idx_units_grade ON units(grade_level);

-- Lessons Table
CREATE TABLE IF NOT EXISTS lessons (
    id VARCHAR(50) PRIMARY KEY,
    unit_id VARCHAR(50) REFERENCES units(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    order_num INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_lessons_unit ON lessons(unit_id);

-- Lesson Materials (Videos, Documents, PDFs)
CREATE TABLE IF NOT EXISTS lesson_materials (
    id VARCHAR(50) PRIMARY KEY,
    lesson_id VARCHAR(50) REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('video', 'document', 'quiz', 'link')),
    title VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_materials_lesson ON lesson_materials(lesson_id);

-- -----------------------------------------------------------------------------
-- 3. ASSESSMENT & QUESTION BANK DOMAIN
-- -----------------------------------------------------------------------------

-- Questions Table
CREATE TABLE IF NOT EXISTS questions (
    id VARCHAR(50) PRIMARY KEY,
    text TEXT NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('mcq', 'trueFalse', 'openEnded')),
    options JSONB,
    correct_answer TEXT NOT NULL,
    explanation TEXT NOT NULL,
    subject VARCHAR(100) NOT NULL,
    grade_level INT NOT NULL,
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    weight NUMERIC(4,2) DEFAULT 1.00 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_questions_subject_grade ON questions(subject, grade_level);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);

-- Tests Table
CREATE TABLE IF NOT EXISTS tests (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    subject VARCHAR(100) NOT NULL,
    grade_level INT NOT NULL,
    total_questions INT NOT NULL,
    duration INT NOT NULL, -- in minutes
    passing_score INT NOT NULL,
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    is_adaptive BOOLEAN DEFAULT FALSE NOT NULL,
    is_placement_test BOOLEAN DEFAULT FALSE NOT NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_tests_subject ON tests(subject);
CREATE INDEX IF NOT EXISTS idx_tests_placement ON tests(is_placement_test);

-- Test Sections Table
CREATE TABLE IF NOT EXISTS test_sections (
    id VARCHAR(50) PRIMARY KEY,
    test_id VARCHAR(50) REFERENCES tests(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    duration INT -- in minutes, optional
);
CREATE INDEX IF NOT EXISTS idx_test_sections_test ON test_sections(test_id);

-- Test Questions Junction Table
CREATE TABLE IF NOT EXISTS test_questions (
    test_id VARCHAR(50) REFERENCES tests(id) ON DELETE CASCADE NOT NULL,
    question_id VARCHAR(50) REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
    section_id VARCHAR(50) REFERENCES test_sections(id) ON DELETE SET NULL,
    PRIMARY KEY (test_id, question_id)
);

-- Test Results Table
CREATE TABLE IF NOT EXISTS test_results (
    id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    test_id VARCHAR(50) REFERENCES tests(id) ON DELETE CASCADE NOT NULL,
    test_title VARCHAR(255) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    score NUMERIC(6,2) NOT NULL,
    total_score NUMERIC(6,2) NOT NULL,
    percentage NUMERIC(6,2) NOT NULL,
    time_taken INT NOT NULL, -- in seconds
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    answers JSONB NOT NULL,
    strengths JSONB NOT NULL,
    weaknesses JSONB NOT NULL,
    is_placement_test BOOLEAN DEFAULT FALSE NOT NULL,
    flagged_questions JSONB
);
CREATE INDEX IF NOT EXISTS idx_test_results_student ON test_results(student_id);
CREATE INDEX IF NOT EXISTS idx_test_results_test ON test_results(test_id);
CREATE INDEX IF NOT EXISTS idx_test_results_completed ON test_results(completed_at DESC);

-- Placement Recommendations Table
CREATE TABLE IF NOT EXISTS placement_recommendations (
    id SERIAL PRIMARY KEY,
    test_result_id VARCHAR(50) REFERENCES test_results(id) ON DELETE CASCADE NOT NULL,
    subject VARCHAR(100) NOT NULL,
    recommended_grade INT NOT NULL,
    confidence_score NUMERIC(4,2) NOT NULL,
    strengths JSONB NOT NULL,
    areas_to_improve JSONB NOT NULL,
    suggested_next_steps JSONB NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_pr_result ON placement_recommendations(test_result_id);

-- Cheating & Academic Integrity Flags
CREATE TABLE IF NOT EXISTS cheating_flags (
    id VARCHAR(50) PRIMARY KEY,
    student_name VARCHAR(255) NOT NULL,
    test_name VARCHAR(255) NOT NULL,
    date VARCHAR(50) NOT NULL,
    confidence_score INT NOT NULL,
    flags JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'reviewed', 'cleared', 'confirmed', 'dismissed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_cf_status ON cheating_flags(status);

-- -----------------------------------------------------------------------------
-- 4. TUTORING, BOOKINGS & FINANCIAL TRANSACTIONS
-- -----------------------------------------------------------------------------

-- Lesson Bookings (1-on-1 Tutoring & Classroom Sessions)
CREATE TABLE IF NOT EXISTS lesson_bookings (
    id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    teacher_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    teacher_name VARCHAR(255) NOT NULL,
    teacher_avatar TEXT,
    subject VARCHAR(100) NOT NULL,
    lesson_title VARCHAR(255) NOT NULL,
    scheduled_date VARCHAR(50) NOT NULL,
    scheduled_time VARCHAR(50) NOT NULL,
    duration_minutes INT DEFAULT 45 NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled' NOT NULL CHECK (status IN ('scheduled', 'live', 'completed', 'cancelled')),
    amount_paid NUMERIC(8,2) DEFAULT 0.00 NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'card' NOT NULL,
    transaction_id VARCHAR(100),
    meeting_url TEXT,
    curriculum_lesson_id VARCHAR(50),
    checkpoint_test_id VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_bookings_student ON lesson_bookings(student_id);
CREATE INDEX IF NOT EXISTS idx_bookings_teacher ON lesson_bookings(teacher_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON lesson_bookings(status);

-- Financial Transactions Ledger
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    booking_id VARCHAR(50) REFERENCES lesson_bookings(id) ON DELETE SET NULL,
    type VARCHAR(30) NOT NULL CHECK (type IN ('lesson_single', 'monthly_pass', 'annual_pass', 'refund')),
    amount NUMERIC(8,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD' NOT NULL,
    status VARCHAR(20) DEFAULT 'succeeded' NOT NULL CHECK (status IN ('succeeded', 'pending', 'refunded', 'failed')),
    payment_method VARCHAR(50) NOT NULL,
    card_last4 VARCHAR(10),
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_tx_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_tx_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_tx_created ON transactions(created_at DESC);

-- Student Passes (Subscriptions & Prepaid Lesson Credits)
CREATE TABLE IF NOT EXISTS student_passes (
    id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    plan_name VARCHAR(100) NOT NULL,
    remaining_credits INT DEFAULT 0 NOT NULL,
    total_credits INT DEFAULT 0 NOT NULL,
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'expired', 'exhausted')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sp_student ON student_passes(student_id);

-- -----------------------------------------------------------------------------
-- 5. GAMIFICATION, ENGAGEMENT & PROGRESS TRACKING
-- -----------------------------------------------------------------------------

-- Achievements Master Catalog
CREATE TABLE IF NOT EXISTS achievements (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(100) NOT NULL,
    rarity VARCHAR(20) DEFAULT 'common' NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    points INT DEFAULT 10 NOT NULL,
    criteria JSONB
);

-- User Achievements (Earned Badges)
CREATE TABLE IF NOT EXISTS user_achievements (
    student_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    achievement_id VARCHAR(50) REFERENCES achievements(id) ON DELETE CASCADE NOT NULL,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (student_id, achievement_id)
);
CREATE INDEX IF NOT EXISTS idx_ua_student ON user_achievements(student_id);

-- Student Stats & XP Engine
CREATE TABLE IF NOT EXISTS student_stats (
    student_id VARCHAR(50) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    level INT DEFAULT 1 NOT NULL,
    xp INT DEFAULT 0 NOT NULL,
    total_xp INT DEFAULT 0 NOT NULL,
    current_streak INT DEFAULT 0 NOT NULL,
    longest_streak INT DEFAULT 0 NOT NULL,
    last_test_date TIMESTAMP WITH TIME ZONE,
    total_tests_taken INT DEFAULT 0 NOT NULL,
    average_score NUMERIC(5,2) DEFAULT 0.00 NOT NULL,
    subject_mastery JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Leaderboard Records
CREATE TABLE IF NOT EXISTS leaderboard_entries (
    id SERIAL PRIMARY KEY,
    season VARCHAR(50) DEFAULT 'current' NOT NULL,
    student_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    rank INT NOT NULL,
    total_xp INT DEFAULT 0 NOT NULL,
    average_score NUMERIC(5,2) DEFAULT 0.00 NOT NULL,
    tests_taken INT DEFAULT 0 NOT NULL,
    streak INT DEFAULT 0 NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_lb_season_rank ON leaderboard_entries(season, rank);

-- Notifications Inbox
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    type VARCHAR(30) NOT NULL CHECK (type IN ('test_available', 'result_ready', 'achievement', 'streak_reminder', 'booking_confirmed', 'system')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    icon VARCHAR(100),
    read BOOLEAN DEFAULT FALSE NOT NULL,
    action_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notif_read ON notifications(read);

-- Learning Goals
CREATE TABLE IF NOT EXISTS learning_goals (
    id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    subject VARCHAR(100) NOT NULL,
    target_percentage NUMERIC(5,2) NOT NULL,
    current_percentage NUMERIC(5,2) DEFAULT 0.00 NOT NULL,
    deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    achieved BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_lg_student ON learning_goals(student_id);

-- -----------------------------------------------------------------------------
-- 6. AUDIT, MODERATION & ENTERPRISE SYSTEM
-- -----------------------------------------------------------------------------

-- Content Version Revisions
CREATE TABLE IF NOT EXISTS content_versions (
    id VARCHAR(50) PRIMARY KEY,
    question_id VARCHAR(50) NOT NULL,
    version INT NOT NULL,
    content TEXT NOT NULL,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'approved' NOT NULL CHECK (status IN ('draft', 'approved', 'retired'))
);
CREATE INDEX IF NOT EXISTS idx_cv_question ON content_versions(question_id);

-- Flagged Content & Moderation Review Queue
CREATE TABLE IF NOT EXISTS flagged_content (
    id VARCHAR(50) PRIMARY KEY,
    content_id VARCHAR(50) NOT NULL,
    content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('question', 'test', 'user', 'review')),
    reason TEXT NOT NULL,
    flagged_by VARCHAR(50) NOT NULL,
    flagged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    resolution TEXT
);
CREATE INDEX IF NOT EXISTS idx_fc_status ON flagged_content(status);

-- Announcements Table
CREATE TABLE IF NOT EXISTS announcements (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    audience VARCHAR(20) DEFAULT 'all' NOT NULL CHECK (audience IN ('all', 'students', 'parents', 'teachers', 'admins')),
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'published' NOT NULL CHECK (status IN ('draft', 'published', 'archived'))
);
CREATE INDEX IF NOT EXISTS idx_ann_audience ON announcements(audience);

-- API Keys Table (Third-Party LMS & API Integrations)
CREATE TABLE IF NOT EXISTS api_keys (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'revoked')),
    permissions JSONB NOT NULL,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- User Activity & Audit Logs
CREATE TABLE IF NOT EXISTS user_activities (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_activities_user ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_time ON user_activities(timestamp DESC);

-- Platform Customizations (Branding, Logos, Custom Theme Copy)
CREATE TABLE IF NOT EXISTS platform_customizations (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL
);

-- =============================================================================
-- End of EduPath Enterprise Production Schema
-- =============================================================================
