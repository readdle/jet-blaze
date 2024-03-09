import {
  merge,
  type Observable,
  type Subscription,
  tap,
  withLatestFrom,
} from "rxjs";
import {
  type Controller,
  createInputStreams,
  hasExternalEvents,
  type InputStreamsInternal,
  type InputStreamsOperations,
  reduceInitViewState,
  unwrapObservableState,
  type ViewEventsSubjects,
  type ViewState,
} from "../component-connector";

export type InputSubjects<
  P extends object,
  VP extends object,
> = InputStreamsOperations<P> &
  InputStreamsInternal<P> &
  ViewEventsSubjects<VP>;

export type SetupResult<P extends object, VP extends object> = {
  readonly in: Omit<
    InputSubjects<P, VP>,
    "complete" | "props$" | "mount$" | "unmount$" | "mount" | "unmount"
  >;
  readonly out: ViewState<VP>;
  readonly mount: () => void;
  readonly unmount: () => void;
  readonly dispose: () => void;
};

export function setUp<P extends object, VP extends object>(
  controller: Controller<P, VP>,
  initProps: P,
): SetupResult<P, VP> {
  const inputs = createInputStreams<P, VP>(initProps, false);
  const { viewState, sideEffectStreams, subjects, ...rest } =
    controller(inputs);

  const sideEffectsStreams = sideEffectStreams ?? [];

  const outputs: SetupResult<P, VP>["out"] = reduceInitViewState(
    viewState,
    initProps,
  );

  const mount = (): void => inputs.mount();
  const unmount = (): void => inputs.unmount();
  const completeInputs = (): void => inputs.complete();

  const outEventsStreams = hasExternalEvents(rest)
    ? Object.entries(rest.externalEvents).map(([key, stream]) => {
        return (stream as Observable<ReadonlyArray<unknown> | unknown>).pipe(
          withLatestFrom(inputs.props$),
          tap(([i, p]) => {
            const callback = (p as Record<string, unknown>)[key] as Function;
            if (callback === undefined) {
              return;
            }
            const args = Array.isArray(i) ? i : [i];
            callback.apply(null, [...args]);
          }),
        );
      })
    : [];

  // eslint-disable-next-line functional/no-let
  let subscription: Subscription;

  const dispose = (): void => {
    unmount();
    completeInputs();
    subjects?.forEach((i) => i.complete());
    subscription.unsubscribe();
  };

  const result = {
    in: inputs,
    out: outputs,
    mount,
    unmount,
    dispose,
  };

  subscription = merge(
    unwrapObservableState(viewState, inputs.props$, "component-test").pipe(
      tap((i) => {
        // eslint-disable-next-line functional/immutable-data
        result.out = { ...result.out, ...i };
      }),
    ),
    ...sideEffectsStreams,
    ...outEventsStreams,
  ).subscribe({
    error: (err) => {
      throw new Error(err);
    },
  });

  return result;
}
