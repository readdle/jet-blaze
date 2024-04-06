import {
  map,
  type Observable,
  scan,
  share,
  shareReplay,
  startWith,
  Subject,
} from "rxjs";

export interface TodoStateService {
  readonly addTodo: (value: string) => void;
  readonly toggleAll: (completed: boolean) => void;
  readonly toggle: (id: string) => void;
  readonly remove: (id: string) => void;
  readonly removeCompleted: () => void;

  readonly items$: Observable<readonly Item[]>;
}

export type Item = {
  id: string;
  value: string;
  completed: boolean;
};

const enum ActionType {
  AddTodo,
  ToggleAll,
  Toggle,
  Remove,
  RemoveCompleted,
}

type Actions =
  | {
      type: ActionType.AddTodo;
      value: string;
    }
  | {
      type: ActionType.ToggleAll;
      completed: boolean;
    }
  | {
      type: ActionType.Toggle;
      id: string;
    }
  | {
      type: ActionType.Remove;
      id: string;
    }
  | {
      type: ActionType.RemoveCompleted;
    };

type State = {
  readonly items: readonly Item[];
};

const initialState: State = {
  items: [],
};

const uuid = () => Math.random().toString(36).substring(2, 9);

export const createTodoStateService = (): TodoStateService & Disposable => {
  const actions$ = new Subject<Actions>();

  const state$ = actions$.pipe(
    scan((state, action) => {
      switch (action.type) {
        case ActionType.AddTodo:
          return {
            ...state,
            items: [
              ...state.items,
              {
                id: uuid(),
                value: action.value,
                completed: false,
              },
            ],
          };
        case ActionType.ToggleAll:
          return {
            ...state,
            items: state.items.map((item) => ({
              ...item,
              completed: action.completed,
            })),
          };
        case ActionType.Toggle:
          return {
            ...state,
            items: state.items.map((item) =>
              item.id === action.id
                ? { ...item, completed: !item.completed }
                : item,
            ),
          };
        case ActionType.Remove:
          return {
            ...state,
            items: state.items.filter((item) => item.id !== action.id),
          };
        case ActionType.RemoveCompleted:
          return {
            ...state,
            items: state.items.filter((item) => !item.completed),
          };
      }
    }, initialState),
    startWith(initialState),
    share(),
  );

  const items$ = state$.pipe(
    map((state) => state.items),
    shareReplay(1),
  );

  return {
    addTodo: (value: string) =>
      actions$.next({ type: ActionType.AddTodo, value }),
    toggleAll: (completed: boolean) =>
      actions$.next({ type: ActionType.ToggleAll, completed }),
    toggle: (id: string) => actions$.next({ type: ActionType.Toggle, id }),
    remove: (id: string) => actions$.next({ type: ActionType.Remove, id }),
    removeCompleted: () => actions$.next({ type: ActionType.RemoveCompleted }),
    items$,
    [Symbol.dispose]: () => [actions$].forEach((i) => i.complete()),
  };
};
