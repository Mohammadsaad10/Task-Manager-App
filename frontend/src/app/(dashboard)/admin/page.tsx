'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTasks } from '@/hooks/useTasks';
import TaskList from '@/components/TaskList';
import TaskFilters from '@/components/TaskFilters';
import SearchBar from '@/components/SearchBar';
import Pagination from '@/components/ui/Pagination';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';
import styles from './admin.module.css';

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { tasks, pagination, isLoading, filters, setFilters } = useTasks(true);
  const [search, setSearch] = useState('');

  // Redirect non-admin users
  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.replace('/dashboard');
    }
  }, [user, router]);

  if (!user || user.role !== 'ADMIN') return null;

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setFilters({ search: value || undefined });
  };

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <div>
            <h1 className="heading-1">
              Admin Panel <Badge variant="role-admin">ADMIN</Badge>
            </h1>
            <p className="body-text">View and manage all user tasks</p>
          </div>
        </div>

        <div className={styles.toolbar}>
          <TaskFilters
            activeStatus={filters.status}
            onStatusChange={(status) => setFilters({ status })}
          />
          <SearchBar value={search} onChange={handleSearchChange} />
        </div>

        {isLoading ? (
          <div className={styles.loading}><Spinner size="lg" /></div>
        ) : tasks.length === 0 ? (
          <div className={styles.empty}>
            <p>No tasks found</p>
          </div>
        ) : (
          <>
            <TaskList tasks={tasks} />
            {pagination && (
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                total={pagination.total}
                limit={pagination.limit}
                onPageChange={(page) => setFilters({ page })}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
