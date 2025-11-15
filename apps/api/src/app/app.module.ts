import 'dotenv/config';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User, Organization, Task, AuditLog, UserRole } from '../entities';
import { AuthModule } from '../auth/auth.module';
import { TasksModule } from '../tasks/tasks.module';
import { AuditModule } from '../audit/audit.module';
import { TeamModule } from '../team/team.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: (process.env.DB_TYPE as 'sqlite' | 'postgres') ?? 'sqlite',
        database: process.env.DB_PATH ?? './tmp/dev.sqlite',
        host: process.env.DB_HOST,
        port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        entities: [User, Organization, Task, AuditLog, UserRole],
        synchronize: true,
      }),
    }),
    AuthModule,
    TasksModule,
    AuditModule,
    TeamModule,
  ],
})
export class AppModule {}
