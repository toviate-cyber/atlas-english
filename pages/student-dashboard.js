import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function StudentDashboard() {
  const router = useRouter();
  const [student, setStudent] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const savedStudent = localStorage.getItem('student');
    if (!savedStudent) {
      router.push('/student-login');
      return;
    }

    const studentData = JSON.parse(savedStudent);
    setStudent(studentData);
    fetchData(studentData.id);

    // Refresh every 10 seconds
    const interval = setInterval(() => {
      fetchData(studentData.id);
    }, 10000);

    return () => clearInterval(interval);
  }, [router]);

  const fetchData = async (studentId) => {
    try {
      // Fetch sessions for this student's teacher
      const sessionsRes = await fetch(`/api/sessions/for-student?student_id=${studentId}`);
      const sessionsData = await sessionsRes.json();
      setSessions(sessionsData.sessions || []);

      // Fetch progress
      const progressRes = await fetch(`/api/progress?student_id=${studentId}`);
      const progressData = await progressRes.json();
      setProgress(progressData.progress || []);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('student');
    router.push('/student-login');
  };

  if (!student) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;
  }

  const passedLessons = progress.filter(p => p.completed).length;
  const totalPoints = progress.reduce((sum, p) => sum + (p.points || 0), 0);

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif' }}>
      <header style={{
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', background: 'linear-gradient(135deg, #1e40af, #0369a1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>⚡ Atlas English</h1>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Student Dashboard</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: '#1f2937', fontWeight: '600' }}>📚 {student.nombre}</span>
          <button onClick={handleLogout} style={{
            padding: '8px 16px',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}>
            Sign Out
          </button>
        </div>
      </header>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        {/* TABS */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '2px solid #e5e7eb', paddingBottom: '15px' }}>
          <button
            onClick={() => setActiveTab('dashboard')}
            style={{
              padding: '10px 20px',
              background: activeTab === 'dashboard' ? '#eff6ff' : 'transparent',
              border: 'none',
              color: activeTab === 'dashboard' ? '#0ea5e9' : '#6b7280',
              cursor: 'pointer',
              fontWeight: '600',
              borderBottom: activeTab === 'dashboard' ? '3px solid #0ea5e9' : 'none'
            }}
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => setActiveTab('lessons')}
            style={{
              padding: '10px 20px',
              background: activeTab === 'lessons' ? '#eff6ff' : 'transparent',
              border: 'none',
              color: activeTab === 'lessons' ? '#0ea5e9' : '#6b7280',
              cursor: 'pointer',
              fontWeight: '600',
              borderBottom: activeTab === 'lessons' ? '3px solid #0ea5e9' : 'none'
            }}
          >
            📚 Lessons
          </button>
          <button
            onClick={() => setActiveTab('meetings')}
            style={{
              padding: '10px 20px',
              background: activeTab === 'meetings' ? '#eff6ff' : 'transparent',
              border: 'none',
              color: activeTab === 'meetings' ? '#0ea5e9' : '#6b7280',
              cursor: 'pointer',
              fontWeight: '600',
              borderBottom: activeTab === 'meetings' ? '3px solid #0ea5e9' : 'none'
            }}
          >
            📅 Meetings
          </button>
        </div>

        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ color: '#1f2937', marginBottom: '20px' }}>Your Progress</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              <div style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: '800', color: '#1e40af' }}>{student.nivel}</div>
                <div style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px' }}>English Level</div>
              </div>
              <div style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: '800', color: '#1e40af' }}>{totalPoints}</div>
                <div style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px' }}>Total Points</div>
              </div>
              <div style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: '800', color: '#10b981' }}>{passedLessons}</div>
                <div style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px' }}>Lessons Passed</div>
              </div>
            </div>

            <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '20px' }}>
              <h3 style={{ color: '#1f2937', marginTop: 0 }}>Status</h3>
              <p style={{ color: '#6b7280', margin: 0 }}>Email: <strong>{student.email}</strong></p>
              <p style={{ color: '#6b7280', margin: '8px 0 0 0' }}>Account Status: <strong style={{ color: '#10b981' }}>{student.status}</strong></p>
            </div>
          </div>
        )}

        {/* LESSONS TAB */}
        {activeTab === 'lessons' && (
          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ color: '#1f2937', marginBottom: '20px' }}>Your Lessons</h2>
            
            {progress.length === 0 ? (
              <p style={{ color: '#9ca3af', textAlign: 'center', padding: '40px 20px' }}>No lessons yet. Start with the placement test!</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px' }}>
                {progress.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      background: p.completed ? '#f0fdf4' : '#eff6ff',
                      border: p.completed ? '2px solid #10b981' : '2px solid #0ea5e9',
                      borderRadius: '10px',
                      padding: '16px',
                      textAlign: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontSize: '24px', fontWeight: '800', color: p.completed ? '#10b981' : '#0ea5e9' }}>
                      {p.lesson_id}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>
                      {p.completed ? '✅ Passed' : '📖 In Progress'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#1f2937', marginTop: '8px', fontWeight: '600' }}>
                      {p.points} pts
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MEETINGS TAB */}
        {activeTab === 'meetings' && (
          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ color: '#1f2937', marginBottom: '20px' }}>Your Meetings</h2>
            
            {loading ? (
              <p>Loading...</p>
            ) : sessions.length === 0 ? (
              <p style={{ color: '#9ca3af', textAlign: 'center', padding: '40px 20px' }}>No meetings scheduled yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    style={{
                      background: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '10px',
                      padding: '20px'
                    }}
                  >
                    <h3 style={{ color: '#1f2937', margin: '0 0 12px 0' }}>{session.titulo}</h3>
                    <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 8px 0' }}>
                      📅 {session.fecha} at {session.hora}
                    </p>
                    {session.notas && (
                      <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 12px 0' }}>{session.notas}</p>
                    )}
                    {session.meet_link && (
                      <a href={session.meet_link} target="_blank" rel="noreferrer" style={{
                        display: 'inline-block',
                        background: '#0ea5e9',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        fontSize: '14px'
                      }}>
                        📞 Join Meeting
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
