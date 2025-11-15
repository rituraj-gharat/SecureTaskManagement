import { Controller, Get, Put, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { RequirePerms, CurrentUser } from '@secure-tasks/auth';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { JwtPayload, Role } from '@secure-tasks/data';
import { TeamService, UpdateRoleDto, InviteUserDto } from './team.service';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @RequirePerms('audit:read') // Use audit:read as proxy for team management
  @Get('members')
  listMembers(@CurrentUser() user: JwtPayload) {
    return this.teamService.listMembers(user);
  }

  @RequirePerms('audit:read') // Use audit:read as proxy for team management
  @Put('members/:userId/role')
  updateRole(
    @Param('userId') userId: string,
    @Body() dto: UpdateRoleDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.teamService.updateRole(userId, dto, user);
  }

  @RequirePerms('audit:read') // Use audit:read as proxy for team management
  @Post('members/invite')
  inviteUser(
    @Body() dto: InviteUserDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.teamService.inviteUser(dto, user);
  }

  @RequirePerms('audit:read') // Use audit:read as proxy for team management
  @Delete('members/:userId')
  removeMember(
    @Param('userId') userId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.teamService.removeMember(userId, user);
  }
}

