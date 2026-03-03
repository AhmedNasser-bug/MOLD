/**
 * Component Registry - Manages screen components and their lifecycle
 * 
 * Replaces the window.game.* pattern with a proper registry system
 * that supports type-safe component registration and retrieval
 */

export interface ScreenController {
  initialize(): void | Promise<void>;
  show(): void;
  hide(): void;
  destroy?(): void;
}

export interface ComponentOptions {
  autoInit?: boolean;
  singleton?: boolean;
}

class ComponentRegistry {
  private static instance: ComponentRegistry;
  private components: Map<string, ScreenController> = new Map();
  private factories: Map<string, () => ScreenController> = new Map();
  private options: Map<string, ComponentOptions> = new Map();

  private constructor() {}

  public static getInstance(): ComponentRegistry {
    if (!ComponentRegistry.instance) {
      ComponentRegistry.instance = new ComponentRegistry();
    }
    return ComponentRegistry.instance;
  }

  /**
   * Register a screen component
   */
  public register(
    name: string,
    factory: () => ScreenController,
    options: ComponentOptions = {}
  ): void {
    this.factories.set(name, factory);
    this.options.set(name, { autoInit: true, singleton: true, ...options });

    console.log(`[ComponentRegistry] Registered: ${name}`);

    // Auto-initialize if requested
    if (options.autoInit) {
      this.get(name);
    }
  }

  /**
   * Get a component instance
   */
  public get(name: string): ScreenController | null {
    // Return existing instance if singleton
    if (this.components.has(name)) {
      return this.components.get(name)!;
    }

    // Create new instance from factory
    const factory = this.factories.get(name);
    if (!factory) {
      console.warn(`[ComponentRegistry] Component not found: ${name}`);
      return null;
    }

    const component = factory();
    const opts = this.options.get(name) || {};

    // Initialize
    const initResult = component.initialize();
    if (initResult instanceof Promise) {
      initResult.catch(error => {
        console.error(`[ComponentRegistry] Initialization failed for ${name}:`, error);
      });
    }

    // Store if singleton
    if (opts.singleton !== false) {
      this.components.set(name, component);
    }

    return component;
  }

  /**
   * Check if component is registered
   */
  public has(name: string): boolean {
    return this.factories.has(name);
  }

  /**
   * Unregister a component
   */
  public unregister(name: string): void {
    const component = this.components.get(name);
    if (component && component.destroy) {
      component.destroy();
    }

    this.components.delete(name);
    this.factories.delete(name);
    this.options.delete(name);

    console.log(`[ComponentRegistry] Unregistered: ${name}`);
  }

  /**
   * Show a screen by name
   */
  public async show(name: string): Promise<void> {
    const component = this.get(name);
    if (component) {
      // Hide all other screens
      for (const [key, comp] of this.components.entries()) {
        if (key !== name) {
          comp.hide();
        }
      }

      // Show requested screen
      component.show();
      console.log(`[ComponentRegistry] Showing: ${name}`);
    } else {
      console.warn(`[ComponentRegistry] Cannot show ${name}: not registered`);
    }
  }

  /**
   * Hide a screen by name
   */
  public hide(name: string): void {
    const component = this.get(name);
    if (component) {
      component.hide();
    }
  }

  /**
   * Get all registered component names
   */
  public list(): string[] {
    return Array.from(this.factories.keys());
  }

  /**
   * Clear all components
   */
  public clear(): void {
    for (const [name] of this.components) {
      this.unregister(name);
    }
  }
}

export const componentRegistry = ComponentRegistry.getInstance();

/**
 * Decorator for auto-registering screen components
 * Usage: @Screen('home')
 */
export function Screen(name: string, options: ComponentOptions = {}) {
  return function <T extends { new(...args: any[]): ScreenController }>(constructor: T) {
    // Register the component when class is defined
    componentRegistry.register(
      name,
      () => new constructor(),
      options
    );
    return constructor;
  };
}
