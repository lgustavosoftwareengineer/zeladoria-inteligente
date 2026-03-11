import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from '@/core/config';
import { CoreModule } from '@/core/core.module';
import { AuditModule } from '@/audit/audit.module';
import { HealthModule } from '@/health/health.module';
import { LlmModule } from '@/llm/llm.module';
import { ReportsModule } from '@/reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    CoreModule,
    LlmModule,
    AuditModule,
    ReportsModule,
    HealthModule,
  ],
})
export class AppModule {}
