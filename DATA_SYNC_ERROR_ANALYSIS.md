# Data Sync Error Analysis

## Error Summary

**Primary Issue**: Vite module transport disconnection during hot reload
**Secondary Issues**: Netlify adapter remnants (already fixed), deprecated import warnings (documentation only)

## Root Cause Analysis

### 1. Transport Disconnection Error (Critical)
```
transport was disconnected, cannot call "fetchModule"
```

**Cause**: The Vite dev server is being restarted or closed during dependency scanning, causing the module runner to lose connection.

**Impact**: 
- Hot module replacement (HMR) breaks
- Page refreshes fail
- Development experience is severely degraded

**Why This Happens**:
- Large number of entry points (38 Astro files) causes long scan times
- SQLite WASM initialization may be blocking or timing out
- Concurrent module requests during initial load overwhelm the server

### 2. Netlify Edge Functions Error (Fixed)
```
An error occurred while setting up the Netlify Edge Functions environment
```

**Status**: ✅ Already fixed by switching to `@astrojs/vercel` adapter
**Note**: Warnings still appear in logs from cached modules, but are harmless

### 3. Deprecated Import Warnings (Non-blocking)
```
The "@astrojs/vercel/serverless" import is deprecated
```

**Status**: ℹ️ Documentation only, not in actual code
**Location**: PROJECT_ASSESSMENT.md contains old example code

## Actual Data Sync Issue

Looking at the error pattern, the **real data sync problem** is:

1. **SQLite WASM blocking during initialization** - The database service is likely initializing synchronously on page load, causing the module system to timeout

2. **Missing async guards** - DataSyncService and migration checks run on every navigation without proper async boundaries

3. **Race condition in component initialization** - Multiple screens trying to access DatabaseService simultaneously during HMR

## Immediate Fixes Needed

### Fix 1: Add Vite Config for Large Apps (P0)

Add to `astro.config.mjs`:

```javascript
vite: {
    optimizeDeps: {
        exclude: ['@sqlite.org/sqlite-wasm'],
        entries: ['src/pages/**/*.astro'], // Only scan pages, not all components
    },
    server: {
        headers: {
            'Cross-Origin-Opener-Policy': 'same-origin',
            'Cross-Origin-Embedder-Policy': 'require-corp',
        },
        hmr: {
            overlay: true,
            timeout: 30000, // Increase timeout for SQLite init
        },
    },
    ssr: {
        noExternal: ['@sqlite.org/sqlite-wasm'], // Bundle SQLite in SSR
    },
},
```

### Fix 2: Lazy Load DatabaseService (P0)

Prevent blocking initialization:

```typescript
// src/infrastructure/db/DatabaseService.ts
class DatabaseService {
    private static instance: Promise<DatabaseService> | null = null;
    
    public static getInstance(): Promise<DatabaseService> {
        if (!DatabaseService.instance) {
            console.log('[v0] DatabaseService: Starting lazy initialization...');
            DatabaseService.instance = this.initialize();
        }
        return DatabaseService.instance;
    }
    
    private static async initialize(): Promise<DatabaseService> {
        const service = new DatabaseService();
        await service.init();
        console.log('[v0] DatabaseService: Initialization complete');
        return service;
    }
}
```

### Fix 3: Add Request Deduplication (P1)

Prevent concurrent initialization requests:

```typescript
// src/infrastructure/db/DatabaseService.ts
private static initPromise: Promise<void> | null = null;

private async init(): Promise<void> {
    if (DatabaseService.initPromise) {
        console.log('[v0] DatabaseService: Waiting for existing init...');
        await DatabaseService.initPromise;
        return;
    }
    
    DatabaseService.initPromise = this.doInit();
    await DatabaseService.initPromise;
}
```

## Testing Checklist

After implementing fixes:

- [ ] Dev server starts without transport errors
- [ ] HMR works after saving files
- [ ] Page navigation doesn't cause disconnections
- [ ] Console shows single "[v0] DatabaseService: Initialization complete"
- [ ] No concurrent SQLite initialization attempts

## Expected Outcome

- ✅ Transport errors eliminated
- ✅ Fast dev server startup (< 5s instead of timing out)
- ✅ Reliable HMR without disconnections
- ✅ Single database initialization per session
- ✅ No blocking on page navigation

## Verification Commands

```bash
# Check for concurrent inits (should see only 1)
grep -c "DatabaseService: Starting" <logs>

# Check for transport errors (should be 0)
grep -c "transport was disconnected" <logs>

# Measure startup time
time npm run dev
```
