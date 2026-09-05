import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AuditService } from '../audit/audit.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminAuthService {
  private readonly logger = new Logger(AdminAuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly auditService: AuditService,
  ) {}

  async login(dto: AdminLoginDto, ip?: string, userAgent?: string) {
    const cleanEmail = dto.email.trim().toLowerCase();

    // 1. Busca admin no banco
    const user = await this.prisma.adminUser.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      await this.auditService.log({
        action: 'ADMIN_LOGIN_FAILED',
        entity: 'AdminUser',
        ipAddress: ip,
        userAgent: userAgent,
        details: { email: cleanEmail, reason: 'Usuário não encontrado' },
      });
      throw new UnauthorizedException('Credenciais administrativas inválidas.');
    }

    // 2. Compara a senha criptografada via bcrypt
    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!passwordValid) {
      await this.auditService.log({
        action: 'ADMIN_LOGIN_FAILED',
        entity: 'AdminUser',
        entityId: user.id,
        ipAddress: ip,
        userAgent: userAgent,
        details: { email: cleanEmail, reason: 'Senha incorreta' },
      });
      throw new UnauthorizedException('Credenciais administrativas inválidas.');
    }

    // 3. Gera JWT assinado
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('jwt.secret'),
      expiresIn: this.configService.get<string>('jwt.expiresIn') || '8h',
    });

    // 4. Registra login bem-sucedido no Audit Log
    await this.auditService.log({
      action: 'ADMIN_LOGIN_SUCCESS',
      entity: 'AdminUser',
      entityId: user.id,
      ipAddress: ip,
      userAgent: userAgent,
      details: { email: user.email },
    });

    this.logger.log(`Admin autenticado com sucesso: ${user.email} (${ip || 'unknown'})`);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }
}
