/**
 * Application Error Hierarchy
 * Provides consistent error handling with codes, context, and recovery info
 */

export enum ErrorCode {
  // Database errors (1xxx)
  DB_CONNECTION_FAILED = 1001,
  DB_QUERY_FAILED = 1002,
  DB_TRANSACTION_FAILED = 1003,
  DB_MIGRATION_FAILED = 1004,
  
  // Data errors (2xxx)
  DATA_NOT_FOUND = 2001,
  DATA_INVALID = 2002,
  DATA_SYNC_FAILED = 2003,
  DATA_CORRUPTION = 2004,
  
  // Validation errors (3xxx)
  VALIDATION_FAILED = 3001,
  SCHEMA_MISMATCH = 3002,
  REQUIRED_FIELD_MISSING = 3003,
  
  // Repository errors (4xxx)
  REPOSITORY_OPERATION_FAILED = 4001,
  ENTITY_NOT_FOUND = 4002,
  DUPLICATE_ENTITY = 4003,
  
  // Game logic errors (5xxx)
  GAME_STATE_INVALID = 5001,
  GAME_ENGINE_ERROR = 5002,
  
  // Unknown/Generic
  UNKNOWN_ERROR = 9999,
}

export interface ErrorContext {
  operation?: string;
  entityType?: string;
  entityId?: string | number;
  details?: Record<string, any>;
  timestamp?: number;
}

/**
 * Base application error with structured information
 */
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly context: ErrorContext;
  public readonly isOperational: boolean; // Can be handled gracefully
  public readonly timestamp: number;

  constructor(
    message: string,
    code: ErrorCode = ErrorCode.UNKNOWN_ERROR,
    context: ErrorContext = {},
    isOperational: boolean = true
  ) {
    super(message);
    
    this.name = this.constructor.name;
    this.code = code;
    this.context = {
      ...context,
      timestamp: Date.now(),
    };
    this.isOperational = isOperational;
    this.timestamp = Date.now();
    
    // Maintains proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Convert to structured log format
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      context: this.context,
      isOperational: this.isOperational,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }

  /**
   * Get user-friendly message
   */
  getUserMessage(): string {
    switch (this.code) {
      case ErrorCode.DB_CONNECTION_FAILED:
        return 'Unable to connect to the database. Please check your connection and try again.';
      case ErrorCode.DATA_NOT_FOUND:
        return `We couldn't find the ${this.context.entityType?.toLowerCase() || 'data'} you were looking for.`;
      case ErrorCode.VALIDATION_FAILED:
        return 'Some information is invalid. Please review your input and try again.';
      case ErrorCode.DATA_SYNC_FAILED:
        return 'Failed to sync your progress. Your data is saved locally and will sync later.';
      case ErrorCode.GAME_STATE_INVALID:
        return 'The mission state got corrupted. Please restart the mission to continue.';
      default:
        return `An unexpected error occurred (Code: ${this.code}). If this persists, please try refreshing.`;
    }
  }
}

/**
 * Database-specific errors
 */
export class DatabaseError extends AppError {
  constructor(
    message: string,
    code: ErrorCode = ErrorCode.DB_QUERY_FAILED,
    context: ErrorContext = {}
  ) {
    super(message, code, context, true);
  }
}

/**
 * Data validation errors
 */
export class ValidationError extends AppError {
  public readonly validationErrors: Record<string, string[]>;

  constructor(
    message: string,
    validationErrors: Record<string, string[]> = {},
    context: ErrorContext = {}
  ) {
    super(message, ErrorCode.VALIDATION_FAILED, context, true);
    this.validationErrors = validationErrors;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      validationErrors: this.validationErrors,
    };
  }
}

/**
 * Entity not found error
 */
export class EntityNotFoundError extends AppError {
  constructor(entityType: string, entityId: string | number) {
    super(
      `${entityType} with ID ${entityId} not found`,
      ErrorCode.ENTITY_NOT_FOUND,
      { entityType, entityId },
      true
    );
  }
}

/**
 * Transaction errors
 */
export class TransactionError extends DatabaseError {
  constructor(message: string, context: ErrorContext = {}) {
    super(message, ErrorCode.DB_TRANSACTION_FAILED, context);
  }
}

/**
 * Data corruption errors (non-operational)
 */
export class DataCorruptionError extends AppError {
  constructor(message: string, context: ErrorContext = {}) {
    super(message, ErrorCode.DATA_CORRUPTION, context, false);
  }
}

/**
 * Error logger utility
 */
export class ErrorLogger {
  static log(error: Error | AppError): void {
    if (error instanceof AppError) {
      console.error(`[${error.name}] ${error.code}:`, error.toJSON());
    } else {
      console.error('[UnhandledError]', error);
    }
  }

  static logWithContext(error: Error | AppError, additionalContext: Record<string, any>): void {
    if (error instanceof AppError) {
      console.error(`[${error.name}] ${error.code}:`, {
        ...error.toJSON(),
        additionalContext,
      });
    } else {
      console.error('[UnhandledError]', { error, additionalContext });
    }
  }
}
