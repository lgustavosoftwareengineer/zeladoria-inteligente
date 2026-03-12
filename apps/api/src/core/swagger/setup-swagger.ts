import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { INestApplication } from '@nestjs/common';

const SWAGGER_PATH = 'api/docs';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
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

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(SWAGGER_PATH, app, document, {
    swaggerOptions: { persistAuthorization: true },
  });
}
