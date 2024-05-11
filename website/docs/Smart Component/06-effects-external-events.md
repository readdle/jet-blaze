---
sidebar_label: Effects & External Events
sidebar_position: 6
---
# Effects & External Events

Managing effects and external events in your Smart Components ensures seamless data flow and application logic. This section outlines how to effectively manage these aspects using the Jet-Blaze framework.

## Effects

Effects are used to perform operations outside the immediate scope of the View or state management, such as making HTTP requests or interfacing with external services.

### Example Effect Stream

    ```typescript
    import { tap } from 'rxjs/operators';

    export function createEffectController(service: SomeService): Controller<Props, ViewProps> {
      return ({ onAction$ }) => {
        const effect$ = onAction$.pipe(
          tap(() => service.someServiceCall())
        );

        return {
          effects: [effect$]
        };
      };
    }
    ```

### Key Guidelines

- **Purity:** Implement effects as pure functions. Avoid calling subscribe directly in the Controller; let the framework handle subscriptions.
- **Subscription Management:** The framework ensures that subscriptions are managed efficiently, avoiding memory leaks and unnecessary computations.

## External Events

External events are how the Controller communicates significant changes or needs to trigger actions outside of its scope.

### Example External Event

    ```typescript
    export type Props = {
      readonly onNotify: (val: string) => void;
    };

    export function createEventController(): Controller<Props, ViewProps> {
      return ({ onAction$ }) => {
        const event$ = onAction$.pipe(
          map((val) => `Event with value ${val}`)
        );

        return {
          externalEvents: {
            onNotify: event$
          }
        };
      };
    }
    ```

This setup ensures that external callbacks are called appropriately, keeping external systems in sync with the state of your application.

:::tip[Tips for Managing Effects and External Events]
- **Effect Isolation:** Isolate side effects in specific streams to maintain a clean and predictable flow of data and actions.
:::

With these practices in place, your Smart Components will be robust and capable of handling complex interactions and changes in state effectively.
