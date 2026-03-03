import { describe, it, expect, vi } from 'vitest';
import { TransactionManager } from '../infrastructure/db/TransactionManager';
import { DatabaseService } from '../infrastructure/db/DatabaseService';

describe('TransactionManager', () => {
    it('should execute a successful transaction', async () => {
        const mockDb = {
            run: vi.fn().mockResolvedValue(undefined),
        } as unknown as DatabaseService;

        const operations = vi.fn().mockResolvedValue('success');

        const result = await TransactionManager.execute(mockDb, operations);

        expect(result).toBe('success');
        expect(mockDb.run).toHaveBeenCalledWith('BEGIN TRANSACTION');
        expect(operations).toHaveBeenCalledWith(mockDb);
        expect(mockDb.run).toHaveBeenCalledWith('COMMIT');
    });

    it('should rollback if operations fail', async () => {
        const mockDb = {
            run: vi.fn().mockResolvedValue(undefined),
        } as unknown as DatabaseService;

        const error = new Error('Operation failed');
        const operations = vi.fn().mockRejectedValue(error);

        await expect(TransactionManager.execute(mockDb, operations)).rejects.toThrow('Operation failed');

        expect(mockDb.run).toHaveBeenCalledWith('BEGIN TRANSACTION');
        expect(mockDb.run).toHaveBeenCalledWith('ROLLBACK');
        expect(mockDb.run).not.toHaveBeenCalledWith('COMMIT');
    });

    it('should throw combined error if rollback fails', async () => {
        const mockDb = {
            run: vi.fn()
                .mockImplementation(async (sql: string) => {
                    if (sql === 'ROLLBACK') throw new Error('Rollback failed');
                    return undefined;
                }),
        } as unknown as DatabaseService;

        const opError = new Error('Operation failed');
        const operations = vi.fn().mockRejectedValue(opError);

        await expect(TransactionManager.execute(mockDb, operations)).rejects.toThrow(
            'Transaction and rollback both failed: Error: Operation failed'
        );

        expect(mockDb.run).toHaveBeenCalledWith('BEGIN TRANSACTION');
        expect(mockDb.run).toHaveBeenCalledWith('ROLLBACK');
    });
});
