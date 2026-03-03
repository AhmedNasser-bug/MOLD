# Critical Fixes Task List
## Persistence & Data Layer Design Flows

**Priority:** P0-P1 (Production Blockers)
**Total Effort:** 52 hours (1.5 weeks for 1 developer)
**Dependencies:** Must be done in order

---

## Task 1: Add Transaction Support to Repositories
**Priority:** P0 (Critical)  
**Effort:** 4 hours  
**Branch:** `fix/add-database-transactions`

### Problem
Multi-step database operations risk partial failures, leaving data in inconsistent state. Only 1 of 5 repositories uses transactions.

### Solution
Create reusable transaction wrapper and update all repositories.

### Implementation Steps

1. **Create Transaction Utility** (1 hour)
   - File: `src/infrastructure/db/TransactionManager.ts`
   ```typescript
   export class TransactionManager {
       static async execute<T>(
           db: DatabaseService,
           operations: (tx: DatabaseService) => Promise<T>
       ): Promise<T> {
           await db.run('BEGIN TRANSACTION');
           try {
               const result = await operations(db);
               await db.run('COMMIT');
               return result;
           } catch (error) {
               await db.run('ROLLBACK');
               throw error;
           }
       }
   }
   ```

2. **Update PlayerRepository** (30 min)
   - Wrap `addExp()` in transaction
   - Add rollback logic

3. **Update SubjectRepository.saveFullSubject()** (1 hour)
   - Currently saves subject, questions, separately
   - Wrap in transaction to ensure atomicity

4. **Update GameHistoryRepository** (30 min)
   - Wrap multi-table updates in transaction

5. **Create Tests** (1 hour)
   - Test successful transaction
   - Test rollback on error
   - Test nested transactions

### Acceptance Criteria
- [ ] All multi-step operations wrapped in transactions
- [ ] Rollback tested and working
- [ ] No partial database updates possible
- [ ] Tests cover success and failure cases

### Files Changed
- `src/infrastructure/db/TransactionManager.ts` (NEW)
- `src/infrastructure/db/repositories/PlayerRepository.ts`
- `src/infrastructure/db/repositories/SubjectRepository.ts`
- `src/infrastructure/db/repositories/GameHistoryRepository.ts`
- `tests/infrastructure/transaction-manager.test.ts` (NEW)

---

## Task 2: Cache Migration Status in Memory
**Priority:** P0 (Critical - Performance)  
**Effort:** 1 hour  
**Branch:** `fix/cache-migration-status`

### Problem
MigrationService checks database on every page load, adding 20-50ms overhead unnecessarily.

### Solution
Add in-memory flag after first migration check.

### Implementation Steps

1. **Update MigrationService** (45 min)
   ```typescript
   export class MigrationService {
       private static migrationComplete = false;
       
       async runMigrations(): Promise<void> {
           if (MigrationService.migrationComplete) {
               return; // Skip check
           }
           
           // Existing migration logic...
           
           MigrationService.migrationComplete = true;
       }
   }
   ```

2. **Add Debug Logging** (15 min)
   - Log when skipping due to cache
   - Log migration timing

### Acceptance Criteria
- [ ] Migration only runs once per session
- [ ] Page load 20-50ms faster after first load
- [ ] Debug logs show cache hits

### Files Changed
- `src/infrastructure/db/MigrationService.ts`

---

## Task 3: Create Standardized Error Types
**Priority:** P0 (Critical - Debuggability)  
**Effort:** 3 hours  
**Branch:** `fix/standardize-errors`

### Problem
15 catch blocks with inconsistent error handling. No error codes, context, or recovery information.

### Solution
Create custom error hierarchy with codes and context.

### Implementation Steps

