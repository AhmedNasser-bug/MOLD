/**
 * Local Model Adapter (Stub)
 * Implements LLMAdapter for local/self-hosted models (e.g., Ollama, llama.cpp).
 */
import type { LLMAdapter, LLMResponse, GenerationOptions } from './LLMAdapter';

export class LocalModelAdapter implements LLMAdapter {
    readonly provider = 'local';
    private endpoint: string;
    private modelName: string;

    constructor(config: { endpoint: string; modelName: string }) {
        this.endpoint = config.endpoint;
        this.modelName = config.modelName;
    }

    async generate(prompt: string, options?: GenerationOptions): Promise<LLMResponse> {
        // STUB: Implement local model API call
        throw new Error('LocalModelAdapter.generate() not implemented');
    }

    async streamGenerate(
        prompt: string,
        onChunk: (chunk: string) => void,
        options?: GenerationOptions
    ): Promise<LLMResponse> {
        // STUB: Implement streaming
        throw new Error('LocalModelAdapter.streamGenerate() not implemented');
    }

    async healthCheck(): Promise<boolean> {
        // STUB: Check if local model server is running
        return false;
    }
}
