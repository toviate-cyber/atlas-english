import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    // Redirige a platform.html
    window.location.href = '/platform.html';
  }, []);

  return <div>Loading...</div>;
}
