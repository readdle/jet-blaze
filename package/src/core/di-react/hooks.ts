import { useEffect, useRef } from "react";
import { isAsyncDisposable, isDisposable } from "../di";

export function useConstant<T>(initialValue: T | (() => T)): T {
  const ref = useRef<{ readonly value: T }>();

  if (ref.current === undefined) {
    ref.current = {
      value:
        typeof initialValue === "function"
          ? (initialValue as Function)()
          : initialValue,
    };
  }

  return ref.current.value;
}

const disposeContainer = (disposableContainer: unknown) => {
  try {
    if (isDisposable(disposableContainer)) {
      disposableContainer[Symbol.dispose]();
    } else if (isAsyncDisposable(disposableContainer)) {
      disposableContainer[Symbol.asyncDispose]().then(
        () => {},
        (err) => {
          console.error("Error while disposing container", err);
        },
      );
    }
  } catch (err) {
    console.error("Error while disposing container", err);
  }
};

export const useDispose = (container: unknown) => {
  useEffect(() => {
    return () => disposeContainer(container);
  }, []);
};
