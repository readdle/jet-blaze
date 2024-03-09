import type { Key } from "./key";

export interface Resolve extends AsyncDisposable {
  readonly parentScope: Resolve | undefined;

  createScope(name: Symbol): Resolve;

  resolve<T>(key: Key<T>): T;
}
