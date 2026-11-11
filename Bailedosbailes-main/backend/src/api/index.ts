import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from '../common/filters/all-exceptions.filter';
import express, { Express, Request, Response } from 'express';

const expressApp: Express = express();
let isInitialized = false;

async function bootstrapServer(): Promise<Express> {
  if (!isInitialized) {
    const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));

    // CORS na Vercel
    app.enableCors({
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-signature', 'x-request-id'],
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );

    app.useGlobalFilters(new AllExceptionsFilter());

    await app.init();
    isInitialized = true;
  }

  return expressApp;
}

export default async function handler(req: Request, res: Response) {
  const app = await bootstrapServer();
  return app(req, res);
}
