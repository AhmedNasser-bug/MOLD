# MOLD V2 Refactoring - Migration Guide

## Overview

This guide explains how to migrate existing screen components to use the new refactored architecture. The refactoring addresses 10 major design flaws and establishes a robust, maintainable codebase.

## What Changed?

### 1. Event System
**Before:** Inconsistent window events and CustomEvents
```typescript
window.dispatchEvent(new CustomEvent('game:stats-update', { detail: data }));
```

**After:** Type-safe EventBus
```typescript
import { eventBus } from '../infrastructure/events/EventBus';
await eventBus.emit('game:stats-update', data);
```

### 2. State Management
**Before:** Callback-based state updates
```typescript
this.engine = new GameEngine(subject, player, config, (state) => {
    this.renderState(state);
});
```

**After:** State machine with events
```typescript
this.engine = new GameEngine(subject, player, config);
await this.engine.start();
const state = this.engine.getState(); // Pull state when needed
```

### 3. Component Initialization
**Before:** Polling with setInterval
```typescript
const interval = setInterval(() => {
    this.header = document.getElementById('header')?.headerInstance;
    if (this.header) {
        clearInterval(interval);
        this.init();
    }
}, 100);
```

**After:** Component Registry
```typescript
import { componentRegistry } from '../ui/registry/ComponentRegistry';
this.header = componentRegistry.get('sr-header');
```

### 4. Data Persistence
**Before:** localStorage
```typescript
const data = localStorage.getItem('subject-progress');
```

**After:** Database Repositories
```typescript
import { GameHistoryRepository } from '../infrastructure/db/repositories/GameHistoryRepository';
const repo = GameHistoryRepository.getInstance();
const stats = await repo.getPlayerStats(playerId, subjectId);
```

### 5. Screen Controllers
**Before:** Manual initialization and global namespace pollution
```typescript
class MyScreenController {
    constructor() {
        window.addEventListener('load', () => this.init());
    }
    init() {
        window.game.startMode = this.start.bind(this);
    }
}
```

**After:** BaseScreenController with lifecycle
```typescript
import { BaseScreenController } from '../ui/controllers/BaseScreenController';

class MyScreenController extends BaseScreenController {
    constructor() {
        super('my-screen-id');
    }
    
    async onInit(): Promise<void> {
        // Initialize screen
    }
    
    async onDestroy(): Promise<void> {
        // Cleanup
    }
}
```

## Migration Steps

### Step 1: Update Imports

Add new infrastructure imports:
```typescript
import { eventBus } from '../infrastructure/events/EventBus';
import { componentRegistry } from '../ui/registry/ComponentRegistry';
import { BaseScreenController } from '../ui/controllers/BaseScreenController';
import { GameHistoryRepository } from '../infrastructure/db/repositories/GameHistoryRepository';
import { PlayerRepository } from '../infrastructure/db/repositories/PlayerRepository';
```

### Step 2: Extend BaseScreenController

Change your class to extend BaseScreenController:
```typescript
// Before
class MyScreenController {
    constructor() {
        this.init();
    }
}

// After
class MyScreenController extends BaseScreenController {
    constructor() {
        super('my-screen-id');
    }
    
    async onInit(): Promise<void> {
        // Initialization logic here
    }
}
```

### Step 3: Replace Polling with Registry

Replace component polling:
```typescript
// Before
const interval = setInterval(() => {
    this.header = document.getElementById('header')?.headerInstance;
    if (this.header) clearInterval(interval);
}, 100);

// After
this.header = componentRegistry.get('header');
```

### Step 4: Update Event Handling

Replace window events with eventBus:
```typescript
// Before
window.addEventListener('game:stats-update', (e: any) => {
    this.updateStats(e.detail);
});

// After
eventBus.on('game:stats-update', (data) => {
    this.updateStats(data);
});
```

### Step 5: Update GameEngine Usage

Update GameEngine instantiation:
```typescript
// Before
this.engine = new GameEngine(
    subject, 
    player, 
    config,
    (state) => this.renderState(state)
);

// After
this.engine = new GameEngine(subject, player, config);
await this.engine.start();

// Pull state when needed
const state = this.engine.getState();
this.renderState(state);
```

### Step 6: Migrate localStorage to Database

Replace localStorage calls:
```typescript
// Before
const progress = localStorage.getItem('progress');
const data = JSON.parse(progress || '{}');

// After
const repo = GameHistoryRepository.getInstance();
const stats = await repo.getPlayerStats(this.playerId, this.subjectId);
```

### Step 7: Register Methods Properly

