---
sidebar_label: Controller Layer
sidebar_position: 4
---
# Controller Layer Details

The Controller layer in Jet-Blaze manages application logic using a streams-based architecture via RxJS. It acts as a state machine, organizing input streams (e.g., user interactions, external events) into output streams that update the View.

## Key Principles of the Controller Layer

- **Input Streams:** Streams generated from View callbacks, component lifecycle events, external properties, and injected services.
- **Output Streams:** Streams feeding View properties, triggering external events, or introducing side effects.

### Example Controller

    ```typescript
    import { merge, map, scan, share, withLatestFrom } from 'rxjs';
    import { Controller, passInput } from 'jet-blaze/connector';

    export type Props = {
      readonly initialValue: number;
      readonly onChange: (val: number) => void;
    };

    export function createCounterController(): Controller<Props, ViewProps> {
      return ({ onIncrement$, onDecrement$, mount$, props$ }) => {
        const value$ = merge(
          onIncrement$.pipe(map(() => +1)),
          onDecrement$.pipe(map(() => -1)),
          mount$.pipe(
            withLatestFrom(props$),
            map(([, {initialValue}]) => ({type: 'set', value: initialValue})),
          )
        ).pipe(
          scan((acc, x) => typeof x === "number" ? acc + x : x.value, 0),
          share()
        );

        return {
          viewState: {
            value: [value$, 0],
          },
          externalEvents: {
            onChange: value$
          }
        };
      };
    }
    ```

### Managing Input Streams

1. **View Callbacks:** Every View callback is converted into an RxJS stream, suffixed with `$`.
2. **Lifecycle Events:** `mount$` and `unmount$` streams represent component lifecycle events.
3. **External Properties:** `props$` provides external property changes.
4. **Injected Services:** Services and their states are injected via the DI container.

### Output Streams

1. **View State: Simple Values, Tuples, and `passInput`**
    - **Simple Values:** If a View property is constant, it can be directly provided as a value.

        ```typescript
        export function createSimpleController(): Controller<Props, ViewProps> {
          return () => {
            return {
              viewState: {
                constantValue: 42
              },
            };
          };
        }
        ```

    - **Tuples (`[val$, 0]`):** Tuples consist of an observable stream for updating the View property and an initial value.

        ```typescript
        export function createTupleController(): Controller<Props, ViewProps> {
          const value$ = of(100);

          return () => {
            return {
              viewState: {
                value: [value$, 0],
              },
            };
          };
        }
        ```

    - **`passInput`:** The `passInput` function directly maps external properties to the View state.

        ```typescript
        export type Props = {
          readonly className?: string;
        };

        export interface ViewProps {
          readonly className?: string;
        }

        export function createMyComponentController(): Controller<Props, ViewProps> {
          return ({ props$ }) => {
            return {
              viewState: {
                className: passInput('className')
              },
            };
          };
        }
        ```

2. **External Events:** The `externalEvents` object defines streams that trigger external callback functions.

3. **Side Effects:** The `effects` array defines streams that cause side effects, like HTTP requests.

In the next section, you'll learn how to handle the React `children` property effectively.
