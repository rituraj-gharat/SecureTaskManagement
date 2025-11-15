import { Permission, Role } from '@secure-tasks/data';

export const ROLE_PERMS: Record<Role, Permission[]> = {
  OWNER: ['task:create', 'task:read', 'task:update', 'task:delete', 'audit:read'],
  ADMIN: ['task:create', 'task:read', 'task:update', 'task:delete', 'audit:read'],
  VIEWER: ['task:read'],
};

export const inherits = (role: Role): Role[] => {
  if (role === 'OWNER') return ['OWNER', 'ADMIN', 'VIEWER'];
  if (role === 'ADMIN') return ['ADMIN', 'VIEWER'];
  return ['VIEWER'];
};

export const aggregatePerms = (roles: Role[]): Set<Permission> => {
  const set = new Set<Permission>();
  roles.flatMap(inherits).forEach((r) => ROLE_PERMS[r].forEach((p) => set.add(p)));
  return set;
};
