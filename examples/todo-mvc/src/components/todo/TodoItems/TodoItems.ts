import { connect, type Controller } from "jet-blaze/connector";
import { combineLatest, map, merge, throttleTime } from "rxjs";
import { FilterType, TodoItemsView, type ViewProps } from "./TodoItemsView";
import { todoItemsControllerKey } from "./todo-items-controller-key";
import type { TodoStateService } from "../todo-state/todo-state.ts";

export interface Props {}

const absurd = (x: never): never => {
  throw new Error(`absurd: ${x}`);
};

export function createTodoItemsController(
  todoStateService: TodoStateService,
): Controller<Props, ViewProps> {
  return ({ onItemToggle$, onItemRemove$, mount$, onFilterChanged$ }) => {
    const filterType$ = merge(
      mount$.pipe(map(() => FilterType.All)),
      onFilterChanged$,
    );

    const listItems$ = combineLatest([
      todoStateService.items$,
      filterType$,
    ]).pipe(
      map(([items, filterType]) =>
        items
          .filter(({ completed }) => {
            switch (filterType) {
              case FilterType.Active:
                return !completed;
              case FilterType.Completed:
                return completed;
              case FilterType.All:
                return true;
              default:
                return absurd(filterType);
            }
          })
          .map((item) => ({
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
        filterType: [filterType$, FilterType.All],
      },
      sideEffectStreams: [onToggleItemEffect$, onItemRemoveEffect$],
    };
  };
}

export const TodoItems = connect(TodoItemsView, todoItemsControllerKey);
