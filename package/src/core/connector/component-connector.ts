import React, { createElement, memo, useEffect, useRef, useState } from "react";
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  isObservable,
  map,
  merge,
  type Observable,
  of,
  type OperatorFunction,
  startWith,
  Subject,
  tap,
  withLatestFrom,
} from "rxjs";
import type { Key } from "../di";
import { useDiContainer } from "../di-react";
import { useConstant, useUpdateEffect } from "./hooks";
import { hasProperty } from "./utils";

function assertInvalidValue(x: never): never {
  throw new Error(`Unexpected object: ${x}`);
}

type FunctionPropertyKeys<T extends object> = Exclude<
  {
    readonly [K in keyof T]: T[K] extends Function ? K : never;
  }[keyof T],
  "children"
>;

type NonFunctionPropertyKeys<T extends object> = Exclude<
  keyof T,
  FunctionPropertyKeys<T>
>;

export type BindItem<T> = readonly [Observable<T>, T];

const propsMapperKey = Symbol("map");

export type PropsMapper<P, T> = {
  readonly [propsMapperKey]: (props: P) => T;
};

export type ObservableState<VP, PR> = {
  readonly [P in keyof VP]: BindItem<VP[P]> | VP[P] | PropsMapper<PR, VP[P]>;
};

export function passInput<P, SK extends keyof P>(
  sourceKey: SK,
): PropsMapper<P, P[SK]> {
  return {
    [propsMapperKey]: (props) => props[sourceKey],
  };
}

type CompressedParameters<F extends (...args: readonly unknown[]) => unknown> =
  Parameters<F> extends readonly [infer T]
    ? T
    : Parameters<F> extends readonly []
      ? void
      : Readonly<Parameters<F>>;

export type ViewState<VP extends object> = Pick<
  VP,
  NonFunctionPropertyKeys<VP>
>;
export type ViewEvents<VP extends object> = Pick<VP, FunctionPropertyKeys<VP>>;
export type ViewEventsSubjects<VP extends object> = {
  readonly [P in FunctionPropertyKeys<VP> as `${P & string}$`]: VP[P] extends (
    ...args: readonly any[]
  ) => any
    ? Subject<CompressedParameters<VP[P]>>
    : never;
};

type IsFunction<T> = T extends (...args: any[]) => any ? true : false;

export type HasCallbacks<T> = {
  [K in keyof T]: IsFunction<T[K]>;
}[keyof T];

export type OutEvents<VP extends object> = {
  [P in FunctionPropertyKeys<VP>]: VP[P] extends (
    ...args: readonly any[]
  ) => any
    ? Observable<CompressedParameters<VP[P]>>
    : never;
};

export type ExternalEvents<P extends object> = {
  readonly externalEvents: OutEvents<P>;
};

export type ComposeResult<VP extends object, P extends object> = {
  readonly viewState: ObservableState<ViewState<VP>, ViewState<P>>;
  readonly effects?: readonly Observable<unknown>[];
  readonly subjects?: readonly Subject<unknown>[];
} & (true extends HasCallbacks<P> ? ExternalEvents<P> : {});

export type InputStreamsInternal<P> = {
  readonly props$: Observable<P>;
  readonly mount$: Observable<void>;
  readonly unmount$: Observable<void>;
};

type ViewEventsSubjectsInternal = {
  readonly eventsSubjects: Record<string, Subject<unknown>>;
};

export type InputStreamsOperations<P> = {
  readonly mount: () => void;
  readonly unmount: () => void;
  readonly complete: () => void;
  readonly nextProps: (props: P) => void;
};

export type InputStreams<
  P extends object,
  VP extends object,
> = InputStreamsInternal<P> & ViewEventsSubjects<VP>;

export type Controller<P extends object, VP extends object> = (
  streams: InputStreams<P, VP>,
) => ComposeResult<VP, P>;

export type StreamComposer<P extends object, VP extends object, C = unknown> = (
  context: C,
) => Controller<P, VP>;

export function createInputStreams<P extends object, VP extends object>(
  initProps: P,
  debugLog: boolean,
) {
  const props$ = new BehaviorSubject(initProps);
  const mount$ = new Subject<void>();
  const unmount$ = new Subject<void>();
  const eventsSubjects: Record<string, Subject<unknown>> = {};
  const debugLogger = (...messages: readonly unknown[]): void => {
    // eslint-disable-next-line no-console
    if (debugLog) console.log(...messages);
  };

  const internalTarget: InputStreamsOperations<P> &
    InputStreamsInternal<P> &
    ViewEventsSubjectsInternal = {
    props$,
    mount$,
    unmount$,
    eventsSubjects,
    mount: () => mount$.next(),
    unmount: () => unmount$.next(),
    nextProps: (props) => props$.next(props),
    complete: () => {
      Object.values(eventsSubjects).forEach((obj) => {
        if (!!obj && typeof obj.complete === "function") {
          obj.complete();
        }
      });

      [mount$, unmount$, props$].forEach((subject) => subject.complete());
    },
  };

  const proxy = new Proxy(internalTarget, {
    get(target: Record<string, unknown>, propertyName: string): unknown {
      debugLogger("Getting input stream property", { propertyName, target });
      if (target[propertyName] !== undefined) {
        debugLogger("Got input stream property from cache", {
          propertyName,
          val: target[propertyName],
        });

        return target[propertyName];
      }

      if (eventsSubjects[propertyName] === undefined) {
        // eslint-disable-next-line functional/immutable-data,no-param-reassign
        eventsSubjects[propertyName] = new Subject<unknown>();
        debugLogger("Create new input stream subject", {
          propertyName,
          val: eventsSubjects[propertyName],
        });
      }

      debugLogger("Return new input stream subject", {
        propertyName,
        val: eventsSubjects[propertyName],
        eventsSubjects,
      });

      return eventsSubjects[propertyName];
    },
  });

  return proxy as InputStreamsOperations<P> &
    InputStreamsInternal<P> &
    ViewEventsSubjectsInternal &
    ViewEventsSubjects<VP>;
}

