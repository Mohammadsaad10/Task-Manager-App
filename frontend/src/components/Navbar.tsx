'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ThemeToggle from '@/components/ui/ThemeToggle';
import styles from './Navbar.module.css';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  if (!user) return null;

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link href="/dashboard" className={styles.logo}>
          <span>📋</span>
          <span className={styles.logoText}>TaskFlow</span>
        </Link>

        <div className={cn(styles.links, menuOpen && styles.linksOpen)}>
          <Link
            href="/dashboard"
            className={cn(styles.link, pathname === '/dashboard' && styles.linkActive)}
            onClick={() => setMenuOpen(false)}
          >
            Dashboard
          </Link>
        </div>

        <div className={styles.actions}>
          <ThemeToggle />
          <div className={styles.userMenu}>
            <button
              className={styles.userButton}
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              <span className={styles.avatar}>
                {user.name.charAt(0).toUpperCase()}
              </span>
              <span className={styles.userName}>{user.name}</span>
              <span className={styles.chevron}>▾</span>
            </button>
            {userMenuOpen && (
              <div className={styles.dropdown}>
                <p className={styles.dropdownEmail}>{user.email}</p>
                <button
                  className={styles.dropdownItem}
                  onClick={() => {
                    setUserMenuOpen(false);
                    logout();
                  }}
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>

          <button
            className={styles.hamburger}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>
    </nav>
  );
}
