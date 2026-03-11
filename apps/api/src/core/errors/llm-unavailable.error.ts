export class LlmUnavailableError extends Error {
  constructor(cause?: Error) {
    super('LLM provider is temporarily unavailable');
    this.name = 'LlmUnavailableError';
    if (cause) this.cause = cause;
  }
}
