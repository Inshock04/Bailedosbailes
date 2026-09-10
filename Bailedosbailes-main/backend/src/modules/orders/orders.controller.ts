import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('api/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('tiers')
  async getTiers() {
    return this.ordersService.listTiers();
  }

  @Get(':id')
  async getOrder(@Param('id') id: string) {
    const order = await this.ordersService.findById(id);
    if (!order) {
      throw new NotFoundException('Pedido não encontrado.');
    }

    return {
      id: order.id,
      status: order.status,
      ticketTier: order.ticketTier.name,
      batch: order.ticketTier.batch,
      quantity: order.quantity,
      totalAmount: order.totalAmount,
      paidAt: order.paidAt,
      ticketToken: order.status === 'PAID' ? order.ticketToken : undefined,
    };
  }
}
