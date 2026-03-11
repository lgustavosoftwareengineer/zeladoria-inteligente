import serverlessExpress from '@vendia/serverless-express';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { Handler } from 'aws-lambda';
import { AppModule } from '@/app.module';
import { Env } from '@/core/config';

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

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Zeladoria Inteligente API')
    .setDescription(
      'AI-powered citizen problem reporting system. ' +
        'Citizens submit urban problem reports and the API uses an LLM to classify, ' +
        'prioritize and generate a formal technical summary for public administrators.',
    )
    .setVersion('1.0')
    .addTag('reports', 'Citizen problem reports')
    .addTag('health', 'Service health check')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.init();

  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}

export const handler: Handler = async (event, context, callback) => {
  serverHandler ??= await bootstrap();
  return serverHandler(event, context, callback);
};
