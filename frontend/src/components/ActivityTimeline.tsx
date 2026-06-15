'use client';

import { ActivityLog } from '@/types';
import { timeAgo } from '@/lib/utils';
import styles from './ActivityTimeline.module.css';

interface ActivityTimelineProps {
  activities: ActivityLog[];
}

function getActionIcon(action: string, field?: string | null): string {
  if (action === 'created') return '🆕';
  if (action === 'deleted') return '🗑️';
  if (action === 'status_changed') return '🔄';
  if (field === 'attachment_added') return '📎';
  if (field === 'attachment_removed') return '📎';
  return '✏️';
}

function getActionText(log: ActivityLog): string {
  if (log.action === 'created') return 'created this task';
  if (log.action === 'deleted') return 'deleted this task';
  if (log.action === 'status_changed') {
    return `changed status from ${log.oldValue} to ${log.newValue}`;
  }
  if (log.fieldChanged === 'attachment_added') {
    return `attached ${log.newValue}`;
  }
  if (log.fieldChanged === 'attachment_removed') {
    return `removed ${log.oldValue}`;
  }
  if (log.fieldChanged) {
    return `updated ${log.fieldChanged}`;
  }
  return 'updated this task';
}

export default function ActivityTimeline({ activities }: ActivityTimelineProps) {
  if (activities.length === 0) {
    return <p className={styles.empty}>No activity yet</p>;
  }

  return (
    <div className={styles.timeline}>
      {activities.map((log, i) => (
        <div key={log.id} className={styles.item} style={{ animationDelay: `${i * 60}ms` }}>
          <div className={styles.iconWrap}>
            <span className={styles.icon}>{getActionIcon(log.action, log.fieldChanged)}</span>
            {i < activities.length - 1 && <div className={styles.line} />}
          </div>
          <div className={styles.content}>
            <p className={styles.text}>
              <strong>{log.user.name}</strong>{' '}
              {getActionText(log)}
            </p>
            <span className={styles.time}>{timeAgo(log.createdAt)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
