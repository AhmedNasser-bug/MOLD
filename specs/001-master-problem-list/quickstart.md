# Integration Quickstart

This outlines how to work with the updated architecture after the Master Problem List refactor.

## 1. No more `window` global state
Do not push data to `window.subjectData` or methods to `window.game`.
*   **Instead**: Use the `API.getInstance()` facade to fetch validated data.

## 2. Screen Lifecycle
When creating a new game mode screen (e.g., `SurvivalScreen`), you MUST implement the `onDestroy` cleanup method.
```typescript
class MyScreenController extends BaseScreenController {
    // Subscriptions are tracked automatically if you use this.subscribeToEvent()
    
    onDestroy() {
        super.onDestroy(); // Cleans up tracked subscriptions
        // Clean up your specific GameEngine instances here
        this.engine?.destroy();
    }
}
```

## 3. Database Operations
Never instantiate Repositories directly in UI files.
*   **Bad**: `new SubjectRepository().get(id)`
*   **Good**: `API.Subject.get(id)` (This ensures the transaction and cache layer is utilized).
