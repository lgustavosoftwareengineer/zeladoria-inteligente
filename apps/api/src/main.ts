import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DEFAULT_PORT, Env } from '@/core/config';
import { setupSwagger } from '@/core/swagger';
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

  const isDevelopment = config.get('NODE_ENV') === 'development';

  if (isDevelopment) {
    setupSwagger(app);
  }

  const port = config.get('PORT', { infer: true }) ?? DEFAULT_PORT;
  await app.listen(port);

  if (isDevelopment) {
    console.log(
      `zeladoria-inteligente-api running on http://localhost:${port}/api`,
    );
    console.log(`Swagger UI available at http://localhost:${port}/api/docs`);
  }
}

void bootstrap();