1. **Create Error Base Classes** (1 hour)
   - File: `src/infrastructure/errors/AppErrors.ts`
   ```typescript
   export enum ErrorCode {
       // Database errors (1xxx)
       DB_CONNECTION_FAILED = 1001,
       DB_QUERY_FAILED = 1002,
       DB_TRANSACTION_FAILED = 1003,
       
       // Data errors (2xxx)
       DATA_NOT_FOUND = 2001,
       DATA_INVALID = 2002,
       DATA_SYNC_FAILED = 2003,
       
       // Validation errors (3xxx)
       VALIDATION_FAILED = 3001,
       SCHEMA_MISMATCH = 3002,
   }
   
   export class AppError extends Error {
       constructor(
           public readonly code: ErrorCode,
           message: string,
           public readonly context?: Record<string, any>,
           public readonly retryable: boolean = false
       ) {
           super(message);
           this.name = this.constructor.name;
       }
   }
   
   export class DatabaseError extends AppError {
       constructor(message: string, context?: Record<string, any>) {
           super(ErrorCode.DB_QUERY_FAILED, message, context, true);
       }
   }
   
   export class DataNotFoundError extends AppError {
       constructor(resource: string, id: string) {
           super(
               ErrorCode.DATA_NOT_FOUND,
               `${resource} not found: ${id}`,
               { resource, id },
               false
           );
       }
   }
   
   export class ValidationError extends AppError {
       constructor(message: string, errors: any[]) {
           super(
               ErrorCode.VALIDATION_FAILED,
               message,
               { errors },
               false
           );
       }
   }
   ```

2. **Update Repositories** (1 hour)
   - Replace generic catches with typed errors
   - Add context to all errors

3. **Update Services** (30 min)
   - Use custom errors in DataSyncService
   - Add retry logic for retryable errors

4. **Create Error Handler Utility** (30 min)
   ```typescript
   export class ErrorHandler {
       static handle(error: unknown): AppError {
           if (error instanceof AppError) {
               return error;
           }
           // Convert unknown errors to AppError
           return new AppError(
               ErrorCode.UNKNOWN_ERROR,
               error instanceof Error ? error.message : String(error),
               { originalError: error }
           );
       }
   }
   ```

### Acceptance Criteria
- [ ] All catch blocks use typed errors
- [ ] Error codes present on all errors
- [ ] Context included for debugging
- [ ] Retryable flag set appropriately

### Files Changed
- `src/infrastructure/errors/AppErrors.ts` (NEW)
- `src/infrastructure/errors/ErrorHandler.ts` (NEW)
- All repositories (5 files)
- All services (2 files)

---

## Task 4: Add Runtime Validation Guards
**Priority:** P0 (Critical - Data Integrity)  
**Effort:** 6 hours  
**Branch:** `fix/runtime-validation`

### Problem
Despite having Zod schemas, no runtime validation occurs at data boundaries. Corrupted data can enter system.

### Solution
Add validation at all entry points: API responses, file loads, DB reads.

### Implementation Steps

1. **Create ValidationService** (1.5 hours)
   - File: `src/logic/services/ValidationService.ts`
   ```typescript
   import { z } from 'zod';
   import { ValidationError } from '../../infrastructure/errors/AppErrors';
   
   export class ValidationService {
       static validate<T>(
           schema: z.ZodType<T>,
           data: unknown,
           context?: string
       ): T {
           try {
               return schema.parse(data);
           } catch (error) {
               if (error instanceof z.ZodError) {
                   throw new ValidationError(
                       `Validation failed${context ? ` for ${context}` : ''}`,
                       error.errors
                   );
               }
               throw error;
           }
       }
       
       static validateAsync<T>(
           schema: z.ZodType<T>,
           data: unknown,
           context?: string
       ): Promise<T> {
           return Promise.resolve(this.validate(schema, data, context));
       }
   }
   ```

2. **Add Validation to DataSyncService** (1 hour)
   ```typescript
   private static async processResponse(response: Response): Promise<boolean> {
       const rawData = await response.json();
       
       // Validate API response
       const data = ValidationService.validate(
           SubjectDataSchema,
           rawData,
           'API response'
       );
       
       // Validate questions before saving
       const questions = ValidationService.validate(
           z.array(QuestionSchema),
           data.questions,
           'questions array'
       );
       
       // Continue processing...
   }
   ```

