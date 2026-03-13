import { CATEGORIES, PRIORITIES } from '@/core/domain';
import { buildTriagePrompt } from '@/llm/prompts/triage.prompt';
import { STUB_REPORT_INPUT } from '@/llm/stubs';

describe('buildTriagePrompt', () => {
  it('should interpolate all three input fields into the prompt', () => {
    // Arrange & Act
    const prompt = buildTriagePrompt(STUB_REPORT_INPUT);

    // Assert
    expect(prompt).toContain(STUB_REPORT_INPUT.title);
    expect(prompt).toContain(STUB_REPORT_INPUT.description);
    expect(prompt).toContain(STUB_REPORT_INPUT.location);
  });

  it('should include all valid CATEGORIES values in the prompt', () => {
    // Arrange & Act
    const prompt = buildTriagePrompt(STUB_REPORT_INPUT);

    // Assert
    CATEGORIES.forEach((category) => {
      expect(prompt).toContain(category);
    });
  });

  it('should include all valid PRIORITIES values in the prompt', () => {
    // Arrange & Act
    const prompt = buildTriagePrompt(STUB_REPORT_INPUT);

    // Assert
    PRIORITIES.forEach((priority) => {
      expect(prompt).toContain(priority);
    });
  });

  it('should instruct the model to return only JSON without markdown', () => {
    // Arrange & Act
    const prompt = buildTriagePrompt(STUB_REPORT_INPUT);

    // Assert
    expect(prompt).toContain('EXCLUSIVAMENTE');
    expect(prompt).toContain('sem markdown');
  });
});
