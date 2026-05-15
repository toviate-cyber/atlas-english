import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uxpqtlppygdheimjtmkl.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4cHF0bHBweWdkaGVpbWp0bWtsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ5MjI1NiwiZXhwIjoyMDkzMDY4MjU2fQ._KzGP3AF_1zuoRV3gCDjRzrLyEC32tp16QZLinwgIS8';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { student_id, nivel } = req.body;

  if (!student_id || !nivel) {
    return res.status(400).json({ error: 'student_id and nivel required' });
  }

  try {
    const { data, error } = await supabase
      .from('students')
      .update({ nivel })
      .eq('id', student_id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({ student: data });
  } catch (error) {
    console.error('Error updating level:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