3. **Add Validation to Subject Entity** (1 hour)
   ```typescript
   public async loadFromDB(): Promise<any[]> {
       const data = await repo.getSubjectData(this.id);
       
       if (data) {
           // Validate before using
           const questions = ValidationService.validate(
               z.array(QuestionSchema),
               await repo.getQuestionsForSubject(this.id),
               `questions for ${this.id}`
           );
           
           this._questions = questions;
       }
   }
   ```

4. **Add Validation to SSR Subject Loader** (1 hour)
   ```typescript
   static async load(subjectId: string): Promise<SubjectData | null> {
       // Load files...
       
       // Validate before returning
       return ValidationService.validate(
           SubjectDataSchema,
           {
               id: subjectId,
               name,
               config,
               questions,
               flashcards,
               terminology,
               achievements
           },
           `subject ${subjectId}`
       );
   }
   ```

5. **Add User Input Validation** (1 hour)
   - Player name length/format
   - Score bounds checking
   - Time values sanity checks

6. **Create Tests** (30 min)
   - Test valid data passes
   - Test invalid data throws ValidationError
   - Test error messages are helpful

### Acceptance Criteria
- [ ] All API responses validated
- [ ] All file loads validated
- [ ] All DB reads validated
- [ ] All user inputs validated
- [ ] Validation errors include helpful messages
- [ ] Tests cover valid and invalid cases

### Files Changed
- `src/logic/services/ValidationService.ts` (NEW)
- `src/logic/services/DataSyncService.ts`
- `src/logic/entities/Subject.ts`
- `src/data/subjects/Subject.ts`
- `tests/logic/services/validation-service.test.ts` (NEW)

---

## Task 5: Fix Entity State Corruption Pattern
**Priority:** P0 (Critical - Data Integrity)  
**Effort:** 5 hours  
**Branch:** `fix/entity-state-corruption`

### Problem
Entities update internal state before database write. If DB fails, entity has wrong state with no rollback.

### Solution
Implement optimistic update pattern with rollback capability.

### Implementation Steps

1. **Create EntityBase Class** (2 hours)
   - File: `src/logic/entities/EntityBase.ts`
   ```typescript
   export abstract class EntityBase {
       private pendingOperations: Map<string, any> = new Map();
       
       protected async safeUpdate<T>(
           key: string,
           newValue: T,
           dbOperation: () => Promise<void>
       ): Promise<T> {
           const oldValue = (this as any)[key];
           this.pendingOperations.set(key, oldValue);
           
           try {
               // Optimistically update state
               (this as any)[key] = newValue;
               
               // Persist to DB
               await dbOperation();
               
               // Success - clear pending
               this.pendingOperations.delete(key);
               return newValue;
           } catch (error) {
               // Rollback on failure
               (this as any)[key] = oldValue;
               this.pendingOperations.delete(key);
               throw error;
           }
       }
   }
   ```

2. **Refactor Player Entity** (1.5 hours)
   ```typescript
   export class Player extends EntityBase {
       public async addExp(amount: number): Promise<void> {
           if (amount < 0) {
               throw new ValidationError('Exp amount must be positive', []);
           }
           
           const newExp = this._exp + amount;
           
           await this.safeUpdate(
               '_exp',
               newExp,
               () => PlayerRepository.getInstance().updateExp(this.id, newExp)
           );
       }
       
       public async rename(newName: string): Promise<void> {
           if (!newName || newName.length < 2) {
               throw new ValidationError('Name must be at least 2 characters', []);
           }
           
           await this.safeUpdate(
               'name',
               newName,
               () => PlayerRepository.getInstance().updateName(this.id, newName)
           );
       }
   }
   ```

3. **Create Tests** (1.5 hours)
   - Test successful update
   - Test rollback on DB failure
   - Test validation before update
   - Test multiple concurrent updates