Register screen methods:
```typescript
// Before
window.game = window.game || {};
window.game.startMode = this.start.bind(this);

// After
componentRegistry.register('my-screen-controller', {
    start: () => this.start(),
    screen: this.screenId,
});

// For backward compatibility (temporary)
window.game = window.game || {};
window.game.startMode = this.start.bind(this);
```

### Step 8: Add Lifecycle Cleanup

Implement onDestroy for cleanup:
```typescript
async onDestroy(): Promise<void> {
    if (this.engine) {
        this.engine.destroy();
    }
    // Unsubscribe from events
    // Clean up resources
}
```

## Example: Complete Migration

### Before (Old Pattern)
```typescript
class SpeedrunController {
    private engine: GameEngine;
    
    constructor() {
        window.addEventListener('load', () => this.init());
    }
    
    async init() {
        // Poll for components
        const interval = setInterval(() => {
            this.header = document.getElementById('header')?.headerInstance;
            if (this.header) {
                clearInterval(interval);
                this.setup();
            }
        }, 100);
    }
    
    setup() {
        window.game = window.game || {};
        window.game.startSpeedrun = this.start.bind(this);
    }
    
    async start() {
        const data = localStorage.getItem('progress');
        
        this.engine = new GameEngine(
            subject,
            player,
            config,
            (state) => this.render(state)
        );
        
        await this.engine.start();
    }
    
    render(state: any) {
        // Update UI
    }
}

new SpeedrunController();
```

### After (New Pattern)
```typescript
import { BaseScreenController } from '../ui/controllers/BaseScreenController';
import { eventBus } from '../infrastructure/events/EventBus';
import { componentRegistry } from '../ui/registry/ComponentRegistry';
import { GameHistoryRepository } from '../infrastructure/db/repositories/GameHistoryRepository';

class SpeedrunController extends BaseScreenController {
    private engine: GameEngine | null = null;
    private header: any;
    
    constructor() {
        super('speedrun-screen');
    }
    
    async onInit(): Promise<void> {
        // Get components from registry
        this.header = componentRegistry.get('header');
        
        // Subscribe to events
        eventBus.on('game:stats-update', (data) => this.updateStats(data));
        
        // Register methods
        componentRegistry.register('speedrun-controller', {
            start: () => this.start(),
            screen: this.screenId,
        });
    }
    
    async start() {
        this.show();
        
        // Get data from database
        const repo = GameHistoryRepository.getInstance();
        const stats = await repo.getPlayerStats(this.playerId, this.subjectId);
        
        // Create engine (no callback)
        this.engine = new GameEngine(subject, player, config);
        await this.engine.start();
        
        // Render initial state
        const state = this.engine.getState();
        this.render(state);
    }
    
    render(state: any) {
        // Update UI
    }
    
    async onDestroy(): Promise<void> {
        if (this.engine) {
            this.engine.destroy();
        }
    }
}

new SpeedrunController();
```

## Key Benefits

1. **No more polling** - Components resolve immediately via registry
2. **Type-safe events** - Compile-time checking of event names and payloads
3. **Proper lifecycle** - onInit and onDestroy hooks for clean setup/teardown
4. **State machine** - GameEngine now has explicit states (IDLE, READY, ANSWERING, FEEDBACK, COMPLETED)
5. **Database persistence** - All data persisted to SQLite, localStorage removed
6. **Centralized state** - UIStore provides app-wide state management
7. **Better testability** - Dependencies are injectable and mockable

## Testing After Migration

1. **Verify components load**: Check that componentRegistry finds all components
2. **Check events fire**: Add console.log to event handlers
3. **Test database**: Verify data persists and loads correctly
4. **Check state transitions**: Ensure GameEngine state machine works
5. **Test cleanup**: Verify onDestroy cleans up properly

## Rollback Plan

If issues occur:
1. The migration service preserves localStorage data
2. Old window.game methods are kept for backward compatibility
3. Gradual migration is supported - old and new patterns can coexist temporarily

## Getting Help

- Check `REFACTORING_PROGRESS.md` for implementation status
- Review `v0_plans/smart-guide.md` for the complete plan
- Look at `SpeedrunScreen.astro` for a fully migrated example

## Next Steps

1. Migrate remaining screens (BlitzScreen, HardcoreScreen, PracticeScreen, etc.)
2. Update HomeScreen to use componentRegistry instead of window.game
3. Remove backward compatibility shims after all screens are migrated
4. Clean up MoldV1 legacy code
5. Add comprehensive tests

---

**Last Updated:** 2026-02-18
**Status:** Phase 1-5 Complete, Phase 6-7 In Progress
