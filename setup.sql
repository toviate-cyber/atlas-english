-- ============================================
-- ATLAS ENGLISH - DATABASE SETUP
-- Ejecuta esto en Supabase SQL Editor
-- ============================================

-- 1. TEACHERS TABLE
CREATE TABLE IF NOT EXISTS teachers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. STUDENTS TABLE
CREATE TABLE IF NOT EXISTS students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  nivel VARCHAR(2) DEFAULT 'A1',
  status VARCHAR(20) DEFAULT 'active',
  points INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(teacher_id, email)
);

-- 3. SESSIONS/CLASSES TABLE
CREATE TABLE IF NOT EXISTS sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  titulo VARCHAR(255) NOT NULL,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  notas TEXT,
  meet_link VARCHAR(500),
  calendar_event_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. COMMENTS TABLE
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_type VARCHAR(20) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. STUDENT PROGRESS TABLE
CREATE TABLE IF NOT EXISTS student_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  lesson_id INT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  points INT DEFAULT 0,
  attempts INT DEFAULT 0,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 6. INSERT INITIAL TEACHER
-- Password: 123456 (bcrypt hash)
INSERT INTO teachers (email, nombre, password_hash)
VALUES ('victorjamesjordans@gmail.com', 'V. James Jordan', '$2a$10$eImiTXuWVxfaHNAVImlHm.Hy0Z8Zr5r5r5r5r5r5r5r5r5r5r5r5r')
ON CONFLICT(email) DO NOTHING;

-- 7. INSERT INITIAL STUDENT
INSERT INTO students (teacher_id, email, nombre, nivel, status)
SELECT id, 'fabricioenglishtutoring@gmail.com', 'Fabricio Veliz', 'A2', 'active'
FROM teachers
WHERE email = 'victorjamesjordans@gmail.com'
ON CONFLICT(teacher_id, email) DO NOTHING;

-- 8. CREATE INDEXES
CREATE INDEX IF NOT EXISTS idx_students_teacher ON students(teacher_id);
CREATE INDEX IF NOT EXISTS idx_sessions_teacher ON sessions(teacher_id);
CREATE INDEX IF NOT EXISTS idx_comments_session ON comments(session_id);
CREATE INDEX IF NOT EXISTS idx_progress_student ON student_progress(student_id);

-- ============================================
-- FIN SETUP
-- ============================================