export function bindTo<T>(stream: Observable<T>, initValue: T): BindItem<T> {
  return [stream, initValue] as const;
}

function isBindItem(value: unknown): value is BindItem<unknown> {
  return Array.isArray(value) && value.length === 2 && isObservable(value[0]);
}

function isPropertyMapper<P, VP>(item: unknown): item is PropsMapper<P, VP> {
  return Boolean(item && item.hasOwnProperty(propsMapperKey));
}

export function unwrapObservableState<VP extends object, P extends object>(
  state: ObservableState<ViewState<VP>, ViewState<P>>,
  props$: Observable<ViewState<P>>,
  componentName: string,
  debug = false,
): Observable<ViewState<VP>> {
  const keys: readonly string[] = Object.keys(state);

  function debugLog<T>(index: number): OperatorFunction<T, T> {
    return (source) =>
      source.pipe(
        map((k) => {
          if (debug) {
            // eslint-disable-next-line no-console,i18next/no-literal-string
            console.log(componentName, "propChanged", keys[index], k);
          }

          return k;
        }),
      );
  }

  const streams = Object.values(state).map((item, index) => {
    if (isBindItem(item)) {
      return item[0].pipe(
        startWith(item[1]),
        distinctUntilChanged(),
        debugLog(index),
      );
    }

    if (isPropertyMapper(item)) {
      return props$.pipe(
        map(item[propsMapperKey]),
        distinctUntilChanged(),
        debugLog(index),
      );
    }

    return of(item).pipe(debugLog(index));
  });

  return combineLatest(streams).pipe(
    map((values) => {
      // eslint-disable-next-line prefer-const,functional/no-let
      let result = {};
      // eslint-disable-next-line prefer-const,functional/no-let
      for (let i = 0; i < keys.length; i += 1) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line functional/immutable-data
        result[keys[i]] = values[i];
      }
      return result as ViewState<VP>;
    }),
  );
}

function getInitValue<P>(item: unknown, props: P): unknown {
  if (isBindItem(item)) {
    return item[1];
  }

  if (isPropertyMapper(item)) {
    return item[propsMapperKey](props);
  }

  return item;
}

export function reduceInitViewState<VP extends object, P extends object>(
  outputState: ObservableState<ViewState<VP>, ViewState<P>>,
  props: ViewState<P>,
): ViewState<VP> {
  return Object.entries(outputState).reduce(
    (a, entry: readonly [string, unknown]) => {
      const item = entry[1];
      const initValue = getInitValue(item, props);
      return { ...a, [entry[0]]: initValue } as Partial<ViewState<VP>>;
    },
    {},
  ) as ViewState<VP>;
}

// eslint-disable-next-line no-restricted-syntax
export enum RenderStrategy {
  None = "None",
  Default = "Default",
  Memoized = "Memoized",
  MemoizedInner = "MemoizedInner",
  MemoizedOuter = "MemoizedOuter",
}

function useRenderStrategy<VP extends object>(
  renderStrategy: RenderStrategy,
  viewComponent: React.FC<VP>,
): React.FC<VP> {
  return useConstant(() => {
    switch (renderStrategy) {
      case RenderStrategy.None:
        return viewComponent;
      case RenderStrategy.Default:
      case RenderStrategy.MemoizedOuter:
        return (viewProps: VP) => createElement(viewComponent, viewProps);
      case RenderStrategy.Memoized:
      case RenderStrategy.MemoizedInner: {
        const MemoizedComponent = memo(viewComponent);
        // eslint-disable-next-line functional/immutable-data
        MemoizedComponent.displayName = `ShallowMemoized${
          viewComponent.displayName || viewComponent.name
        }`;

        return (viewProps: VP) => createElement(MemoizedComponent, viewProps);
      }
      default:
        return assertInvalidValue(renderStrategy);
    }
  });
}

export const hasExternalEvents = <P extends object>(
  component: unknown,
): component is ExternalEvents<P> => {
  return (
    hasProperty(component, "externalEvents") &&
    typeof component.externalEvents === "object" &&
    component.externalEvents !== null
  );
};

