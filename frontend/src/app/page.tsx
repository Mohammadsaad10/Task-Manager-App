'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './page.module.css';
import Button from '@/components/ui/Button';

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className={styles.hero}>
      <div className={styles.bg}>
        <div className={styles.orb1} />
        <div className={styles.orb2} />
        <div className={styles.orb3} />
      </div>
      <div className={styles.content}>
        <div className={styles.logo}>
          Task<span className={styles.logoAccent}>Flow</span>
        </div>
        <h1 className={styles.title}>
          Manage tasks with <span className={styles.accent}>clarity</span>
        </h1>
        <p className={styles.subtitle}>
          A premium task management experience with real-time updates, smart
          filtering, and beautiful dark mode.
        </p>
        <div className={styles.actions}>
          <Button size="lg" onClick={() => router.push('/signup')}>
            Get Started Free
          </Button>
          <Button variant="secondary" size="lg" onClick={() => router.push('/login')}>
            Sign In
          </Button>
        </div>
        <div className={styles.features}>
          <div className={styles.feature}>
            <span>⚡</span>
            <span>Real-time updates</span>
          </div>
          <div className={styles.feature}>
            <span>📎</span>
            <span>File attachments</span>
          </div>
          <div className={styles.feature}>
            <span>🌙</span>
            <span>Dark mode</span>
          </div>
          <div className={styles.feature}>
            <span>🔒</span>
            <span>Role-based access</span>
          </div>
        </div>
      </div>
    </div>
  );
}
