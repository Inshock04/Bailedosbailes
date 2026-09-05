import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { AuditModule } from './modules/audit/audit.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { WaitlistModule } from './modules/waitlist/waitlist.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    // Configuração com suporte a variáveis de ambiente (.env)
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    // Rate Limiting Global com Throttler
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100, // 100 reqs/min por IP por padrão nas rotas gerais
      },
    ]),

    // Banco de Dados PostgreSQL & Serviços Globais
    DatabaseModule,
    AuditModule,
    NotificationsModule,

    // Módulos Funcionais
    WaitlistModule,
    OrdersModule,
    PaymentsModule,
    AdminModule,
  ],
})
export class AppModule {}
