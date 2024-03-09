import type { RegistryItem } from "./container";
import { Container, LifeTimeScope } from "./container";
import { getSymbolForKey, type Key } from "./key";
import type { Resolve } from "./resolve";

export interface Builder {
  register<T>(
    key: Key<T>,
    factory: (container: Resolve) => T,
    scope: LifeTimeScope,
  ): void;
  register<T>(key: Key<T>, factory: (container: Resolve) => T): void;
}

export interface Module {
  (builder: Builder): void;
}

export interface DiContainerBuilder extends Builder {
  registerModule(module: Module): void;
  build(): Resolve;
}

export class ContainerBuilder implements DiContainerBuilder {
  private readonly factories = new Map<symbol, RegistryItem<unknown>>();

  // eslint-disable-next-line functional/prefer-readonly-type
  private built = false;

  public register<T>(
    registryKey: Key<T>,
    factory: (container: Resolve) => T,
    scope: LifeTimeScope = LifeTimeScope.Scope,
  ): void {
    if (this.built) {
      // eslint-disable-next-line i18next/no-literal-string
      throw new Error("Container has been already built");
    }

    const factoryKey = getSymbolForKey(registryKey);

    if (this.factories.has(factoryKey)) {
      throw new Error(`Duplicate registration "${String(registryKey)}"`);
    }

    this.factories.set(factoryKey, { factory, scope });
  }

  registerModule(module: Module): void {
    module(this);
  }

  public build(): Resolve {
    if (this.built) {
      // eslint-disable-next-line i18next/no-literal-string
      throw new Error("Container has been already built");
    }

    // eslint-disable-next-line functional/immutable-data
    this.built = true;

    // eslint-disable-next-line i18next/no-literal-string
    return new Container(this.factories, Symbol.for("Root"));
  }
}
