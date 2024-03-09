import type { PropsWithChildren } from "react";
import React from "react";
import { DiContainerContext, useDiContainer } from "./di-container-context";
import { useConstant, useDispose } from "./hooks";

export interface DIScopeProps {
  readonly scopeName: Symbol;
}

export const DIScope: React.FC<PropsWithChildren<DIScopeProps>> = (props) => {
  const parentContainer = useDiContainer();

  const container = useConstant(() =>
    parentContainer.createScope(props.scopeName),
  );

  useDispose(container);

  return (
    <DiContainerContext.Provider value={container}>
      {props.children}
    </DiContainerContext.Provider>
  );
};
