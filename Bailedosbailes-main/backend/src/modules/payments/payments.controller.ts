import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreateCheckoutPreferenceDto } from './dto/create-checkout-preference.dto';
import { Request } from 'express';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

@Controller('api/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * Endpoint de criação de checkout / preference no Mercado Pago.
   * Protegido por rate limiting: máx 10 chamadas por minuto por IP.
   */
  @Post('preference')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async createPreference(@Body() dto: CreateCheckoutPreferenceDto) {
    return this.paymentsService.createPreference(dto);
  }

  /**
   * Endpoint de Webhook do Mercado Pago.
   * Responde 200 OK rápido conforme exigência do gateway.
   */
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Body() rawPayload: any,
    @Headers('x-signature') xSignature: string,
    @Headers('x-request-id') xRequestId: string,
    @Query() query: Record<string, any>,
    @Req() req: Request,
  ) {
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;

    return this.paymentsService.handleWebhookNotification({
      rawPayload,
      xSignature,
      xRequestId,
      query,
      clientIp,
    });
  }

  /**
   * Rota de handshake GET (alguns testes do Mercado Pago enviam GET no webhook para testar conectividade).
   */
  @Get('webhook')
  @HttpCode(HttpStatus.OK)
  handleWebhookHandshake() {
    return { status: 'ONLINE', service: 'Hotel Cortez Payments Webhook' };
  }
}
