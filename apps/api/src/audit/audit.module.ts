import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AUDIT_LOGGER_PORT } from '@/core/ports';
import { AuditRepository } from '@/audit/audit.repository';
import { AuditService } from '@/audit/audit.service';
import { AuditLog } from '@/audit/entities/audit-log.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([AuditLog])],
  providers: [
    AuditRepository,
    AuditService,
    { provide: AUDIT_LOGGER_PORT, useExisting: AuditService },
  ],
  exports: [AUDIT_LOGGER_PORT],
})
export class AuditModule {}
