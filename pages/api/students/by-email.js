import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uxpqtlppygdheimjtmkl.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4cHF0bHBweWdkaGVpbWp0bWtsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ5MjI1NiwiZXhwIjoyMDkzMDY4MjU2fQ._KzGP3AF_1zuoRV3gCDjRzrLyEC32tp16QZLinwgIS8';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default async function handler(req, res) {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: 'email required' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data: student, error } = await supabase
      .from('students')
      .select('id, nombre, email, nivel, status, points, teacher_id')
      .eq('email', email)
      .eq('status', 'active')
      .single();

    if (error || !student) {
      return res.status(401).json({ error: 'Student not found' });
    }

    return res.status(200).json({ student });
  } catch (error) {
    console.error('Error fetching student:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
