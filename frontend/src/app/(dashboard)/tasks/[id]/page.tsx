'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { Task, ActivityLog, Attachment, TaskFormData } from '@/types';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import TaskForm from '@/components/TaskForm';
import ActivityTimeline from '@/components/ActivityTimeline';
import { formatDate, getStatusLabel, getPriorityLabel, isOverdue, formatFileSize, getStatusBadgeVariant, getPriorityBadgeVariant } from '@/lib/utils';
import styles from './taskDetail.module.css';

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const taskId = params.id as string;

  const [task, setTask] = useState<Task | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fetchTask = useCallback(async () => {
    try {
      const [taskRes, activityRes, attachRes] = await Promise.all([
        api.get(`/tasks/${taskId}`),
        api.get(`/tasks/${taskId}/activity`),
        api.get(`/tasks/${taskId}/attachments`),
      ]);
      setTask(taskRes.data.data);
      setActivities(activityRes.data.data);
      setAttachments(attachRes.data.data);
    } catch {
      showToast('Failed to load task', 'error');
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  }, [taskId, showToast, router]);

  useEffect(() => { fetchTask(); }, [fetchTask]);

  const handleEdit = async (data: TaskFormData) => {
    setIsSubmitting(true);
    try {
      await api.patch(`/tasks/${taskId}`, data);
      showToast('Task updated!', 'success');
      setShowEditModal(false);
      fetchTask();
    } catch {
      showToast('Failed to update task', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('File must be smaller than 5MB', 'error');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      await api.post(`/tasks/${taskId}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showToast('File uploaded!', 'success');
      fetchTask();
    } catch {
      showToast('Failed to upload file', 'error');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    try {
      await api.delete(`/tasks/${taskId}/attachments/${attachmentId}`);
      showToast('Attachment removed', 'info');
      fetchTask();
    } catch {
      showToast('Failed to remove attachment', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loading}><Spinner size="lg" /></div>
    );
  }

  if (!task) return null;

  const statusVariant = getStatusBadgeVariant(task.status);
  const priorityVariant = getPriorityBadgeVariant(task.priority);
  const overdue = task.status !== 'DONE' && isOverdue(task.dueDate);

  return (
    <div className={styles.page}>
      <div className="container">
        <button className={styles.back} onClick={() => router.push('/dashboard')}>
          ← Back to Dashboard
        </button>

        <div className={styles.layout}>
          {/* Main Content */}
          <div className={styles.main}>
            <div className={styles.cardGlass}>
              <div className={styles.topRow}>
                <div className={styles.badges}>
                  <Badge variant={statusVariant}>{getStatusLabel(task.status)}</Badge>
                  <Badge variant={priorityVariant}>{getPriorityLabel(task.priority)}</Badge>
                  {overdue && <span className={styles.overdue}>⚠ Overdue</span>}
                </div>
                <Button variant="secondary" size="sm" onClick={() => setShowEditModal(true)}>
                  ✏️ Edit
                </Button>
              </div>

              <h1 className={styles.title}>{task.title}</h1>

              {task.description && (
                <p className={styles.description}>{task.description}</p>
              )}

              <div className={styles.meta}>
                {task.dueDate && (
                  <div className={styles.metaItem}>
                    <span>📅</span> Due: {formatDate(task.dueDate)}
                  </div>
                )}
                <div className={styles.metaItem}>
                  <span>🕐</span> Created: {formatDate(task.createdAt)}
                </div>
                <div className={styles.metaItem}>
                  <span>✏️</span> Updated: {formatDate(task.updatedAt)}
                </div>
              </div>
            </div>

            {/* Attachments */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className="heading-3">📎 Attachments ({attachments.length})</h2>
                <label className={styles.uploadBtn}>
                  {isUploading ? <Spinner size="sm" /> : '+ Upload'}
                  <input
                    type="file"
                    hidden
                    onChange={handleFileUpload}
                    accept="image/*,.pdf,.doc,.docx,.txt"
                  />
                </label>
              </div>
              {attachments.length === 0 ? (
                <p className="caption">No attachments yet</p>
              ) : (
                <div className={styles.attachList}>
                  {attachments.map((att) => (
                    <div key={att.id} className={styles.attachItem}>
                      <div className={styles.attachInfo}>
                        <span className={styles.attachIcon}>
                          {att.fileType.startsWith('image') ? '🖼️' : '📄'}
                        </span>
                        <div>
                          <a
                            href={att.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.attachName}
                          >
                            {att.fileName}
                          </a>
                          <span className={styles.attachSize}>
                            {formatFileSize(att.fileSize)}
                          </span>
                        </div>
                      </div>
                      <button
                        className={styles.attachDelete}
                        onClick={() => handleDeleteAttachment(att.id)}
                      >
                        🗑
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar — Activity */}
          <aside className={styles.sidebar}>
            <h2 className="heading-3">📜 Activity</h2>
            <ActivityTimeline activities={activities} />
          </aside>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Task"
      >
        <TaskForm
          mode="edit"
          initialData={{
            title: task.title,
            description: task.description || '',
            status: task.status,
            priority: task.priority,
            dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : '',
          }}
          onSubmit={handleEdit}
          isSubmitting={isSubmitting}
          onCancel={() => setShowEditModal(false)}
        />
      </Modal>
    </div>
  );
}
