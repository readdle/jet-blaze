import { key, type Module } from "jet-blaze/di";
import {
  createTodoStateService,
  type TodoStateService,
} from "../components/todo/todo-state/todo-state.ts";
import { todoInputControllerKey } from "../components/todo/TodoInput/todo-input-controller-key.ts";
import { createTodoInputController } from "../components/todo/TodoInput/TodoInput.ts";
import { todoItemsControllerKey } from "../components/todo/TodoItems/todo-items-controller-key.ts";
import { createTodoItemsController } from "../components/todo/TodoItems/TodoItems.ts";

const todoStateServiceKey = key<TodoStateService>("TodoStateService");

export const todoModule: Module = (container) => {
  container.register(todoStateServiceKey, (_c) => createTodoStateService());
  container.register(todoInputControllerKey, (c) =>
    createTodoInputController(c.resolve(todoStateServiceKey)),
  );

  container.register(todoItemsControllerKey, (c) =>
    createTodoItemsController(c.resolve(todoStateServiceKey)),
  );
};
