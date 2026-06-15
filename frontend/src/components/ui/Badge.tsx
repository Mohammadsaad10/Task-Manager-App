'use client';

import { ReactNode } from 'react';
import styles from './Badge.module.css';
import { cn } from '@/lib/utils';

export type BadgeVariant =
  | 'status-todo'
  | 'status-in-progress'
  | 'status-done'
  | 'priority-low'
  | 'priority-medium'
  | 'priority-high'
  | 'role-admin';

interface BadgeProps {
  variant: BadgeVariant;
  children: ReactNode;
  className?: string;
}

export default function Badge({ variant, children, className }: BadgeProps) {
  return (
    <span className={cn(styles.badge, styles[variant], className)}>
      {children}
    </span>
  );
}
