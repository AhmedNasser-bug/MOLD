/**
 * Generation Pipeline
 * Chain of Responsibility Pattern: Sequential processing steps.
 */

/**
 * Interface for a single pipeline step.
 */
export interface PipelineStep<TIn = unknown, TOut = unknown> {
    readonly name: string;
    process(input: TIn): Promise<TOut>;
}

/**
 * Context passed through the pipeline.
 */
export interface PipelineContext {
    materialId?: string;
    chunkId?: string;
    metadata: Record<string, unknown>;
    errors: Error[];
}

/**
 * Result of pipeline execution.
 */
export interface PipelineResult<T> {
    success: boolean;
    data?: T;
    context: PipelineContext;
    executionTime: number;
    stepsExecuted: string[];
}

/**
 * Generation Pipeline using Chain of Responsibility pattern.
 * Allows registering processing steps that pass data down the chain.
 */
export class GenerationPipeline {
    private steps: PipelineStep[] = [];
    private context: PipelineContext;

    constructor() {
        this.context = {
            metadata: {},
            errors: []
        };
    }

    /**
     * Register a processing step.
     * Steps are executed in order of registration.
     */
    register<TIn, TOut>(step: PipelineStep<TIn, TOut>): this {
        this.steps.push(step as PipelineStep);
        return this;
    }

    /**
     * Clear all registered steps.
     */
    clear(): this {
        this.steps = [];
        return this;
    }

    /**
     * Execute the pipeline with the given input.
     */
    async execute<TInput, TOutput>(input: TInput): Promise<PipelineResult<TOutput>> {
        const startTime = Date.now();
        const stepsExecuted: string[] = [];
        let result: unknown = input;

        this.context = {
            metadata: {},
            errors: []
        };

        try {
            for (const step of this.steps) {
                stepsExecuted.push(step.name);
                result = await step.process(result);
            }

            return {
                success: true,
                data: result as TOutput,
                context: this.context,
                executionTime: Date.now() - startTime,
                stepsExecuted
            };
        } catch (error) {
            this.context.errors.push(error as Error);
            return {
                success: false,
                context: this.context,
                executionTime: Date.now() - startTime,
                stepsExecuted
            };
        }
    }

    /**
     * Get the current context.
     */
    getContext(): PipelineContext {
        return this.context;
    }

    /**
     * Update context metadata.
     */
    setContextMetadata(key: string, value: unknown): void {
        this.context.metadata[key] = value;
    }
}
