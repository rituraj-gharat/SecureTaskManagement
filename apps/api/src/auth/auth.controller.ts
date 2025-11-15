// apps/api/src/auth/auth.controller.ts
import { Controller, Post, Body, BadRequestException, InternalServerErrorException, HttpException } from '@nestjs/common';
import { AuthService } from './auth.service';

type RegisterDto = { email: string; password: string; orgName: string };
type LoginDto = { email: string; password: string };

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    try {
      // Register user and get user data
      const userData = await this.auth.register(dto);
      
      // Generate token for the newly registered user
      const token = await this.auth.login(dto.email, dto.password);
      if (!token) throw new BadRequestException('Registration failed');
      
      // Return token in same format as login
      return { access_token: token };
    } catch (error) {
      // If it's already an HttpException, re-throw it
      if (error instanceof HttpException) {
        throw error;
      }
      
      // Log the actual error for debugging
      console.error('[AuthController] Registration error:', error);
      console.error('[AuthController] Error stack:', error?.stack);
      console.error('[AuthController] Error message:', error?.message);
      
      // Return a user-friendly error message
      const errorMessage = error?.message || 'Failed to create account';
      throw new BadRequestException(errorMessage);
    }
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const token = await this.auth.login(dto.email, dto.password);
    if (!token) throw new BadRequestException('Login failed');
    return { access_token: token };
  }
}
