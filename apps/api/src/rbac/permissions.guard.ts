// apps/api/src/rbac/permissions.guard.ts
import {
    CanActivate,
    ExecutionContext,
    Injectable,
    ForbiddenException,
    UnauthorizedException,
  } from '@nestjs/common';
  import { Reflector } from '@nestjs/core';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  
  import { UserRole } from '../entities/user-role.entity';
  import { REQ_PERMS, aggregatePerms } from '@secure-tasks/auth';
  import type { Permission, Role, JwtPayload } from '@secure-tasks/data';
  
  @Injectable()
  export class PermissionsGuard implements CanActivate {
    constructor(
      private readonly reflector: Reflector,
      @InjectRepository(UserRole) private readonly userRoles: Repository<UserRole>,
    ) {}
  
    async canActivate(ctx: ExecutionContext): Promise<boolean> {
      // 1) If no permissions are required, allow
      const required =
        this.reflector.getAllAndOverride<Permission[]>(REQ_PERMS, [
          ctx.getHandler(),
          ctx.getClass(),
        ]) ?? [];
  
      if (required.length === 0) return true;
  
      // 2) Ensure user is present (JwtAuthGuard should have set req.user)
      const req = ctx.switchToHttp().getRequest();
      const user = req.user as JwtPayload | undefined;
      if (!user) throw new UnauthorizedException('Missing authenticated user');
  
      // 3) Load the user’s roles for this org
      const roles = await this.userRoles.find({
        where: { userId: user.sub, orgId: user.orgId },
      });
  
      // 4) Build the user’s effective permissions (with inheritance)
      const perms = aggregatePerms(roles.map(r => r.role as Role));
  
      // 5) Check all required permissions
      const allowed = required.every(p => perms.has(p));
      if (!allowed) throw new ForbiddenException('Insufficient permissions');
  
      return true;
    }
  }
  