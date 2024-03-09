import {
  BaseDisposable,
  isAsyncDisposable,
  isDisposable,
} from "./base-disposable";
import { getSymbolForKey, type Key } from "./key";
import type { Resolve } from "./resolve";
import { assertNever } from "./tools";

export const LifeTimeScope = {
  Transient: 0,
  Singleton: 1,
  Scope: 2,
} as const;

export type LifeTimeScope = (typeof LifeTimeScope)[keyof typeof LifeTimeScope];

export interface RegistryItem<T> {
  readonly factory: FactoryMethod<T>;
  readonly scope: LifeTimeScope;
}

export type FactoryMethod<T> = (container: Resolve) => T;

export class Container extends BaseDisposable implements Resolve {
  private readonly factories: ReadonlyMap<symbol, RegistryItem<unknown>>;

  private readonly cache = new Map<symbol, unknown>();

  // Set logToConsole to true for debugging DI errors
  // eslint-disable-next-line functional/prefer-readonly-type
  public static logToConsole = false;

  public readonly parentScope: Resolve | undefined;

  public readonly rootScope: Resolve;

  private readonly name: Symbol;

  // eslint-disable-next-line functional/prefer-readonly-type
  private static isCreatingSingleton = false;

  public constructor(
    factories: ReadonlyMap<symbol, RegistryItem<unknown>>,
    name: Symbol,
    parentScope?: Resolve,
  ) {
    super();

    this.factories = factories;
    this.name = name;
    this.parentScope = parentScope;
    this.rootScope = this.getRootScope();
  }

  public createScope(name: Symbol): Resolve {
    return new Container(this.factories, name, this);
  }

  protected async onDispose(): Promise<void> {
    if (Container.logToConsole) {
      // eslint-disable-next-line no-console
      this.logInfoMessage("Disposing container", {
        cacheSize: this.cache.size,
      });
    }
    for (const [cacheKey, object] of this.cache.entries()) {
      if (Container.logToConsole) {
        this.logDebugMessage(`Disposing '${String(cacheKey)}'`);
      }
      if (isDisposable(object)) {
        object[Symbol.dispose]();
      } else if (isAsyncDisposable(object)) {
        // eslint-disable-next-line no-await-in-loop
        await object[Symbol.asyncDispose]();
      }
    }
  }

  public resolve<T>(registryKey: Key<T>): T {
    if (Container.logToConsole) {
      // eslint-disable-next-line no-console
      console.group(`Resolving '${String(registryKey)}`);
    }
    try {
      if (Container.logToConsole) {
        this.logDebugMessage(`Resolving '${String(registryKey)}'`, {
          registry: registryKey,
        });
      }
      const factoryKey = getSymbolForKey(registryKey);
      const registryItem = this.factories.get(factoryKey) as
        | RegistryItem<T>
        | undefined;
      if (!registryItem) {
        this.logErrorMessage(
          `Cant resolve object. There is no registry with key "${String(registryKey)}"`,
        );
        throw new Error(
          `Cant resolve object. There is no registry with key "${String(registryKey)}"`,
        );
      }

      switch (registryItem.scope) {
        case LifeTimeScope.Transient: {
          if (Container.logToConsole) {
            this.logDebugMessage(
              `Resolved [Transient] '${String(registryKey)}'`,
              {
                registry: registryKey,
              },
            );
          }
          return registryItem.factory(this);
        }

        case LifeTimeScope.Scope: {
          return this.getObjectInstance(registryKey, registryItem);
        }

        case LifeTimeScope.Singleton: {
          if (!this.parentScope) {
            return this.getObjectInstance(registryKey, registryItem);
          }

          return this.rootScope.resolve(registryKey);
        }

        default:
          return assertNever(registryItem.scope);
      }
    } finally {
      if (Container.logToConsole) {
        // eslint-disable-next-line no-console
        console.groupEnd();
      }
    }
  }

  private getRootScope(): Resolve {
    if (!this.parentScope) {
      return this;
    }

    // eslint-disable-next-line functional/no-let
    let current = this.parentScope;
    while (current.parentScope) {
      current = current.parentScope;
    }

    return current;
  }

  private getObjectInstance<T>(
    registryKey: Key<T>,
    registryItem: RegistryItem<T>,
  ): T {
    const factoryKey = getSymbolForKey(registryKey);
    const object = this.cache.get(factoryKey);
    if (object) {
      if (Container.logToConsole) {
        this.logDebugMessage(
          `Resolved, from cache [${registryItem.scope}] '${String(registryKey)}'`,
          {
            registry: registryKey,
          },
        );
      }
      return object as T;
    }

    const shouldSetFlag =
      !Container.isCreatingSingleton &&
      registryItem.scope === LifeTimeScope.Singleton;

    if (shouldSetFlag) {
      Container.isCreatingSingleton = true;
    }
    try {
      if (
        Container.isCreatingSingleton &&
        registryItem.scope === LifeTimeScope.Scope
      ) {
        const message = `Cant resolve object. Scoped object '${String(
          registryKey,
        )}' cant be resolved from Singleton`;
        this.logErrorMessage(message);
        throw new Error(message);
      }

      const newObject = registryItem.factory(this);
      this.cache.set(factoryKey, newObject);

      if (Container.logToConsole) {
        this.logDebugMessage(
          `Resolved, new instance, [${registryItem.scope}] '${String(registryKey)}'`,
          {
            registry: registryKey,
          },
        );
      }
      return newObject;
    } finally {
      if (shouldSetFlag) {
        Container.isCreatingSingleton = false;
      }
    }
  }

  private logDebugMessage(
    message: string,
    meta?: Record<string, unknown>,
  ): void {
    console.log(this.name, message, meta);
  }

  private logInfoMessage(
    message: string,
    meta?: Record<string, unknown>,
  ): void {
    console.info(this.name, message, meta);
  }

  private logErrorMessage(
    message: string,
    meta?: Record<string, unknown>,
  ): void {
    console.error(this.name, message, meta);
  }
}
