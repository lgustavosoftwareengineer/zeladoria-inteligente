import { Injectable, Logger } from '@nestjs/common';
import {
  LlmParseError,
  LlmUnavailableError,
  LlmValidationError,
} from '@/core/errors';
import { ILlmAnalyzer, LlmAnalysisResult, ReportInput } from '@/core/ports';
import { MAX_ATTEMPTS, RETRY_DELAY_MS } from '@/llm/llm.constants';
import { buildTriagePrompt } from '@/llm/prompts/triage.prompt';
import { OpenRouterProvider } from '@/llm/providers/openrouter.provider';
import { LlmOutputSchema } from '@/llm/schemas/llm-output.schema';

@Injectable()
export class LlmService implements ILlmAnalyzer {
  private readonly logger = new Logger(LlmService.name);

  constructor(private readonly provider: OpenRouterProvider) {}

  async analyze(input: ReportInput): Promise<LlmAnalysisResult> {
    const prompt = buildTriagePrompt(input);
    return this.executeWithRetry(prompt);
  }

  private async executeWithRetry(prompt: string): Promise<LlmAnalysisResult> {
    let lastError: Error = new Error('Unknown error');

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        return await this.attemptAnalysis(prompt);
      } catch (err) {
        lastError = err as Error;
        this.logAttemptFailure(attempt, lastError);
        if (attempt < MAX_ATTEMPTS) {
          await this.delay(RETRY_DELAY_MS);
        }
      }
    }

    throw new LlmUnavailableError(lastError);
  }

  private async attemptAnalysis(prompt: string): Promise<LlmAnalysisResult> {
    const start = Date.now();
    const raw = await this.provider.complete(prompt);
    const latencyMs = Date.now() - start;
    const output = this.parseAndValidate(raw);
    return { output, rawResponse: raw, latencyMs };
  }

  private logAttemptFailure(attempt: number, error: Error): void {
    const isValidationError =
      error instanceof LlmParseError || error instanceof LlmValidationError;
    const label = isValidationError ? 'failed validation' : 'failed';
    this.logger.warn(
      `Attempt ${attempt}/${MAX_ATTEMPTS} ${label}: ${error.message}`,
    );
  }

  private parseAndValidate(raw: string): LlmAnalysisResult['output'] {
    const cleaned = this.extractJson(raw);

    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      throw new LlmParseError(raw);
    }

    const result = LlmOutputSchema.safeParse(parsed);
    if (!result.success) {
      throw new LlmValidationError(result.error.issues);
    }

    return result.data;
  }

  private extractJson(raw: string): string {
    const fenceMatch = /```(?:json)?\s*([\s\S]*?)```/.exec(raw);
    if (fenceMatch?.[1]) {
      return fenceMatch[1].trim();
    }

    const objectMatch = /\{[\s\S]*\}/.exec(raw);
    if (objectMatch?.[0]) {
      return objectMatch[0].trim();
    }

    return raw.trim();
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
