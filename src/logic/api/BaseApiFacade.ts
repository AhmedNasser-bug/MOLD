import { z } from 'zod';
import { UnitOfWork } from '../../infrastructure/db/UnitOfWork';
import { DatabaseError } from '../../infrastructure/errors/DatabaseError';
import { ValidationError } from '../../infrastructure/errors/ValidationError';

/**
 * Base abstract class defining the strict API layer boundaries.
 * 
 * Provides built-in methods to validate incoming data through Zod schema,
 * and standardizes the execution of `UnitOfWork` transactions so that UI components
 * never manually control DB commits or errors.
 */
export abstract class BaseApiFacade {

    /**
     * Wraps execution in a structured transaction via Unit of Work.
     * It maps underlying errors to structured framework errors.
     * 
     * @param work Callback providing the initialized UoW instance.
     */
    protected async withTransaction<T>(
        work: (uow: UnitOfWork) => Promise<T>
    ): Promise<T> {
        const uow = await UnitOfWork.create();
        try {
            return await uow.transaction(async () => {
                return await work(uow);
            });
        } catch (error) {
            if (error instanceof ValidationError || error instanceof DatabaseError) {
                throw error;
            }
            throw new DatabaseError(
                error instanceof Error ? error.message : "Critical, unmapped database transaction error",
                "TRANSACTION",
                error
            );
        }
    }

    /**
     * Strictly verifies unknown payloads or inputs against Zod boundaries.
     * Extracted to centralize error mapping so clients always catch clean `ValidationErrors`.
     * 
     * @param schema The exact target schema shape.
     * @param data The incoming data payload mapping from UI logic or network.
     * @param componentName The domain context throwing the errors ("Player", "Score").
     */
    protected validate<T>(schema: z.ZodSchema<T>, data: unknown, componentName: string): T {
        try {
            return schema.parse(data);
        } catch (error) {
            if (error instanceof z.ZodError) {
                const detailedMessages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
                throw new ValidationError(
                    `Schema violation inside ${componentName}: ${detailedMessages.join('; ')}`,
                    componentName,
                    error
                );
            }
            throw new ValidationError(`Unknown parsing error in Zod validation for ${componentName}`, componentName, error);
        }
    }
}
