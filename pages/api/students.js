import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uxpqtlppygdheimjtmkl.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4cHF0bHBweWdkaGVpbWp0bWtsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ5MjI1NiwiZXhwIjoyMDkzMDY4MjU2fQ._KzGP3AF_1zuoRV3gCDjRzrLyEC32tp16QZLinwgIS8';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default async function handler(req, res) {
  const { teacher_id } = req.query;

  if (!teacher_id) {
    return res.status(400).json({ error: 'teacher_id required' });
  }

  if (req.method === 'GET') {
    try {
      const { data: students, error } = await supabase
        .from('students')
        .select('id, nombre, email, nivel, status, points, created_at')
        .eq('teacher_id', teacher_id)
        .eq('status', 'active');

      if (error) throw error;

      return res.status(200).json({ students: students || [] });
    } catch (error) {
      console.error('Error fetching students:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  if (req.method === 'POST') {
    const { nombre, email, nivel } = req.body;

    try {
      const { data: student, error } = await supabase
        .from('students')
        .insert({
          teacher_id,
          nombre,
          email,
          nivel: nivel || 'A1',
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json({ student });
    } catch (error) {
      console.error('Error creating student:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
