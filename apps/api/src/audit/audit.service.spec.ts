import { ConfigService } from '@nestjs/config';
import { AuditEvent } from '@/core/ports';
import { AuditRepository } from '@/audit/audit.repository';
import { AuditService } from '@/audit/audit.service';
import { AuditLog } from '@/audit/entities/audit-log.entity';

const MOCK_AUDIT_LOG: AuditLog = {
  id: 'audit-uuid-1',
  reportId: 'report-uuid-1',
  eventType: AuditEvent.LLM_SUCCEEDED,
  provider: 'openrouter',
  model: 'google/gemini-2.5-flash',
  promptSent: 'test prompt',
  rawResponse: '{"category":"Via Pública"}',
  errorMessage: null,
  latencyMs: 300,
  createdAt: new Date(),
};

describe('AuditService', () => {
  let service: AuditService;
  let repository: jest.Mocked<AuditRepository>;
  let saveMock: jest.Mock;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(() => {
    saveMock = jest.fn();
    repository = {
      save: saveMock,
      findByReportId: jest.fn(),
    } as unknown as jest.Mocked<AuditRepository>;

    configService = {
      get: jest.fn((key: string) =>
        key === 'LLM_PROVIDER_NAME' ? 'openrouter' : 'google/gemini-2.5-flash',
      ),
    } as unknown as jest.Mocked<ConfigService>;

    service = new AuditService(repository, configService);
  });

  describe('createLog', () => {
    it('should persist audit log with correct fields on LLM success', async () => {
      // Arrange
      saveMock.mockResolvedValue(MOCK_AUDIT_LOG);

      // Act
      await service.createLog({
        reportId: 'report-uuid-1',
        eventType: AuditEvent.LLM_SUCCEEDED,
        promptSent: 'test prompt',
        rawResponse: '{"category":"Via Pública"}',
        latencyMs: 300,
      });

      // Assert
      expect(saveMock).toHaveBeenCalledWith(
        expect.objectContaining({
          reportId: 'report-uuid-1',
          eventType: AuditEvent.LLM_SUCCEEDED,
          provider: 'openrouter',
          model: 'google/gemini-2.5-flash',
          latencyMs: 300,
        }),
      );
    });

    it('should persist error message and null latency on LLM failure', async () => {
      // Arrange
      saveMock.mockResolvedValue({
        ...MOCK_AUDIT_LOG,
        eventType: AuditEvent.LLM_FAILED,
      });

      // Act
      await service.createLog({
        reportId: 'report-uuid-1',
        eventType: AuditEvent.LLM_FAILED,
        promptSent: 'test prompt',
        errorMessage: 'LLM provider is temporarily unavailable',
      });

      // Assert
      expect(saveMock).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: AuditEvent.LLM_FAILED,
          errorMessage: 'LLM provider is temporarily unavailable',
          latencyMs: null,
        }),
      );
    });
  });
});
