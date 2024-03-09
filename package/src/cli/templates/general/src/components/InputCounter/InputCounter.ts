import { connect, type Controller } from "jet-blaze/connector";
import { map, merge, scan, share } from "rxjs";
import { inputCounterControllerKey } from "./input-counter-controller-key.ts";
import { InputCounterView, type ViewProps } from "./InputCounterView.tsx";

export interface Props {}

export function createInputCounterController(): Controller<Props, ViewProps> {
  return ({ onDecrementClick$, onIncrementClick$, mount$ }) => {
    const val$ = merge(
      onDecrementClick$.pipe(map(() => -1)),
      onIncrementClick$.pipe(map(() => 1)),
      mount$.pipe(map(() => 0)),
    ).pipe(
      scan((acc, x) => (x === 0 ? 0 : acc + x), 0),
      share(),
    );

    return {
      viewState: {
        val: [val$, 0],
      },
    };
  };
}

export const InputCounter = connect(
  InputCounterView,
  inputCounterControllerKey,
);