### Acceptance Criteria
- [ ] Entity state never corrupted on DB failure
- [ ] Validation before state changes
- [ ] Automatic rollback on errors
- [ ] Tests verify rollback behavior

### Files Changed
- `src/logic/entities/EntityBase.ts` (NEW)
- `src/logic/entities/Player.ts`
- `tests/logic/entities/player.test.ts` (NEW)

---

## Task 6: Eliminate Window Global State Pollution
**Priority:** P1 (High - Maintainability)  
**Effort:** 4 hours  
**Branch:** `fix/remove-window-subject-data`

### Problem
Subject entity directly writes to `window.subjectData`, bypassing type safety and making testing difficult.

### Solution
Use EventBus pattern to notify components of data changes.

### Implementation Steps

1. **Add Subject Events to EventBus** (30 min)
   ```typescript
   // src/infrastructure/events/EventTypes.ts
   export type EventMap = {
       // Existing events...
       'subject:loaded': { subjectId: string; data: SubjectData };
       'subject:updated': { subjectId: string };
       'subject:sync-started': { subjectId: string };
       'subject:sync-completed': { subjectId: string; success: boolean };
   }
   ```

2. **Update Subject Entity** (1 hour)
   ```typescript
   public async loadFromDB(): Promise<any[]> {
       const data = await repo.getSubjectData(this.id);
       
       if (data) {
           this._questions = await repo.getQuestionsForSubject(this.id);
           // ... load other data
           
           // Instead of window.subjectData, emit event
           await eventBus.emit('subject:loaded', {
               subjectId: this.id,
               data: {
                   id: this.id,
                   name: this.name,
                   questions: this._questions,
                   terminology: this._terminology,
                   flashcards: this._flashcards,
               }
           });
           
           return this._questions;
       }
   }
   ```

3. **Update Screens to Subscribe** (2 hours)
   - HomeScreen subscribes to 'subject:loaded'
   - Game screens subscribe to updates
   - Remove all `window.subjectData` references

4. **Create SubjectStore (Optional but Recommended)** (30 min)
   ```typescript
   export class SubjectStore {
       private currentSubject: SubjectData | null = null;
       
       constructor() {
           eventBus.on('subject:loaded', (data) => {
               this.currentSubject = data.data;
           });
       }
       
       getCurrent(): SubjectData | null {
           return this.currentSubject;
       }
   }
   ```

### Acceptance Criteria
- [ ] No more `window.subjectData` references
- [ ] Type-safe subject access via EventBus
- [ ] All screens work with new pattern
- [ ] Tests don't require mocking window

### Files Changed
- `src/infrastructure/events/EventTypes.ts`
- `src/logic/entities/Subject.ts`
- `src/ui/screens/HomeScreen.astro`
- All game screens (8 files)
- `src/logic/stores/SubjectStore.ts` (NEW)

---

## Task 7: Unify Dual Subject Implementation
**Priority:** P1 (High - Architecture)  
**Effort:** 8 hours  
**Branch:** `refactor/unify-subject-classes`

### Problem
Two Subject classes (`src/data/subjects/Subject.ts` and `src/logic/entities/Subject.ts`) with overlapping responsibilities cause confusion and code duplication.

### Solution
Split concerns: schemas in shared file, loader service for SSR, entity for runtime.

### Implementation Steps

1. **Extract Schemas to Shared File** (1 hour)
   - File: `src/shared/schemas/SubjectSchemas.ts`
   - Move all Zod schemas here
   - Export types

2. **Create SubjectLoader Service** (2 hours)
   - File: `src/logic/services/SubjectLoaderService.ts`
   - Move SSR loading logic here
   - Make it work in both SSR and browser
   ```typescript
   export class SubjectLoaderService {
       static async loadFromFile(id: string): Promise<SubjectData | null> {
           // SSR only - uses fs
           if (typeof window !== 'undefined') {
               throw new Error('loadFromFile is SSR only');
           }
           // Existing file loading logic
       }
       
       static async loadFromAPI(id: string): Promise<SubjectData | null> {
           // Browser compatible - uses fetch
           // Existing API loading logic
       }
   }
   ```

