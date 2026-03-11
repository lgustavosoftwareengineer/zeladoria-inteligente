import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DEFAULT_LLM_PROVIDER_NAME,
  DEFAULT_OPENROUTER_MODEL,
  Env,
} from '@/core/config';
import { AuditEvent, CreateAuditLogParams, IAuditLogger } from '@/core/ports';
import { AuditRepository } from '@/audit/audit.repository';

@Injectable()
export class AuditService implements IAuditLogger {
  constructor(
    private readonly auditRepository: AuditRepository,
    private readonly config: ConfigService<Env>,
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
