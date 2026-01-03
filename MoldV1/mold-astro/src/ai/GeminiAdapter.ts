
/**
 * Gemini Adapter
 * Implements LLMAdapter for Google Gemini models via REST API.
 */
import type { LLMAdapter, LLMResponse, GenerationOptions } from './LLMAdapter';

export class GeminiAdapter implements LLMAdapter {
    readonly provider = 'gemini';
    private apiKey: string;
    private baseUrl: string;

    constructor(config: { apiKey: string; baseUrl?: string }) {
        this.apiKey = config.apiKey;
        this.baseUrl = config.baseUrl || 'https://generativelanguage.googleapis.com/v1beta/models';
    }

    async generate(prompt: string, options?: GenerationOptions): Promise<string> {
        if (!this.apiKey) {
            console.warn('⚠️ No Gemini API Key provided. Returning mock response.');
            return JSON.stringify([
                {
                    type: "mcq",
                    question: "MOCK (Gemini): What is the primary advantage of Proof of Stake?",
                    options: ["Energy Efficiency", "Higher Energy Use", "Centralization", "Slower Speed"],
                    correct: 0,
                    explanation: "PoS systems use significantly less energy than PoW.",
                    category: "Consensus",
                    difficulty: "medium"
                }
            ]);
        }

        try {
            const model = options?.model || 'gemini-pro';
            const url = `${this.baseUrl}/${model}:generateContent?key=${this.apiKey}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        temperature: options?.temperature || 0.7,
                        maxOutputTokens: options?.maxTokens || 4000
                    }
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Gemini API Error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();

            // Extract text from Gemini response structure
            if (data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
                return data.candidates[0].content.parts[0].text;
            } else {
                throw new Error('Gemini response missing candidates/content');
            }

        } catch (error) {
            console.error('Gemini Generation Failed:', error);
            throw error;
        }
    }

    async streamGenerate(
        prompt: string,
        onChunk: (chunk: string) => void,
        options?: GenerationOptions
    ): Promise<string> {
        throw new Error('Streaming not supported in this version of GeminiAdapter.');
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
