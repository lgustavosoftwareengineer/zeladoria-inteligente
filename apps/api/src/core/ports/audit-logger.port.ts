export const AUDIT_LOGGER_PORT = Symbol('AUDIT_LOGGER_PORT');

export enum AuditEvent {
  LLM_SUCCEEDED = 'llm_succeeded',
  LLM_FAILED = 'llm_failed',
}

interface AuditLogBase {
  reportId: string;
  promptSent: string;
}

export interface CreateAuditLogSuccessParams extends AuditLogBase {
  eventType: AuditEvent.LLM_SUCCEEDED;
  rawResponse: string;
  latencyMs: number;
}

export interface CreateAuditLogFailureParams extends AuditLogBase {
  eventType: AuditEvent.LLM_FAILED;
  errorMessage: string;
}

export type CreateAuditLogParams =
  | CreateAuditLogSuccessParams
  | CreateAuditLogFailureParams;

export interface IAuditLogger {
  createLog(params: CreateAuditLogParams): Promise<void>;
}
