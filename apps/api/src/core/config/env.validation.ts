import { z } from 'zod';
import {
  DEFAULT_CORS_ORIGIN,
  DEFAULT_LLM_PROVIDER_NAME,
  DEFAULT_OPENROUTER_MODEL,
  DEFAULT_PORT,
} from './default-env';

const EnvSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().default(DEFAULT_PORT),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  OPENROUTER_API_KEY: z.string().min(1, 'OPENROUTER_API_KEY is required'),
  OPENROUTER_MODEL: z.string().default(DEFAULT_OPENROUTER_MODEL),
  LLM_PROVIDER_NAME: z.string().default(DEFAULT_LLM_PROVIDER_NAME),
  CORS_ORIGIN: z.string().default(DEFAULT_CORS_ORIGIN),
});

export type Env = z.infer<typeof EnvSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  const result = EnvSchema.safeParse(config);

  if (!result.success) {
    const formatted = result.error.issues
      .map((e) => `  - ${String(e.path.join('.'))}: ${e.message}`)
      .join('\n');
    throw new Error(`Environment validation failed:\n${formatted}`);
  }

  return result.data;
}
