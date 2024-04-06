import { DIContainer } from "jet-blaze/di-react";
import "./App.css";
import { createContainer } from "../composition-root/composition-root.ts";
import { TodoInput } from "./todo/TodoInput/TodoInput.ts";
import { TodoItems } from "./todo/TodoItems/TodoItems.ts";

function App() {
  return (
    <DIContainer container={createContainer}>
      <TodoInput />
      <TodoItems />
    </DIContainer>
  );
}

export default App;
