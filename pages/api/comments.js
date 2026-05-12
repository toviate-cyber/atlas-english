import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uxpqtlppygdheimjtmkl.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4cHF0bHBweWdkaGVpbWp0bWtsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ5MjI1NiwiZXhwIjoyMDkzMDY4MjU2fQ._KzGP3AF_1zuoRV3gCDjRzrLyEC32tp16QZLinwgIS8';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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
