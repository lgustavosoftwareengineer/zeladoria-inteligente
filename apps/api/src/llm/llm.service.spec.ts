import { LlmUnavailableError } from '@/core/errors';
import { MAX_ATTEMPTS } from '@/llm/llm.constants';
import { LlmService } from '@/llm/llm.service';
import { OpenRouterProvider } from '@/llm/providers/openrouter.provider';
import type { ReportInput } from '@/core/ports';

const VALID_RAW_RESPONSE = JSON.stringify({
  category: 'Via Pública',
  priority: 'Alta',
  technical_summary: 'Dano estrutural identificado em via pública.',
});

const MOCK_INPUT: ReportInput = {
  title: 'Buraco na rua',
  description: 'Buraco enorme na frente da casa',
  location: 'Rua das Flores, 42',
};

describe('LlmService', () => {
  let service: LlmService;
  let completeMock: jest.Mock;
  let mockProvider: jest.Mocked<
    Pick<OpenRouterProvider, 'complete' | 'providerName'>
  >;

  beforeEach(() => {
    completeMock = jest.fn();
    mockProvider = {
      providerName: 'openrouter',
      complete: completeMock,
    };
    service = new LlmService(mockProvider as unknown as OpenRouterProvider);
  });

  describe('analyze', () => {
    it('should return parsed output on success', async () => {
      // Arrange
      completeMock.mockResolvedValue(VALID_RAW_RESPONSE);

      // Act
      const result = await service.analyze(MOCK_INPUT);

      // Assert
      expect(result.output.category).toBe('Via Pública');
      expect(result.output.priority).toBe('Alta');
      expect(result.rawResponse).toBe(VALID_RAW_RESPONSE);
      expect(result.latencyMs).toBeGreaterThanOrEqual(0);
    });

    it('should strip markdown code fences before parsing', async () => {
      // Arrange
      const wrappedResponse = `\`\`\`json\n${VALID_RAW_RESPONSE}\n\`\`\``;
      completeMock.mockResolvedValue(wrappedResponse);

      // Act
      const result = await service.analyze(MOCK_INPUT);

      // Assert
      expect(result.output.category).toBe('Via Pública');
    });

    it('should throw LlmUnavailableError after MAX_ATTEMPTS failed provider attempts', async () => {
      // Arrange
      completeMock.mockRejectedValue(new Error('network timeout'));

      // Act
      const act = () => service.analyze(MOCK_INPUT);

      // Assert
      await expect(act()).rejects.toThrow(LlmUnavailableError);
      expect(completeMock).toHaveBeenCalledTimes(MAX_ATTEMPTS);
    });

    it('should throw LlmUnavailableError after MAX_ATTEMPTS parse failures', async () => {
      // Arrange
      completeMock.mockResolvedValue('this is not json at all');

      // Act
      const act = () => service.analyze(MOCK_INPUT);

      // Assert
      await expect(act()).rejects.toThrow(LlmUnavailableError);
      expect(completeMock).toHaveBeenCalledTimes(MAX_ATTEMPTS);
    });

    it('should throw LlmUnavailableError after MAX_ATTEMPTS schema validation failures', async () => {
      // Arrange
      completeMock.mockResolvedValue(JSON.stringify({ foo: 'bar' }));

      // Act
      const act = () => service.analyze(MOCK_INPUT);

      // Assert
      await expect(act()).rejects.toThrow(LlmUnavailableError);
      expect(completeMock).toHaveBeenCalledTimes(MAX_ATTEMPTS);
    });

    it('should recover on third attempt after two parse failures', async () => {
      // Arrange
      mockProvider.complete
        .mockResolvedValueOnce('not json')
        .mockResolvedValueOnce('still not json')
        .mockResolvedValue(VALID_RAW_RESPONSE);

      // Act
      const result = await service.analyze(MOCK_INPUT);

      // Assert
      expect(result.output.category).toBe('Via Pública');
      expect(completeMock).toHaveBeenCalledTimes(MAX_ATTEMPTS);
    });

    it('should throw LlmUnavailableError when category is not in enum', async () => {
      // Arrange
      completeMock.mockResolvedValue(
        JSON.stringify({
          category: 'Invalid Category',
          priority: 'Alta',
          technical_summary: 'Valid technical summary text here.',
        }),
      );

      // Act
      const act = () => service.analyze(MOCK_INPUT);

      // Assert
      await expect(act()).rejects.toThrow(LlmUnavailableError);
    });
  });
});
