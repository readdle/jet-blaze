import { DIContainer } from "jet-blaze/di-react";
import "./App.css";
import { createContainer } from "../composition-root/composition-root.ts";

function App() {
  return (
    <DIContainer container={createContainer}>
    </DIContainer>
  );
}

export default App;
