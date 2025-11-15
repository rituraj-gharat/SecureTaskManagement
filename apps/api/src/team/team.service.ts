import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserRole } from '../entities/user-role.entity';
import { Organization } from '../entities/organization.entity';
import { JwtPayload, Role } from '@secure-tasks/data';

export interface TeamMemberDto {
  userId: string;
  email: string;
  role: Role;
}

export interface UpdateRoleDto {
  role: Role;
}

export interface InviteUserDto {
  email: string;
  role: Role;
}

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(UserRole) private readonly userRoles: Repository<UserRole>,
    @InjectRepository(Organization) private readonly orgs: Repository<Organization>,
  ) {}

  async listMembers(user: JwtPayload): Promise<TeamMemberDto[]> {
    // Check if user has permission to view team members
    const userRoles = await this.userRoles.find({
      where: { userId: user.sub, orgId: user.orgId },
    });
    const roles = userRoles.map(r => r.role as Role);
    const isOwnerOrAdmin = roles.includes('OWNER') || roles.includes('ADMIN');

    if (!isOwnerOrAdmin) {
      throw new ForbiddenException('Only OWNER or ADMIN can view team members');
    }

    // Get all roles for users in the organization
    // This ensures we only return users who have an active role
    const allUserRoles = await this.userRoles.find({
      where: { orgId: user.orgId },
    });

    // Get unique user IDs that have roles
    const userIdsWithRoles = [...new Set(allUserRoles.map(ur => ur.userId))];

    // If no users have roles, return empty array
    if (userIdsWithRoles.length === 0) {
      return [];
    }

    // Get users who have roles in the organization
    const orgUsers = await this.users.find({
      where: { 
        id: In(userIdsWithRoles),
        org: { id: user.orgId } 
      },
      relations: { org: true },
    });

    // Build member list - only include users who have a role
    return orgUsers
      .filter(user => {
        // Only include users who have a role entry (double-check)
        return allUserRoles.some(ur => ur.userId === user.id);
      })
      .map(user => {
        const userRole = allUserRoles.find(ur => ur.userId === user.id);
        return {
          userId: user.id,
          email: user.email,
          role: (userRole?.role as Role) || 'VIEWER',
        };
      });
  }

  async updateRole(userId: string, dto: UpdateRoleDto, currentUser: JwtPayload): Promise<TeamMemberDto> {
    // Check if current user has permission (OWNER or ADMIN)
    const currentUserRoles = await this.userRoles.find({
      where: { userId: currentUser.sub, orgId: currentUser.orgId },
    });
    const roles = currentUserRoles.map(r => r.role as Role);
    const isOwnerOrAdmin = roles.includes('OWNER') || roles.includes('ADMIN');

    if (!isOwnerOrAdmin) {
      throw new ForbiddenException('Only OWNER or ADMIN can update roles');
    }

    // Prevent OWNER from being changed (only other OWNERs can change roles anyway)
    const targetUserRole = await this.userRoles.findOne({
      where: { userId, orgId: currentUser.orgId },
    });

    if (targetUserRole?.role === 'OWNER' && !roles.includes('OWNER')) {
      throw new ForbiddenException('Cannot change OWNER role');
    }

    // Find the user
    const user = await this.users.findOne({
      where: { id: userId, org: { id: currentUser.orgId } },
      relations: { org: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update or create role
    if (targetUserRole) {
      targetUserRole.role = dto.role;
      await this.userRoles.save(targetUserRole);
    } else {
      const newRole = this.userRoles.create({
        userId: user.id,
        orgId: currentUser.orgId,
        role: dto.role,
      });
      await this.userRoles.save(newRole);
    }

    return {
      userId: user.id,
      email: user.email,
      role: dto.role,
    };
  }

  async inviteUser(dto: InviteUserDto, currentUser: JwtPayload): Promise<TeamMemberDto> {
    // Check if current user has permission (OWNER or ADMIN)
    const currentUserRoles = await this.userRoles.find({
      where: { userId: currentUser.sub, orgId: currentUser.orgId },
    });
    const roles = currentUserRoles.map(r => r.role as Role);
    const isOwnerOrAdmin = roles.includes('OWNER') || roles.includes('ADMIN');

    if (!isOwnerOrAdmin) {
      throw new ForbiddenException('Only OWNER or ADMIN can invite users');
    }

    // Check if user exists
    let user = await this.users.findOne({
      where: { email: dto.email },
      relations: { org: true },
    });

    if (!user) {
      throw new BadRequestException('User with this email does not exist. Please ask them to sign up first.');
    }

    // Check if user is already in the organization
    const existingRole = await this.userRoles.findOne({
      where: { userId: user.id, orgId: currentUser.orgId },
    });

    if (existingRole) {
      throw new BadRequestException('User is already a member of this organization');
    }

    // Update user's organization if needed
    if (user.org.id !== currentUser.orgId) {
      // User belongs to different org - update their org membership
      const org = await this.orgs.findOne({ where: { id: currentUser.orgId } });
      if (!org) {
        throw new NotFoundException('Organization not found');
      }
      user.org = org;
      await this.users.save(user);
    }

    // Assign role
    const newRole = this.userRoles.create({
      userId: user.id,
      orgId: currentUser.orgId,
      role: dto.role,
    });
    await this.userRoles.save(newRole);

    return {
      userId: user.id,
      email: user.email,
      role: dto.role,
    };
  }

  async removeMember(userId: string, currentUser: JwtPayload): Promise<{ deleted: boolean }> {
    // Check if current user has permission (OWNER or ADMIN)
    const currentUserRoles = await this.userRoles.find({
      where: { userId: currentUser.sub, orgId: currentUser.orgId },
    });
    const roles = currentUserRoles.map(r => r.role as Role);
    const isOwnerOrAdmin = roles.includes('OWNER') || roles.includes('ADMIN');

    if (!isOwnerOrAdmin) {
      throw new ForbiddenException('Only OWNER or ADMIN can remove team members');
    }

    // Prevent deleting yourself
    if (userId === currentUser.sub) {
      throw new BadRequestException('Cannot remove yourself from the team');
    }

    // Find the target user
    const user = await this.users.findOne({
      where: { id: userId, org: { id: currentUser.orgId } },
      relations: { org: true },
    });

    if (!user) {
      throw new NotFoundException('User not found in this organization');
    }

    // Check if target user is OWNER
    const targetUserRole = await this.userRoles.findOne({
      where: { userId, orgId: currentUser.orgId },
    });

    if (targetUserRole?.role === 'OWNER') {
      // Count how many OWNERs exist in this organization
      const ownerRoles = await this.userRoles.find({
        where: { orgId: currentUser.orgId, role: 'OWNER' as any },
      });

      if (ownerRoles.length <= 1) {
        throw new BadRequestException('Cannot remove the last OWNER from the organization');
      }

      // Only allow if current user is also OWNER
      if (!roles.includes('OWNER')) {
        throw new ForbiddenException('Only OWNER can remove another OWNER');
      }
    }

    // Remove the user's role (they remain in the system but lose access to this org)
    if (targetUserRole) {
      await this.userRoles.remove(targetUserRole);
    }

    // Optionally: Remove user from organization (set org to null or another org)
    // For now, we'll keep them in the org but without a role
    // If you want to completely remove them, uncomment this:
    // user.org = null;
    // await this.users.save(user);

    return { deleted: true };
  }
}

