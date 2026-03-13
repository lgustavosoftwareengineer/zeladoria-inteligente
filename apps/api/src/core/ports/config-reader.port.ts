import type { Env } from '@/core/config';

export interface IConfigReader {
  get(key: keyof Env, options: { infer: true }): string | undefined;
}
