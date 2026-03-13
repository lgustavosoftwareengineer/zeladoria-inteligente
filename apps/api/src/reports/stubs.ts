import type { LlmAnalysisResult } from '@/core/ports';
import type { ReportResponseDto } from '@/reports/dto/report-response.dto';
import type { Report } from '@/reports/entities/report.entity';

export const STUB_REPORT: Report = {
  id: 'uuid-123',
  title: 'Buraco na rua',
  description: 'Buraco enorme',
  location: 'Rua X, 10',
  category: 'Via Pública',
  priority: 'Alta',
  technicalSummary: 'Dano estrutural em via pública.',
  createdAt: new Date('2026-03-11T12:00:00.000Z'),
};

export const STUB_LLM_RESULT: LlmAnalysisResult = {
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

export const STUB_REPORT_RESPONSE_DTO: ReportResponseDto = {
  id: 'uuid-123',
  title: 'Buraco na rua',
  description: 'Buraco enorme',
  location: 'Rua X, 10',
  category: 'Via Pública',
  priority: 'Alta',
  technicalSummary: 'Dano estrutural identificado.',
  createdAt: new Date(),
};
