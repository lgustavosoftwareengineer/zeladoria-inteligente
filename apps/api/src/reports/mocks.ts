import type { IAuditLogger, ILlmAnalyzer } from '@/core/ports';
import type { ReportsRepository } from '@/reports/reports.repository';

export function buildMockReportsRepository(): jest.Mocked<ReportsRepository> {
  return {
    save: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
  } as unknown as jest.Mocked<ReportsRepository>;
}

export function buildMockLlmAnalyzer(): jest.Mocked<ILlmAnalyzer> {
  return {
    analyze: jest.fn(),
  } as unknown as jest.Mocked<ILlmAnalyzer>;
}

export function buildMockAuditLogger(): {
  logger: jest.Mocked<IAuditLogger>;
  createLogMock: jest.Mock;
} {
  const createLogMock = jest.fn();
  return {
    createLogMock,
    logger: { createLog: createLogMock } as jest.Mocked<IAuditLogger>,
  };
}
