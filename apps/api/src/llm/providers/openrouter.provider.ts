import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import {
  DEFAULT_LLM_PROVIDER_NAME,
  DEFAULT_OPENROUTER_MODEL,
  Env,
} from '@/core/config';
import {
  DEFAULT_LLM_TEMPERATURE,
  OPENROUTER_BASE_URL,
  OPENROUTER_EMPTY_CONTENT_ERROR,
} from '@/llm/llm.constants';
import { ILlmProvider } from '@/llm/providers/llm-provider.interface';

@Injectable()
export class OpenRouterProvider implements ILlmProvider, OnModuleInit {
  readonly providerName = DEFAULT_LLM_PROVIDER_NAME;
  private readonly logger = new Logger(OpenRouterProvider.name);
  private client!: OpenAI;
  private model!: string;

  constructor(private readonly config: ConfigService<Env>) {}

  onModuleInit(): void {
    this.client = new OpenAI({
      baseURL: OPENROUTER_BASE_URL,
      apiKey: this.config.get('OPENROUTER_API_KEY'),
    });

    this.model =
      this.config.get('OPENROUTER_MODEL') ?? DEFAULT_OPENROUTER_MODEL;

    this.logger.log(`OpenRouter provider ready — model: ${this.model}`);
  }

  async complete(prompt: string): Promise<string> {
    const completion = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: DEFAULT_LLM_TEMPERATURE,
    });

    const [firstChoice] = completion.choices;
    const content = firstChoice?.message?.content;

    if (!content) {
      throw new Error(OPENROUTER_EMPTY_CONTENT_ERROR);
    }

    return content;
  }
}
