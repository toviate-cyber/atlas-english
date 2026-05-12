import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

// Lesson bank (same as before)
const LESSON_BANK = [
  ["To Be: Present Simple", "The verb 'to be' is the most basic in English. AM (I), IS (he/she/it), ARE (you/we/they).", [
    {q:"I ___ a student.",a:["am","is","are"],c:0},{q:"He ___ from Panama.",a:["am","is","are"],c:1},{q:"We ___ friends.",a:["am","is","are"],c:2}
  ]],
  ["Present Simple – Habits", "Daily routines and habits. Add -s/-es with he/she/it.", [
    {q:"She ___ coffee every morning.",a:["like","likes","liking"],c:1},{q:"I ___ English every day.",a:["study","studies","studying"],c:0}
  ]],
  ["Articles: A, An, The", "Use 'a' before consonants, 'an' before vowels, 'the' for specific things.", [
    {q:"___ apple a day keeps the doctor away.",a:["A","An","The"],c:1},{q:"I want ___ sandwich.",a:["a","an","the"],c:0}
  ]],
];

export default function StudentDashboard() {
  const router = useRouter();
  const [student, setStudent] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Placement test
  const [showPlacementTest, setShowPlacementTest] = useState(false);
  const [testQuestions, setTestQuestions] = useState([]);
  const [testAnswers, setTestAnswers] = useState({});
  const [testIndex, setTestIndex] = useState(0);
  const [testResult, setTestResult] = useState(null);

  // Lesson
  const [currentLesson, setCurrentLesson] = useState(null);
  const [lessonAnswers, setLessonAnswers] = useState({});

  useEffect(() => {
    const savedStudent = localStorage.getItem('student');
    if (!savedStudent) {
      router.push('/student-login');
      return;
    }

    const studentData = JSON.parse(savedStudent);
    setStudent(studentData);
    fetchData(studentData.id);

    const interval = setInterval(() => {
      fetchData(studentData.id);
    }, 10000);

    return () => clearInterval(interval);
  }, [router]);

  const fetchData = async (studentId) => {
    try {
      const sessionsRes = await fetch(`/api/sessions/for-student?student_id=${studentId}`);
      const sessionsData = await sessionsRes.json();
      setSessions(sessionsData.sessions || []);

      const progressRes = await fetch(`/api/progress?student_id=${studentId}`);
      const progressData = await progressRes.json();
      setProgress(progressData.progress || []);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const startPlacementTest = async () => {
    try {
      const res = await fetch('/api/placement-test');
      const data = await res.json();
      setTestQuestions(data.questions);
      setTestAnswers({});
      setTestIndex(0);
      setTestResult(null);
      setShowPlacementTest(true);
    } catch (error) {
      console.error('Error loading test:', error);
    }
  };

  const submitPlacementTest = async () => {
    try {
      const answers = testQuestions.map((_, i) => testAnswers[i] ?? -1);
      const res = await fetch('/api/placement-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      });

      const result = await res.json();
      setTestResult(result);

      // Update student level in localStorage
      const updated = { ...student, nivel: result.level };
      localStorage.setItem('student', JSON.stringify(updated));
      setStudent(updated);
    } catch (error) {
      console.error('Error submitting test:', error);
    }
  };

  const openLesson = (lessonIndex) => {
    setCurrentLesson(lessonIndex);
    setLessonAnswers({});
  };

  const submitLesson = async (lessonIndex) => {
    if (!student) return;

    const lesson = LESSON_BANK[lessonIndex];
    let correct = 0;

    lesson[2].forEach((ex, i) => {
      if (lessonAnswers[i] === ex.c) correct++;
    });

    const passed = correct >= Math.ceil(lesson[2].length * 0.75);
    const points = passed ? 50 + (correct * 5) : 0;

    // Save progress
    try {
      await fetch(`/api/progress?student_id=${student.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lesson_id: lessonIndex + 1,
          completed: passed,
          points: points,
          attempts: 1
        })
      });

      fetchData(student.id);
      setCurrentLesson(null);
      alert(passed ? `Lesson passed! +${points} points` : 'Try again');
    } catch (error) {
      console.error('Error saving progress:', error);
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

  // Placement test UI
  if (showPlacementTest && testQuestions.length > 0) {
    if (testResult) {
      return (
        <div style={{ minHeight: '100vh', background: '#f3f4f6', padding: '40px 20px', fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🎉</div>
            <h1 style={{ color: '#1f2937', marginBottom: '20px' }}>Your English Level</h1>
            <div style={{ fontSize: '48px', fontWeight: '800', color: '#1e40af', marginBottom: '20px' }}>{testResult.level}</div>
            <p style={{ color: '#6b7280', marginBottom: '10px' }}>Score: {testResult.score}/{testResult.total} ({testResult.percentage}%)</p>
            <button
              onClick={() => {
                setShowPlacementTest(false);
                setActiveTab('lessons');
              }}
              style={{
                marginTop: '20px',
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #1e40af, #0369a1)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              View Lessons
            </button>
          </div>
        </div>
      );
    }

    const q = testQuestions[testIndex];
    return (
      <div style={{ minHeight: '100vh', background: '#f3f4f6', padding: '40px 20px', fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '12px' }}>
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ color: '#1f2937', marginBottom: '10px' }}>Placement Test</h2>
            <div style={{ background: '#f3f4f6', borderRadius: '8px', height: '8px', overflow: 'hidden' }}>
              <div style={{ background: '#0ea5e9', height: '100%', width: `${((testIndex + 1) / testQuestions.length) * 100}%`, transition: 'width 0.3s' }}></div>
            </div>
            <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px' }}>Question {testIndex + 1} of {testQuestions.length}</p>
          </div>

          <h3 style={{ color: '#1f2937', marginBottom: '20px' }}>{q.q}</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '30px' }}>
            {q.a.map((option, i) => (
              <button
                key={i}
                onClick={() => setTestAnswers({ ...testAnswers, [testIndex]: i })}
                style={{
                  padding: '12px 16px',
                  background: testAnswers[testIndex] === i ? '#bfdbfe' : '#f9fafb',
                  border: testAnswers[testIndex] === i ? '2px solid #0ea5e9' : '1px solid #d1d5db',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.3s'
                }}
              >
                {option}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => testIndex > 0 && setTestIndex(testIndex - 1)}
              disabled={testIndex === 0}
              style={{
                flex: 1,
                padding: '12px',
                background: testIndex === 0 ? '#e5e7eb' : '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                cursor: testIndex === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              ← Previous
            </button>
            {testIndex < testQuestions.length - 1 ? (
              <button
                onClick={() => setTestIndex(testIndex + 1)}
                disabled={testAnswers[testIndex] === undefined}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: testAnswers[testIndex] === undefined ? '#e5e7eb' : 'linear-gradient(135deg, #1e40af, #0369a1)',
                  color: testAnswers[testIndex] === undefined ? '#9ca3af' : 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: testAnswers[testIndex] === undefined ? 'not-allowed' : 'pointer',
                  fontWeight: '600'
                }}
              >
                Next →
              </button>
            ) : (
              <button
                onClick={submitPlacementTest}
                disabled={testAnswers[testIndex] === undefined}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: testAnswers[testIndex] === undefined ? '#e5e7eb' : 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: testAnswers[testIndex] === undefined ? 'not-allowed' : 'pointer',
                  fontWeight: '600'
                }}
              >
                Submit ✓
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Lesson UI
  if (currentLesson !== null) {
    const lesson = LESSON_BANK[currentLesson];
    return (
      <div style={{ minHeight: '100vh', background: '#f3f4f6', padding: '40px 20px', fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '12px' }}>
          <button
            onClick={() => setCurrentLesson(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#0ea5e9',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '20px'
            }}
          >
            ← Back
          </button>

          <h1 style={{ color: '#1f2937', marginBottom: '10px' }}>Lesson {currentLesson + 1}: {lesson[0]}</h1>
          <p style={{ color: '#6b7280', marginBottom: '30px' }}>{lesson[1]}</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '30px' }}>
            {lesson[2].map((ex, i) => (
              <div key={i} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px' }}>
                <p style={{ color: '#1f2937', fontWeight: '600', marginBottom: '12px' }}>Question {i + 1}: {ex.q}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {ex.a.map((option, j) => (
                    <button
                      key={j}
                      onClick={() => setLessonAnswers({ ...lessonAnswers, [i]: j })}
                      style={{
                        padding: '10px 12px',
                        background: lessonAnswers[i] === j ? '#bfdbfe' : '#f3f4f6',
                        border: lessonAnswers[i] === j ? '2px solid #0ea5e9' : '1px solid #d1d5db',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.3s'
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => submitLesson(currentLesson)}
            style={{
              width: '100%',
              padding: '12px',
              background: 'linear-gradient(135deg, #1e40af, #0369a1)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Submit Answers
          </button>
        </div>
      </div>
    );
  }

  // Main dashboard
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
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '2px solid #e5e7eb', paddingBottom: '15px' }}>
          <button onClick={() => setActiveTab('dashboard')} style={{padding: '10px 20px', background: activeTab === 'dashboard' ? '#eff6ff' : 'transparent', border: 'none', color: activeTab === 'dashboard' ? '#0ea5e9' : '#6b7280', cursor: 'pointer', fontWeight: '600'}}>📊 Dashboard</button>
          <button onClick={() => setActiveTab('lessons')} style={{padding: '10px 20px', background: activeTab === 'lessons' ? '#eff6ff' : 'transparent', border: 'none', color: activeTab === 'lessons' ? '#0ea5e9' : '#6b7280', cursor: 'pointer', fontWeight: '600'}}>📚 Lessons</button>
          <button onClick={() => setActiveTab('meetings')} style={{padding: '10px 20px', background: activeTab === 'meetings' ? '#eff6ff' : 'transparent', border: 'none', color: activeTab === 'meetings' ? '#0ea5e9' : '#6b7280', cursor: 'pointer', fontWeight: '600'}}>📅 Meetings</button>
        </div>

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
            {!testResult && (
              <button
                onClick={startPlacementTest}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: 'linear-gradient(135deg, #1e40af, #0369a1)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '16px'
                }}
              >
                📋 Take Placement Test
              </button>
            )}
          </div>
        )}

        {activeTab === 'lessons' && (
          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ color: '#1f2937', marginBottom: '20px' }}>Available Lessons</h2>
            {testResult ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px' }}>
                {LESSON_BANK.map((lesson, i) => {
                  const isPassed = progress.find(p => p.lesson_id === i + 1 && p.completed);
                  return (
                    <button
                      key={i}
                      onClick={() => openLesson(i)}
                      style={{
                        padding: '16px',
                        background: isPassed ? '#f0fdf4' : '#eff6ff',
                        border: isPassed ? '2px solid #10b981' : '2px solid #0ea5e9',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.3s'
                      }}
                    >
                      <div style={{ fontSize: '24px', fontWeight: '800', color: isPassed ? '#10b981' : '#0ea5e9' }}>
                        {i + 1}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                        {isPassed ? '✅ Passed' : '📖 Start'}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p style={{ color: '#6b7280', textAlign: 'center', padding: '40px' }}>Take the placement test first to unlock lessons</p>
            )}
          </div>
        )}

        {activeTab === 'meetings' && (
          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ color: '#1f2937', marginBottom: '20px' }}>Your Meetings</h2>
            {sessions.length === 0 ? (
              <p style={{ color: '#9ca3af', textAlign: 'center', padding: '40px' }}>No meetings scheduled yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {sessions.map((session) => (
                  <div key={session.id} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '20px' }}>
                    <h3 style={{ color: '#1f2937', margin: '0 0 12px 0' }}>{session.titulo}</h3>
                    <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 8px 0' }}>📅 {session.fecha} at {session.hora}</p>
                    {session.notas && <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 12px 0' }}>{session.notas}</p>}
                    {session.meet_link && <a href={session.meet_link} target="_blank" rel="noreferrer" style={{ display: 'inline-block', background: '#0ea5e9', color: 'white', padding: '8px 16px', borderRadius: '6px', textDecoration: 'none', fontSize: '14px' }}>📞 Join Meeting</a>}
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
