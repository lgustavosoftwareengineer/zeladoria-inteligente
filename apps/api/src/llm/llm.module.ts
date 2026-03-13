import { Global, Module } from '@nestjs/common';
import { LLM_ANALYZER_PORT } from '@/core/ports';
import { LlmService } from '@/llm/llm.service';
import { LLM_PROVIDER } from '@/llm/providers/llm-provider.interface';
import { OpenRouterProvider } from '@/llm/providers/openrouter.provider';

@Global()
@Module({
  providers: [
    { provide: LLM_PROVIDER, useClass: OpenRouterProvider },
    { provide: LLM_ANALYZER_PORT, useClass: LlmService },
  ],
  exports: [LLM_ANALYZER_PORT],
})
export class LlmModule {}
