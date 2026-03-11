export interface ILlmProvider {
  readonly providerName: string;
  complete(prompt: string): Promise<string>;
}
