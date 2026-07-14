import { Controller, Post, Get, Body, Req, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from '../common/decorators';
import { CurrentUser } from '../common/current-user.decorator';
import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @MinLength(1)
  username: string;

  @IsString()
  @MinLength(1)
  password: string;
}

export class RefreshDto {
  @IsString()
  @MinLength(1)
  refresh_token: string;
}

/**
 * 鉴权接口（对齐 SPEC-05 §6.1）
 *
 * 路由前缀 /api/auth（main.ts 全局前缀 + 控制器前缀）
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** 登录，返回 token 对（公开接口） */
  @Public()
  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto, @Req() req: any) {
    const ip = req.ip || '0.0.0.0';
    const data = await this.authService.login(dto.username, dto.password, ip);
    return { success: true, data, error: null };
  }

  /** 刷新 access_token（公开接口，但需携带 refresh_token） */
  @Public()
  @Post('refresh')
  @HttpCode(200)
  async refresh(@Body() dto: RefreshDto) {
    const data = await this.authService.refresh(dto.refresh_token);
    return { success: true, data, error: null };
  }

  /** 登出，加入黑名单 */
  @Post('logout')
  @HttpCode(200)
  async logout(@Req() req: any) {
    const authHeader = req.headers?.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.substring(7)
      : '';
    await this.authService.logout(token);
    return { success: true, data: null, error: null };
  }

  /** 获取当前用户信息 */
  @Get('me')
  async me(@CurrentUser('userId') userId: string) {
    const data = await this.authService.getMe(userId);
    return { success: true, data, error: null };
  }
}
