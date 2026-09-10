import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdminController, LegacyAdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminAuthController } from './admin-auth.controller';
import { AdminAuthService } from './admin-auth.service';
import { AdminJwtGuard } from './guards/admin-jwt.guard';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: config.get<string>('jwt.expiresIn') || '8h',
        },
      }),
    }),
  ],
  controllers: [AdminController, LegacyAdminController, AdminAuthController],
  providers: [AdminService, AdminAuthService, AdminJwtGuard],
  exports: [AdminService, AdminAuthService, AdminJwtGuard, JwtModule],
})
export class AdminModule {}
