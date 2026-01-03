
import type { LLMAdapter } from './LLMAdapter';

/**
 * Gemini Adapter
 * Implementation of LLMAdapter for Google Gemini API.
 */
export class GeminiAdapter implements LLMAdapter {
    private apiKey: string;
    private baseUrl: string = 'https://generativelanguage.googleapis.com/v1beta/models';
    private model: string;

    constructor(apiKey: string, model: string = 'gemini-pro') {
        this.apiKey = apiKey;
        this.model = model;
    }

    async generate(prompt: string, options?: Record<string, any>): Promise<string> {
        if (!this.apiKey) {
            console.warn('⚠️ No Gemini API Key provided. Returning mock response.');
            return this.getMockResponse();
        }

        const modelToUse = options?.model || this.model;
        const url = `${this.baseUrl}/${modelToUse}:generateContent?key=${this.apiKey}`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: options?.temperature || 0.7
                    }
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Gemini API Error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        } catch (error) {
            console.error('Gemini Generation Failed:', error);
            throw error; // Re-throw to be handled by pipeline
        }
    }

    private getMockResponse(): string {
        return JSON.stringify([{
            id: 'mock_1',
            type: 'mcq',
            question: 'MOCK (Gemini): What is the consensus mechanism of Bitcoin?',
            options: ['Proof of Work', 'Proof of Stake', 'Proof of History', 'Proof of Authority'],
            correct: 0,
            explanation: 'Bitcoin uses Proof of Work (PoW) where miners solve complex mathematical puzzles.',
            category: 'Blockchain Basics'
        }]);
    }
}
