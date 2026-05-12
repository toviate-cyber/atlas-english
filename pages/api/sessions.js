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
    const { titulo, fecha, hora, notas, meet_link } = req.body;

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

      return res.status(201).json({ session });
    } catch (error) {
      console.error('Error creating session:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
