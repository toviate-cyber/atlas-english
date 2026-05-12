import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uxpqtlppygdheimjtmkl.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4cHF0bHBweWdkaGVpbWp0bWtsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ5MjI1NiwiZXhwIjoyMDkzMDY4MjU2fQ._KzGP3AF_1zuoRV3gCDjRzrLyEC32tp16QZLinwgIS8';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    // Get teacher from DB
    const { data: teacher, error: fetchError } = await supabase
      .from('teachers')
      .select('id, email, nombre, password_hash')
      .eq('email', email)
      .single();

    if (fetchError || !teacher) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    // Hardcoded check for MVP (later: use bcrypt)
    if (password !== '123456') {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Return teacher info (without password)
    return res.status(200).json({
      success: true,
      teacher: {
        id: teacher.id,
        email: teacher.email,
        nombre: teacher.nombre
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
