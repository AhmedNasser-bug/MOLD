/**
 * Adapter Test Scaffold
 * Tests for LLM Adapters
 */
import { describe, it, expect } from 'vitest';
import { OpenAIAdapter } from '../ai/OpenAIAdapter';
import { AnthropicAdapter } from '../ai/AnthropicAdapter';
import { LocalModelAdapter } from '../ai/LocalModelAdapter';

describe('LLM Adapters', () => {
    describe('OpenAIAdapter', () => {
        it('should have correct provider name', () => {
            const adapter = new OpenAIAdapter({ apiKey: 'test-key' });
            expect(adapter.provider).toBe('openai');
        });

        it('should throw on generate (not implemented)', async () => {
            const adapter = new OpenAIAdapter({ apiKey: 'test-key' });
            await expect(adapter.generate('test')).rejects.toThrow('not implemented');
        });

        it('should return false on healthCheck (not implemented)', async () => {
            const adapter = new OpenAIAdapter({ apiKey: 'test-key' });
            const result = await adapter.healthCheck();
            expect(result).toBe(false);
        });
    });

    describe('AnthropicAdapter', () => {
        it('should have correct provider name', () => {
            const adapter = new AnthropicAdapter({ apiKey: 'test-key' });
            expect(adapter.provider).toBe('anthropic');
        });

        it('should throw on generate (not implemented)', async () => {
            const adapter = new AnthropicAdapter({ apiKey: 'test-key' });
            await expect(adapter.generate('test')).rejects.toThrow('not implemented');
        });
    });

    describe('LocalModelAdapter', () => {
        it('should have correct provider name', () => {
            const adapter = new LocalModelAdapter({
                endpoint: 'http://localhost:11434',
                modelName: 'llama2'
            });
            expect(adapter.provider).toBe('local');
        });

        it('should throw on generate (not implemented)', async () => {
            const adapter = new LocalModelAdapter({
                endpoint: 'http://localhost:11434',
                modelName: 'llama2'
            });
            await expect(adapter.generate('test')).rejects.toThrow('not implemented');
        });
    });
});
