export class LlmParseError extends Error {
  constructor(raw: string) {
    super(`Failed to parse LLM response as JSON. Raw: "${raw.slice(0, 300)}"`);
    this.name = 'LlmParseError';
  }
}
