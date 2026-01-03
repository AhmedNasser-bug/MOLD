
/**
 * LLM Adapter Interface
 * 
 * Defines the contract for any Large Language Model provider.
 * This allows the Generator to be agnostic of the underlying AI service.
 */
export interface LLMAdapter {
    /**
     * generating text response from a prompt.
     * @param prompt The prompt to send to the LLM.
     * @param options Optional configuration overrides (temperature, etc.)
     */
    generate(prompt: string, options?: Record<string, any>): Promise<string>;
}
