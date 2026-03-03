/**
 * Screen Manager - Handles screen transitions and navigation
 * 
 * Uses event bus for navigation requests and component registry
 * for screen lifecycle management
 */

import { eventBus } from '../../infrastructure/events/EventBus';
import { componentRegistry } from '../registry/ComponentRegistry';

export type ScreenName =
  | 'home'
  | 'speedrun'
  | 'blitz'
  | 'hardcore'
  | 'survival'
  | 'practice'
  | 'flashcards'
  | 'revision'
  | 'results'
  | 'achievements';

class ScreenManager {
  private static instance: ScreenManager;
  private currentScreen: ScreenName | null = null;
  private previousScreen: ScreenName | null = null;
  private screenHistory: ScreenName[] = [];

  private constructor() {
    this.setupEventListeners();
  }

  public static getInstance(): ScreenManager {
    if (!ScreenManager.instance) {
      ScreenManager.instance = new ScreenManager();
    }
    return ScreenManager.instance;
  }

  /**
   * Setup event listeners for navigation
   */
  private setupEventListeners(): void {
    // Listen for mode selection
    eventBus.on('mode:selected', async (event) => {
      const { mode } = event;
      await this.navigateToMode(mode);
    });

    // Listen for home navigation
    eventBus.on('navigate:home', async (event) => {
      await this.navigateTo('home', event.preserveState);
    });

    // Listen for game completion
    eventBus.on('game:complete', async () => {
      await this.navigateTo('results');
    });
  }

  /**
   * Navigate to a specific screen
   */
  public async navigateTo(
    screenName: ScreenName,
    preserveState: boolean = false
  ): Promise<void> {
    const from = this.currentScreen;

    // Don't navigate if already on this screen
    if (from === screenName) {
      console.log(`[ScreenManager] Already on screen: ${screenName}`);
      return;
    }

    console.log(`[ScreenManager] Navigating: ${from || 'none'} -> ${screenName}`);

    // Update history
    if (from && !preserveState) {
      this.screenHistory.push(from);
    }

    // Destroy the previous screen if it exists to prevent memory leaks (don't cache game instances)
    if (from && from !== 'home') {
      const prevComponent = componentRegistry.get(from);
      if (prevComponent && prevComponent.destroy) {
        console.log(`[ScreenManager] Destroying previous screen: ${from}`);
        componentRegistry.unregister(from);
      }
    }

    // Show the new screen via registry
    await componentRegistry.show(screenName);

    // Update state
    this.previousScreen = from;
    this.currentScreen = screenName;

    // Emit screen change event
    await eventBus.emit('screen:change', {
      from: from || 'none',
      to: screenName,
    });
  }

  /**
   * Navigate to a game mode screen
   */
  public async navigateToMode(mode: string): Promise<void> {
    // Map modes to screen names
    const modeToScreen: Record<string, ScreenName> = {
      'speedrun': 'speedrun',
      'blitz': 'blitz',
      'hardcore': 'hardcore',
      'survival': 'survival',
      'practice': 'practice',
      'flashcards-term': 'flashcards',
      'flashcards-bank': 'flashcards',
      'full-revision': 'revision',
    };

    const screenName = modeToScreen[mode];
    if (screenName) {
      await this.navigateTo(screenName);
    } else {
      console.warn(`[ScreenManager] Unknown mode: ${mode}`);
    }
  }

  /**
   * Go back to previous screen
   */
  public async goBack(): Promise<void> {
    if (this.screenHistory.length > 0) {
      const previous = this.screenHistory.pop()!;
      await this.navigateTo(previous, true);
    } else {
      await this.navigateTo('home');
    }
  }

  /**
   * Get current screen name
   */
  public getCurrentScreen(): ScreenName | null {
    return this.currentScreen;
  }

  /**
   * Get previous screen name
   */
  public getPreviousScreen(): ScreenName | null {
    return this.previousScreen;
  }

  /**
   * Clear navigation history
   */
  public clearHistory(): void {
    this.screenHistory = [];
  }

  /**
   * Check if can go back
   */
  public canGoBack(): boolean {
    return this.screenHistory.length > 0;
  }
}

export const screenManager = ScreenManager.getInstance();
