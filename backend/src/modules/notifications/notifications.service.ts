import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';

export interface TicketEmailPayload {
  orderId: string;
  buyerName: string;
  buyerEmail: string;
  ticketName: string;
  batch: string;
  quantity: number;
  totalAmount: number;
  ticketToken: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Dispara o e-mail de confirmação de ingresso de forma assíncrona.
   * Chamado APENAS após a confirmação oficial de pagamento via API do Mercado Pago.
   */
  async sendTicketConfirmationEmail(payload: TicketEmailPayload): Promise<void> {
    const resendApiKey = this.configService.get<string>('email.resendApiKey');
    const fromEmail = this.configService.get<string>('email.fromEmail') || 'Hotel Cortez <ingressos@hotelcortez.com>';

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; background-color: #0b0612; color: #f3edf9; padding: 30px; border-radius: 8px;">
        <div style="text-align: center; border-bottom: 2px solid #ef4444; padding-bottom: 20px; margin-bottom: 25px;">
          <h1 style="color: #ef4444; letter-spacing: 2px; margin: 0;">HOTEL CORTEZ • HALLOWEEN 2026</h1>
          <p style="color: #fca5a5; font-size: 14px; margin-top: 5px;">Seu ingresso está confirmado! Apresente o código na portaria.</p>
        </div>

        <div style="background-color: #1a0f26; border: 1px solid #3d1b33; border-radius: 6px; padding: 20px; margin-bottom: 20px;">
          <h2 style="color: #fca5a5; font-size: 18px; margin-top: 0;">Detalhes do Portador</h2>
          <p><strong>Nome:</strong> ${payload.buyerName}</p>
          <p><strong>E-mail:</strong> ${payload.buyerEmail}</p>
          <p><strong>Ingresso:</strong> ${payload.ticketName} (${payload.batch})</p>
          <p><strong>Quantidade:</strong> ${payload.quantity}</p>
          <p><strong>Valor Total Pago:</strong> R$ ${payload.totalAmount.toFixed(2)}</p>
        </div>

        <div style="background-color: #270e17; border: 2px dashed #ef4444; border-radius: 6px; padding: 20px; text-align: center; margin-bottom: 25px;">
          <p style="color: #fca5a5; margin: 0; font-size: 13px;">TOKEN DE ACESSO EXCLUSIVO</p>
          <h3 style="color: #ffffff; font-size: 24px; letter-spacing: 3px; margin: 10px 0; font-family: monospace;">${payload.ticketToken}</h3>
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">Este código é pessoal e intransferível. Será validado na portaria.</p>
        </div>

        <div style="font-size: 12px; color: #9ca3af; text-align: center; border-top: 1px solid #2d1222; padding-top: 15px;">
          <p>Local: Hotel Cortez / Palacete Histórico • Av. Paulista, 1000 - São Paulo, SP</p>
          <p>Data: 31 de Outubro de 2026 • 22:00 às 06:00 | Classificação: 18 anos</p>
        </div>
      </div>
    `;

    if (!resendApiKey || resendApiKey === 'TEST_RESEND_API_KEY_PLACEHOLDER') {
      this.logger.warn(
        `[EMAIL SIMULAÇÃO] RESEND_API_KEY não configurada. E-mail simulado para: ${payload.buyerEmail} | Token: ${payload.ticketToken}`,
      );

      // Marca como enviado no banco para consistência
      await this.prisma.order.update({
        where: { id: payload.orderId },
        data: { emailSent: true, emailSentAt: new Date() },
      });
      return;
    }

    try {
      this.logger.log(`Enviando e-mail transacional via Resend para ${payload.buyerEmail}...`);
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: payload.buyerEmail,
          subject: `🎟️ Ingresso Confirmado: Hotel Cortez Halloween 2026 [${payload.ticketToken}]`,
          html: htmlContent,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`Erro na API do Resend (${response.status}): ${errorText}`);
        return;
      }

      await this.prisma.order.update({
        where: { id: payload.orderId },
        data: { emailSent: true, emailSentAt: new Date() },
      });

      this.logger.log(`E-mail enviado com sucesso para ${payload.buyerEmail}`);
    } catch (err) {
      this.logger.error(`Falha ao disparar e-mail para ${payload.buyerEmail}:`, err);
    }
  }
}
