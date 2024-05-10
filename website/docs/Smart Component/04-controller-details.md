---
sidebar_label: Controller Layer
sidebar_position: 4
---
# Controller Layer Details

The Controller layer manages application logic using a streams-based architecture via RxJS. It acts as a state machine, organizing input streams (e.g., user interactions, external events) into output streams that update the View.

## Key Principles of the Controller Layer

- **Input Streams:** Streams generated from View callbacks, component lifecycle events, external properties, and injected services.
- **Output Streams:** Streams feeding View properties, triggering external events, or introducing side effects.

### Example Controller

```typescript
import { merge, map, scan, share } from 'rxjs';
import { Controller, passInput } from 'jet-blaze';

export type Props = {
  readonly initialValue: number;
  readonly onChange: (val: number) => void;
};

export function createCounterController(): Controller<Props, ViewProps> {
  return ({ onIncrement$, onDecrement$, mount$ }) => {
    const value$ = merge(
      onIncrement$.pipe(map(() => +1)),
      onDecrement$.pipe(map(() => -1)),
      mount$.pipe(map(() => 0))
    ).pipe(
      scan((acc, x) => acc + x, 0),
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
### Input Streams
1. **View Callbacks**: Every View callback is converted into an RxJS stream, suffixed with $.
2. **Lifecycle Events**: mount$ and unmount$ streams represent component lifecycle events.
3. **External Properties**: props$ provides external property changes.
4. **Injected Services**: Services and their states are injected via the DI container.
### Output Streams
1. **View State**: The viewState object defines streams that directly set View properties.
2. **External Events**: The externalEvents object defines streams that trigger external callback functions.
3. **Side Effects**: The effects array defines streams that cause side effects, like HTTP requests.

In the next section, you'll learn how to manage side effects and external events effectively.