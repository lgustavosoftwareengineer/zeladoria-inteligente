import { CATEGORIES, PRIORITIES } from '@/core/domain';
import { buildTriagePrompt } from '@/llm/prompts/triage.prompt';
import type { ReportInput } from '@/core/ports';

describe('buildTriagePrompt', () => {
  const mockInput: ReportInput = {
    title: 'Buraco na rua',
    description: 'Tem um buraco enorme na frente da minha casa',
    location: 'Rua das Flores, 42',
  };

  it('should interpolate all three input fields into the prompt', () => {
    // Arrange & Act
    const prompt = buildTriagePrompt(mockInput);

    // Assert
    expect(prompt).toContain(mockInput.title);
    expect(prompt).toContain(mockInput.description);
    expect(prompt).toContain(mockInput.location);
  });

  it('should include all valid CATEGORIES values in the prompt', () => {
    // Arrange & Act
    const prompt = buildTriagePrompt(mockInput);

    // Assert
    CATEGORIES.forEach((category) => {
      expect(prompt).toContain(category);
    });
  });

  it('should include all valid PRIORITIES values in the prompt', () => {
    // Arrange & Act
    const prompt = buildTriagePrompt(mockInput);

    // Assert
    PRIORITIES.forEach((priority) => {
      expect(prompt).toContain(priority);
    });
  });

  it('should instruct the model to return only JSON without markdown', () => {
    // Arrange & Act
    const prompt = buildTriagePrompt(mockInput);

    // Assert
    expect(prompt).toContain('EXCLUSIVAMENTE');
    expect(prompt).toContain('sem markdown');
  });
});
