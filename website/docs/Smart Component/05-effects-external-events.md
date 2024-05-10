---
sidebar_label: Effects & External Events
sidebar_position: 5
---
# Effects & External Events

Managing effects and external events in your Smart Components ensures seamless data flow and application logic.

## Effects

Effects allow you to perform operations outside of the View or state management scope. They include side effects like HTTP requests and service calls.

### Example Effect Stream

```typescript
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
### Key Guidelines:

 - **Purity**: Implement effects as pure functions. Avoid calling subscribe directly.
 - **Subscription Management**: The framework handles subscriptions, ensuring effects run efficiently.

## External Events

External events are triggered by the Controller to notify external (HOC) callbacks of significant changes.

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

External events ensure that external callbacks receive appropriate updates and act accordingly.

In the final section, you'll find guidance on testing Smart Components using Jet-Blaze's built-in functions.