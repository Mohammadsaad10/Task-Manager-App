'use client';

import { TaskStatus } from '@/types';
import styles from './TaskFilters.module.css';
import { cn } from '@/lib/utils';

interface TaskFiltersProps {
  activeStatus?: TaskStatus;
  onStatusChange: (status?: TaskStatus) => void;
}

const FILTERS: { value?: TaskStatus; label: string }[] = [
  { value: undefined, label: 'All' },
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'DONE', label: 'Done' },
];

export default function TaskFilters({ activeStatus, onStatusChange }: TaskFiltersProps) {
  return (
    <div className={styles.filters}>
      {FILTERS.map((filter) => (
        <button
          key={filter.label}
          className={cn(
            styles.pill,
            activeStatus === filter.value && styles.active
          )}
          onClick={() => onStatusChange(filter.value)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
