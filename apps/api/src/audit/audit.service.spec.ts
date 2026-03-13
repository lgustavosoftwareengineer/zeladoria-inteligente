import { AuditEvent } from '@/core/ports';
import { AuditService } from '@/audit/audit.service';
import {
  buildMockAuditRepository,
  buildMockConfigService,
} from '@/audit/mocks';
import { STUB_AUDIT_LOG } from '@/audit/stubs';

describe('AuditService', () => {
  let service: AuditService;
  let repository: ReturnType<typeof buildMockAuditRepository>['repository'];
  let saveMock: jest.Mock;
  let configService: ReturnType<typeof buildMockConfigService>;

  beforeEach(() => {
    const repo = buildMockAuditRepository();
    repository = repo.repository;
    saveMock = repo.saveMock;
    configService = buildMockConfigService();
    service = new AuditService(repository, configService);
  });

  describe('createLog', () => {
    it('should persist audit log with correct fields on LLM success', async () => {
      // Arrange
      saveMock.mockResolvedValue(STUB_AUDIT_LOG);

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
        ...STUB_AUDIT_LOG,
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
