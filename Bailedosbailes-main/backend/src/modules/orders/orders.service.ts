import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import * as crypto from 'crypto';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Gera um token único, criptograficamente seguro, para ser embutido no QR Code do ingresso.
   */
  private generateSecureTicketToken(): string {
    const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `AHS-CORTEZ-${randomHex}-${randomNum}`;
  }

  /**
   * Cria um novo pedido com status inicial PENDING.
   * REGRA CRÍTICA: O preço NUNCA é recebido do cliente! É lido diretamente do banco de dados (TicketTier).
   */
  async createPendingOrder(dto: CreateOrderDto) {
    // 1. Consulta o lote oficial no banco de dados
    const tier = await this.prisma.ticketTier.findUnique({
      where: { id: dto.ticketTierId },
    });

    if (!tier || !tier.active) {
      throw new NotFoundException(`Lote de ingresso "${dto.ticketTierId}" não encontrado ou inativo.`);
    }

    // 2. Verifica cota disponível
    if (tier.availableQuota < dto.quantity) {
      throw new BadRequestException(
        `Quantidade solicitada (${dto.quantity}) excede o estoque disponível deste lote (${tier.availableQuota} restantes).`,
      );
    }

    // 3. Calcula o valor total estritamente com base no preço do banco
    const unitPrice = Number(tier.price);
    const totalAmount = unitPrice * dto.quantity;
    const ticketToken = this.generateSecureTicketToken();

    // 4. Salva o pedido inicial no Postgres com status PENDING
    const order = await this.prisma.order.create({
      data: {
        buyerName: dto.buyerName.trim(),
        buyerEmail: dto.buyerEmail.trim().toLowerCase(),
        buyerPhone: dto.buyerPhone.replace(/\D/g, ''),
        ticketTierId: tier.id,
        quantity: dto.quantity,
        unitPrice: unitPrice,
        totalAmount: totalAmount,
        status: OrderStatus.PENDING,
        ticketToken: ticketToken,
      },
      include: {
        ticketTier: true,
      },
    });

    this.logger.log(
      `[Pedido Criado] ID: ${order.id} | Tier: ${tier.name} | Qtd: ${order.quantity} | Total: R$ ${totalAmount.toFixed(2)} | Status: PENDING`,
    );

    return order;
  }

  async findById(orderId: string) {
    return this.prisma.order.findUnique({
      where: { id: orderId },
      include: { ticketTier: true },
    });
  }

  async findByToken(token: string) {
    return this.prisma.order.findUnique({
      where: { ticketToken: token },
      include: { ticketTier: true },
    });
  }

  async updateOrderPreference(orderId: string, preferenceId: string) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: { mpPreferenceId: preferenceId },
    });
  }

  async listTiers() {
    return this.prisma.ticketTier.findMany({
      where: { active: true },
      orderBy: { price: 'asc' },
    });
  }
}
