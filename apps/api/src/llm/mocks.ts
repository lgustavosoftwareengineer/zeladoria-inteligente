import type { ILlmProvider } from '@/llm/providers/llm-provider.interface';

export function buildMockOpenRouterProvider(): jest.Mocked<ILlmProvider> {
  return {
    providerName: 'openrouter',
    complete: jest.fn(),
  };
}
