/**
 * UI Store - Manages application-wide UI state
 * 
 * Handles state that affects multiple components like:
 * - Current subject selection
 * - User preferences
 * - UI settings (theme, sound, etc.)
 * - Active player
 */

import { eventBus } from '../../infrastructure/events/EventBus';

export interface UIState {
  currentSubject: {
    id: string;
    name: string;
  } | null;
  currentPlayer: {
    id: number;
    name: string;
    exp: number;
  } | null;
  preferences: {
    soundEnabled: boolean;
    musicEnabled: boolean;
    vibrationEnabled: boolean;
    difficulty: 'easy' | 'medium' | 'hard';
  };
  loading: boolean;
  error: string | null;
}

class UIStore {
  private static instance: UIStore;
  private state: UIState;
  private listeners: Set<(state: UIState) => void> = new Set();

  private constructor() {
    // Initialize with defaults
    this.state = {
      currentSubject: null,
      currentPlayer: null,
      preferences: {
        soundEnabled: true,
        musicEnabled: false,
        vibrationEnabled: true,
        difficulty: 'medium',
      },
      loading: false,
      error: null,
    };

    // Load preferences from localStorage
    this.loadPreferences();
  }

  public static getInstance(): UIStore {
    if (!UIStore.instance) {
      UIStore.instance = new UIStore();
    }
    return UIStore.instance;
  }

  /**
   * Get current state
   */
  public getState(): Readonly<UIState> {
    return { ...this.state };
  }

  /**
   * Subscribe to state changes
   */
  public subscribe(listener: (state: UIState) => void): () => void {
    this.listeners.add(listener);
    // Immediately call with current state
    listener(this.getState());
    // Return unsubscribe function
    return () => this.listeners.delete(listener);
  }

  /**
   * Set current subject
   */
  public setSubject(id: string, name: string): void {
    this.state.currentSubject = { id, name };
    this.notify();
  }

  /**
   * Set current player
   */
  public setPlayer(id: number, name: string, exp: number): void {
    this.state.currentPlayer = { id, name, exp };
    this.notify();
    
    eventBus.emitSync('player:updated', {
      playerId: id,
      changes: {},
    });
  }

  /**
   * Update preferences
   */
  public updatePreferences(preferences: Partial<UIState['preferences']>): void {
    this.state.preferences = {
      ...this.state.preferences,
      ...preferences,
    };
    this.savePreferences();
    this.notify();
  }

  /**
   * Set loading state
   */
  public setLoading(loading: boolean): void {
    this.state.loading = loading;
    this.notify();
  }

  /**
   * Set error
   */
  public setError(error: string | null): void {
    this.state.error = error;
    this.notify();
  }

  /**
   * Clear error
   */
  public clearError(): void {
    this.setError(null);
  }

  /**
   * Load preferences from localStorage
   */
  private loadPreferences(): void {
    try {
      const stored = localStorage.getItem('ui_preferences');
      if (stored) {
        const preferences = JSON.parse(stored);
        this.state.preferences = {
          ...this.state.preferences,
          ...preferences,
        };
      }
    } catch (error) {
      console.error('[UIStore] Error loading preferences:', error);
    }
  }

  /**
   * Save preferences to localStorage
   */
  private savePreferences(): void {
    try {
      localStorage.setItem(
        'ui_preferences',
        JSON.stringify(this.state.preferences)
      );
    } catch (error) {
      console.error('[UIStore] Error saving preferences:', error);
    }
  }

  /**
   * Notify all listeners
   */
  private notify(): void {
    const state = this.getState();
    for (const listener of this.listeners) {
      try {
        listener(state);
      } catch (error) {
        console.error('[UIStore] Listener error:', error);
      }
    }
  }

  /**
   * Reset to defaults
   */
  public reset(): void {
    this.state = {
      currentSubject: null,
      currentPlayer: null,
      preferences: {
        soundEnabled: true,
        musicEnabled: false,
        vibrationEnabled: true,
        difficulty: 'medium',
      },
      loading: false,
      error: null,
    };
    this.notify();
  }
}

export const uiStore = UIStore.getInstance();
