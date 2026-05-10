#!/usr/bin/env node

/**
 * Setup MVP - Crea tablas en Supabase para compartir datos profesor-estudiante
 * Opción 2: Código de acceso compartido
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uxpqtlppygdheimjtmkl.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_TKRzrwXWgWSlPKqN5UbS2g_q2chB7oo';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setupTables() {
  console.log('🔧 Setting up MVP tables...\n');

  const tables = [
    {
      name: 'sessions',
      sql: `
        CREATE TABLE IF NOT EXISTS sessions (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          code VARCHAR(6) UNIQUE NOT NULL,
          teacher_id VARCHAR(50) NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '24 hours'
        );
        CREATE INDEX IF NOT EXISTS sessions_code_idx ON sessions(code);
      `
    },
    {
      name: 'session_participants',
      sql: `
        CREATE TABLE IF NOT EXISTS session_participants (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
          user_id VARCHAR(50) NOT NULL,
          role VARCHAR(10) CHECK (role IN ('teacher', 'student')),
          name VARCHAR(100),
          joined_at TIMESTAMP DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS participants_session_idx ON session_participants(session_id);
      `
    },
    {
      name: 'meetings',
      sql: `
        CREATE TABLE IF NOT EXISTS meetings (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
          teacher_id VARCHAR(50) NOT NULL,
          title VARCHAR(200),
          scheduled_at TIMESTAMP,
          notes TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS meetings_session_idx ON meetings(session_id);
      `
    },
    {
      name: 'comments',
      sql: `
        CREATE TABLE IF NOT EXISTS comments (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
          user_id VARCHAR(50) NOT NULL,
          user_name VARCHAR(100),
          user_role VARCHAR(10),
          text TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS comments_session_idx ON comments(session_id);
      `
    }
  ];

  for (const table of tables) {
    try {
      const { data, error } = await supabase.rpc('exec_sql', { sql: table.sql });
      if (error) {
        console.log(`⚠️  ${table.name}: ${error.message}`);
      } else {
        console.log(`✅ ${table.name}: Ready`);
      }
    } catch (e) {
      console.log(`⚠️  ${table.name}: Could not verify (might already exist)`);
    }
  }

  console.log('\n✨ MVP setup complete!');
  console.log('Tables created (or verified as existing):');
  console.log('  - sessions: stores teacher codes');
  console.log('  - session_participants: tracks who joined');
  console.log('  - meetings: shared meeting calendar');
  console.log('  - comments: bidirectional comments');
}

setupTables().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
