import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UnitOfWork } from '../infrastructure/db/UnitOfWork';
import { DatabaseService } from '../infrastructure/db/DatabaseService';

// Deep mock DatabaseService to prevent global state carrying across instances
vi.mock('../infrastructure/db/DatabaseService', () => {
    const mockRun = vi.fn();
    return {
        DatabaseService: {
            getInstance: vi.fn().mockResolvedValue({
                run: mockRun
            })
        }
    };
});

describe('UnitOfWork Transactional Boundaries', () => {
    let mockRun: any;

    beforeEach(async () => {
        vi.clearAllMocks();
        const instance = await DatabaseService.getInstance();
        mockRun = instance.run;
    });

    it('should successfully commit a transaction if no errors occur', async () => {
        const uow = await UnitOfWork.create();

        await uow.transaction(async () => {
            mockRun("INSERT INTO test (id) VALUES (1)");
        });

        expect(mockRun).toHaveBeenCalledWith("BEGIN TRANSACTION");
        expect(mockRun).toHaveBeenCalledWith("COMMIT");
        expect(mockRun).not.toHaveBeenCalledWith("ROLLBACK");
    });

    it('should rollback transaction automatically when an error is thrown in work block', async () => {
        const uow = await UnitOfWork.create();

        try {
            await uow.transaction(async () => {
                mockRun("INSERT INTO test (id) VALUES (1)");
                throw new Error("Simulated mid-save failure!");
            });
        } catch (e) {
            // expected
        }

        expect(mockRun).toHaveBeenCalledWith("BEGIN TRANSACTION");
        expect(mockRun).not.toHaveBeenCalledWith("COMMIT");
        expect(mockRun).toHaveBeenCalledWith("ROLLBACK");
    });
});