3. **Simplify Subject Entity** (2 hours)
   - Remove all loading logic
   - Keep only runtime state management
   - Use SubjectLoaderService internally
   ```typescript
   export class Subject {
       private constructor(
           public readonly id: string,
           public readonly name: string,
           private _questions: Question[],
           private _terminology: Terminology,
           private _flashcards: Flashcard[]
       ) {}
       
       static async load(id: string, source: 'db' | 'api' = 'db'): Promise<Subject> {
           const data = source === 'db'
               ? await SubjectLoaderService.loadFromDB(id)
               : await SubjectLoaderService.loadFromAPI(id);
               
           if (!data) {
               throw new DataNotFoundError('Subject', id);
           }
           
           return new Subject(
               data.id,
               data.name,
               data.questions,
               data.terminology,
               data.flashcards
           );
       }
       
       // Pure methods - no side effects
       getQuestions(): Question[] { return [...this._questions]; }
       getTerminology(): Terminology { return { ...this._terminology }; }
   }
   ```

4. **Update Imports Across Codebase** (2 hours)
   - Replace old Subject imports
   - Update to use new unified API
   - Fix any breaking changes

5. **Delete Old Files** (30 min)
   - Remove duplicate Subject.ts
   - Update exports

6. **Create Tests** (30 min)
   - Test SSR loading
   - Test browser loading
   - Test entity methods

### Acceptance Criteria
- [ ] Single source of truth for Subject
- [ ] Clear separation: schemas / loading / entity
- [ ] Works in both SSR and browser
- [ ] No import confusion
- [ ] All tests pass

### Files Changed
- `src/shared/schemas/SubjectSchemas.ts` (NEW)
- `src/logic/services/SubjectLoaderService.ts` (NEW)
- `src/logic/entities/Subject.ts` (REFACTOR)
- `src/data/subjects/Subject.ts` (DELETE)
- 20+ files that import Subject

---

## Task 8: Decouple Entities from Repositories
**Priority:** P1 (High - Testability)  
**Effort:** 6 hours  
**Branch:** `refactor/dependency-injection`

### Problem
Entities directly instantiate repositories via `.getInstance()`, making testing difficult and violating dependency inversion principle.

### Solution
Use dependency injection pattern with interfaces.

### Implementation Steps

1. **Create Repository Interfaces** (1 hour)
   - File: `src/logic/interfaces/IRepositories.ts`
   ```typescript
   export interface IPlayerRepository {
       getPlayer(id: number): Promise<PlayerData | null>;
       createPlayer(name: string): Promise<PlayerData>;
       updateExp(id: number, exp: number): Promise<void>;
       updateName(id: number, name: string): Promise<void>;
   }
   
   export interface ISubjectRepository {
       getSubjectData(id: string): Promise<any>;
       getQuestionsForSubject(id: string): Promise<any[]>;
       saveFullSubject(...args: any[]): Promise<void>;
   }
   ```

2. **Update Player Entity** (1.5 hours)
   ```typescript
   export class Player extends EntityBase {
       constructor(
           public readonly id: number,
           public name: string,
           private _exp: number,
           private repository: IPlayerRepository  // Injected
       ) {
           super();
       }
       
       public async addExp(amount: number): Promise<void> {
           // Use injected repository instead of .getInstance()
           await this.safeUpdate(
               '_exp',
               this._exp + amount,
               () => this.repository.updateExp(this.id, this._exp + amount)
           );
       }
       
       static async create(
           name: string,
           repository?: IPlayerRepository
       ): Promise<Player> {
           const repo = repository || PlayerRepository.getInstance();
           const data = await repo.createPlayer(name);
           return new Player(data.id, data.name, data.exp, repo);
       }
   }
   ```

3. **Update Subject Entity** (1.5 hours)
   - Similar pattern for Subject

