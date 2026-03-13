import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DEFAULT_LLM_PROVIDER_NAME,
  DEFAULT_OPENROUTER_MODEL,
} from '@/core/config';
import { AuditEvent } from '@/core/ports';
import {
  AuditRepository,
  type IAuditRepository,
} from '@/audit/audit.repository';
import type {
  CreateAuditLogParams,
  IAuditLogger,
  IConfigReader,
} from '@/core/ports';

@Injectable()
export class AuditService implements IAuditLogger {
  constructor(
    @Inject(AuditRepository)
    private readonly auditRepository: IAuditRepository,
    @Inject(ConfigService)
    private readonly config: IConfigReader,
  ) {}

  async createLog(params: CreateAuditLogParams): Promise<void> {
    const base = {
      reportId: params.reportId,
      eventType: params.eventType,
      provider:
        this.config.get('LLM_PROVIDER_NAME', { infer: true }) ??
        DEFAULT_LLM_PROVIDER_NAME,
      model:
        this.config.get('OPENROUTER_MODEL', { infer: true }) ??
        DEFAULT_OPENROUTER_MODEL,
      promptSent: params.promptSent,
    };

    if (params.eventType === AuditEvent.LLM_SUCCEEDED) {
      await this.auditRepository.save({
        ...base,
        rawResponse: params.rawResponse,
        errorMessage: null,
        latencyMs: params.latencyMs,
      });
    } else {
      await this.auditRepository.save({
        ...base,
        rawResponse: null,
        errorMessage: params.errorMessage,
        latencyMs: null,
      });
    }
  }
}
