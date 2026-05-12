import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('victorjamesjordans@gmail.com');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      // Save teacher to localStorage
      localStorage.setItem('teacher', JSON.stringify(data.teacher));

      // Redirect to teacher dashboard
      router.push('/teacher');
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '400px', background: '#fff', borderRadius: '12px', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        {/* Logo */}
        <div style={{ fontSize: '32px', fontWeight: 800, background: 'linear-gradient(135deg, #1e40af, #0369a1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '24px', textAlign: 'center' }}>
          ⚡ Atlas English
        </div>

        {/* Title */}
        <h1 style={{ fontSize: '24px', color: '#1f2937', marginBottom: '8px', textAlign: 'center' }}>Teacher Login</h1>
        <p style={{ color: '#6b7280', marginBottom: '24px', textAlign: 'center', fontSize: '14px' }}>Sign in to manage your students</p>

        {/* Error Message */}
        {error && (
          <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '12px 14px', border: '1px solid #d1d5db', borderRadius: '8px', marginBottom: '12px', fontSize: '14px', fontFamily: 'inherit', outline: 'none' }}
            onFocus={(e) => e.target.style.borderColor = '#0ea5e9'}
            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '12px 14px', border: '1px solid #d1d5db', borderRadius: '8px', marginBottom: '12px', fontSize: '14px', fontFamily: 'inherit', outline: 'none' }}
            onFocus={(e) => e.target.style.borderColor = '#0ea5e9'}
            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: 'linear-gradient(135deg, #1e40af, #0369a1)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              fontSize: '14px',
              opacity: loading ? 0.6 : 1,
              transition: 'all 0.3s'
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Credentials */}
        <div style={{ marginTop: '24px', padding: '16px', background: '#f3f4f6', borderRadius: '8px', fontSize: '12px', color: '#6b7280' }}>
          <div style={{ fontWeight: 600, marginBottom: '8px', color: '#1f2937' }}>Demo Credentials:</div>
          <div>Email: <code style={{ background: '#e5e7eb', padding: '2px 6px', borderRadius: '4px' }}>victorjamesjordans@gmail.com</code></div>
          <div style={{ marginTop: '4px' }}>Password: <code style={{ background: '#e5e7eb', padding: '2px 6px', borderRadius: '4px' }}>123456</code></div>
        </div>
      </div>
    </div>
  );
}
