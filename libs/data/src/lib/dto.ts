export type Role = 'OWNER' | 'ADMIN' | 'VIEWER';
export type Permission =
| 'task:create' | 'task:read' | 'task:update' | 'task:delete' | 'audit:read';

export interface JwtPayload { sub: string; email: string; orgId: string; roles: Role[]; }

export interface CreateTaskDto { 
  title: string; 
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string; // ISO date string
  category?: 'Work'|'Personal'; 
  status?: 'todo'|'doing'|'done'; 
  position?: number; 
}
export interface UpdateTaskDto { 
  title?: string; 
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string; // ISO date string
  category?: 'Work'|'Personal'; 
  status?: 'todo'|'doing'|'done'; 
  position?: number; 
}
