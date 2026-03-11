import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { DatabaseModule } from '@/core/database/database.module';
import { GlobalExceptionFilter } from '@/core/filters/global-exception.filter';
import { LoggingInterceptor } from '@/core/interceptors/logging.interceptor';

@Module({
  imports: [DatabaseModule],
  exports: [DatabaseModule],
  providers: [
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class CoreModule {}
