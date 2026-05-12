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

  if (req.method === 'GET') {
    try {
      const { data: progress, error } = await supabase
        .from('student_progress')
        .select('id, lesson_id, completed, points, attempts, completed_at')
        .eq('student_id', student_id)
        .order('lesson_id', { ascending: true });

      if (error) throw error;

      return res.status(200).json({ progress: progress || [] });
    } catch (error) {
      console.error('Error fetching progress:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  if (req.method === 'POST') {
    const { lesson_id, completed, points, attempts } = req.body;

    if (lesson_id === undefined) {
      return res.status(400).json({ error: 'lesson_id required' });
    }

    try {
      // Check if already exists
      const { data: existing } = await supabase
        .from('student_progress')
        .select('id')
        .eq('student_id', student_id)
        .eq('lesson_id', lesson_id)
        .single();

      let result;
      if (existing) {
        // Update
        result = await supabase
          .from('student_progress')
          .update({
            completed: completed || false,
            points: points || 0,
            attempts: (attempts || 0) + 1,
            completed_at: completed ? new Date().toISOString() : null
          })
          .eq('id', existing.id)
          .select()
          .single();
      } else {
        // Insert
        result = await supabase
          .from('student_progress')
          .insert({
            student_id,
            lesson_id,
            completed: completed || false,
            points: points || 0,
            attempts: attempts || 1,
            completed_at: completed ? new Date().toISOString() : null
          })
          .select()
          .single();
      }

      if (result.error) throw result.error;

      return res.status(201).json({ progress: result.data });
    } catch (error) {
      console.error('Error saving progress:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
