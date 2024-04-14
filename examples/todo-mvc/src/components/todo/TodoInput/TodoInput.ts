import { connect, type Controller } from "jet-blaze/connector";
import { TodoInputView, type ViewProps } from "./TodoInputView";
import { todoInputControllerKey } from "./todo-input-controller-key";
import {
  asapScheduler,
  filter,
  map,
  merge,
  observeOn,
  startWith,
  tap,
  withLatestFrom,
} from "rxjs";
import type { TodoStateService } from "../todo-state/todo-state.ts";

export interface Props {}

export function createTodoInputController(
  todoStateService: Pick<TodoStateService, "addTodo">,
): Controller<Props, ViewProps> {
  return ({ onChange$, onKeyDownEnter$, onAddButtonClick$ }) => {
    const addItem$ = merge(onKeyDownEnter$, onAddButtonClick$);

    const name$ = merge(
      onChange$,
      addItem$.pipe(
        map(() => ""),
        observeOn(asapScheduler), // This delay the reset of the input value to the next tick after addTodoEffect$ is executed
      ),
    ).pipe(startWith(""));

    const addTodoEffect$ = addItem$.pipe(
      withLatestFrom(name$),
      map(([, val]) => val),
      filter((name) => name.trim() !== ""),
      tap((name) => todoStateService.addTodo(name)),
    );

    return {
      viewState: {
        name: [name$, ""],
      },
      sideEffectStreams: [addTodoEffect$],
    };
  };
}

export const TodoInput = connect(TodoInputView, todoInputControllerKey);
