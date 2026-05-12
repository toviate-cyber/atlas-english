import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { student_id } = req.query;

  if (!student_id) {
    return res.status(400).json({ error: 'student_id required' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get student's teacher_id first
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('teacher_id')
      .eq('id', student_id)
      .single();

    if (studentError || !student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Get all sessions for this teacher
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('id, titulo, fecha, hora, notas, meet_link, created_at')
      .eq('teacher_id', student.teacher_id)
      .order('fecha', { ascending: false });

    if (sessionsError) throw sessionsError;

    return res.status(200).json({ sessions: sessions || [] });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
