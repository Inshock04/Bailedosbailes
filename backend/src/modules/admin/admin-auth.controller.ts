import { Body, Controller, Post, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AdminAuthService } from './admin-auth.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { Request } from 'express';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

@Controller('api/admin')
export class AdminAuthController {
  constructor(private readonly authService: AdminAuthService) {}

  /**
   * Login do Painel Administrativo.
   * Rate limiting rígido: máx 5 tentativas por minuto por IP para proteção contra brute force.
   */
  @Post(['login', 'auth/login'])
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async login(@Body() dto: AdminLoginDto, @Req() req: Request) {
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    return this.authService.login(dto, ip, userAgent);
  }
}
