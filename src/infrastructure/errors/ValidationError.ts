import { ZodError } from 'zod';

export class ValidationError extends Error {
    constructor(
        message: string,
        public readonly entity: string,
        public readonly originalError?: ZodError | unknown
    ) {
        super(message);
        this.name = 'ValidationError';

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ValidationError);
        }
    }
}
