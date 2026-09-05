import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../audit/audit.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * (a) Retorna exclusivamente quem está na lista de espera (WaitlistEntry).
   * Entidade 100% separada de compras/ingressos.
   */
  async getWaitlist() {
    return this.prisma.waitlistEntry.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * (b) Retorna exclusivamente os pedidos e ingressos (Order).
   * Detalha status de pagamento (PENDING, PAID, REJECTED), valores e dados do comprador.
   */
  async getOrders() {
    return this.prisma.order.findMany({
      include: {
        ticketTier: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Métricas consolidadas em tempo real do banco de dados Postgres.
   */
  async getDashboardMetrics() {
    const [orders, waitlistCount, totalPaidRevenueAgg] = await Promise.all([
      this.prisma.order.findMany({
        include: { ticketTier: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.waitlistEntry.count(),
      this.prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: OrderStatus.PAID },
      }),
    ]);

    const paidOrders = orders.filter((o) => o.status === OrderStatus.PAID);
    const checkedInCount = paidOrders.filter((o) => o.checkedIn).length;
    const pendingOrdersCount = orders.filter((o) => o.status === OrderStatus.PENDING).length;

    return {
      totalTicketsSold: paidOrders.reduce((sum, o) => sum + o.quantity, 0),
      totalRevenue: Number(totalPaidRevenueAgg._sum.totalAmount || 0),
      paidOrdersCount: paidOrders.length,
      pendingOrdersCount,
      waitlistCount,
      checkedInCount,
      orders,
    };
  }

  /**
   * Validação de Token de Ingresso na Portaria / Scanner.
   */
  async verifyCheckin(token: string) {
    const cleanToken = token.trim().toUpperCase();

    const order = await this.prisma.order.findFirst({
      where: {
        ticketToken: {
          equals: cleanToken,
          mode: 'insensitive',
        },
      },
      include: { ticketTier: true },
    });

    if (!order) {
      throw new NotFoundException('Ingresso ou código não encontrado no sistema.');
    }

    return {
      found: true,
      type: 'TICKET',
      data: {
        id: order.id,
        token: order.ticketToken,
        buyerName: order.buyerName,
        ticketName: order.ticketTier.name,
        category: order.ticketTier.category,
        batch: order.ticketTier.batch,
        quantity: order.quantity,
        totalAmount: order.totalAmount,
        paymentStatus: order.status,
        checkedIn: order.checkedIn,
        checkedInAt: order.checkedInAt,
        paidAt: order.paidAt,
      },
    };
  }

  /**
   * Confirmação de entrada na portaria.
   */
  async confirmCheckin(token: string, adminEmail?: string) {
    const cleanToken = token.trim().toUpperCase();

    const order = await this.prisma.order.findFirst({
      where: {
        ticketToken: {
          equals: cleanToken,
          mode: 'insensitive',
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Ingresso não localizado.');
    }

    if (order.status !== OrderStatus.PAID) {
      throw new BadRequestException(
        `ENTRADA NEGADA: O pagamento deste pedido encontra-se com status "${order.status}".`,
      );
    }

    if (order.checkedIn) {
      throw new BadRequestException(
        `ATENÇÃO: Este ingresso JÁ FOI UTILIZADO anteriormente em ${order.checkedInAt?.toLocaleString('pt-BR')}!`,
      );
    }

    const updated = await this.prisma.order.update({
      where: { id: order.id },
      data: {
        checkedIn: true,
        checkedInAt: new Date(),
      },
    });

    await this.auditService.log({
      action: 'CHECKIN_PERFORMED',
      entity: 'Order',
      entityId: order.id,
      details: { token: cleanToken, performedBy: adminEmail },
    });

    return {
      success: true,
      message: 'ENTRADA CONFIRMADA COM SUCESSO! Bem-vindo ao Hotel Cortez.',
      order: updated,
    };
  }

  /**
   * Consulta os logs de auditoria de segurança.
   */
  async getAuditLogs() {
    return this.auditService.getRecentLogs(100);
  }
}
