'use client';

import { InputHTMLAttributes, ReactNode } from 'react';
import styles from './Input.module.css';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export default function Input({ label, error, icon, className, ...props }: InputProps) {
  return (
    <div className={styles.wrapper}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={cn(styles.inputContainer, error && styles.hasError)}>
        {icon && <span className={styles.icon}>{icon}</span>}
        <input
          className={cn(styles.input, icon && styles.hasIcon, className)}
          {...props}
        />
      </div>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
