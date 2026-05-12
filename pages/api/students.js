import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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
