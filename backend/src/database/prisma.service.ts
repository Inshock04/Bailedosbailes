import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error', 'warn'],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Prisma conectado com sucesso ao banco PostgreSQL.');
    } catch (err) {
      this.logger.error('Erro ao conectar ao PostgreSQL via Prisma:', err);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Prisma desconectado.');
  }
}
