// apps/api/src/tasks/tasks.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Task } from '../entities/task.entity';
import { AuditLog } from '../entities/audit-log.entity';
import { UserRole } from '../entities/user-role.entity';

import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';

import { PermissionsGuard } from '../rbac/permissions.guard';

@Module({
  imports: [
    // Register ALL repositories this feature uses (including the guard's)
    TypeOrmModule.forFeature([Task, AuditLog, UserRole]),
  ],
  controllers: [TasksController],
  providers: [
    TasksService,
    PermissionsGuard, // guard injects Repository<UserRole>
  ],
  exports: [
    TasksService,
  ],
})
export class TasksModule {}
