// apps/api/src/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';

import { User } from '../entities/user.entity';
import { Organization } from '../entities/organization.entity';
import { UserRole } from '../entities/user-role.entity';
import { Role } from '@secure-tasks/data';

type RegisterDto = { email: string; password: string; orgName: string };

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    @InjectRepository(Organization)
    private readonly orgs: Repository<Organization>,
    @InjectRepository(UserRole)
    private readonly roles: Repository<UserRole>,
    private readonly jwt: JwtService,
  ) {}

  async register({ email, password, orgName }: RegisterDto) {
    try {
      console.log('[AuthService] Starting registration for:', email);
      
      const exists = await this.users.findOne({ where: { email } });
      if (exists) {
        throw new BadRequestException('Email already in use');
      }

      // Check if organization name already exists
      const orgExists = await this.orgs.findOne({ where: { name: orgName } });
      if (orgExists) {
        throw new BadRequestException('Organization name already exists. Please choose a different name.');
      }

      // 1) Create org
      console.log('[AuthService] Creating organization:', orgName);
      const org = this.orgs.create({ name: orgName });
      await this.orgs.save(org);
      console.log('[AuthService] Organization created with ID:', org.id);

      // 2) Create user
      console.log('[AuthService] Creating user:', email);
      const passwordHash = await bcrypt.hash(password, 10);
      const user = this.users.create({ email, passwordHash, org });
      await this.users.save(user);
      console.log('[AuthService] User created with ID:', user.id);

      // Validate IDs are set
      if (!user.id) {
        throw new BadRequestException('Failed to create user: user ID is missing');
      }
      if (!org.id) {
        throw new BadRequestException('Failed to create organization: organization ID is missing');
      }

      // 3) Assign OWNER role (match your Role enum: usually 'OWNER')
      console.log('[AuthService] Creating UserRole - userId:', user.id, 'orgId:', org.id, 'role: OWNER');
      try {
        const role = this.roles.create({
          userId: user.id,
          orgId: org.id,
          role: 'OWNER' as Role,
        });
        await this.roles.save(role);
        console.log('[AuthService] UserRole created successfully');
      } catch (roleError) {
        console.error('[AuthService] Error creating UserRole:', roleError);
        // If UserRole creation fails, try to clean up the created user and org
        try {
          await this.users.remove(user);
          await this.orgs.remove(org);
        } catch (cleanupError) {
          console.error('[AuthService] Error during cleanup:', cleanupError);
        }
        throw new BadRequestException('Failed to assign user role. Please try again.');
      }

      return {
        id: user.id,
        orgId: org.id,
        email: user.email,
      };
    } catch (e) {
      // This will show the REAL cause in the Nest logs
      // so we don't have to guess.
      console.error('[AuthService] Error in register:', e);
      console.error('[AuthService] Error name:', e?.name);
      console.error('[AuthService] Error message:', e?.message);
      console.error('[AuthService] Error stack:', e?.stack);
      
      // If it's a database error, extract more details
      if (e?.code || e?.errno || e?.sqlState) {
        console.error('[AuthService] Database error code:', e?.code);
        console.error('[AuthService] Database error errno:', e?.errno);
        console.error('[AuthService] Database error sqlState:', e?.sqlState);
        console.error('[AuthService] Database error sql:', e?.sql);
        
        // Handle SQLite unique constraint violations
        if (e?.code === 'SQLITE_CONSTRAINT_UNIQUE' || e?.code === '23505' || e?.errno === 19) {
          const message = e?.message || '';
          if (message.includes('users.email') || message.includes('email')) {
            throw new BadRequestException('Email already in use');
          } else if (message.includes('organizations.name') || message.includes('name')) {
            throw new BadRequestException('Organization name already exists. Please choose a different name.');
          } else {
            throw new BadRequestException('A record with this information already exists');
          }
        }
      }
      
      // If it's already a BadRequestException, re-throw it
      if (e instanceof BadRequestException) {
        throw e;
      }
      
      throw e;
    }
  }

  async login(email: string, password: string) {
    const user = await this.users.findOne({
      where: { email },
      relations: { org: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const ok = await bcrypt.compare(password, user.passwordHash ?? '');
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Get user roles for this organization
    const userRoles = await this.roles.find({
      where: { userId: user.id, orgId: user.org?.id },
    });
    const roles = userRoles.map(r => r.role);

    const payload = {
      sub: user.id,
      email: user.email,
      orgId: user.org?.id,
      roles,
    };

    const secret = process.env.JWT_SECRET || 'dev-secret';
    const expiresInEnv = process.env.JWT_EXPIRES_IN || '1d';
    const expiresIn: JwtSignOptions['expiresIn'] = expiresInEnv
      ? (Number.isNaN(Number(expiresInEnv))
          ? (expiresInEnv as JwtSignOptions['expiresIn'])
          : Number(expiresInEnv))
      : ('1d' as JwtSignOptions['expiresIn']);

    return this.jwt.signAsync(payload, { secret, expiresIn });
  }
}
