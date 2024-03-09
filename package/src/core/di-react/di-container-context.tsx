import { createContext, useContext } from "react";
import type { Resolve } from "../di";

export const DiContainerContext = createContext<Resolve | undefined>(undefined);

export function useDiContainer(): Resolve {
  const result = useContext(DiContainerContext);

  if (!result) {
    throw new Error("Di container has not been created.");
  }

  return result;
}
