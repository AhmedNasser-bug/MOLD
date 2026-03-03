import { vi } from 'vitest';

// Basic mock for sqlite-wasm to prevent actual DB instantiation during pure unit tests
vi.mock('@sqlite.org/sqlite-wasm', () => {
    return {
        default: vi.fn(() => Promise.resolve({
            oo1: {
                DB: vi.fn().mockImplementation(() => ({
                    exec: vi.fn(),
                    close: vi.fn(),
                    prepare: vi.fn().mockReturnValue({
                        step: vi.fn(),
                        get: vi.fn(),
                        finalize: vi.fn(),
                        bind: vi.fn(),
                    }),
                })),
            },
        })),
    };
});
