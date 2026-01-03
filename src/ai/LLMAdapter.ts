/**
 * LLM Adapter Interface
 * Adapter Pattern: Abstracts LLM provider differences.
 */

export interface GenerationOptions {
    temperature?: number;
    maxTokens?: number;
    model?: string;
    systemPrompt?: string;
    stopSequences?: string[];
}

export interface LLMResponse {
    content: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
    model?: string;
    finishReason?: 'stop' | 'length' | 'error';
}

/**
 * Abstract interface for LLM providers.
 * Implement this to add support for new LLM backends.
 */
export interface LLMAdapter {
    /**
     * Provider name (e.g., 'openai', 'anthropic', 'local')
     */
    readonly provider: string;

    /**
     * Generate a completion from the given prompt.
     */
    generate(prompt: string, options?: GenerationOptions): Promise<LLMResponse>;

    /**
     * Stream generation with chunk callbacks.
     */
    streamGenerate?(
        prompt: string,
        onChunk: (chunk: string) => void,
        options?: GenerationOptions
    ): Promise<LLMResponse>;

    /**
     * Test connection to the LLM service.
     */
    healthCheck(): Promise<boolean>;
}
