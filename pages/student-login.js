import { useState } from 'react';
import { useRouter } from 'next/router';

export default function StudentLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('fabricioenglishtutoring@gmail.com');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Para MVP: obtener estudiante por email de Supabase
      const res = await fetch(`/api/students/by-email?email=${encodeURIComponent(email)}`);
      const data = await res.json();

      if (!res.ok || !data.student) {
        setError('Student not found');
        setLoading(false);
        return;
      }

      // Save student info to localStorage
      localStorage.setItem('student', JSON.stringify(data.student));

      // Redirect to dashboard
      router.push('/student-dashboard');
    } catch (err) {
      setError('Connection error: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
      }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '800',
          background: 'linear-gradient(135deg, #1e40af, #0369a1)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textAlign: 'center',
          marginBottom: '10px'
        }}>⚡ Atlas English</h1>

        <h2 style={{
          fontSize: '24px',
          color: '#1f2937',
          textAlign: 'center',
          marginBottom: '20px'
        }}>Student Login</h2>

        {error && (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #fca5a5',
            color: '#991b1b',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: 'inherit',
              boxSizing: 'border-box'
            }}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: 'inherit',
              boxSizing: 'border-box'
            }}
            required
          />
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              background: 'linear-gradient(135deg, #1e40af, #0369a1)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
              transition: 'all 0.3s'
            }}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Sign In'}
          </button>
        </form>

        <p style={{
          fontSize: '12px',
          color: '#6b7280',
          textAlign: 'center',
          marginTop: '16px'
        }}>
          Demo: fabricioenglishtutoring@gmail.com / 123456
        </p>

        <p style={{
          fontSize: '12px',
          color: '#6b7280',
          textAlign: 'center',
          marginTop: '8px'
        }}>
          <a href="/teacher-login" style={{ color: '#0ea5e9', textDecoration: 'none' }}>
            Teacher? Login here
          </a>
        </p>
      </div>
    </div>
  );
}
