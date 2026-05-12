import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if teacher is logged in
    const teacher = localStorage.getItem('teacher');
    const student = localStorage.getItem('student');

    if (teacher) {
      router.push('/teacher');
    } else if (student) {
      router.push('/platform.html');
    } else {
      router.push('/login');
    }
  }, []);

  return <div>Loading...</div>;
}
