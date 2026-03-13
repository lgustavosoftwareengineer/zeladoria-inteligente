import { AuditEvent } from '@/core/ports';
import type { AuditLog } from '@/audit/entities/audit-log.entity';

export const STUB_AUDIT_LOG: AuditLog = {
  id: 'audit-uuid-1',
  reportId: 'report-uuid-1',
  eventType: AuditEvent.LLM_SUCCEEDED,
  provider: 'openrouter',
  model: 'meta-llama/llama-3.3-70b-instruct:free',
  promptSent: 'test prompt',
  rawResponse: '{"category":"Via Pública"}',
  errorMessage: null,
  latencyMs: 300,
  createdAt: new Date(),
};
