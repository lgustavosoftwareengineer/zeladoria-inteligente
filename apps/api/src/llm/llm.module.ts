import { Global, Module, type Provider } from '@nestjs/common';
import { LLM_ANALYZER_PORT } from '@/core/ports';
import { LlmService } from '@/llm/llm.service';
import { OpenRouterProvider } from '@/llm/providers/openrouter.provider';

const llmAnalyzerProvider: Provider = {
  provide: LLM_ANALYZER_PORT,
  useExisting: LlmService,
};

@Global()
@Module({
  providers: [OpenRouterProvider, LlmService, llmAnalyzerProvider],
  exports: [LLM_ANALYZER_PORT],
})
export class LlmModule {}
