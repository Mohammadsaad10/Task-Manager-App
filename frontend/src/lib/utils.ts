import { TaskStatus, Priority } from '@/types';
import type { BadgeVariant } from '@/components/ui/Badge';

/** Map TaskStatus to Badge variant */
export function getStatusBadgeVariant(status: TaskStatus): BadgeVariant {
  const map: Record<TaskStatus, BadgeVariant> = {
    TODO: 'status-todo',
    IN_PROGRESS: 'status-in-progress',
    DONE: 'status-done',
  };
  return map[status];
}

/** Map Priority to Badge variant */
export function getPriorityBadgeVariant(priority: Priority): BadgeVariant {
  const map: Record<Priority, BadgeVariant> = {
    LOW: 'priority-low',
    MEDIUM: 'priority-medium',
    HIGH: 'priority-high',
  };
  return map[priority];
}

/** Format ISO date string to readable format: "Jun 13, 2026" */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Format ISO date to relative time: "2 hours ago", "3 days ago" */
export function timeAgo(dateString: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);

  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
    }
  }
  return 'Just now';
}

/** Format file size in bytes to human-readable: "2.4 MB", "340 KB" */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
}

/** Get display label for task status */
export function getStatusLabel(status: TaskStatus): string {
  const labels: Record<TaskStatus, string> = {
    TODO: 'To Do',
    IN_PROGRESS: 'In Progress',
    DONE: 'Done',
  };
  return labels[status];
}

/** Get display label for priority */
export function getPriorityLabel(priority: Priority): string {
  const labels: Record<Priority, string> = {
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
  };
  return labels[priority];
}

/** Check if a date is in the past */
export function isOverdue(dateString: string | null): boolean {
  if (!dateString) return false;
  return new Date(dateString) < new Date();
}

/** Classname helper — filters out falsy values and joins */
export function cn(...classes: (string | boolean | undefined | null | 0 | 0n)[]): string {
  return classes.filter((c): c is string => typeof c === 'string' && c.length > 0).join(' ');
}
