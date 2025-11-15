import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequirePerms, CurrentUser } from '@secure-tasks/auth';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { CreateTaskDto, UpdateTaskDto, JwtPayload } from '@secure-tasks/data';
import { TasksService } from './tasks.service';
import { AuditLog } from '../entities/audit-log.entity';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly svc: TasksService) {}

  @RequirePerms('task:create')
  @Post()
  create(@Body() dto: CreateTaskDto, @CurrentUser() user: JwtPayload) {
    return this.svc.create(dto, user);
  }

  @RequirePerms('task:read')
  @Get()
  list(@CurrentUser() user: JwtPayload) {
    return this.svc.listForUser(user);
  }

  @RequirePerms('task:update')
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.svc.update(id, dto, user);
  }

  @RequirePerms('task:delete')
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.svc.remove(id, user);
  }
}

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('audit-log')
export class AuditController {
  constructor(
    @InjectRepository(AuditLog)
    private readonly repo: Repository<AuditLog>,
  ) {}

  @RequirePerms('audit:read')
  @Get()
  list() {
    return this.repo.find({ order: { timestamp: 'DESC' }, take: 200 });
  }
}
