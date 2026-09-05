import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface CreateAuditLogParams {
  action: string;
  entity?: string;
  entityId?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(params: CreateAuditLogParams) {
    try {
      this.logger.log(`[AUDIT] ${params.action} - Entity: ${params.entity || 'N/A'}:${params.entityId || 'N/A'} - IP: ${params.ipAddress || 'unknown'}`);
      return await this.prisma.auditLog.create({
        data: {
          action: params.action,
          entity: params.entity,
          entityId: params.entityId,
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
          details: params.details ? JSON.stringify(params.details) : undefined,
        },
      });
    } catch (error) {
      // Falhas ao salvar audit log nunca devem derrubar o request principal, mas devem ser registradas
      this.logger.error('Falha ao gravar registro de auditoria no banco:', error);
      return null;
    }
  }

  async getRecentLogs(limit: number = 50) {
    return this.prisma.auditLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }
}
