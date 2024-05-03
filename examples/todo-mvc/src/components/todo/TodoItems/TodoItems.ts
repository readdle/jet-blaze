import { connect, type Controller } from "jet-blaze/connector";
import {
  combineLatest,
  map,
  merge,
  tap,
  throttleTime,
  withLatestFrom,
} from "rxjs";
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
  return ({
    onItemToggle$,
    onItemRemove$,
    mount$,
    onFilterChanged$,
    onToggleAllClick$,
    onRemoveCompletedClick$,
  }) => {
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
      tap((id) => todoStateService.toggle(id)),
    );

    const onItemRemoveEffect$ = onItemRemove$.pipe(
      throttleTime(300),
      tap((id) => todoStateService.remove(id)),
    );

    const onToggleAllEffect$ = onToggleAllClick$.pipe(
      withLatestFrom(todoStateService.items$),
      tap(([_, items]) => {
        const allCompleted = items.every((item) => item.completed);
        todoStateService.toggleAll(!allCompleted);
      }),
    );

    const onRemoveCompletedEffect$ = onRemoveCompletedClick$.pipe(
      tap(() => todoStateService.removeCompleted()),
    );

    return {
      viewState: {
        listItems: [listItems$, []],
        filterType: [filterType$, FilterType.All],
      },
      effects: [
        onToggleItemEffect$,
        onItemRemoveEffect$,
        onToggleAllEffect$,
        onRemoveCompletedEffect$,
      ],
    };
  };
}

export const TodoItems = connect(TodoItemsView, todoItemsControllerKey);
