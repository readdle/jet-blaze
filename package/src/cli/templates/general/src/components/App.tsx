import { DIContainer } from "jet-blaze/di-react";
import "./App.css";
import { createContainer } from "../composition-root/composition-root.ts";
import { InputCounter } from "./InputCounter/InputCounter.ts";

function App() {
  return (
    <DIContainer container={createContainer}>
      <InputCounter />
    </DIContainer>
  );
}

export default App;