4. **Create Factory Pattern** (1 hour)
   ```typescript
   export class EntityFactory {
       constructor(
           private playerRepo: IPlayerRepository,
           private subjectRepo: ISubjectRepository
       ) {}
       
       async createPlayer(name: string): Promise<Player> {
           const data = await this.playerRepo.createPlayer(name);
           return new Player(data.id, data.name, data.exp, this.playerRepo);
       }
   }
   ```

5. **Update Tests** (1 hour)
   - Create mock repositories
   - Test entities with mocks
   - Verify no direct getInstance calls

### Acceptance Criteria
- [ ] Entities accept repository interfaces
- [ ] No direct .getInstance() calls in entities
- [ ] Tests use mock repositories
- [ ] Production code uses real repositories

### Files Changed
- `src/logic/interfaces/IRepositories.ts` (NEW)
- `src/logic/entities/Player.ts`
- `src/logic/entities/Subject.ts`
- `src/logic/factories/EntityFactory.ts` (NEW)
- Tests for all entities

---

## Task 9: Add In-Memory Data Cache
**Priority:** P2 (Medium - Performance)  
**Effort:** 3 hours  
**Branch:** `feat/data-cache-layer`

### Problem
Subject data reloaded from database on every access, causing redundant queries.

### Solution
Add cache layer with TTL and invalidation.

### Implementation Steps

1. **Create CacheService** (1.5 hours)
   - File: `src/logic/services/CacheService.ts`
   ```typescript
   interface CacheEntry<T> {
       data: T;
       timestamp: number;
       ttl: number;
   }
   
   export class CacheService {
       private cache = new Map<string, CacheEntry<any>>();
       
       set<T>(key: string, data: T, ttlMs: number = 300000): void {
           this.cache.set(key, {
               data,
               timestamp: Date.now(),
               ttl: ttlMs
           });
       }
       
       get<T>(key: string): T | null {
           const entry = this.cache.get(key);
           if (!entry) return null;
           
           if (Date.now() - entry.timestamp > entry.ttl) {
               this.cache.delete(key);
               return null;
           }
           
           return entry.data;
       }
       
       invalidate(pattern: string): void {
           for (const key of this.cache.keys()) {
               if (key.startsWith(pattern)) {
                   this.cache.delete(key);
               }
           }
       }
   }
   ```

2. **Integrate with SubjectLoaderService** (1 hour)
   ```typescript
   static async loadFromDB(id: string): Promise<SubjectData | null> {
       const cacheKey = `subject:${id}`;
       
       // Check cache first
       const cached = cacheService.get<SubjectData>(cacheKey);
       if (cached) {
           console.log(`[SubjectLoader] Cache hit for ${id}`);
           return cached;
       }
       
       // Load from DB
       const data = await repo.getSubjectData(id);
       
       // Cache for 5 minutes
       if (data) {
           cacheService.set(cacheKey, data, 300000);
       }
       
       return data;
   }
   ```

3. **Add Cache Invalidation** (30 min)
   - Invalidate on subject sync
   - Invalidate on data updates

### Acceptance Criteria
- [ ] Subject data cached for 5 minutes
- [ ] Cache invalidated on updates
- [ ] Performance improved (fewer DB queries)
- [ ] Memory usage reasonable

### Files Changed
- `src/logic/services/CacheService.ts` (NEW)
- `src/logic/services/SubjectLoaderService.ts`
- `src/logic/services/DataSyncService.ts`

---

## Task 10: Add Structured Logging System
**Priority:** P2 (Medium - Debuggability)  
**Effort:** 4 hours  
**Branch:** `feat/structured-logging`

### Problem
Inconsistent console.log/warn/error throughout codebase. No structured logging, request tracing, or performance metrics.

### Solution
Create Logger utility with structured output and log levels.

### Implementation Steps

