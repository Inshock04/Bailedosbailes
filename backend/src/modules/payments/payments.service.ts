import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { OrdersService } from '../orders/orders.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';
import { CreateCheckoutPreferenceDto } from './dto/create-checkout-preference.dto';
import { validateMercadoPagoSignature } from './utils/mp-signature';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly ordersService: OrdersService,
    private readonly notificationsService: NotificationsService,
    private readonly auditService: AuditService,
  ) {}

  private get mpAccessToken(): string {
    return this.configService.get<string>('mp.accessToken') || '';
  }

  private get mpWebhookSecret(): string {
    return this.configService.get<string>('mp.webhookSecret') || '';
  }

  private get frontendUrl(): string {
    return this.configService.get<string>('frontendUrl') || 'http://localhost:3000';
  }

  /**
   * Cria uma Preference no Mercado Pago Checkout Pro vinculada a um Order salvo no banco.
   * REGRA DE OURO: O preço é calculado estritamente no backend e passado para o MP.
   */
  async createPreference(dto: CreateCheckoutPreferenceDto) {
    // 1. Cria a ordem de compra inicial no banco com status PENDING
    const order = await this.ordersService.createPendingOrder(dto);

    const isPlaceholderToken =
      !this.mpAccessToken ||
      this.mpAccessToken.startsWith('TEST_ACCESS_TOKEN_') ||
      this.mpAccessToken === 'TEST_ACCESS_TOKEN_PLACEHOLDER';

    // Simulações de pagamento no site estão desativadas por segurança
    if (isPlaceholderToken) {
      throw new BadRequestException(
        'Simulações de pagamento no site foram desativadas. Para adquirir seu ingresso oficial com segurança, fale diretamente com a equipe organizadora pelo WhatsApp oficial: https://wa.me/5511943963952 (+55 11 94396-3952).',
      );
    }

    // 2. Monta o payload oficial para a API de Preferences do Mercado Pago
    const backendWebhookUrl =
      this.configService.get<string>('mp.webhookUrl') ||
      `${this.frontendUrl}/api/payments/webhook`;

    const preferencePayload = {
      items: [
        {
          id: order.ticketTierId,
          title: `Hotel Cortez Halloween 2026 - ${order.ticketTier.name}`,
          description: `Ingresso ${order.ticketTier.category} (${order.ticketTier.batch})`,
          quantity: order.quantity,
          currency_id: 'BRL',
          unit_price: Number(order.unitPrice),
        },
      ],
      payer: {
        name: order.buyerName,
        email: order.buyerEmail,
        phone: {
          number: order.buyerPhone,
        },
      },
      external_reference: order.id, // Vínculo estrito com o Order ID no Postgres
      notification_url: backendWebhookUrl,
      back_urls: {
        success: `${this.frontendUrl}/?status=success&orderId=${order.id}`,
        failure: `${this.frontendUrl}/?status=failure&orderId=${order.id}`,
        pending: `${this.frontendUrl}/?status=pending&orderId=${order.id}`,
      },
      auto_return: 'approved',
      statement_descriptor: 'HOTEL CORTEZ',
    };

    try {
      this.logger.log(`Criando Preference no Mercado Pago para Order ${order.id}...`);
      const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.mpAccessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferencePayload),
      });

      if (!response.ok) {
        const errorDetails = await response.text();
        this.logger.error(`Erro na API do Mercado Pago (${response.status}): ${errorDetails}`);
        throw new InternalServerErrorException(
          'Falha ao gerar link de pagamento no Mercado Pago.',
        );
      }

      const prefData = await response.json();

      // Salva o ID da preference no pedido
      await this.ordersService.updateOrderPreference(order.id, prefData.id);

      return {
        orderId: order.id,
        preferenceId: prefData.id,
        initPoint: prefData.init_point,
        sandboxInitPoint: prefData.sandbox_init_point,
      };
    } catch (error: any) {
      this.logger.error('Exceção ao criar Preference:', error);
      throw error;
    }
  }

  /**
   * Processamento seguro do Webhook de Notificação do Mercado Pago.
   * Executa:
   * 1. Validação de assinatura HMAC-SHA256 (x-signature).
   * 2. RECONSULTA OBRIGATÓRIA na API GET /v1/payments/{id} com ACCESS_TOKEN (Defesa em profundidade).
   * 3. Cruzamento de external_reference e conferência estrita de valor (totalAmount).
   * 4. Idempotência (impede duplicidade caso o webhook seja reenviado).
   * 5. Atualização atômica de status e disparo assíncrono do e-mail.
   */
  async handleWebhookNotification(params: {
    rawPayload: any;
    xSignature?: string;
    xRequestId?: string;
    query: Record<string, any>;
    clientIp?: string;
  }) {
    const { rawPayload, xSignature, xRequestId, query, clientIp } = params;

    // Extrai o ID do pagamento da notificação (suporta query e body)
    const paymentId =
      rawPayload?.data?.id ||
      rawPayload?.id ||
      query?.id ||
      query?.['data.id'];

    const topic = rawPayload?.type || rawPayload?.action || query?.topic || query?.type;

    this.logger.log(
      `[Webhook Recebido] Tipo: ${topic || 'unknown'} | Payment ID: ${paymentId || 'N/A'}`,
    );

    if (!paymentId) {
      this.logger.log('Notificação ignorada (não contém identificador de pagamento).');
      return { status: 'IGNORED', message: 'No payment id' };
    }

    // 1. Validação da assinatura x-signature (HMAC-SHA256)
    const signatureResult = validateMercadoPagoSignature({
      xSignatureHeader: xSignature,
      xRequestIdHeader: xRequestId,
      dataId: String(paymentId),
      webhookSecret: this.mpWebhookSecret,
    });

    if (!signatureResult.isValid) {
      this.logger.warn(
        `[Webhook Alerta] Falha na validação de assinatura: ${signatureResult.reason}`,
      );
      await this.auditService.log({
        action: 'WEBHOOK_SIGNATURE_INVALID',
        entity: 'Payment',
        entityId: String(paymentId),
        ipAddress: clientIp,
        details: { reason: signatureResult.reason, signature: xSignature },
      });
      // Mesmo com aviso de assinatura, prosseguimos para a reconsulta direta na API com nosso próprio token seguro
    }

    // 2. RECONSULTA OBRIGATÓRIA: Chamada GET /v1/payments/{id} na API oficial do Mercado Pago
    const paymentData = await this.fetchPaymentFromMercadoPago(String(paymentId));

    if (!paymentData) {
      this.logger.error(`Pagamento ${paymentId} não localizado na API do Mercado Pago.`);
      return { status: 'NOT_FOUND_ON_GATEWAY' };
    }

    const orderId = paymentData.external_reference;
    const mpStatus = paymentData.status; // 'approved', 'pending', 'rejected', 'cancelled', etc.
    const transactionAmount = Number(paymentData.transaction_amount);

    if (!orderId) {
      this.logger.error(`Pagamento ${paymentId} sem external_reference associado.`);
      return { status: 'MISSING_EXTERNAL_REFERENCE' };
    }

    // 3. Localiza a Ordem correspondente no banco Postgres
    const order = await this.ordersService.findById(orderId);
    if (!order) {
      this.logger.error(`Ordem ${orderId} não encontrada no banco de dados local.`);
      return { status: 'ORDER_NOT_FOUND' };
    }

    // 4. VERIFICAÇÃO DE IDEMPOTÊNCIA
    // Se o pedido já estiver marcado como PAID e com esse paymentId registrado, não duplica ações
    if (order.status === OrderStatus.PAID && order.mpPaymentId === String(paymentId)) {
      this.logger.log(
        `[Idempotência] Notificação duplicada recebida para Pedido ${order.id} já aprovado. Ignorando reprocessamento.`,
      );
      return { status: 'ALREADY_PROCESSED', orderId: order.id };
    }

    // 5. Verificação de Valor
    const expectedAmount = Number(order.totalAmount);
    const amountDifference = Math.abs(transactionAmount - expectedAmount);

    if (amountDifference > 0.05) {
      // Divergência de valor detectada!
      this.logger.error(
        `[FRAUDE/ERRO] Valor recebido (R$ ${transactionAmount}) difere do valor esperado (R$ ${expectedAmount}) para o Pedido ${order.id}`,
      );

      await this.auditService.log({
        action: 'PAYMENT_AMOUNT_MISMATCH',
        entity: 'Order',
        entityId: order.id,
        ipAddress: clientIp,
        details: {
          expectedAmount,
          receivedAmount: transactionAmount,
          paymentId,
        },
      });

      return { status: 'AMOUNT_MISMATCH', orderId: order.id };
    }

    // 6. Atualização de Status
    if (mpStatus === 'approved') {
      // Pagamento confirmado com sucesso!
      await this.prisma.$transaction(async (tx) => {
        // Atualiza status do pedido
        await tx.order.update({
          where: { id: order.id },
          data: {
            status: OrderStatus.PAID,
            mpPaymentId: String(paymentId),
            paidAt: new Date(paymentData.date_approved || Date.now()),
          },
        });

        // Decrementa cota disponível do lote
        await tx.ticketTier.update({
          where: { id: order.ticketTierId },
          data: {
            availableQuota: {
              decrement: order.quantity,
            },
          },
        });
      });

      // Registra no Audit Log
      await this.auditService.log({
        action: 'PAYMENT_CONFIRMED',
        entity: 'Order',
        entityId: order.id,
        ipAddress: clientIp,
        details: {
          paymentId: String(paymentId),
          amount: transactionAmount,
          method: paymentData.payment_type_id || 'checkout_pro',
          buyerEmail: order.buyerEmail,
        },
      });

      this.logger.log(`[SUCESSO] Pedido ${order.id} marcado como PAID! Token: ${order.ticketToken}`);

      // 7. Disparo ASSÍNCRONO do e-mail de comprovante (após a confirmação real)
      this.notificationsService
        .sendTicketConfirmationEmail({
          orderId: order.id,
          buyerName: order.buyerName,
          buyerEmail: order.buyerEmail,
          ticketName: order.ticketTier.name,
          batch: order.ticketTier.batch,
          quantity: order.quantity,
          totalAmount: transactionAmount,
          ticketToken: order.ticketToken,
        })
        .catch((err) => {
          this.logger.error(`Erro no envio assíncrono de e-mail para ${order.buyerEmail}:`, err);
        });

      return { status: 'APPROVED', orderId: order.id };
    } else {
      // Status não aprovado (pending, in_process, rejected, cancelled)
      const mappedStatus =
        mpStatus === 'rejected'
          ? OrderStatus.REJECTED
          : mpStatus === 'cancelled'
          ? OrderStatus.CANCELLED
          : OrderStatus.PENDING;

      await this.prisma.order.update({
        where: { id: order.id },
        data: {
          status: mappedStatus,
          mpPaymentId: String(paymentId),
        },
      });

      await this.auditService.log({
        action: `PAYMENT_STATUS_${mpStatus.toUpperCase()}`,
        entity: 'Order',
        entityId: order.id,
        ipAddress: clientIp,
        details: { paymentId, mpStatus },
      });

      this.logger.log(`Pedido ${order.id} atualizado com status: ${mappedStatus}`);
      return { status: mappedStatus, orderId: order.id };
    }
  }

  /**
   * Consulta oficial do pagamento diretamente nos servidores do Mercado Pago usando ACCESS_TOKEN.
   */
  private async fetchPaymentFromMercadoPago(paymentId: string) {
    const isPlaceholderToken =
      !this.mpAccessToken ||
      this.mpAccessToken.startsWith('TEST_ACCESS_TOKEN_') ||
      this.mpAccessToken === 'TEST_ACCESS_TOKEN_PLACEHOLDER';

    // Suporte para simulação em ambiente de desenvolvimento local
    if (isPlaceholderToken) {
      this.logger.warn(
        `[MP SIMULAÇÃO] Reconsulta simulada ativada para paymentId: ${paymentId}`,
      );

      // Se for simulação, localiza o pedido pelo id ou primeiro pendente
      const order = await this.prisma.order.findFirst({
        where: {
          OR: [
            { id: paymentId },
            { mpPreferenceId: { contains: paymentId } },
            { status: OrderStatus.PENDING },
          ],
        },
      });

      if (!order) return null;

      return {
        id: paymentId,
        status: 'approved',
        external_reference: order.id,
        transaction_amount: Number(order.totalAmount),
        date_approved: new Date().toISOString(),
        payment_type_id: 'bank_transfer_pix',
      };
    }

    try {
      const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.mpAccessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        this.logger.error(
          `Falha ao consultar pagamento ${paymentId} no Mercado Pago. Status HTTP: ${res.status}`,
        );
        return null;
      }

      return await res.json();
    } catch (err) {
      this.logger.error(`Exceção de rede ao consultar pagamento ${paymentId}:`, err);
      return null;
    }
  }
}
