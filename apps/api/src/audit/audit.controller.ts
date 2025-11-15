// apps/api/src/audit/audit.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';
import { RequirePerms, CurrentUser } from '@secure-tasks/auth';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { JwtPayload } from '@secure-tasks/data';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('audit-log')
export class AuditController {
  constructor(@InjectRepository(AuditLog) private readonly repo: Repository<AuditLog>) {}

  @RequirePerms('audit:read')
  @Get()
  list(@CurrentUser() _user: JwtPayload) {
    return this.repo.find({ order: { timestamp: 'DESC' }, take: 200 });
  }
}
