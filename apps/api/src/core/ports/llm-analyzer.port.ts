import type { Category, Priority } from '@/core/domain';

export const LLM_ANALYZER_PORT = Symbol('LLM_ANALYZER_PORT');

export interface ReportInput {
  title: string;
  description: string;
  location: string;
}

export interface LlmAnalysisOutput {
  category: Category;
  priority: Priority;
  technical_summary: string;
}

export interface LlmAnalysisResult {
  output: LlmAnalysisOutput;
  rawResponse: string;
  latencyMs: number;
}

export interface ILlmAnalyzer {
  analyze(input: ReportInput): Promise<LlmAnalysisResult>;
}
