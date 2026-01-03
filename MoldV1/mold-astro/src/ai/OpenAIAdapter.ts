/**
 * OpenAI Adapter (Stub)
 * Implements LLMAdapter for OpenAI GPT models.
 */
import type { LLMAdapter, LLMResponse, GenerationOptions } from './LLMAdapter';

export class OpenAIAdapter implements LLMAdapter {
    readonly provider = 'openai';
    private apiKey: string;
    private baseUrl: string;

    constructor(config: { apiKey: string; baseUrl?: string }) {
        this.apiKey = config.apiKey;
        this.baseUrl = config.baseUrl || 'https://api.openai.com/v1';
    }

    async generate(prompt: string, options?: GenerationOptions): Promise<string> {
        if (!this.apiKey) {
            // Fallback for development/testing without cost
            console.warn('⚠️ No OpenAI API Key provided. Returning mock response.');
            return JSON.stringify([
                {
                    type: "mcq",
                    question: "MOCK: What is the primary purpose of a blockchain?",
                    options: ["Decentralization", "Centralization", "Database Optimization", "Gaming"],
                    correct: 0,
                    explanation: "Blockchain technology allows for decentralized data management.",
                    category: "Core Concepts",
                    difficulty: "easy"
                }
            ]);
        }

        try {
            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: options?.model || 'gpt-4o',
                    messages: [
                        { role: 'system', content: 'You are a strict JSON generator.' },
                        { role: 'user', content: prompt }
                    ],
                    temperature: options?.temperature || 0.7,
                    max_tokens: options?.maxTokens || 4000
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`OpenAI API Error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;

        } catch (error) {
            console.error('LLM Generation Failed:', error);
            throw error;
        }
    }

    async streamGenerate(
        prompt: string,
        onChunk: (chunk: string) => void,
        options?: GenerationOptions
    ): Promise<string> {
        throw new Error('Streaming not supported in this version.');
    }

    async healthCheck(): Promise<boolean> {
        try {
            await this.generate('ping', { maxTokens: 5 });
            return true;
        } catch {
            return false;
        }
    }
}
