import { NotFoundException } from '@nestjs/common';
import { LlmUnavailableError } from '@/core/errors';
import {
  AuditEvent,
  IAuditLogger,
  ILlmAnalyzer,
  LlmAnalysisResult,
} from '@/core/ports';
import { CreateReportDto } from '@/reports/dto/create-report.dto';
import { Report } from '@/reports/entities/report.entity';
import { ReportsRepository } from '@/reports/reports.repository';
import { ReportsService } from '@/reports/reports.service';

const MOCK_REPORT: Report = {
  id: 'uuid-123',
  title: 'Buraco na rua',
  description: 'Buraco enorme',
  location: 'Rua X, 10',
  category: 'Outros',
  priority: 'Baixa',
  technicalSummary: '',
  createdAt: new Date(),
};

const MOCK_LLM_RESULT: LlmAnalysisResult = {
  output: {
    category: 'Via Pública',
    priority: 'Alta',
    technical_summary:
      'Dano estrutural em via pública requer atenção imediata.',
  },
  rawResponse:
    '{"category":"Via Pública","priority":"Alta","technical_summary":"..."}',
  latencyMs: 350,
};

describe('ReportsService', () => {
  let service: ReportsService;
  let reportsRepository: jest.Mocked<ReportsRepository>;
  let llmAnalyzer: jest.Mocked<ILlmAnalyzer>;
  let createLogMock: jest.Mock;
  let auditLogger: jest.Mocked<IAuditLogger>;

  beforeEach(() => {
    reportsRepository = {
      save: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
    } as unknown as jest.Mocked<ReportsRepository>;

    llmAnalyzer = { analyze: jest.fn() };
    createLogMock = jest.fn();
    auditLogger = { createLog: createLogMock };

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
        .mockResolvedValueOnce(MOCK_REPORT)
        .mockResolvedValueOnce({
          ...MOCK_REPORT,
          category: 'Via Pública',
          priority: 'Alta',
        });
      llmAnalyzer.analyze.mockResolvedValue(MOCK_LLM_RESULT);
      createLogMock.mockResolvedValue(undefined);

      // Act
      const result = await service.create(dto);

      // Assert
      expect(result.category).toBe('Via Pública');
      expect(result.priority).toBe('Alta');
      expect(createLogMock).toHaveBeenCalledWith(
        expect.objectContaining({
          reportId: MOCK_REPORT.id,
          promptSent: JSON.stringify(dto),
          eventType: AuditEvent.LLM_SUCCEEDED,
          rawResponse: MOCK_LLM_RESULT.rawResponse,
          latencyMs: MOCK_LLM_RESULT.latencyMs,
        }),
      );
    });

    it('should audit failure and rethrow when LLM throws LlmUnavailableError', async () => {
      // Arrange
      reportsRepository.save.mockResolvedValue(MOCK_REPORT);
      llmAnalyzer.analyze.mockRejectedValue(new LlmUnavailableError());
      createLogMock.mockResolvedValue(undefined);

      // Act
      const act = () => service.create(dto);

      // Assert
      await expect(act()).rejects.toThrow(LlmUnavailableError);
      expect(createLogMock).toHaveBeenCalledWith(
        expect.objectContaining({
          reportId: MOCK_REPORT.id,
          promptSent: JSON.stringify(dto),
          eventType: AuditEvent.LLM_FAILED,
          errorMessage: 'LLM provider is temporarily unavailable',
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return list of report response DTOs', async () => {
      // Arrange
      reportsRepository.findAll.mockResolvedValue([MOCK_REPORT]);

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
      reportsRepository.findById.mockResolvedValue(MOCK_REPORT);

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
