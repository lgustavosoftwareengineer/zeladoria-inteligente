export const LLM_PROVIDER = 'LLM_PROVIDER';

export interface ILlmProvider {
  readonly providerName: string;
  complete(prompt: string): Promise<string>;
}
