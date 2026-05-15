import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { LESSON_BANK, LEVELS } from '../lib/lessons-data';

export default function StudentDashboard() {
  const router = useRouter();
  const [student, setStudent] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [initialized, setInitialized] = useState(false);
  
  // Placement test
  const [showPlacementTest, setShowPlacementTest] = useState(false);
  const [testQuestions, setTestQuestions] = useState([]);
  const [testAnswers, setTestAnswers] = useState({});
  const [testIndex, setTestIndex] = useState(0);
  const [testResult, setTestResult] = useState(null);

  // Lesson
  const [currentLesson, setCurrentLesson] = useState(null);
  const [lessonAnswers, setLessonAnswers] = useState({});
  const [lessonQuestionIndex, setLessonQuestionIndex] = useState(0);

  useEffect(() => {
    if (initialized) return; // Only run once
    
    const savedStudent = localStorage.getItem('student');
    if (!savedStudent) {
      router.push('/student-login');
      return;
    }

    const studentData = JSON.parse(savedStudent);
    setStudent(studentData);
    fetchData(studentData.id);
    setInitialized(true);
  }, []);

  const fetchData = async (studentId, silent = false) => {
    try {
      const sessionsRes = await fetch(`/api/sessions/for-student?student_id=${studentId}`);
      const sessionsData = await sessionsRes.json();
      setSessions(sessionsData.sessions || []);

      const progressRes = await fetch(`/api/progress?student_id=${studentId}`);
      const progressData = await progressRes.json();
      setProgress(progressData.progress || []);

      if (!silent) setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (!silent) setLoading(false);
    }
  };

  const startPlacementTest = async () => {
    const questions = generatePlacementTest();
    setTestQuestions(questions);
    setTestAnswers({});
    setTestIndex(0);
    setShowPlacementTest(true);
  };

  const generatePlacementTest = () => {
    // 15 preguntas sobre A1-C1 levels
    return [
      {q: "I ___ a student.", o: ["am", "is", "are"], c: 0},
      {q: "She ___ from Spain.", o: ["am", "is", "are"], c: 1},
      {q: "If it rains, I ___ stay home.", o: ["will", "would", "had"], c: 0},
      {q: "She ___ lived here for 5 years.", o: ["has", "have", "had"], c: 0},
      {q: "The house ___ built in 1990.", o: ["was", "is", "were"], c: 0},
      {q: "I wish I ___ speak French.", o: ["could", "can", "would"], c: 0},
      {q: "If I ___ you, I would accept.", o: ["was", "were", "am"], c: 1},
      {q: "She has ___ been working here.", o: ["been", "being", "be"], c: 0},
      {q: "The person ___ helped us is kind.", o: ["who", "which", "where"], c: 0},
      {q: "I ___ swimming in the pool.", o: ["am enjoying", "enjoy", "enjoying"], c: 0},
      {q: "He must ___ already left.", o: ["have", "has", "had"], c: 0},
      {q: "___, he passed the exam.", o: ["Nevertheless", "Because", "Furthermore"], c: 0},
      {q: "By next month, I ___ finished.", o: ["will have", "will be", "have"], c: 0},
      {q: "She ___ told me the truth.", o: ["should have", "should", "has"], c: 0},
      {q: "The task is ___ than expected.", o: ["more difficult", "difficult", "difficulty"], c: 0}
    ];
  };

  const submitPlacementTest = async () => {
    let correct = 0;
    testQuestions.forEach((q, idx) => {
      if (testAnswers[idx] === q.c) correct++;
    });

    const score = Math.round((correct / testQuestions.length) * 100);
    let level = 'A1';
    if (score >= 80) level = 'C1';
    else if (score >= 65) level = 'B2';
    else if (score >= 50) level = 'B1';
    else if (score >= 35) level = 'A2';

    setTestResult({score, level, correct, total: testQuestions.length});

    // Update student level
    const updatedStudent = {...student, nivel: level};
    localStorage.setItem('student', JSON.stringify(updatedStudent));
    setStudent(updatedStudent);

    // Save to backend
    try {
      await fetch('/api/students/update-level', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({student_id: student.id, nivel: level})
      });
    } catch (error) {
      console.error('Error updating level:', error);
    }
  };

  const openLesson = (lessonIndex) => {
    setCurrentLesson(lessonIndex);
    setLessonAnswers({});
    setLessonQuestionIndex(0);
  };

  const submitLessonAnswer = async () => {
    if (lessonQuestionIndex < LESSON_BANK[currentLesson].questions.length - 1) {
      setLessonQuestionIndex(lessonQuestionIndex + 1);
    } else {
      // Lesson complete
      const lesson = LESSON_BANK[currentLesson];
      let score = 0;
      lesson.questions.forEach((q, idx) => {
        if (lessonAnswers[idx] === q.c) score++;
      });

      const passed = score >= lesson.questions.length * 0.7; // 70% to pass

      // Save progress
      try {
        await fetch('/api/progress', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            student_id: student.id,
            lesson_id: lesson.id,
            completed: passed,
            points: Math.round((score / lesson.questions.length) * 100)
          })
        });

        setCurrentLesson(null);
        fetchData(student.id, true);
      } catch (error) {
        console.error('Error saving progress:', error);
      }
    }
  };

  const totalPoints = progress.reduce((acc, p) => acc + (p.points || 0), 0);
  const passedLessons = progress.filter(p => p.completed).length;
  const availableLessons = LESSON_BANK.filter(l => l.level === student?.nivel);

  if (loading) {
    return (
      <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6'}}>
        <div style={{textAlign: 'center'}}>
          <div style={{fontSize: '32px', marginBottom: '20px'}}>⏳</div>
          <p style={{color: '#6b7280'}}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return <div>Redirecting...</div>;
  }

  // Placement test view
  if (showPlacementTest && !testResult) {
    const q = testQuestions[testIndex];
    return (
      <div style={{minHeight: '100vh', background: '#f3f4f6', padding: '40px 20px', fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'}}>
        <div style={{maxWidth: '600px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '12px'}}>
          <div style={{marginBottom: '30px'}}>
            <h2 style={{color: '#1f2937', marginBottom: '10px'}}>Atlas English Placement Test</h2>
            <div style={{background: '#f3f4f6', borderRadius: '8px', height: '8px', overflow: 'hidden'}}>
              <div style={{background: '#0ea5e9', height: '100%', width: `${((testIndex + 1) / testQuestions.length) * 100}%`, transition: 'width 0.3s'}}></div>
            </div>
            <p style={{color: '#6b7280', fontSize: '14px', marginTop: '8px'}}>Question {testIndex + 1} of {testQuestions.length}</p>
          </div>

          <h3 style={{color: '#1f2937', marginBottom: '20px'}}>{q.q}</h3>

          <div style={{display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '30px'}}>
            {q.o.map((option, i) => (
              <button
                key={i}
                onClick={() => setTestAnswers({...testAnswers, [testIndex]: i})}
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

          <div style={{display: 'flex', gap: '12px'}}>
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

  // Lesson view
  if (currentLesson !== null) {
    const lesson = LESSON_BANK[currentLesson];
    const q = lesson.questions[lessonQuestionIndex];

    return (
      <div style={{minHeight: '100vh', background: '#f3f4f6', padding: '40px 20px', fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'}}>
        <div style={{maxWidth: '600px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '12px'}}>
          <div style={{marginBottom: '30px'}}>
            <button onClick={() => setCurrentLesson(null)} style={{background: 'none', border: 'none', color: '#0ea5e9', cursor: 'pointer', marginBottom: '15px'}}>← Back</button>
            <h2 style={{color: '#1f2937', marginBottom: '5px'}}>{lesson.title}</h2>
            <p style={{color: '#6b7280', fontSize: '14px', marginBottom: '15px'}}>{lesson.description}</p>
            <div style={{background: '#f3f4f6', borderRadius: '8px', height: '8px', overflow: 'hidden'}}>
              <div style={{background: '#0ea5e9', height: '100%', width: `${((lessonQuestionIndex + 1) / lesson.questions.length) * 100}%`, transition: 'width 0.3s'}}></div>
            </div>
            <p style={{color: '#6b7280', fontSize: '14px', marginTop: '8px'}}>Question {lessonQuestionIndex + 1} of {lesson.questions.length}</p>
          </div>

          <h3 style={{color: '#1f2937', marginBottom: '20px'}}>{q.q}</h3>

          <div style={{display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '30px'}}>
            {q.o.map((option, i) => (
              <button
                key={i}
                onClick={() => setLessonAnswers({...lessonAnswers, [lessonQuestionIndex]: i})}
                style={{
                  padding: '12px 16px',
                  background: lessonAnswers[lessonQuestionIndex] === i ? '#bfdbfe' : '#f9fafb',
                  border: lessonAnswers[lessonQuestionIndex] === i ? '2px solid #0ea5e9' : '1px solid #d1d5db',
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

          <button
            onClick={submitLessonAnswer}
            disabled={lessonAnswers[lessonQuestionIndex] === undefined}
            style={{
              width: '100%',
              padding: '12px',
              background: lessonAnswers[lessonQuestionIndex] === undefined ? '#e5e7eb' : 'linear-gradient(135deg, #1e40af, #0369a1)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: lessonAnswers[lessonQuestionIndex] === undefined ? 'not-allowed' : 'pointer',
              fontWeight: '600'
            }}
          >
            {lessonQuestionIndex === lesson.questions.length - 1 ? 'Finish Lesson ✓' : 'Next Question →'}
          </button>
        </div>
      </div>
    );
  }

  // Main dashboard
  return (
    <div style={{minHeight: '100vh', background: '#f3f4f6'}}>
      <header style={{background: 'white', borderBottom: '1px solid #e5e7eb', padding: '20px 0', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'}}>
        <div style={{maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div>
            <h1 style={{margin: '0', fontSize: '24px', fontWeight: '800', background: 'linear-gradient(135deg, #1e40af, #0369a1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>⚡ Atlas English</h1>
            <p style={{margin: '5px 0 0 0', color: '#6b7280', fontSize: '14px'}}>Welcome, {student.nombre}</p>
          </div>
          <button onClick={() => {localStorage.removeItem('student'); router.push('/')}} style={{padding: '8px 16px', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500'}}>
            Sign Out
          </button>
        </div>
      </header>

      <div style={{maxWidth: '1200px', margin: '0 auto', padding: '40px 20px'}}>
        <div style={{display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '2px solid #e5e7eb', paddingBottom: '15px'}}>
          <button onClick={() => setActiveTab('dashboard')} style={{padding: '10px 20px', background: activeTab === 'dashboard' ? '#eff6ff' : 'transparent', border: 'none', color: activeTab === 'dashboard' ? '#0ea5e9' : '#6b7280', cursor: 'pointer', fontWeight: '600'}}>📊 Dashboard</button>
          <button onClick={() => setActiveTab('lessons')} style={{padding: '10px 20px', background: activeTab === 'lessons' ? '#eff6ff' : 'transparent', border: 'none', color: activeTab === 'lessons' ? '#0ea5e9' : '#6b7280', cursor: 'pointer', fontWeight: '600'}}>📚 Lessons</button>
          <button onClick={() => setActiveTab('meetings')} style={{padding: '10px 20px', background: activeTab === 'meetings' ? '#eff6ff' : 'transparent', border: 'none', color: activeTab === 'meetings' ? '#0ea5e9' : '#6b7280', cursor: 'pointer', fontWeight: '600'}}>📅 Meetings</button>
        </div>

        {activeTab === 'dashboard' && (
          <div style={{background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'}}>
            <h2 style={{color: '#1f2937', marginBottom: '20px'}}>Your Progress</h2>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px'}}>
              <div style={{background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '20px', textAlign: 'center'}}>
                <div style={{fontSize: '32px', fontWeight: '800', color: '#1e40af'}}>{student.nivel}</div>
                <div style={{color: '#6b7280', fontSize: '14px', marginTop: '8px'}}>English Level</div>
              </div>
              <div style={{background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '20px', textAlign: 'center'}}>
                <div style={{fontSize: '32px', fontWeight: '800', color: '#1e40af'}}>{totalPoints}</div>
                <div style={{color: '#6b7280', fontSize: '14px', marginTop: '8px'}}>Total Points</div>
              </div>
              <div style={{background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '20px', textAlign: 'center'}}>
                <div style={{fontSize: '32px', fontWeight: '800', color: '#10b981'}}>{passedLessons}</div>
                <div style={{color: '#6b7280', fontSize: '14px', marginTop: '8px'}}>Lessons Passed</div>
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
          <div style={{background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'}}>
            <h2 style={{color: '#1f2937', marginBottom: '20px'}}>Lessons for {student?.nivel}</h2>
            {availableLessons.length > 0 ? (
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px'}}>
                {availableLessons.map((lesson) => {
                  const isPassed = progress.find(p => p.lesson_id === lesson.id && p.completed);
                  return (
                    <div key={lesson.id} style={{background: isPassed ? '#f0fdf4' : '#eff6ff', border: isPassed ? '2px solid #10b981' : '2px solid #0ea5e9', borderRadius: '10px', padding: '20px', cursor: 'pointer', transition: 'all 0.3s'}} onClick={() => openLesson(LESSON_BANK.indexOf(lesson))}>
                      <h3 style={{margin: '0 0 8px 0', color: '#1f2937', fontSize: '16px', fontWeight: '600'}}>{lesson.title}</h3>
                      <p style={{margin: '0 0 12px 0', color: '#6b7280', fontSize: '13px'}}>{lesson.description}</p>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <span style={{fontSize: '12px', color: '#6b7280'}}>20 questions</span>
                        <span style={{color: isPassed ? '#10b981' : '#0ea5e9', fontWeight: '600'}}>{isPassed ? '✅ Passed' : '📖 Start'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{color: '#6b7280', textAlign: 'center', padding: '40px'}}>Take the placement test first to unlock lessons</p>
            )}
          </div>
        )}

        {activeTab === 'meetings' && (
          <div style={{background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'}}>
            <h2 style={{color: '#1f2937', marginBottom: '20px'}}>Your Meetings</h2>
            {sessions.length === 0 ? (
              <p style={{color: '#9ca3af', textAlign: 'center', padding: '40px'}}>No meetings scheduled yet</p>
            ) : (
              <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                {sessions.map((session) => (
                  <div key={session.id} style={{background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '20px'}}>
                    <h3 style={{color: '#1f2937', margin: '0 0 12px 0'}}>{session.titulo}</h3>
                    <p style={{color: '#6b7280', fontSize: '14px', margin: '0 0 8px 0'}}>📅 {session.fecha} at {session.hora}</p>
                    {session.notas && <p style={{color: '#6b7280', fontSize: '14px', margin: '0 0 12px 0'}}>{session.notas}</p>}
                    {session.meet_link && <a href={session.meet_link} target="_blank" rel="noreferrer" style={{display: 'inline-block', background: '#0ea5e9', color: 'white', padding: '8px 16px', borderRadius: '6px', textDecoration: 'none', fontSize: '14px'}}>📞 Join Meeting</a>}
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
