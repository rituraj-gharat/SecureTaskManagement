import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { User } from '../entities/user.entity';
import { Organization } from '../entities/organization.entity';
import { UserRole } from '../entities/user-role.entity';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Organization, UserRole]),
    PassportModule,          // <-- needed for AuthGuard('jwt')
    JwtModule.register({}),  // options are supplied at sign time in AuthService
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy], // <-- register strategy
  exports: [AuthService],
})
export class AuthModule {}