export const connect = <P extends {}, VP extends {}>(
  viewComponent: React.FC<VP>,
  streamComposer: (() => Controller<P, VP>) | Key<Controller<P, VP>>,
  displayName?: string,
  renderStrategy: RenderStrategy = RenderStrategy.Memoized,
  debugLog = false,
): React.FC<P> => {
  const componentName =
    displayName ??
    `BoundedTo${viewComponent.displayName || viewComponent.name}`;

  const SmartComponent: React.FC<P> = (props) => {
    const input = useConstant(() => createInputStreams<P, VP>(props, debugLog));
    const container = useDiContainer();
    const component = useConstant(() =>
      (typeof streamComposer === "function"
        ? streamComposer()
        : container.resolve(streamComposer))(input),
    );
    const debugLogger = useConstant(() => (...messages: readonly unknown[]) => {
      // eslint-disable-next-line no-console
      if (debugLog) console.log(componentName, ...messages);
    });

    const eventHandlers = useConstant(() => {
      debugLogger("inputStreams.eventsSubjects", input.eventsSubjects);
      return Object.entries(input.eventsSubjects).reduce(
        (handlers, [subjectName, subjectValue]) => {
          const callback = (...args: readonly unknown[]): void => {
            const eventValue = args.length === 1 ? args[0] : args;
            debugLogger("View callback event", {
              subjectName,
              eventValue,
              subjectValue,
            });
            subjectValue.next(eventValue);
          };
          const propName = subjectName.slice(0, subjectName.length - 1); // remove '$' at the end
          return { ...handlers, [propName]: callback } as Partial<
            ViewEvents<VP>
          >;
        },
        {},
      ) as ViewEvents<VP>;
    });

    const compactViewProps = (viewProps: ViewState<VP>): VP => {
      return { ...viewProps, ...eventHandlers } as VP;
    };

    const initialViewProps = useConstant(() => {
      const defaultState = reduceInitViewState(component.viewState, props);
      return compactViewProps(defaultState);
    });
    const viewPropsDispatcherRef = useRef({
      value: initialViewProps as VP | null,
      set: (nextProps: VP | null) => {
        // eslint-disable-next-line functional/immutable-data
        viewPropsDispatcherRef.current.value = nextProps;
      },
    });

    const subscription = useConstant(() => {
      debugLogger("Mount", componentName);
      const externalEventsStreams = hasExternalEvents(component)
        ? Object.entries(component.externalEvents).map(([key, stream]) => {
            return combineLatest([
              stream as Observable<ReadonlyArray<unknown> | unknown>,
              input.mount$,
            ]).pipe(
              map((item) => item[0]),
              withLatestFrom(input.props$),
              tap(([item, p]) => {
                const callback = (p as Record<string, unknown>)[key];
                if (callback === undefined) {
                  return;
                }

                if (typeof callback !== "function") {
                  console.error(
                    componentName,
                    `Property ${key} is not a function`,
                  );
                  return;
                }

                const args = Array.isArray(item) ? item : [item];
                callback.apply(null, [...args]);
              }),
            );
          })
        : [];

      debugLogger("Subscribing");

      const sub = merge(
        unwrapObservableState<VP, P>(
          component.viewState,
          input.props$,
          componentName,
          debugLog,
        ).pipe(
          tap((nextViewProps) => {
            debugLogger("unwrapObservableState", nextViewProps);
            try {
              viewPropsDispatcherRef.current.set(
                compactViewProps(nextViewProps),
              );
            } catch (e) {
              console.error(
                componentName,
                "viewPropsDispatcherRef.current.set",
                nextViewProps,
              );
              throw e;
            }
          }),
        ),
        ...(component.effects ?? []),
        ...externalEventsStreams,
      ).subscribe({
        error: (err) => {
          console.error(componentName, err);
        },
      });

      debugLogger("Subscribed");

      return sub;
    });

    const [viewProps, setViewProps] = useState<VP>(
      () => viewPropsDispatcherRef.current.value as VP,
    );

    useEffect(() => {
      // eslint-disable-next-line functional/immutable-data
      viewPropsDispatcherRef.current.set = setViewProps as (
        v: VP | null,
      ) => void;
      input.mount();

      return () => {
        debugLogger("Unmount");
        input.unmount();
        subscription.unsubscribe();
        component.subjects?.forEach((subject) => subject.complete());
        input.complete();
        // eslint-disable-next-line react-hooks/exhaustive-deps
        viewPropsDispatcherRef.current.set(null);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useUpdateEffect(() => {
      debugLogger("externalPropsChanged", props);
      input.nextProps(props);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, Object.values(props));

    const render = useRenderStrategy(renderStrategy, viewComponent);

    return render(viewProps);
  };

  // eslint-disable-next-line functional/immutable-data
  SmartComponent.displayName = componentName;

  return [RenderStrategy.Memoized, RenderStrategy.MemoizedOuter].includes(
    renderStrategy,
  )
    ? memo(SmartComponent)
    : SmartComponent;
};
