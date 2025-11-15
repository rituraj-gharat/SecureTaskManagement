// apps/api/src/audit/audit.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from '../entities/audit-log.entity';
import { UserRole } from '../entities/user-role.entity';
import { AuditController } from './audit.controller';
import { PermissionsGuard } from '../rbac/permissions.guard';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog, UserRole])], // <-- required for @InjectRepository(AuditLog) and PermissionsGuard
  controllers: [AuditController],
  providers: [PermissionsGuard], // <-- needed for the guard to work
})
export class AuditModule {}
