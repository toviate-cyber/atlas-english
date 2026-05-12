import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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
