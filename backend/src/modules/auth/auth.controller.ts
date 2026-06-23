import { Controller, Post, Get, Body, Req, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { Request } from 'express';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login and receive a JWT token' })
  async login(@Body() dto: LoginDto) {
    const data = await this.authService.login(dto);
    return { message: 'Login successful', data };
  }

  @Public()
  @Post('register-vendor')
  @ApiOperation({ summary: 'Register a new vendor (pending admin approval)' })
  async register(@Body() dto: RegisterDto) {
    const data = await this.authService.register(dto);
    return { message: 'Vendor registered successfully. Pending admin verification.', data };
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  async getMe(@CurrentUser() user: any) {
    const data = await this.authService.getMe(user.id);
    return { message: 'Profile fetched', data };
  }

  @Post('logout')
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({ summary: 'Logout — invalidates the current JWT token' })
  async logout(@Req() req: Request) {
    await this.authService.logout((req as any).token);
    return { message: 'Logged out successfully', data: null };
  }
}
