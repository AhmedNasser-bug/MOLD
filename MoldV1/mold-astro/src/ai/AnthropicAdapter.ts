/**
 * Anthropic Adapter (Stub)
 * Implements LLMAdapter for Anthropic Claude models.
 */
import type { LLMAdapter, LLMResponse, GenerationOptions } from './LLMAdapter';

export class AnthropicAdapter implements LLMAdapter {
    readonly provider = 'anthropic';
    private apiKey: string;

    constructor(config: { apiKey: string }) {
        this.apiKey = config.apiKey;
    }

    async generate(prompt: string, options?: GenerationOptions): Promise<LLMResponse> {
        // STUB: Implement Anthropic API call
        throw new Error('AnthropicAdapter.generate() not implemented');
    }

    async streamGenerate(
        prompt: string,
        onChunk: (chunk: string) => void,
        options?: GenerationOptions
    ): Promise<LLMResponse> {
        // STUB: Implement streaming
        throw new Error('AnthropicAdapter.streamGenerate() not implemented');
    }

    async healthCheck(): Promise<boolean> {
        // STUB: Implement health check
        return false;
    }
}
