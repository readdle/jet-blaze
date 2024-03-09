// @ts-ignore
Symbol.dispose ??= Symbol("Symbol.dispose");

// @ts-ignore
Symbol.asyncDispose ??= Symbol("Symbol.asyncDispose");

export abstract class BaseDisposable implements AsyncDisposable {
  private disposed = false;

  public get isDisposed(): boolean {
    return this.disposed;
  }

  public [Symbol.asyncDispose](): Promise<void> {
    if (this.disposed) {
      return Promise.resolve();
    }

    this.disposed = true;

    return this.onDispose();
  }

  protected abstract onDispose(): Promise<void>;
}

export function isDisposable(value: unknown): value is Disposable {
  return (
    typeof value === "object" &&
    value !== null &&
    Symbol.dispose in value &&
    typeof value[Symbol.dispose] === "function"
  );
}

export function isAsyncDisposable(value: unknown): value is AsyncDisposable {
  return (
    typeof value === "object" &&
    value !== null &&
    Symbol.asyncDispose in value &&
    typeof value[Symbol.asyncDispose] === "function"
  );
}