1. **Create Logger Service** (2 hours)
   - File: `src/infrastructure/logging/Logger.ts`
   ```typescript
   export enum LogLevel {
       DEBUG = 0,
       INFO = 1,
       WARN = 2,
       ERROR = 3,
   }
   
   export interface LogContext {
       component?: string;
       operation?: string;
       userId?: number;
       subjectId?: string;
       duration?: number;
       [key: string]: any;
   }
   
   export class Logger {
       private static level: LogLevel = LogLevel.INFO;
       
       static setLevel(level: LogLevel): void {
           this.level = level;
       }
       
       static debug(message: string, context?: LogContext): void {
           if (this.level <= LogLevel.DEBUG) {
               this.log('DEBUG', message, context);
           }
       }
       
       static info(message: string, context?: LogContext): void {
           if (this.level <= LogLevel.INFO) {
               this.log('INFO', message, context);
           }
       }
       
       static warn(message: string, context?: LogContext): void {
           if (this.level <= LogLevel.WARN) {
               this.log('WARN', message, context);
           }
       }
       
       static error(message: string, error?: Error, context?: LogContext): void {
           if (this.level <= LogLevel.ERROR) {
               this.log('ERROR', message, {
                   ...context,
                   error: error?.message,
                   stack: error?.stack
               });
           }
       }
       
       private static log(level: string, message: string, context?: LogContext): void {
           const timestamp = new Date().toISOString();
           const formatted = {
               timestamp,
               level,
               message,
               ...context
           };
           
           console.log(JSON.stringify(formatted));
       }
       
       static async measure<T>(
           operation: string,
           fn: () => Promise<T>,
           context?: LogContext
       ): Promise<T> {
           const start = performance.now();
           try {
               const result = await fn();
               const duration = performance.now() - start;
               this.info(`${operation} completed`, { ...context, duration });
               return result;
           } catch (error) {
               const duration = performance.now() - start;
               this.error(`${operation} failed`, error as Error, { ...context, duration });
               throw error;
           }
       }
   }
   ```

2. **Replace console.log calls** (1.5 hours)
   - Update all repositories
   - Update all services
   - Update all entities
   ```typescript
   // Before:
   console.log(`[Subject] Loaded ${id}`);
   
   // After:
   Logger.info('Subject loaded', {
       component: 'Subject',
       operation: 'loadFromDB',
       subjectId: id,
       questionCount: questions.length
   });
   ```

3. **Add Performance Monitoring** (30 min)
   ```typescript
   const subject = await Logger.measure(
       'loadSubject',
       () => SubjectLoaderService.loadFromDB(id),
       { subjectId: id }
   );
   ```

### Acceptance Criteria
- [ ] All console.log replaced with Logger
- [ ] Structured JSON output
- [ ] Log levels configurable
- [ ] Performance metrics captured

### Files Changed
- `src/infrastructure/logging/Logger.ts` (NEW)
- All files with console.log (26 files)

---

## Task 11: Add Comprehensive Error Recovery
**Priority:** P2 (Medium)  
**Effort:** 4 hours  
**Branch:** `feat/error-recovery-strategies`

### Problem
Errors cause permanent failures. No retry logic, fallback strategies, or graceful degradation.

### Solution
Implement retry policies and fallback mechanisms.

### Implementation Steps

1. **Create Retry Utility** (1.5 hours)
   - File: `src/infrastructure/utils/RetryPolicy.ts`
   ```typescript
   export interface RetryConfig {
       maxAttempts: number;
       delayMs: number;
       backoffMultiplier: number;
       retryableErrors: ErrorCode[];
   }
   
   export class RetryPolicy {
       static async execute<T>(
           operation: () => Promise<T>,
           config: RetryConfig
       ): Promise<T> {
           let lastError: Error;
           
           for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
               try {
                   return await operation();
               } catch (error) {
                   lastError = error as Error;
                   
                   if (!this.isRetryable(error, config)) {
                       throw error;
                   }
                   
                   if (attempt < config.maxAttempts) {
                       const delay = config.delayMs * Math.pow(config.backoffMultiplier, attempt - 1);
                       Logger.warn(`Retry attempt ${attempt}/${config.maxAttempts}`, {
                           operation: operation.name,
                           delay,
                           error: (error as Error).message
                       });
                       await this.sleep(delay);
                   }
               }
           }
           
           throw lastError!;
       }
       
       private static isRetryable(error: unknown, config: RetryConfig): boolean {
           if (error instanceof AppError) {
               return config.retryableErrors.includes(error.code);
           }
           return false;
       }
       
       private static sleep(ms: number): Promise<void> {
           return new Promise(resolve => setTimeout(resolve, ms));
       }
   }
   ```

