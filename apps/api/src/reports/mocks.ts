import type { IAuditLogger, ILlmAnalyzer } from '@/core/ports';
import type { IReportsRepository } from '@/reports/reports.repository';

export function buildMockReportsRepository(): jest.Mocked<IReportsRepository> {
  return {
    save: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
  };
}

export function buildMockLlmAnalyzer(): jest.Mocked<ILlmAnalyzer> {
  return {
    analyze: jest.fn(),
  };
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
