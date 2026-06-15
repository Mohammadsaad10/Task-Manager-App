import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        textAlign: 'center',
        padding: 24,
      }}
    >
      <p style={{ fontSize: '4rem' }}>🔍</p>
      <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>404 — Page Not Found</h1>
      <p style={{ color: 'var(--text-secondary)' }}>
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/dashboard"
        style={{
          marginTop: 16,
          padding: '10px 24px',
          background: 'var(--accent-gradient)',
          color: 'white',
          borderRadius: 'var(--radius-md)',
          fontWeight: 600,
        }}
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
