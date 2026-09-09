import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminJwtGuard } from './guards/admin-jwt.guard';
import { Request } from 'express';

@Controller('api/admin')
@UseGuards(AdminJwtGuard) // PROTEÇÃO OBRIGATÓRIA NO BACKEND EM TODA ROTA ADMIN
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * (a) Lista separada de pessoas na Lista de Espera (sem pagamento)
   */
  @Get('waitlist')
  async getWaitlist() {
    return this.adminService.getWaitlist();
  }

  /**
   * (b) Lista separada de quem comprou ingressos e o respectivo status de pagamento
   */
  @Get('orders')
  async getOrders() {
    return this.adminService.getOrders();
  }

  /**
   * Dashboard e KPIs consolidados
   */
  @Get('metrics')
  async getMetrics() {
    return this.adminService.getDashboardMetrics();
  }

  /**
   * Validador de QR Code / Token para a portaria
   */
  @Post('checkin/verify')
  async verifyCheckin(@Body('token') token: string) {
    return this.adminService.verifyCheckin(token);
  }

  /**
   * Confirmação de entrada na portaria
   */
  @Post('checkin/confirm')
  async confirmCheckin(@Body('token') token: string, @Req() req: Request) {
    const adminEmail = (req as any).adminUser?.email;
    return this.adminService.confirmCheckin(token, adminEmail);
  }

  /**
   * Logs de auditoria para segurança e compliance
   */
  @Get('audit-logs')
  async getAuditLogs() {
    return this.adminService.getAuditLogs();
  }

  @Get('tickets/search')
  async searchTickets(@Req() req: Request) {
    return this.adminService.searchTickets(String(req.query.q || ''));
  }

  @Post('tickets/create')
  async createTicket(@Body() body: { name: string; phone: string }) {
    return this.adminService.createTicket(body.name, body.phone);
  }

  @Put('tickets/:id')
  async updateTicket(@Req() req: Request, @Body() body: { name?: string; phone?: string }) {
    return this.adminService.updateTicket(req.params.id, body.name, body.phone);
  }

  @Delete('tickets/:id')
  async deleteTicket(@Req() req: Request) {
    return this.adminService.deleteTicket(req.params.id);
  }
}

@Controller('api')
@UseGuards(AdminJwtGuard)
export class LegacyAdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('checkin/verify')
  async verifyLegacyCheckin(@Body('token') token: string) {
    return this.adminService.verifyCheckin(token);
  }

  @Post('checkin/confirm')
  async confirmLegacyCheckin(@Body('token') token: string, @Req() req: Request) {
    return this.adminService.confirmCheckin(token, (req as any).adminUser?.email);
  }
}
