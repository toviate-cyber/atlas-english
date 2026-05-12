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
      const { data: sessions, error } = await supabase
        .from('sessions')
        .select('id, titulo, fecha, hora, notas, meet_link, created_at')
        .eq('teacher_id', teacher_id)
        .order('fecha', { ascending: false });

      if (error) throw error;

      return res.status(200).json({ sessions: sessions || [] });
    } catch (error) {
      console.error('Error fetching sessions:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  if (req.method === 'POST') {
    const { titulo, fecha, hora, notas, meet_link, student_ids } = req.body;

    if (!titulo || !fecha || !hora) {
      return res.status(400).json({ error: 'titulo, fecha, hora required' });
    }

    try {
      const { data: session, error } = await supabase
        .from('sessions')
        .insert({
          teacher_id,
          titulo,
          fecha,
          hora,
          notas: notas || '',
          meet_link: meet_link || ''
        })
        .select()
        .single();

      if (error) throw error;

      if (student_ids && student_ids.length > 0) {
        const ss = student_ids.map(id => ({ session_id: session.id, student_id: id }));
        await supabase.from('session_students').insert(ss);
      }
      return res.status(201).json({ session });
    } catch (error) {
      console.error('Error creating session:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
