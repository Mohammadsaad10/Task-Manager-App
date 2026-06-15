'use client';

import { useState, FormEvent } from 'react';
import { TaskFormData, TaskStatus, Priority } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import styles from './TaskForm.module.css';

interface TaskFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<TaskFormData>;
  onSubmit: (data: TaskFormData) => Promise<void>;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

const STATUS_OPTIONS = [
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'DONE', label: 'Done' },
];

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
];

export default function TaskForm({
  mode,
  initialData,
  onSubmit,
  isSubmitting = false,
  onCancel,
}: TaskFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [status, setStatus] = useState<TaskStatus>(initialData?.status || 'TODO');
  const [priority, setPriority] = useState<Priority>(initialData?.priority || 'MEDIUM');
  const [dueDate, setDueDate] = useState(initialData?.dueDate || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Today at midnight in local time (YYYY-MM-DDTHH:mm format for datetime-local)
  const todayMin = new Date().toISOString().slice(0, 16);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (title.length > 255) newErrors.title = 'Title must be 255 characters or less';
    if (dueDate && new Date(dueDate) < new Date(new Date().toDateString())) {
      newErrors.dueDate = 'Due date cannot be in the past';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit({ title: title.trim(), description, status, priority, dueDate });
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <Input
        label="Title *"
        placeholder="What needs to be done?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={errors.title}
        autoFocus
      />

      <div className={styles.field}>
        <label className={styles.label}>Description</label>
        <textarea
          className={styles.textarea}
          placeholder="Add more details..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>

      <div className={styles.row}>
        <Select
          label="Status"
          options={STATUS_OPTIONS}
          value={status}
          onChange={(e) => setStatus(e.target.value as TaskStatus)}
        />
        <Select
          label="Priority"
          options={PRIORITY_OPTIONS}
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
        />
      </div>

      <Input
        label="Due Date"
        type="datetime-local"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        min={todayMin}
        error={errors.dueDate}
      />

      <div className={styles.actions}>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" isLoading={isSubmitting} fullWidth={!onCancel}>
          {mode === 'create' ? '+ Create Task' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
