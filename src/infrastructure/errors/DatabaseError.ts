export class DatabaseError extends Error {
    constructor(
        message: string,
        public readonly operation: string,
        public readonly originalError?: unknown
    ) {
        super(message);
        this.name = 'DatabaseError';

        // Maintains proper stack trace for where our error was thrown (only available on V8 Engine)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, DatabaseError);
        }
    }
}
