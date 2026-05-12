import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Home.module.css';

export default function TeacherDashboard() {
  const router = useRouter();
  const [teacher, setTeacher] = useState(null);
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('students');
  
  // Form states
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionDate, setSessionDate] = useState('');
  const [sessionTime, setSessionTime] = useState('');
  const [sessionNotes, setSessionNotes] = useState('');
  const [sessionMeetLink, setSessionMeetLink] = useState('');

  useEffect(() => {
    // Check if teacher is logged in
    const savedTeacher = localStorage.getItem('teacher');
    if (!savedTeacher) {
      router.push('/teacher-login');
      return;
    }

    const teacherData = JSON.parse(savedTeacher);
    setTeacher(teacherData);

    // Fetch students and sessions
    fetchData(teacherData.id);
  }, [router]);

  const fetchData = async (teacherId) => {
    try {
      // Fetch students
      const studentsRes = await fetch(`/api/students?teacher_id=${teacherId}`);
      const studentsData = await studentsRes.json();
      setStudents(studentsData.students || []);

      // Fetch sessions
      const sessionsRes = await fetch(`/api/sessions?teacher_id=${teacherId}`);
      const sessionsData = await sessionsRes.json();
      setSessions(sessionsData.sessions || []);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    
    if (!sessionTitle || !sessionDate || !sessionTime) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const res = await fetch(`/api/sessions?teacher_id=${teacher.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: sessionTitle,
          fecha: sessionDate,
          hora: sessionTime,
          notas: sessionNotes,
          meet_link: sessionMeetLink
        })
      });

      if (!res.ok) {
        alert('Error creating session');
        return;
      }

      // Reset form and refresh
      setSessionTitle('');
      setSessionDate('');
      setSessionTime('');
      setSessionNotes('');
      setSessionMeetLink('');

      // Refresh sessions
      fetchData(teacher.id);
      alert('Session created successfully!');
    } catch (error) {
      console.error('Error creating session:', error);
      alert('Error creating session');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('teacher');
    router.push('/teacher-login');
  };

  if (!teacher) {
    return <div style={styles.loading}>Loading...</div>;
  }

  return (
    <div style={styles.dashboardContainer}>
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.logo}>⚡ Atlas English</h1>
          <p style={styles.subtitle}>Teacher Dashboard</p>
        </div>
        <div style={styles.headerRight}>
          <span style={styles.teacherName}>👋 {teacher.nombre}</span>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Sign Out
          </button>
        </div>
      </header>

      <div style={styles.dashboardContent}>
        {/* TABS */}
        <div style={styles.tabs}>
          <button
            onClick={() => setActiveTab('students')}
            style={{
              ...styles.tabBtn,
              ...(activeTab === 'students' ? styles.tabActive : {})
            }}
          >
            👥 Students
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            style={{
              ...styles.tabBtn,
              ...(activeTab === 'sessions' ? styles.tabActive : {})
            }}
          >
            📅 Sessions
          </button>
        </div>

        {/* STUDENTS TAB */}
        {activeTab === 'students' && (
          <div style={styles.tabContent}>
            <h2>Students</h2>
            {loading ? (
              <p>Loading...</p>
            ) : students.length === 0 ? (
              <p style={styles.emptyState}>No students yet</p>
            ) : (
              <div style={styles.studentsList}>
                {students.map((student) => (
                  <div key={student.id} style={styles.studentCard}>
                    <div style={styles.studentInfo}>
                      <h3>{student.nombre}</h3>
                      <p style={styles.studentEmail}>{student.email}</p>
                      <p style={styles.studentLevel}>Level: <strong>{student.nivel}</strong></p>
                      <p style={styles.studentPoints}>Points: <strong>{student.points}</strong></p>
                    </div>
                    <div style={styles.studentStatus}>
                      <span style={styles.statusBadge}>{student.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SESSIONS TAB */}
        {activeTab === 'sessions' && (
          <div style={styles.tabContent}>
            <h2>Create Session</h2>
            <form onSubmit={handleCreateSession} style={styles.form}>
              <input
                type="text"
                placeholder="Session Title (e.g., English-Class)"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                style={styles.input}
                required
              />
              <input
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                style={styles.input}
                required
              />
              <input
                type="time"
                value={sessionTime}
                onChange={(e) => setSessionTime(e.target.value)}
                style={styles.input}
                required
              />
              <textarea
                placeholder="Notes (optional)"
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                style={styles.textarea}
              />
              <input
                type="text"
                placeholder="Google Meet Link (optional)"
                value={sessionMeetLink}
                onChange={(e) => setSessionMeetLink(e.target.value)}
                style={styles.input}
              />
              <button type="submit" style={styles.button}>
                Create Session
              </button>
            </form>

            <h2 style={styles.marginTop}>Scheduled Sessions</h2>
            {loading ? (
              <p>Loading...</p>
            ) : sessions.length === 0 ? (
              <p style={styles.emptyState}>No sessions scheduled yet</p>
            ) : (
              <div style={styles.sessionsList}>
                {sessions.map((session) => (
                  <div key={session.id} style={styles.sessionCard}>
                    <h3>{session.titulo}</h3>
                    <p style={styles.sessionDate}>
                      📅 {session.fecha} at {session.hora}
                    </p>
                    {session.notas && (
                      <p style={styles.sessionNotes}>{session.notas}</p>
                    )}
                    {session.meet_link && (
                      <a href={session.meet_link} target="_blank" style={styles.meetLink}>
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
