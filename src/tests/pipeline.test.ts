/**
 * Pipeline Test Scaffold
 * Tests for GenerationPipeline
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { GenerationPipeline, type PipelineStep } from '../processing/GenerationPipeline';

describe('GenerationPipeline', () => {
    let pipeline: GenerationPipeline;

    beforeEach(() => {
        pipeline = new GenerationPipeline();
    });

    it('should register steps', () => {
        const step: PipelineStep<string, string> = {
            name: 'TestStep',
            process: async (input) => input.toUpperCase()
        };

        pipeline.register(step);
        // Verify registration (implementation detail)
    });

    it('should execute steps in order', async () => {
        const step1: PipelineStep<number, number> = {
            name: 'Double',
            process: async (n) => n * 2
        };

        const step2: PipelineStep<number, string> = {
            name: 'Stringify',
            process: async (n) => `Result: ${n}`
        };

        pipeline.register(step1).register(step2);

        const result = await pipeline.execute<number, string>(5);

        expect(result.success).toBe(true);
        expect(result.data).toBe('Result: 10');
        expect(result.stepsExecuted).toEqual(['Double', 'Stringify']);
    });

    it('should handle errors gracefully', async () => {
        const failingStep: PipelineStep = {
            name: 'FailStep',
            process: async () => { throw new Error('Test error'); }
        };

        pipeline.register(failingStep);

        const result = await pipeline.execute('input');

        expect(result.success).toBe(false);
        expect(result.context.errors.length).toBeGreaterThan(0);
    });

    it('should track execution time', async () => {
        const slowStep: PipelineStep<string, string> = {
            name: 'SlowStep',
            process: async (input) => {
                await new Promise(r => setTimeout(r, 50));
                return input;
            }
        };

        pipeline.register(slowStep);

        const result = await pipeline.execute('test');

        expect(result.executionTime).toBeGreaterThanOrEqual(50);
    });
});
