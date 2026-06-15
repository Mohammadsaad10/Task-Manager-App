'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useTasks } from '@/hooks/useTasks';
import { useSSE } from '@/hooks/useSSE';
import { Task, TaskFormData, TaskStatus } from '@/types';
import api from '@/lib/api';
import SearchBar from '@/components/SearchBar';
import TaskFilters from '@/components/TaskFilters';
import TaskCard from '@/components/TaskCard';
import TaskList from '@/components/TaskList';
import TaskForm from '@/components/TaskForm';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Pagination from '@/components/ui/Pagination';
import Spinner from '@/components/ui/Spinner';
import styles from './dashboard.module.css';

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const isAdmin = user?.role === 'ADMIN';
  const { tasks, setTasks, pagination, isLoading, filters, setFilters, refetch } = useTasks(isAdmin);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // SSE real-time updates
  const handleSSEUpdate = useCallback(() => {
    refetch(); // Background refetch, won't show loading spinner
  }, [refetch]);

  useSSE({
    enabled: isAuthenticated,
    onTaskCreated: handleSSEUpdate,
    onTaskUpdated: handleSSEUpdate,
    onTaskDeleted: handleSSEUpdate,
  });

  // Create task (Optimistic)
  const handleCreate = async (data: TaskFormData) => {
    setIsSubmitting(true);
    try {
      const res = await api.post('/tasks', data);
      setTasks((prev) => [res.data.data, ...prev]); // Optimistically add at top
      showToast('Task created!', 'success');
      setShowCreateModal(false);
      refetch(); // Re-sync background
    } catch {
      showToast('Failed to create task', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Optimistic status toggle
  const handleStatusToggle = async (task: Task) => {
    const newStatus: TaskStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
    
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
    );

    try {
      await api.patch(`/tasks/${task.id}`, { status: newStatus });
      showToast(newStatus === 'DONE' ? 'Task completed!' : 'Task reopened', 'success');
      refetch(); // Re-sync background
    } catch {
      // Revert on error
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: task.status } : t))
      );
      showToast('Failed to update task', 'error');
    }
  };

  // Optimistic delete task
  const handleDelete = async () => {
    if (!deleteTarget) return;
    const targetId = deleteTarget.id;
    
    // Optimistic UI update
    setTasks((prev) => prev.filter((t) => t.id !== targetId));
    setDeleteTarget(null);

    try {
      await api.delete(`/tasks/${targetId}`);
      showToast('Task deleted', 'info');
      refetch(); // Re-sync background
    } catch {
      // Revert on error (refetch will restore the task)
      refetch();
      showToast('Failed to delete task', 'error');
    }
  };

  // Search handler — updates both local search state and filters
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setFilters({ search: value || undefined });
  };

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className="heading-1">{isAdmin ? 'Admin Dashboard' : 'Dashboard'}</h1>
            <p className="body-text">{isAdmin ? 'Manage all user tasks' : 'Manage your tasks efficiently'}</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            + New Task
          </Button>
        </div>

        {/* Toolbar */}
        <div className={styles.toolbar}>
          <TaskFilters
            activeStatus={filters.status}
            onStatusChange={(status) => setFilters({ status })}
          />
          <div className={styles.toolbarRight}>
            <SearchBar value={search} onChange={handleSearchChange} />
            <select
              className={styles.sortSelect}
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-') as [typeof filters.sortBy, typeof filters.sortOrder];
                setFilters({ sortBy, sortOrder });
              }}
            >
              <option value="createdAt-desc">Newest first</option>
              <option value="createdAt-asc">Oldest first</option>
              <option value="dueDate-asc">Due date ↑</option>
              <option value="dueDate-desc">Due date ↓</option>
              <option value="priority-desc">Priority ↓</option>
              <option value="priority-asc">Priority ↑</option>
            </select>
            <div className={styles.viewToggle}>
              <button
                className={`${styles.viewBtn} ${viewMode === 'list' ? styles.viewBtnActive : ''}`}
                onClick={() => setViewMode('list')}
                title="List view"
              >
                ☰
              </button>
              <button
                className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.viewBtnActive : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid view"
              >
                ▦
              </button>
            </div>
          </div>
        </div>

        {/* Task Grid */}
        {isLoading ? (
          <div className={styles.loading}>
            <Spinner size="lg" />
          </div>
        ) : tasks.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyIcon}>📝</p>
            <h3>No tasks found</h3>
            <p className="body-text">
              {filters.search || filters.status
                ? 'Try different filters or search terms'
                : 'Create your first task to get started'}
            </p>
            {!filters.search && !filters.status && (
              <Button onClick={() => setShowCreateModal(true)} className="mt-3">
                + Create Task
              </Button>
            )}
          </div>
        ) : (
          <>
            {viewMode === 'list' ? (
              <TaskList
                tasks={tasks}
                onStatusToggle={handleStatusToggle}
                onDelete={setDeleteTarget}
              />
            ) : (
              <div className="grid-responsive">
                {tasks.map((task, i) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    index={i}
                    onStatusToggle={handleStatusToggle}
                    onDelete={setDeleteTarget}
                  />
                ))}
              </div>
            )}
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

      {/* Create Task Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Task"
      >
        <TaskForm
          mode="create"
          onSubmit={handleCreate}
          isSubmitting={isSubmitting}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Task"
        size="sm"
      >
        <p className="body-text" style={{ marginBottom: 20 }}>
          Are you sure you want to delete <strong>&quot;{deleteTarget?.title}&quot;</strong>? This action cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
