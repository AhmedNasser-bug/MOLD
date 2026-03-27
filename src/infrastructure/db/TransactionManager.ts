/**
 * TransactionManager - Provides atomic database operations with automatic rollback
 * 
 * Usage:
 *   await TransactionManager.execute(db, async (tx) => {
 *     await tx.run("INSERT INTO ...");
 *     await tx.run("UPDATE ...");
 *   });
 */

import { DatabaseService } from './DatabaseService';

export class TransactionManager {
    /**
     * Execute multiple database operations in a transaction
     * Automatically commits on success, rolls back on error
     */
    static async execute<T>(
        db: DatabaseService,
        operations: (tx: DatabaseService) => Promise<T>
    ): Promise<T> {
        
        try {
            await db.run('BEGIN TRANSACTION');
            
            const result = await operations(db);
            
            await db.run('COMMIT');
            
            return result;
        } catch (error) {
            console.error('[TransactionManager] Transaction failed, rolling back:', error);
            
            try {
                await db.run('ROLLBACK');
            } catch (rollbackError) {
                console.error('[TransactionManager] Rollback failed:', rollbackError);
                throw new Error(`Transaction and rollback both failed: ${error}`);
            }
            
            throw error;
        }
    }

    /**
     * Execute operations with retry on transient failures
     */
    static async executeWithRetry<T>(
        db: DatabaseService,
        operations: (tx: DatabaseService) => Promise<T>,
        maxRetries: number = 3,
        delayMs: number = 100
    ): Promise<T> {
        let lastError: Error | null = null;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await this.execute(db, operations);
            } catch (error) {
                lastError = error as Error;
                
                if (attempt < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, delayMs));
                    delayMs *= 2; // Exponential backoff
                }
            }
        }
        
        throw lastError || new Error('Transaction failed after retries');
    }
}
