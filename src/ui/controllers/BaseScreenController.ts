/**
 * Base Screen Controller - Abstract class for all screen controllers
 * 
 * Provides common functionality for screen lifecycle management
 * and eliminates polling-based initialization
 */

import type { ScreenController } from '../registry/ComponentRegistry';
import { eventBus } from '../../infrastructure/events/EventBus';

export abstract class BaseScreenController implements ScreenController {
  protected screenId: string;
  protected isInitialized: boolean = false;
  protected isVisible: boolean = false;
  protected cleanupFunctions: Array<() => void> = [];

  constructor(screenId: string) {
    this.screenId = screenId;
  }

  /**
   * Initialize the screen (called once)
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.warn(`[${this.constructor.name}] Already initialized`);
      return;
    }

    try {
      // Wait for DOM elements
      await this.waitForElement(`#${this.screenId}`);

      // Bind events
      this.bindEvents();

      // Custom initialization
      await this.onInit();

      this.isInitialized = true;
      console.log(`[${this.constructor.name}] Initialized successfully`);
    } catch (error) {
      console.error(`[${this.constructor.name}] Initialization failed:`, error);
      throw error;
    }
  }

  /**
   * Show the screen
   */
  public show(): void {
    if (!this.isInitialized) {
      console.warn(`[${this.constructor.name}] Cannot show: not initialized`);
      return;
    }

    const screen = document.getElementById(this.screenId);
    if (!screen) {
      console.error(`[${this.constructor.name}] Screen element not found: ${this.screenId}`);
      return;
    }

    // Hide all other screens
    document.querySelectorAll('.screen').forEach(s => {
      if (s.id !== this.screenId) {
        s.classList.remove('active');
      }
    });

    // Show this screen
    screen.classList.add('active');
    this.isVisible = true;

    // Call lifecycle hook
    this.onShow();

    console.log(`[${this.constructor.name}] Shown`);
  }

  /**
   * Hide the screen
   */
  public hide(): void {
    const screen = document.getElementById(this.screenId);
    if (screen) {
      screen.classList.remove('active');
    }

    this.isVisible = false;

    // Call lifecycle hook
    this.onHide();

    console.log(`[${this.constructor.name}] Hidden`);
  }

  /**
   * Destroy the screen and clean up
   */
  public destroy(): void {
    // Call lifecycle hook
    this.onDestroy();

    // Run all cleanup functions
    for (const cleanup of this.cleanupFunctions) {
      try {
        cleanup();
      } catch (error) {
        console.error(`[${this.constructor.name}] Cleanup error:`, error);
      }
    }

    this.cleanupFunctions = [];
    this.isInitialized = false;
    this.isVisible = false;

    console.log(`[${this.constructor.name}] Destroyed`);
  }

  /**
   * Wait for a DOM element to exist
   */
  protected waitForElement(selector: string, timeout: number = 5000): Promise<Element> {
    return new Promise((resolve, reject) => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }

      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector);
        if (element) {
          observer.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      // Timeout
      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Element ${selector} not found within ${timeout}ms`));
      }, timeout);
    });
  }

  /**
   * Subscribe to an event and auto-cleanup on destroy
   */
  protected subscribeEvent<K extends keyof import('../../infrastructure/events/EventTypes').EventMap>(
    event: K,
    handler: import('../../infrastructure/events/EventTypes').EventHandler<import('../../infrastructure/events/EventTypes').EventMap[K]>
  ): void {
    const unsubscribe = eventBus.on(event, handler);
    this.cleanupFunctions.push(unsubscribe);
  }

  /**
   * Add a DOM event listener with auto-cleanup
   */
  protected addEventListener(
    element: HTMLElement | string,
    event: string,
    handler: EventListener
  ): void {
    const el = typeof element === 'string' 
      ? document.querySelector(element) as HTMLElement
      : element;

    if (!el) {
      console.warn(`[${this.constructor.name}] Element not found for event listener`);
      return;
    }

    el.addEventListener(event, handler);
    this.cleanupFunctions.push(() => el.removeEventListener(event, handler));
  }

  /**
   * Get a DOM element by ID or selector
   */
  protected getElement<T extends HTMLElement = HTMLElement>(selector: string): T | null {
    return document.querySelector<T>(selector);
  }

  /**
   * Get all DOM elements by selector
   */
  protected getElements<T extends HTMLElement = HTMLElement>(selector: string): NodeListOf<T> {
    return document.querySelectorAll<T>(selector);
  }

  /**
   * Check if screen is currently visible
   */
  public isShowing(): boolean {
    return this.isVisible;
  }

  // ============================================================================
  // Lifecycle Hooks (Override in subclasses)
  // ============================================================================

  /**
   * Called during initialization (before show)
   * Use this for one-time setup
   */
  protected async onInit(): Promise<void> {
    // Override in subclass
  }

  /**
   * Called when screen is shown
   * Use this to refresh data or start animations
   */
  protected onShow(): void {
    // Override in subclass
  }

  /**
   * Called when screen is hidden
   * Use this to pause animations or save state
   */
  protected onHide(): void {
    // Override in subclass
  }

  /**
   * Called before screen is destroyed
   * Use this for final cleanup
   */
  protected onDestroy(): void {
    // Override in subclass
  }

  /**
   * Bind event listeners (called during initialization)
   * Override this to set up your event handlers
   */
  protected bindEvents(): void {
    // Override in subclass
  }
}
