import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { DEFAULT_PORT, Env } from '@/core/config';
import { AppModule } from '@/app.module';

async function bootstrap() {
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

  const port = config.get('PORT', { infer: true }) ?? DEFAULT_PORT;
  await app.listen(port);

  console.log(
    `zeladoria-inteligente-api running on http://localhost:${port}/api`,
  );
  console.log(`Swagger UI available at http://localhost:${port}/api/docs`);
}

void bootstrap();
