import { LlmUnavailableError } from '@/core/errors';
import { MAX_ATTEMPTS } from '@/llm/llm.constants';
import { LlmService } from '@/llm/llm.service';
import { buildMockOpenRouterProvider } from '@/llm/mocks';
import { STUB_REPORT_INPUT, STUB_VALID_RAW_RESPONSE } from '@/llm/stubs';

describe('LlmService', () => {
  let service: LlmService;
  let mockProvider: ReturnType<typeof buildMockOpenRouterProvider>;

  beforeEach(() => {
    jest.useFakeTimers();
    mockProvider = buildMockOpenRouterProvider();
    service = new LlmService(mockProvider);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('analyze', () => {
    it('should return parsed output on success', async () => {
      // Arrange
      mockProvider.complete.mockResolvedValue(STUB_VALID_RAW_RESPONSE);

      // Act
      const result = await service.analyze(STUB_REPORT_INPUT);

      // Assert
      expect(result.output.category).toBe('Via Pública');
      expect(result.output.priority).toBe('Alta');
      expect(result.rawResponse).toBe(STUB_VALID_RAW_RESPONSE);
      expect(result.latencyMs).toBeGreaterThanOrEqual(0);
    });

    it('should strip markdown code fences before parsing', async () => {
      // Arrange
      const wrappedResponse = `\`\`\`json\n${STUB_VALID_RAW_RESPONSE}\n\`\`\``;
      mockProvider.complete.mockResolvedValue(wrappedResponse);

      // Act
      const result = await service.analyze(STUB_REPORT_INPUT);

      // Assert
      expect(result.output.category).toBe('Via Pública');
    });

    it('should throw LlmUnavailableError after MAX_ATTEMPTS failed provider attempts', async () => {
      // Arrange
      mockProvider.complete.mockRejectedValue(new Error('network timeout'));

      // Act — attach rejection handler before advancing timers to avoid unhandled rejection
      const assertion = expect(
        service.analyze(STUB_REPORT_INPUT),
      ).rejects.toThrow(LlmUnavailableError);
      await jest.runAllTimersAsync();

      // Assert
      await assertion;
      expect(mockProvider.complete).toHaveBeenCalledTimes(MAX_ATTEMPTS);
    });

    it('should throw LlmUnavailableError after MAX_ATTEMPTS parse failures', async () => {
      // Arrange
      mockProvider.complete.mockResolvedValue('this is not json at all');

      // Act — attach rejection handler before advancing timers to avoid unhandled rejection
      const assertion = expect(
        service.analyze(STUB_REPORT_INPUT),
      ).rejects.toThrow(LlmUnavailableError);
      await jest.runAllTimersAsync();

      // Assert
      await assertion;
      expect(mockProvider.complete).toHaveBeenCalledTimes(MAX_ATTEMPTS);
    });

    it('should throw LlmUnavailableError after MAX_ATTEMPTS schema validation failures', async () => {
      // Arrange
      mockProvider.complete.mockResolvedValue(JSON.stringify({ foo: 'bar' }));

      // Act — attach rejection handler before advancing timers to avoid unhandled rejection
      const assertion = expect(
        service.analyze(STUB_REPORT_INPUT),
      ).rejects.toThrow(LlmUnavailableError);
      await jest.runAllTimersAsync();

      // Assert
      await assertion;
      expect(mockProvider.complete).toHaveBeenCalledTimes(MAX_ATTEMPTS);
    });

    it('should recover on third attempt after two parse failures', async () => {
      // Arrange
      mockProvider.complete
        .mockResolvedValueOnce('not json')
        .mockResolvedValueOnce('still not json')
        .mockResolvedValue(STUB_VALID_RAW_RESPONSE);

      // Act
      const promise = service.analyze(STUB_REPORT_INPUT);
      await jest.runAllTimersAsync();
      const result = await promise;

      // Assert
      expect(result.output.category).toBe('Via Pública');
      expect(mockProvider.complete).toHaveBeenCalledTimes(MAX_ATTEMPTS);
    });

    it('should throw LlmUnavailableError when category is not in enum', async () => {
      // Arrange
      mockProvider.complete.mockResolvedValue(
        JSON.stringify({
          category: 'Invalid Category',
          priority: 'Alta',
          technical_summary: 'Valid technical summary text here.',
        }),
      );

      // Act — attach rejection handler before advancing timers to avoid unhandled rejection
      const assertion = expect(
        service.analyze(STUB_REPORT_INPUT),
      ).rejects.toThrow(LlmUnavailableError);
      await jest.runAllTimersAsync();

      // Assert
      await assertion;
    });
  });
});
