import { connect, type Controller } from "jet-blaze/connector";
import { TodoInputView, type ViewProps } from "./TodoInputView";
import { todoInputControllerKey } from "./todo-input-controller-key";
import {
  asapScheduler,
  map,
  merge,
  observeOn,
  tap,
  withLatestFrom,
} from "rxjs";
import type { TodoStateService } from "../todo-state/todo-state.ts";

export interface Props {}

export function createTodoInputController(
  todoStateService: TodoStateService,
): Controller<Props, ViewProps> {
  return ({ onChange$, onKeyDownEnter$ }) => {
    const name$ = merge(
      onChange$,
      onKeyDownEnter$.pipe(
        map(() => ""),
        observeOn(asapScheduler),
      ),
    );

    const addTodoEffect$ = onKeyDownEnter$.pipe(
      withLatestFrom(name$),
      map(([, val]) => val),
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
