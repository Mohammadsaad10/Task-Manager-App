'use client';

import Link from 'next/link';
import { Task } from '@/types';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { getStatusLabel, getPriorityLabel, formatDate, isOverdue, getStatusBadgeVariant, getPriorityBadgeVariant } from '@/lib/utils';
import styles from './TaskList.module.css';

interface TaskListProps {
  tasks: Task[];
  onStatusToggle?: (task: Task) => void;
  onDelete?: (task: Task) => void;
}

export default function TaskList({ tasks, onStatusToggle, onDelete }: TaskListProps) {
  return (
    <div className={styles.list}>
      {/* Table Header */}
      <div className={styles.header}>
        <span className={styles.colTitle}>Task</span>
        <span className={styles.colStatus}>Status</span>
        <span className={styles.colPriority}>Priority</span>
        <span className={styles.colDate}>Due Date</span>
        <span className={styles.colActions}>Actions</span>
      </div>

      {/* Rows */}
      {tasks.map((task, i) => {
        const overdue = task.status !== 'DONE' && isOverdue(task.dueDate);

        return (
          <div
            key={task.id}
            className={styles.row}
            style={{ animationDelay: `${i * 30}ms` }}
          >
            {/* Title + Description */}
            <div className={styles.colTitle}>
              <Link href={`/tasks/${task.id}`} className={styles.titleLink}>
                {task.title}
              </Link>
              {task.description && (
                <p className={styles.desc}>{task.description}</p>
              )}
              {task.user && (
                <span className={styles.owner}>👤 {task.user.name}</span>
              )}
            </div>

            {/* Status */}
            <div className={styles.colStatus}>
              <Badge variant={getStatusBadgeVariant(task.status)}>
                {getStatusLabel(task.status)}
              </Badge>
            </div>

            {/* Priority */}
            <div className={styles.colPriority}>
              <Badge variant={getPriorityBadgeVariant(task.priority)}>
                {getPriorityLabel(task.priority)}
              </Badge>
            </div>

            {/* Due Date */}
            <div className={styles.colDate}>
              {task.dueDate ? (
                <span className={overdue ? styles.overdue : ''}>
                  {formatDate(task.dueDate)}
                  {overdue && <span className={styles.overdueTag}> Overdue</span>}
                </span>
              ) : (
                <span className={styles.noDate}>—</span>
              )}
            </div>

            {/* Actions */}
            <div className={styles.colActions}>
              {onStatusToggle && (
                <Button
                  variant={task.status === 'DONE' ? 'ghost' : 'primary'}
                  size="sm"
                  onClick={() => onStatusToggle(task)}
                  aria-label="Toggle task status"
                >
                  {task.status === 'DONE' ? '↩ Undo' : '✓ Done'}
                </Button>
              )}
              {onDelete && (
                <Button variant="ghost" size="sm" onClick={() => onDelete(task)} aria-label="Delete task">
                  🗑
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
