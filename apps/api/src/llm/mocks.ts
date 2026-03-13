type LlmProviderMock = {
  providerName: string;
  complete: jest.Mock<Promise<string>, [string]>;
};

export function buildMockOpenRouterProvider(): LlmProviderMock {
  return {
    providerName: 'openrouter',
    complete: jest.fn<Promise<string>, [string]>(),
  };
}
