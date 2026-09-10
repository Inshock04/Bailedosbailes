import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import crypto from 'crypto';
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
      purchasedTickets: orders.map((order) => this.mapOrderToTicket(order)),
    };
  }

  async searchTickets(query?: string) {
    const term = query?.trim();
    const orders = await this.prisma.order.findMany({
      where: term ? {
        OR: [
          { buyerName: { contains: term, mode: 'insensitive' } },
          { buyerPhone: { contains: term } },
          { buyerEmail: { contains: term, mode: 'insensitive' } },
        ],
      } : undefined,
      include: { ticketTier: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return { tickets: orders.map((order) => this.mapOrderToTicket(order)) };
  }

  async createTicket(name: string, phone: string) {
    const cleanName = name?.trim();
    const cleanPhone = phone?.replace(/\D/g, '');
    if (!cleanName || !cleanPhone) {
      throw new BadRequestException('Nome e telefone são obrigatórios.');
    }

    const tier = await this.prisma.ticketTier.findFirst({
      where: { active: true, availableQuota: { gt: 0 } },
      orderBy: { price: 'asc' },
    });
    if (!tier) throw new BadRequestException('Não há ingressos disponíveis.');

    const ticketToken = crypto.randomBytes(24).toString('hex').toUpperCase();
    const order = await this.prisma.$transaction(async (tx) => {
      const updatedTier = await tx.ticketTier.updateMany({
        where: { id: tier.id, availableQuota: { gt: 0 } },
        data: { availableQuota: { decrement: 1 } },
      });
      if (updatedTier.count !== 1) throw new BadRequestException('O lote esgotou.');

      return tx.order.create({
        data: {
          buyerName: cleanName,
          buyerEmail: '',
          buyerPhone: cleanPhone,
          ticketTierId: tier.id,
          quantity: 1,
          unitPrice: tier.price,
          totalAmount: tier.price,
          status: 'PAID',
          paymentMethod: 'MANUAL',
          ticketToken,
          paidAt: new Date(),
        },
        include: { ticketTier: true },
      });
    });

    return {
      success: true,
      ticket: { ...this.mapOrderToTicket(order), token: ticketToken, codigo: this.publicCode(order.id) },
    };
  }

  async updateTicket(id: string, name?: string, phone?: string) {
    const order = await this.findOrder(id);
    const updated = await this.prisma.order.update({
      where: { id: order.id },
      data: {
        buyerName: name?.trim() || undefined,
        buyerPhone: phone ? phone.replace(/\D/g, '') : undefined,
      },
      include: { ticketTier: true },
    });
    return { success: true, ticket: this.mapOrderToTicket(updated), message: 'Dados do usuário atualizados!' };
  }

  async deleteTicket(id: string) {
    const order = await this.findOrder(id);
    await this.prisma.$transaction([
      this.prisma.order.update({ where: { id: order.id }, data: { status: 'CANCELLED' } }),
      this.prisma.ticketTier.update({ where: { id: order.ticketTierId }, data: { availableQuota: { increment: order.quantity } } }),
    ]);
    return { success: true, message: 'Usuário/ingresso removido.' };
  }

  private async findOrder(id: string) {
    const order = await this.prisma.order.findFirst({
      where: { OR: [{ id }, { ticketToken: id }] },
      include: { ticketTier: true },
    });
    if (!order) throw new NotFoundException('Usuário/ingresso não encontrado.');
    return order;
  }

  private publicCode(id: string) {
    const numericCode = Number.parseInt(crypto.createHash('sha256').update(id).digest('hex').slice(0, 8), 16) % 9000 + 1000;
    return `AHS-${numericCode}`;
  }

  private mapOrderToTicket(order: any) {
    return {
      id: order.id,
      token: order.ticketToken,
      publicCode: this.publicCode(order.id),
      buyerName: order.buyerName,
      buyerEmail: order.buyerEmail,
      buyerPhone: order.buyerPhone,
      ticketId: order.ticketTierId,
      ticketName: order.ticketTier.name,
      category: order.ticketTier.category,
      price: Number(order.unitPrice),
      paymentMethod: order.paymentMethod === 'PIX' ? 'PIX' : 'CARTAO',
      status: order.status === 'PAID' ? (order.checkedIn ? 'UTILIZADO' : 'VALIDO') : 'CANCELADO',
      createdAt: order.createdAt,
      usedAt: order.checkedInAt || undefined,
      lote: order.ticketTier.batch,
    };
  }

  /**
   * Validação de Token de Ingresso na Portaria / Scanner.
   */
  async verifyCheckin(token: string) {
    const cleanToken = token.trim();

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
        status: order.checkedIn ? 'UTILIZADO' : order.status === OrderStatus.PAID ? 'VALIDO' : 'CANCELADO',
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
    const cleanToken = token.trim();

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
