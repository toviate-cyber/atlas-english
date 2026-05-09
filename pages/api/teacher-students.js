export default async function handler(req, res) {
  try {
    const supabaseUrl = 'https://uxpqtlppygdheimjtmkl.supabase.co'
    const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4cHF0bHBweWdkaGVpbWp0bWtsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ5MjI1NiwiZXhwIjoyMDkzMDY4MjU2fQ._KzGP3AF_1zuoRV3gCDjRzrLyEC32tp16QZLinwgIS8'
    
    const response = await fetch(`${supabaseUrl}/rest/v1/students?order=created_at.desc`, {
      method: 'GET',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json'
      }
    })
    
    const students = await response.json()
    
    if (!response.ok) {
      return res.status(response.status).json({ error: students.message || 'Error fetching students' })
    }
    
    res.status(200).json(students)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
