import {
  type DependencyList,
  type EffectCallback,
  useEffect,
  useRef,
} from "react";

type AnyFunction = (...args: unknown[]) => unknown;

const isFunction = (predicate: unknown): predicate is AnyFunction =>
  typeof predicate === "function";

const initial = {};

export function useConstant<T>(value: T | (() => T)): T {
  const ref = useRef<T | {}>(initial);
  if (ref.current === initial) {
    // eslint-disable-next-line functional/immutable-data
    ref.current = isFunction(value) ? value() : value;
  }
  return ref.current as T;
}

export function useUpdateEffect(
  effect: EffectCallback,
  deps?: DependencyList,
): void {
  const isInitialMount = useRef<boolean>(true);

  useEffect(() => {
    if (isInitialMount.current) {
      // eslint-disable-next-line functional/immutable-data
      isInitialMount.current = false;
    } else {
      effect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
