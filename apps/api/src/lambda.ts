import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import serverlessExpress from '@vendia/serverless-express';
import { Env } from '@/core/config';
import { setupSwagger } from '@/core/swagger';
import { AppModule } from '@/app.module';
import type { Handler } from 'aws-lambda';
import type { Express } from 'express';

let serverHandler: Handler;

async function bootstrap(): Promise<Handler> {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService<Env>);

  app.enableCors({ origin: config.get('CORS_ORIGIN', { infer: true }) });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api');

  setupSwagger(app);

  await app.init();

  const expressApp = app.getHttpAdapter().getInstance() as Express;
  return serverlessExpress({ app: expressApp });
}

export const handler: Handler = async (event, context, callback) => {
  serverHandler ??= await bootstrap();
  return serverHandler(event, context, callback) as Promise<void>;
};
