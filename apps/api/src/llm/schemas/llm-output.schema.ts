import { z } from 'zod';
import { CATEGORIES, PRIORITIES } from '@/core/domain';

export const LlmOutputSchema = z.object({
  category: z.enum(CATEGORIES),
  priority: z.enum(PRIORITIES),
  technical_summary: z.string().min(10).max(1000),
});

export type LlmOutput = z.infer<typeof LlmOutputSchema>;
