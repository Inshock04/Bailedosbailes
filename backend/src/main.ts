import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const frontendUrl = configService.get<string>('frontendUrl') || 'http://localhost:3000';
  const port = configService.get<number>('port') || 3001;

  // 1. CORS RESTRO: restrito ao domínio oficial do frontend e preview
  app.enableCors({
    origin: (origin, callback) => {
      // Permite requisições sem origin (como curl, postman, webhooks do Mercado Pago)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        frontendUrl,
        'http://localhost:3000',
        'http://localhost:5173',
      ];

      // Permite URLs de preview da Vercel se configurado
      const isAllowed =
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.includes('localhost');

      if (isAllowed) {
        callback(null, true);
      } else {
        logger.warn(`Tentativa de acesso bloqueada por CORS: ${origin}`);
        callback(new Error('Origem não permitida por CORS.'), false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-signature', 'x-request-id'],
  });

  // 2. Validação Global de Payloads (rejeitando campos não permitidos)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // 3. Filtro global de tratamento e formatação de erros
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(port, '0.0.0.0');
  logger.log(`🦇 [Hotel Cortez Backend] rodando na porta ${port}`);
  logger.log(`Frontend URL configurado: ${frontendUrl}`);
}

bootstrap();
