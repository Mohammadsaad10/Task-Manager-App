import { Request } from 'express';
import { Role } from '@prisma/client';

/** Express request augmented with authenticated user data */
export interface AuthRequest extends Request {
  user: {
    id: string;
    email: string;
    role: Role;
  };
}

/** Standard pagination parameters */
export interface PaginationQuery {
  page: number;
  limit: number;
}

/** Task filtering, sorting, and pagination parameters */
export interface TaskFilterQuery extends PaginationQuery {
  status?: 'TODO' | 'IN_PROGRESS' | 'DONE';
  search?: string;
  sortBy: 'dueDate' | 'priority' | 'createdAt';
  sortOrder: 'asc' | 'desc';
}

/** Pagination metadata in API responses */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Field-level change record for activity logging */
export interface FieldChange {
  field: string;
  oldValue: string | null;
  newValue: string | null;
}
