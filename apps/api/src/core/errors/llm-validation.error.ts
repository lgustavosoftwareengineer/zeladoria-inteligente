import type { z } from 'zod';

export class LlmValidationError extends Error {
  constructor(issues: z.core.$ZodIssue[]) {
    super(
      `LLM output failed schema validation: ${JSON.stringify(issues, null, 2)}`,
    );
    this.name = 'LlmValidationError';
  }
}
