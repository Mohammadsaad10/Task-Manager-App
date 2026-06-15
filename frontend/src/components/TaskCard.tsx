'use client';

import Link from 'next/link';
import { Task } from '@/types';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { getStatusLabel, getPriorityLabel, formatDate, isOverdue, cn, getStatusBadgeVariant, getPriorityBadgeVariant } from '@/lib/utils';
import styles from './TaskCard.module.css';

interface TaskCardProps {
  task: Task;
  onStatusToggle?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  index?: number;
}

export default function TaskCard({ task, onStatusToggle, onDelete, index = 0 }: TaskCardProps) {
  const statusVariant = getStatusBadgeVariant(task.status);
  const priorityVariant = getPriorityBadgeVariant(task.priority);
  const overdue = task.status !== 'DONE' && isOverdue(task.dueDate);

  return (
    <div
      className={styles.card}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className={styles.header}>
        <div className={styles.badges}>
          <Badge variant={statusVariant}>{getStatusLabel(task.status)}</Badge>
          <Badge variant={priorityVariant}>{getPriorityLabel(task.priority)}</Badge>
        </div>
        {task._count && task._count.attachments > 0 && (
          <span className={styles.attachCount}>📎 {task._count.attachments}</span>
        )}
      </div>

      <Link href={`/tasks/${task.id}`} className={styles.titleLink}>
        <h3 className={styles.title}>{task.title}</h3>
      </Link>

      {task.description && (
        <p className={styles.description}>{task.description}</p>
      )}

      {task.dueDate && (
        <div className={cn(styles.dueDate, overdue && styles.overdue)}>
          <span>📅 {formatDate(task.dueDate)}</span>
          {overdue && <span className={styles.overdueLabel}>Overdue</span>}
        </div>
      )}

      {task.user && (
        <p className={styles.owner}>👤 {task.user.name}</p>
      )}

      <div className={styles.actions}>
        {onStatusToggle && (
          <Button
            variant={task.status === 'DONE' ? 'secondary' : 'primary'}
            size="sm"
            onClick={() => onStatusToggle(task)}
            aria-label="Toggle task status"
          >
            {task.status === 'DONE' ? '↩ Undo' : '✓ Complete'}
          </Button>
        )}
        {onDelete && (
          <Button variant="danger" size="sm" onClick={() => onDelete(task)} aria-label="Delete task">
            🗑 Delete
          </Button>
        )}
      </div>
    </div>
  );
}
