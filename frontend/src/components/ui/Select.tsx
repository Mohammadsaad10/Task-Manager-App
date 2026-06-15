'use client';

import { SelectHTMLAttributes } from 'react';
import styles from './Input.module.css';
import { cn } from '@/lib/utils';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
}

export default function Select({ label, error, options, className, ...props }: SelectProps) {
  return (
    <div className={styles.wrapper}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={cn(styles.inputContainer, error && styles.hasError)}>
        <select className={cn(styles.input, className)} {...props}>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
