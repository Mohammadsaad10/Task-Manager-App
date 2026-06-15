'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import api from '@/lib/api';
import { Task, TaskFilters, PaginationMeta } from '@/types';
import { useDebounce } from './useDebounce';

import { Dispatch, SetStateAction } from 'react';

interface UseTasksReturn {
  tasks: Task[];
  setTasks: Dispatch<SetStateAction<Task[]>>;
  pagination: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;
  filters: TaskFilters;
  setFilters: (filters: Partial<TaskFilters>) => void;
  refetch: () => void;
}

const DEFAULT_FILTERS: TaskFilters = {
  sortBy: 'createdAt',
  sortOrder: 'desc',
  page: 1,
  limit: 10,
};

/** Hook for fetching, filtering, sorting, and paginating tasks */
export function useTasks(isAdmin: boolean = false): UseTasksReturn {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<TaskFilters>(DEFAULT_FILTERS);

  const debouncedSearch = useDebounce(filters.search, 300);

  const setFilters = useCallback((partial: Partial<TaskFilters>) => {
    setFiltersState((prev) => ({
      ...prev,
      ...partial,
      // Reset to page 1 when filters change (except when page itself changes)
      page: partial.page ?? 1,
    }));
  }, []);

  const fetchTasks = useCallback(async (signal?: AbortSignal, background = false) => {
    if (!background) setIsLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = {
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        page: filters.page,
        limit: filters.limit,
      };
      if (filters.status) params.status = filters.status;
      if (debouncedSearch) params.search = debouncedSearch;

      const endpoint = isAdmin ? '/admin/tasks' : '/tasks';
      const res = await api.get(endpoint, { params, signal });

      setTasks(res.data.data);
      setPagination(res.data.pagination);
    } catch (err: unknown) {
      if (axios.isCancel(err)) return;
      const message = err instanceof Error ? err.message : 'Failed to fetch tasks';
      setError(message);
    } finally {
      if (!background) setIsLoading(false);
    }
  }, [filters.status, filters.sortBy, filters.sortOrder, filters.page, filters.limit, debouncedSearch, isAdmin]);

  useEffect(() => {
    const controller = new AbortController();
    fetchTasks(controller.signal, false);
    return () => controller.abort();
  }, [fetchTasks]);

  return {
    tasks,
    setTasks, // Expose setTasks for optimistic UI
    pagination,
    isLoading,
    error,
    filters,
    setFilters,
    refetch: () => fetchTasks(undefined, true), // Background refetch by default
  };
}
