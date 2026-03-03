import { DatabaseService } from './DatabaseService';
import { DatabaseError } from '../errors/DatabaseError';

/**
 * Manages database transaction boundaries for operations involving multiple state mutations.
 * Enforces the Atomicity and Consistency of the local SQLite database.
 */
export class UnitOfWork {
    private inTransaction = false;

    private constructor(private dbService: DatabaseService) { }

    /**
     * Factory method to construct a Unit of Work bound to the DatabaseService singleton.
     */
    public static async create(): Promise<UnitOfWork> {
        const dbService = await DatabaseService.getInstance();
        return new UnitOfWork(dbService);
    }

    /**
     * Start a new transaction.
     * @throws DatabaseError if already in a transaction.
     */
    public begin(): void {
        if (this.inTransaction) {
            throw new DatabaseError("Transaction already in progress", "BEGIN");
        }
        try {
            this.dbService.run("BEGIN TRANSACTION");
            this.inTransaction = true;
        } catch (error) {
            throw new DatabaseError("Failed to begin transaction", "BEGIN", error);
        }
    }

    /**
     * Commit the current transaction successfully.
     * @throws DatabaseError if no transaction is active.
     */
    public commit(): void {
        if (!this.inTransaction) {
            throw new DatabaseError("No transaction in progress", "COMMIT");
        }
        try {
            this.dbService.run("COMMIT");
            this.inTransaction = false;
        } catch (error) {
            throw new DatabaseError("Failed to commit transaction", "COMMIT", error);
        }
    }

    /**
     * Rollback the current transaction upon an error.
     * @throws DatabaseError if no transaction is active.
     */
    public rollback(): void {
        if (!this.inTransaction) {
            throw new DatabaseError("No transaction in progress", "ROLLBACK");
        }
        try {
            this.dbService.run("ROLLBACK");
            this.inTransaction = false;
        } catch (error) {
            throw new DatabaseError("Failed to rollback transaction", "ROLLBACK", error);
        }
    }

    /**
     * Encapsulates a block of async operations inside a transactional boundary.
     * Automatically handles committing or gracefully rolling back on uncaught errors.
     * 
     * @param work The async callback representing the database operations.
     */
    public async transaction<T>(work: () => Promise<T>): Promise<T> {
        this.begin();
        try {
            const result = await work();
            this.commit();
            return result;
        } catch (error) {
            this.rollback();
            throw error;
        }
    }
}