2. **Add Retry to DataSyncService** (1 hour)
   ```typescript
   private static async fetchAndHydrate(id: string): Promise<boolean> {
       return await RetryPolicy.execute(
           () => this.fetchAndHydrateInternal(id),
           {
               maxAttempts: 3,
               delayMs: 1000,
               backoffMultiplier: 2,
               retryableErrors: [ErrorCode.NETWORK_ERROR, ErrorCode.TIMEOUT]
           }
       );
   }
   ```

3. **Add Fallback Strategies** (1 hour)
   ```typescript
   export class FallbackStrategy {
       static async withFallback<T>(
           primary: () => Promise<T>,
           fallback: () => Promise<T>
       ): Promise<T> {
           try {
               return await primary();
           } catch (error) {
               Logger.warn('Primary operation failed, using fallback', {
                   error: (error as Error).message
               });
               return await fallback();
           }
       }
   }
   ```

4. **Implement Graceful Degradation** (30 min)
   - Empty state handling
   - Partial data loading
   - Offline mode

### Acceptance Criteria
- [ ] Network errors retry with backoff
- [ ] Fallback strategies in place
- [ ] Graceful degradation for offline
- [ ] User-facing error messages

### Files Changed
- `src/infrastructure/utils/RetryPolicy.ts` (NEW)
- `src/infrastructure/utils/FallbackStrategy.ts` (NEW)
- `src/logic/services/DataSyncService.ts`
- `src/logic/services/SubjectLoaderService.ts`

---

## Summary

### Effort Breakdown by Priority

| Priority | Tasks | Total Hours |
|----------|-------|-------------|
| **P0** | 5 tasks | 19 hours |
| **P1** | 4 tasks | 23 hours |
| **P2** | 2 tasks | 10 hours |
| **Total** | **11 tasks** | **52 hours** |

### Implementation Order

**Week 1 (P0 Critical Fixes):**
1. Add Transaction Support (4h)
2. Cache Migration Status (1h)
3. Standardized Error Types (3h)
4. Runtime Validation Guards (6h)
5. Fix Entity State Corruption (5h)

**Week 2 (P1 High Priority):**
6. Eliminate Window Pollution (4h)
7. Unify Subject Implementation (8h)
8. Decouple Entities from Repositories (6h)
9. Add Data Cache (3h)

**Week 3 (P2 Nice-to-Have):**
10. Structured Logging (4h)
11. Error Recovery Strategies (4h)

### Expected Impact

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Debug Time** | 30-60 min | 5-10 min | **5-6x faster** |
| **Data Corruption Risk** | High | None | **100% eliminated** |
| **Test Coverage** | 0% | 80%+ | **Complete testability** |
| **Type Safety** | Partial | Full | **100% type-safe** |
| **Error Context** | None | Full details | **Debuggable errors** |
| **Performance** | Baseline | +15-20% faster | **Cache + optimizations** |

---

## Validation Checklist

After completing all tasks:

- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] No console.log statements (use Logger)
- [ ] All database operations use transactions
- [ ] All data boundaries have validation
- [ ] All errors are typed with context
- [ ] Entity state never corrupts
- [ ] No window.global pollution
- [ ] Single Subject implementation
- [ ] Entities injectable for testing
- [ ] Data caching working
- [ ] Structured logging in place
- [ ] Error recovery tested
- [ ] Performance improved
- [ ] Documentation updated
