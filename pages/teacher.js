import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function TeacherDashboard() {
  const router = useRouter();
  const [teacher, setTeacher] = useState(null);
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Form states
  const [newStudent, setNewStudent] = useState({ nombre: '', email: '', nivel: 'A1' });
  const [newSession, setNewSession] = useState({ titulo: '', fecha: '', hora: '', notas: '', meet_link: '' });

  useEffect(() => {
    const savedTeacher = localStorage.getItem('teacher');
    if (!savedTeacher) {
      router.push('/');
      return;
    }

    const teacherData = JSON.parse(savedTeacher);
    setTeacher(teacherData);

    // Fetch students and sessions
    fetchData(teacherData.id);
  }, []);

  const fetchData = async (teacherId) => {
    try {
      const [studentsRes, sessionsRes] = await Promise.all([
        fetch(`/api/students?teacher_id=${teacherId}`),
        fetch(`/api/sessions?teacher_id=${teacherId}`)
      ]);

      const studentsData = await studentsRes.json();
      const sessionsData = await sessionsRes.json();

      setStudents(studentsData.students || []);
      setSessions(sessionsData.sessions || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!newStudent.nombre || !newStudent.email) {
      alert('Complete all fields');
      return;
    }

    try {
      const res = await fetch(`/api/students?teacher_id=${teacher.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudent)
      });

      const data = await res.json();
      if (res.ok) {
        setStudents([...students, data.student]);
        setNewStudent({ nombre: '', email: '', nivel: 'A1' });
        alert('Student added!');
      }
    } catch (error) {
      console.error('Error adding student:', error);
    }
  };

  const handleAddSession = async (e) => {
    e.preventDefault();
    if (!newSession.titulo || !newSession.fecha || !newSession.hora) {
      alert('Complete required fields');
      return;
    }

    try {
      const res = await fetch(`/api/sessions?teacher_id=${teacher.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSession)
      });

      const data = await res.json();
      if (res.ok) {
        setSessions([data.session, ...sessions]);
        setNewSession({ titulo: '', fecha: '', hora: '', notas: '', meet_link: '' });
        alert('Session created!');
      }
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('teacher');
    router.push('/');
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  if (!teacher) {
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6' }}>
      {/* Header */}
      <div style={{
        background: '#fff',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ fontSize: '20px', fontWeight: 800, background: 'linear-gradient(135deg, #1e40af, #0369a1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          ⚡ Atlas English - Teacher
        </div>
        <button onClick={handleLogout} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
          Sign Out
        </button>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        {/* Welcome */}
        <div style={{
          background: 'linear-gradient(135deg, #1e40af, #0369a1)',
          color: '#fff',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '28px' }}>Welcome, {teacher.nombre}! 👨‍🏫</h1>
          <p style={{ margin: '0', opacity: 0.9 }}>Teacher Dashboard</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #e5e7eb', paddingBottom: '15px' }}>
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '10px 16px',
              background: activeTab === 'overview' ? '#eff6ff' : 'transparent',
              border: `2px solid ${activeTab === 'overview' ? '#0ea5e9' : '#1e40af'}`,
              color: activeTab === 'overview' ? '#0ea5e9' : '#1e40af',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            📊 Overview
          </button>
          <button
            onClick={() => setActiveTab('students')}
            style={{
              padding: '10px 16px',
              background: activeTab === 'students' ? '#eff6ff' : 'transparent',
              border: `2px solid ${activeTab === 'students' ? '#0ea5e9' : '#1e40af'}`,
              color: activeTab === 'students' ? '#0ea5e9' : '#1e40af',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            👥 Students
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            style={{
              padding: '10px 16px',
              background: activeTab === 'sessions' ? '#eff6ff' : 'transparent',
              border: `2px solid ${activeTab === 'sessions' ? '#0ea5e9' : '#1e40af'}`,
              color: activeTab === 'sessions' ? '#0ea5e9' : '#1e40af',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            📅 Sessions
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e40af' }}>{students.length}</div>
                <div style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px' }}>Active Students</div>
              </div>
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e40af' }}>{sessions.length}</div>
                <div style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px' }}>Sessions</div>
              </div>
            </div>
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div>
            {/* Add Student Form */}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ marginBottom: '16px', fontSize: '18px' }}>Add Student</h2>
              <form onSubmit={handleAddStudent}>
                <input
                  type="text"
                  placeholder="Student Name"
                  value={newStudent.nombre}
                  onChange={(e) => setNewStudent({ ...newStudent, nombre: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', marginBottom: '12px', fontSize: '14px', fontFamily: 'inherit' }}
                />
                <input
                  type="email"
                  placeholder="Student Email"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', marginBottom: '12px', fontSize: '14px', fontFamily: 'inherit' }}
                />
                <select
                  value={newStudent.nivel}
                  onChange={(e) => setNewStudent({ ...newStudent, nivel: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', marginBottom: '12px', fontSize: '14px', fontFamily: 'inherit' }}
                >
                  <option value="A1">A1 - Beginner</option>
                  <option value="A2">A2 - Elementary</option>
                  <option value="B1">B1 - Pre-Intermediate</option>
                  <option value="B2">B2 - Intermediate+</option>
                </select>
                <button
                  type="submit"
                  style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #1e40af, #0369a1)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px', transition: 'all 0.3s' }}
                >
                  Add Student
                </button>
              </form>
            </div>

            {/* Students List */}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ marginBottom: '16px', fontSize: '18px' }}>Your Students</h2>
              {students.length === 0 ? (
                <p style={{ color: '#9ca3af', textAlign: 'center', padding: '20px' }}>No students yet</p>
              ) : (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {students.map((student) => (
                    <div key={student.id} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                          <div style={{ fontWeight: 600, color: '#1f2937', fontSize: '16px' }}>{student.nombre}</div>
                          <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px' }}>{student.email}</div>
                          <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px' }}>Level: <strong>{student.nivel}</strong></div>
                          <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px' }}>Points: <strong>{student.points}</strong></div>
                        </div>
                        <div style={{ background: student.status === 'active' ? '#d1fae5' : '#fee2e2', color: student.status === 'active' ? '#065f46' : '#991b1b', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>
                          {student.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <div>
            {/* Create Session Form */}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ marginBottom: '16px', fontSize: '18px' }}>Create Session</h2>
              <form onSubmit={handleAddSession}>
                <input
                  type="text"
                  placeholder="Session Title (e.g., English-Class)"
                  value={newSession.titulo}
                  onChange={(e) => setNewSession({ ...newSession, titulo: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', marginBottom: '12px', fontSize: '14px', fontFamily: 'inherit' }}
                />
                <input
                  type="date"
                  value={newSession.fecha}
                  onChange={(e) => setNewSession({ ...newSession, fecha: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', marginBottom: '12px', fontSize: '14px', fontFamily: 'inherit' }}
                />
                <input
                  type="time"
                  value={newSession.hora}
                  onChange={(e) => setNewSession({ ...newSession, hora: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', marginBottom: '12px', fontSize: '14px', fontFamily: 'inherit' }}
                />
                <input
                  type="url"
                  placeholder="Google Meet Link (optional)"
                  value={newSession.meet_link}
                  onChange={(e) => setNewSession({ ...newSession, meet_link: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', marginBottom: '12px', fontSize: '14px', fontFamily: 'inherit' }}
                />
                <textarea
                  placeholder="Notes (optional)"
                  value={newSession.notas}
                  onChange={(e) => setNewSession({ ...newSession, notas: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', marginBottom: '12px', fontSize: '14px', fontFamily: 'inherit', minHeight: '80px' }}
                />
                <button
                  type="submit"
                  style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #1e40af, #0369a1)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px', transition: 'all 0.3s' }}
                >
                  Create Session
                </button>
              </form>
            </div>

            {/* Sessions List */}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ marginBottom: '16px', fontSize: '18px' }}>Your Sessions</h2>
              {sessions.length === 0 ? (
                <p style={{ color: '#9ca3af', textAlign: 'center', padding: '20px' }}>No sessions yet</p>
              ) : (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {sessions.map((session) => (
                    <div key={session.id} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px' }}>
                      <div style={{ fontWeight: 600, color: '#1f2937', fontSize: '16px' }}>{session.titulo}</div>
                      <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px' }}>📅 {session.fecha} at {session.hora}</div>
                      {session.notas && <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px', fontStyle: 'italic' }}>📝 {session.notas}</div>}
                      {session.meet_link && (
                        <div style={{ marginTop: '10px' }}>
                          <a href={session.meet_link} target="_blank" rel="noopener noreferrer" style={{ color: '#0ea5e9', textDecoration: 'none', fontWeight: 600, fontSize: '12px' }}>
                            📞 Join Meeting →
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
