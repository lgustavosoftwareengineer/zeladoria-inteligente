import type { AuditRepository } from '@/audit/audit.repository';
import type { ConfigService } from '@nestjs/config';

export function buildMockAuditRepository(): {
  repository: jest.Mocked<AuditRepository>;
  saveMock: jest.Mock;
} {
  const saveMock = jest.fn();
  const repository = {
    save: saveMock,
    findByReportId: jest.fn(),
  } as unknown as jest.Mocked<AuditRepository>;
  return { repository, saveMock };
}

export function buildMockConfigService(): jest.Mocked<ConfigService> {
  return {
    get: jest.fn((key: string) =>
      key === 'LLM_PROVIDER_NAME' ? 'openrouter' : 'google/gemini-2.5-flash',
    ),
  } as unknown as jest.Mocked<ConfigService>;
}
