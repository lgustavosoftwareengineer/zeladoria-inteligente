import type { IAuditRepository } from '@/audit/audit.repository';
import type { AuditLog } from '@/audit/entities/audit-log.entity';

export function buildMockAuditRepository(): {
  repository: jest.Mocked<IAuditRepository>;
  saveMock: jest.MockedFunction<IAuditRepository['save']>;
} {
  const saveMock = jest.fn<Promise<AuditLog>, [Partial<AuditLog>]>();
  const repository = {
    save: saveMock,
    findByReportId: jest.fn<Promise<AuditLog[]>, [string]>(),
  };
  return { repository, saveMock };
}

export function buildMockConfigService() {
  return {
    get: jest.fn((key: string) =>
      key === 'LLM_PROVIDER_NAME' ? 'openrouter' : 'google/gemini-2.5-flash',
    ),
  };
}
