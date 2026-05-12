import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { session_id } = req.query;

  if (!session_id) {
    return res.status(400).json({ error: 'session_id required' });
  }

  if (req.method === 'GET') {
    try {
      const { data: comments, error } = await supabase
        .from('comments')
        .select('id, user_id, user_type, user_name, text, created_at')
        .eq('session_id', session_id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return res.status(200).json({ comments: comments || [] });
    } catch (error) {
      console.error('Error fetching comments:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  if (req.method === 'POST') {
    const { user_id, user_type, user_name, text } = req.body;

    if (!user_id || !user_type || !user_name || !text) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      const { data: comment, error } = await supabase
        .from('comments')
        .insert({
          session_id,
          user_id,
          user_type,
          user_name,
          text
        })
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json({ comment });
    } catch (error) {
      console.error('Error creating comment:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
