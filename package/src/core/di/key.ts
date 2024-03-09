export type Key<T> = {
  readonly value: symbol;
  readonly type?: T;
};

export const key = <T>(name?: string): Key<T> => ({ value: Symbol(name) });

export const getSymbolForKey = (registryKey: Key<unknown>): symbol =>
  registryKey.value;
