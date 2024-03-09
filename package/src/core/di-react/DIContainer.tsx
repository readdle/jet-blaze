import type { PropsWithChildren } from "react";
import React from "react";
import type { Resolve } from "../di";
import { DiContainerContext } from "./di-container-context";
import { useConstant, useDispose } from "./hooks";

export interface DIContainerProps {
  readonly container: () => Resolve;
}

export const DIContainer: React.FC<PropsWithChildren<DIContainerProps>> = (
  props,
) => {
  const container = useConstant(props.container);

  useDispose(container);

  return (
    <DiContainerContext.Provider value={container}>
      {props.children}
    </DiContainerContext.Provider>
  );
};
