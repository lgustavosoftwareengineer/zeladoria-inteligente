import { NotFoundException } from '@nestjs/common';
import { LlmUnavailableError, LlmValidationError } from '@/core/errors';
import { AuditEvent } from '@/core/ports';
import { CreateReportDto } from '@/reports/dto/create-report.dto';
import {
  buildMockAuditLogger,
  buildMockLlmAnalyzer,
  buildMockReportsRepository,
} from '@/reports/mocks';
import { ReportsService } from '@/reports/reports.service';
import { STUB_LLM_RESULT, STUB_REPORT } from '@/reports/stubs';

describe('ReportsService', () => {
  let service: ReportsService;
  let reportsRepository: ReturnType<typeof buildMockReportsRepository>;
  let llmAnalyzer: ReturnType<typeof buildMockLlmAnalyzer>;
  let createLogMock: jest.Mock;
  let auditLogger: ReturnType<typeof buildMockAuditLogger>['logger'];

  beforeEach(() => {
    reportsRepository = buildMockReportsRepository();
    const audit = buildMockAuditLogger();
    auditLogger = audit.logger;
    createLogMock = audit.createLogMock;
    llmAnalyzer = buildMockLlmAnalyzer();
    service = new ReportsService(reportsRepository, llmAnalyzer, auditLogger);
  });

  describe('create', () => {
    const dto: CreateReportDto = {
      title: 'Buraco na rua',
      description: 'Buraco enorme',
      location: 'Rua X, 10',
    };

    it('should create report, call LLM, audit success, and return enriched DTO', async () => {
      // Arrange
      reportsRepository.save
        .mockResolvedValueOnce({
          ...STUB_REPORT,
          category: 'Outros',
          priority: 'Baixa',
          technicalSummary: '',
        })
        .mockResolvedValueOnce(STUB_REPORT);
      llmAnalyzer.analyze.mockResolvedValue(STUB_LLM_RESULT);
      createLogMock.mockResolvedValue(undefined);

      // Act
      const result = await service.create(dto);

      // Assert
      expect(result.category).toBe('Via Pública');
      expect(result.priority).toBe('Alta');
      expect(createLogMock).toHaveBeenCalledWith(
        expect.objectContaining({
          reportId: STUB_REPORT.id,
          promptSent: JSON.stringify(dto),
          eventType: AuditEvent.LLM_SUCCEEDED,
          rawResponse: STUB_LLM_RESULT.rawResponse,
          latencyMs: STUB_LLM_RESULT.latencyMs,
        }),
      );
    });

    it('should audit failure and rethrow when LLM throws LlmUnavailableError', async () => {
      // Arrange
      reportsRepository.save.mockResolvedValue(STUB_REPORT);
      llmAnalyzer.analyze.mockRejectedValue(new LlmUnavailableError());
      createLogMock.mockResolvedValue(undefined);

      // Act
      const act = () => service.create(dto);

      // Assert
      await expect(act()).rejects.toThrow(LlmUnavailableError);
      expect(createLogMock).toHaveBeenCalledWith(
        expect.objectContaining({
          reportId: STUB_REPORT.id,
          promptSent: JSON.stringify(dto),
          eventType: AuditEvent.LLM_FAILED,
          errorMessage: 'LLM provider is temporarily unavailable',
        }),
      );
    });

    it('should audit failure and rethrow when LLM throws LlmValidationError', async () => {
      // Arrange
      reportsRepository.save.mockResolvedValue(STUB_REPORT);
      llmAnalyzer.analyze.mockRejectedValue(new LlmValidationError([]));
      createLogMock.mockResolvedValue(undefined);

      // Act
      const act = () => service.create(dto);

      // Assert
      await expect(act()).rejects.toThrow(LlmValidationError);
      expect(createLogMock).toHaveBeenCalledWith(
        expect.objectContaining({ eventType: AuditEvent.LLM_FAILED }),
      );
    });
  });

  describe('findAll', () => {
    it('should return list of report response DTOs', async () => {
      // Arrange
      reportsRepository.findAll.mockResolvedValue([STUB_REPORT]);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('uuid-123');
    });
  });

  describe('findById', () => {
    it('should return report DTO when found', async () => {
      // Arrange
      reportsRepository.findById.mockResolvedValue(STUB_REPORT);

      // Act
      const result = await service.findById('uuid-123');

      // Assert
      expect(result.id).toBe('uuid-123');
    });

    it('should throw NotFoundException when report does not exist', async () => {
      // Arrange
      reportsRepository.findById.mockResolvedValue(null);

      // Act
      const act = () => service.findById('non-existent-id');

      // Assert
      await expect(act()).rejects.toThrow(NotFoundException);
    });
  });
});
