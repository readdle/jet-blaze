import { connect, type Controller } from "jet-blaze/connector";
import { map, throttleTime } from "rxjs";
import { TodoItemsView, type ViewProps } from "./TodoItemsView";
import { todoItemsControllerKey } from "./todo-items-controller-key";
import type { TodoStateService } from "../todo-state/todo-state.ts";

export interface Props {}

export function createTodoItemsController(
  todoStateService: TodoStateService,
): Controller<Props, ViewProps> {
  return ({ onItemToggle$, onItemRemove$ }) => {
    const listItems$ = todoStateService.items$.pipe(
      map((items) =>
        items.map((item) => ({
          id: item.id,
          text: item.name,
          completed: item.completed,
        })),
      ),
    );

    const onToggleItemEffect$ = onItemToggle$.pipe(
      map((id) => todoStateService.toggle(id)),
    );

    const onItemRemoveEffect$ = onItemRemove$.pipe(
      throttleTime(300),
      map((id) => todoStateService.remove(id)),
    );

    return {
      viewState: {
        listItems: [listItems$, []],
      },
      sideEffectStreams: [onToggleItemEffect$, onItemRemoveEffect$],
    };
  };
}

export const TodoItems = connect(TodoItemsView, todoItemsControllerKey);
