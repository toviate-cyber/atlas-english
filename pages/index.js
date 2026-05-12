import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

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
        padding: '60px 40px',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '500px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '800',
          background: 'linear-gradient(135deg, #1e40af, #0369a1)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '10px'
        }}>⚡ Atlas English</h1>

        <p style={{
          fontSize: '16px',
          color: '#6b7280',
          marginBottom: '40px'
        }}>Choose your role to continue</p>

        <button
          onClick={() => router.push('/teacher-login')}
          style={{
            width: '100%',
            padding: '16px',
            marginBottom: '16px',
            background: 'linear-gradient(135deg, #1e40af, #0369a1)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
        >
          👨‍🏫 Teacher Login
        </button>

        <button
          onClick={() => router.push('/student-login')}
          style={{
            width: '100%',
            padding: '16px',
            background: '#f3f4f6',
            color: '#1f2937',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
        >
          📚 Student Login
        </button>

        <p style={{
          fontSize: '12px',
          color: '#9ca3af',
          marginTop: '30px'
        }}>
          Made with ❤️ by TOVI
        </p>
      </div>
    </div>
  );
}
