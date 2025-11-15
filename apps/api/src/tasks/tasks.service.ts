import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../entities/task.entity';
import { AuditLog } from '../entities/audit-log.entity';
import { CreateTaskDto, UpdateTaskDto, JwtPayload } from '@secure-tasks/data';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private readonly repo: Repository<Task>,
    @InjectRepository(AuditLog) private readonly auditRepo: Repository<AuditLog>,
  ) {}

  async listForUser(user: JwtPayload) {
    return this.repo.find({
      where: { org: { id: user.orgId } },
      order: { position: 'ASC' },
    });
  }

  async create(dto: CreateTaskDto, user: JwtPayload) {
    try {
      console.log('[TasksService] Creating task with DTO:', dto);
      console.log('[TasksService] User:', { userId: user.sub, orgId: user.orgId });
      
      const task = this.repo.create({
        title: dto.title,
        description: dto.description,
        priority: dto.priority || 'low', // Default to 'low' if not provided
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        category: dto.category || 'Work',
        status: dto.status || 'todo',
        position: dto.position ?? 0,
        org: { id: user.orgId } as any,
        createdByUserId: user.sub,
      });
      
      console.log('[TasksService] Task entity created:', task);
      const saved = await this.repo.save(task);
      console.log('[TasksService] Task saved successfully:', saved);
      await this.audit(user, 'create', 'task', saved.id, { title: dto.title });
      return saved;
    } catch (error) {
      console.error('[TasksService] Error creating task:', error);
      throw error;
    }
  }

  async update(id: string, dto: UpdateTaskDto, user: JwtPayload) {
    const task = await this.repo.findOne({ where: { id } });
    if (!task || task.org.id !== user.orgId) {
      throw new NotFoundException();
    }
    
    // Convert dueDate string to Date if provided
    const updateData: any = { ...dto };
    if (dto.dueDate !== undefined) {
      updateData.dueDate = dto.dueDate ? new Date(dto.dueDate) : null;
    }
    
    Object.assign(task, updateData);
    const saved = await this.repo.save(task);
    await this.audit(user, 'update', 'task', id, dto ? { ...dto } : {});
    return saved;
  }

  async remove(id: string, user: JwtPayload) {
    const task = await this.repo.findOne({ where: { id } });
    if (!task || task.org.id !== user.orgId) {
      throw new NotFoundException();
    }
    await this.repo.delete(id);
    await this.audit(user, 'delete', 'task', id, {});
    return { deleted: true };
  }

  private async audit(
    user: JwtPayload,
    action: string,
    resource: string,
    resourceId: string,
    meta?: Record<string, unknown>,
  ) {
    await this.auditRepo.save({
      timestamp: new Date().toISOString(),
      userId: user.sub,
      action,
      resource,
      resourceId,
      meta,
    });
    console.log(`[AUDIT] ${user.email} ${action} ${resource}(${resourceId})`, meta ?? '');
  }
}
