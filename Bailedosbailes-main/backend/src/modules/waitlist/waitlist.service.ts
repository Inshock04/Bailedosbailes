import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateWaitlistDto } from './dto/create-waitlist.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class WaitlistService {
  private readonly logger = new Logger(WaitlistService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  private sanitizePhone(phone: string): string {
    return phone.replace(/\D/g, '');
  }

  async create(dto: CreateWaitlistDto, ip?: string, userAgent?: string) {
    const cleanPhone = this.sanitizePhone(dto.phone);
    const cleanEmail = dto.email.trim().toLowerCase();
    const cleanName = dto.name.trim();

    // Verifica se já existe registro com mesmo telefone ou e-mail na lista de espera
    const existing = await this.prisma.waitlistEntry.findFirst({
      where: {
        OR: [
          { email: cleanEmail },
          { phone: cleanPhone },
        ],
      },
    });

    if (existing) {
      throw new ConflictException(
        'Este e-mail ou telefone já está cadastrado na lista de espera do Hotel Cortez.',
      );
    }

    const entry = await this.prisma.waitlistEntry.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        notes: dto.notes,
      },
    });

    await this.auditService.log({
      action: 'WAITLIST_ENTRY_CREATED',
      entity: 'WaitlistEntry',
      entityId: entry.id,
      ipAddress: ip,
      userAgent: userAgent,
      details: { name: entry.name, email: entry.email },
    });

    this.logger.log(`Nova entrada na Lista de Espera: ${entry.name} (${entry.email})`);

    return {
      success: true,
      message: 'Nome adicionado com sucesso à Lista de Espera do Hotel Cortez!',
      waitlistId: entry.id,
      positionEstimate: await this.prisma.waitlistEntry.count({
        where: { createdAt: { lte: entry.createdAt } },
      }),
    };
  }

  async findAll() {
    return this.prisma.waitlistEntry.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async count() {
    return this.prisma.waitlistEntry.count();
  }
}
