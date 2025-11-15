import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { UserRole } from '../entities/user-role.entity';
import { Organization } from '../entities/organization.entity';
import { TeamService } from './team.service';
import { TeamController } from './team.controller';
import { PermissionsGuard } from '../rbac/permissions.guard';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserRole, Organization])],
  controllers: [TeamController],
  providers: [TeamService, PermissionsGuard], // <-- needed for the guard to work
  exports: [TeamService],
})
export class TeamModule {}

