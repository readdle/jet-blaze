import { DIContainer } from "jet-blaze/di-react";
import React from "react";
import { createContainer } from "../../composition-root/composition-root";

export const App: React.FC = () => {
  return (
    <DIContainer container={createContainer}>
      <div>App</div>
    </DIContainer>
  );
};
