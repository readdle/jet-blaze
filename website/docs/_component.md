---
sidebar_label: Smart Components
sidebar_position: false
---
# Smart components
Smart Componet based on Contorller and View. And implemente Model-View-Controller pattern. The Controller is the state machine that defines the streams composition based on the input streams. The View is the React component that renders the state of the Controller and fires the events to the Controller.

They are conected together with help of `connect` function that returns the new React component (HOC).

To create the new component should use CLI command.
```bash
npx jb create component <name>
```
It creates the new folder with the name of the component and the corresponding files for the Controller,View, Tests and key for the DI container.

## View
The View is stateless functional React component. 
View should be simple and doesn't contain any logic. It is important from the testing perspective. The logic should be pushed to the Controller to be able easy create Unit Tests for it.

:::tip
To follow that principles View define self properties types based on view data requirenments. View should not have the dependencies from Controller module or sevice modules or any data layer types. 
For example if need to redner text label that contains current data and time you should pass it to the View as a string property and delegate to the controller the formating logic that convert `Date` object to the string. 
:::

To inform the Contorller about user iteractions the View define callback functions. The callback is function with set of arguments and **should not return** result. 

View example:
```typescript
export interface ViewProps {
  readonly val: number;

  readonly onIncrementClick: () => void;
  readonly onDecrementClick: () => void;
}

export const InputCounterView: React.FC<ViewProps> = (props) => {
  return (
    <>
      <div className="input-container">
        <input type="text" value={props.val} readOnly />
      </div>
      <div className="button-container">
        <button onClick={() => props.onIncrementClick()}>Increment</button>
        <button onClick={() => props.onDecrementClick()}>Decrement</button>
      </div>
    </>
  );
};
```
## Controller
Controller could be imagine like a state machine. It has the inputs strems and output streams. Internally it creates the composition of RxJS streams. The goal is composing the output streams based on input streams.

![Controller State Machine](/img/controller-state-machine.png)

On the code level Controller is the factory function that returns the object with the set of streams. The object should contain the following properties:
 - `viewState` - the object that contains the streams that provide values for the View properties.
 - `externalEvents` - the object that contains the streams that fire events for every external(HOC component) callbacks.
 - `effects` - the array that contains the streams that introduce side effects perofmed by Component.

The function get the set of input streams as the argument. The input streams are the RxJS streams that are pushed by the connector when the View callback is called, the component is mounted or unmounted or the external properties are changed.

The example:
```typescript
export type Props = {
    readonly initialValue: number;
    readonly onChange: (val: number) => void;
};

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
      externalEvents: {
        onChange: val$
      }
    };
  };
}

export const InputCounter = connect(InputCounterView, inputCounterControllerKey);
```
### Input Streams
Before starting to talk about the output streams should define the input streams.
There are four groups of input streams:
 - View callbacks
 - Component life cycle events
 - External(HOC) properties
 - Services that inject to the Controller and their reactive states

 First three groups are the input streams that are provided by the connector. The last group (Services) are injected to the Controller and should be provided by the DI container at the composition root.

#### View callbacks
Every View callback is converted to the correspondent RxJS stream by the connector.
The name of the stream will be the same as the callback name with `$` suffix.
The connector will listen to the View callback and push the value to the correspondent stream.
The factory fuction get the set of input streams as the argument. 

Example:
```typescript
// View module
export interface ViewProps {
  readonly onIncrementClick: () => void;
  readonly onDecrementClick: () => void;
}

// Controller module
export function createInputCounterController(): Controller<Props, ViewProps> {
  return ({ onDecrementClick$, onIncrementClick$ }) => {
    // Controller logic
  };
}
```
Here `onDecrementClick$` and `onIncrementClick$` are the input streams that will be pushed by the connector when the correspondent callback is called.

If callback has an argument it be provided as a value of stream event. For example:
```typescript
// View module
export interface ViewProps {
  readonly onValueChange: (val: number) => void;
}
// Controller module
export function createInputCounterController(): Controller<Props, ViewProps> {
  return ({ onValueChange$ }) => {
    // Controller logic
    const effect$ = onValueChange$.pipe(
      tap(val => console.log(val))
    );
    return {
      effects: [ effect$ ]
    };
  };
}
```
Here `onValueChange$` is the input stream that will be pushed by the connector when the `onValueChange` callback is called. The value of the stream event will be the value of the `val` argument of the callback. Also there is effect stream that will be subscribed by the connector. The effect stream will log the value of the `val` argument of the `onValueChange` callback.

If the callback has more than one argument they will be provided as a tuple.
Example:
```typescript
// View module
export interface ViewProps {
  readonly onValueChange: (val: number, name: string) => void;
}
// Controller module
export function createInputCounterController(): Controller<Props, ViewProps> {
  return ({ onValueChange$ }) => {
    // Controller logic
    const effect$ = onValueChange$.pipe(
      tap(([val, name]) => console.log(val, name))
    );
    return {
      effects: [ effect$ ]
    };
  };
}
```
#### Component life cycle events
The component life cycle events are represented as the input streams. The name of the stream will be the same as the life cycle event name with `$` suffix.
There are two life cycle events:
 - `mount$` - the stream that will be pushed by the connector when the component is mounted and the stream composition should be started.
 - `unmount$` - the stream that will be pushed by the connector when the component is unmounted and before the stream composition should be stopped.

Example:
```typescript
// Controller module
export function createInputCounterController(): Controller<Props, ViewProps> {
  return ({ mount$, unmount$ }) => {
    // Controller logic
    const mountEffect$ = mount$.pipe(
      tap(() => console.log('Component mounted'))
    );
    const unmountEffect$ = unmount$.pipe(
      tap(() => console.log('Component unmounted'))
    );
    return {
      effects: [ mountEffect$, unmountEffect$ ]
    };
  };
}
```
#### External properties
The external properties are the properties that are defined by the HOC component. The external properties are represented as the `props$` input stream. The stream will be pushed by the connector when the external properties are changed.

Example:
```typescript
// Controller module
export type Props = {
  readonly val: number;
};

export function createInputCounterController(): Controller<Props, ViewProps> {
  return ({ props$ }) => {
    // Controller logic
    const effect$ = props$.pipe(
      map(props => props.val),
      distinctUntilChanged()
      tap(val => console.log(val))
    );
    return {
      effects: [ effect$ ]
    };
  };
}
```
Here `props$` is the input stream that will be pushed by the connector when the `val` property is changed. The value of the stream event will be the object with the `val` property. The effect stream will log the value of the `val` property if it is changed.

#### External services
The external services are the services that are injected to the Controller. It is passed as an arguments to the Controller constructor function. Which concrete services should be injected to the Controller should be defined in the DI container.

Example:
```typescript
// Service module
export interface Service {
  readonly state$: Observable<{val: number}>;
  readonly increment: () => void;
}
// Controller module
export function createInputCounterController(service: Service): Controller<Props, ViewProps> {
  return ({ mount$, onIncrementClick$ }) => {
    const val$ = service.state$.pipe(
      map(({ val }) => val)
    );
    const effect$ = onIncrementClick$.pipe(
      tap(() => service.increment())
    );
    return {
      viewState: {
        val: [val$, 0]
      },
      effects: [ effect$ ]
    };
  };
}
```
Here `service` is the external service that is injected to the Controller. The `state$` property of the service is the input stream that will be pushed by the service when the state is changed. The value of the stream event will be the object with the `val` property. 

The effect stream will call the `increment` method of the service when the `onIncrementClick` callback is called.

### Output Streams
Controller creates the composition of the output streams based on the input streams. The output streams are the streams that provide the values for the View properties, fire the events for the external(HOC) callbacks and introduce the side effects.

#### View state
The `viewState` property of the Controller result object contains the object that defines the streams that provide the values for the View properties. The object should contain the definition of the stream composition for every value in the `ViewProps`. If any of thease streams are changed that push new state to the View.

:::tip
To handle the complexity is much better to split the streams composition to the parts that are responsible for the correspondent View property. And think about it as an independent state machine that provides the value for the View property.
:::

`viewState` property requires the value that is ussualy a tuple with two elements:
 - The first element is the RxJS stream that provides the value for the View property.
 - The second element is the initial value for the View property. It is used to initialize the View property before the stream emits the first value.

 Example:
 ```typescript
// View module
export interface ViewProps {
  readonly val: number;
  readonly name: string;
}
// Controller module
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

    const name$ = of('John').pipe(
      delay(1000)
    );

    return {
      viewState: {
        val: [val$, 0],
        name: [name$, '<empty>']
      },
    };
  };
 ```
Here `val$` is the stream that provides the value for the `val` property of the View.The initial value of the stream is `0`. Also `name$` is the stream that provides the value for the `name` property of the View. The initial value of the stream is `'<empty>'`. The `name$` stream emits the value `'John'` after 1 second.

##### Static values
If the value of the View property is static and will never changed it should be provided as a simple constant value.

Example:
```typescript
// View module
export interface ViewProps {
  readonly name: string;
}
// Controller module
export function createMyComponentController(): Controller<Props, ViewProps> {
  return () => {
    // Controller logic
    return {
      viewState: {
        name: 'John'
      },
    };
  };
}
```
##### Passthrow HOC props
Sometimes the value of the View property should be the same as the external(HOC) property. In this case the value should be provided with help of `passInput` function. The `passInput` function get the single argument that is the name of the external(HOC) property. The type of the external(HOC) property should be the same as the type of the View property.

Example:
```typescript
// View module
export interface ViewProps {
  readonly className?: string;
}
// Controller module
export type Props = {
  readonly className?: string;
};

export function createMyComponentController(): Controller<Props, ViewProps> {
  return ({ props$ }) => {
    // Controller logic
    return {
      viewState: {
        className: passInput('className')
      },
    };
  };
}
```
##### Pass React children property
`passInput` function could be used to pass the React children property. The children property is the special property that contains the children of the component. The children property should be passed to the View as the `children` property.
Example:
```typescript
// View module
export interface ViewProps {
  readonly children: React.ReactNode;
}
// Controller module
export type Props = {
  readonly children: React.ReactNode;
};
export function createMyComponentController(): Controller<Props, ViewProps> {
  return () => {
    // Controller logic
    return {
      viewState: {
        children: passInput('children')
      },
    };
  };
}
```
#### External(HOC) events
The `externalEvents` property of the Controller result object contains the object that defines the streams that fire events for the external(HOC) callbacks. The object should contain the definition of the stream composition for every callback in the `Props` type. The property is optional and could be omitted if the component doesn't have any external(HOC) callbacks.

Every time the stream emits the value the connector will call the correspondent callback with the value as an argument.
Example:
```typescript
// View module
export interface ViewProps {
  readonly val: number;
  readonly onIncrementClick: () => void;
  readonly onDecrementClick: () => void;
}
// Controller module
export type Props = {
  readonly onChange: (val: number) => void;
};

export function createInputCounterController(): Controller<Props, ViewProps> {
  return ({ onDecrementClick$, onIncrementClick$, mount$ }) => {
    const val$ = merge(
      onDecrementClick$.pipe(map(() => -1)),
      onIncrementClick$.pipe(map(() => 1)),
      mount$.pipe(map(() => 0)),
    ).pipe(
      scan((acc, x) => (x === 0 ? 0 : acc + x), 0),
      distinctUntilChanged(),
      share(),
    );

    return {
      viewState: {
        val: [val$, 0],
      },
      externalEvents: {
        onChange: val$
      }
    };
  };
}
```
Here `onChange` is the external(HOC) callback that will be called by the connector when the `val$` stream emits the value and it is changed.
#### Effects
The `effects` property of the Controller result object contains the array that defines the streams that introduce side effects. The array should contain the definition of the stream composition for every side effect that should be performed by the component. The property is optional and could be omitted if the component doesn't have any side effects.

Side effects is used to perform the operations that are not related to the View rendering or the external(HOC) callbacks. The side effects could be used to perform the operations like:
 - HTTP requests
 - Service calls
 - etc.

Example:
```typescript
// Controller module
interface FooService {
  readonly someUpdatesOnIncrement: (val: number) => void;
}
export function createInputCounterController(fooService: FooService): Controller<Props, ViewProps> {
  return ({ onIncrementClick$ }) => {
    const val$ = of(0); // some logic here to calculate the value
    const effect$ = onIncrementClick$.pipe(
      withLatestFrom(val$),
      tap(([ ,val]) => fooService.someUpdatesOnIncrement(val))
    );
    return {
      effects: [ effect$ ]
    };
  };
}
```
Here `fooService` is the external service that is injected to the Controller. The `someUpdatesOnIncrement` method of the service is called when the `onIncrementClick` callback is called.

:::warning[Don't use subscribe in the Controller]
The Controller should not use the `subscribe` method. The Controller should return the streams that will be subscribed by the connector. The Controller should not have any side effects. The side effects should be implemented in the `effects` property of the Controller object as a regular RxJS streams.
 - This guarantees that the Controller is pure and can be easily tested.
 - Also this guarabtees that there are no race conditions between the streams.
:::

### Testing
The Controller is the pure function that returns the object with the set of streams. The Controller should not have any side effects. The side effects should be implemented in the `effects` property of the Controller object. 
This allows to easily test the Controller. The Controller could be tested by providing the set of input streams and checking the output streams.
The Jet Blaze provides the `setUp` function that is used to test the Controller. 
The `setUp` function get the Controller factory function and the initial HOC props as arguments. The function returns the object with the set of streams that could be used to check the output streams. 
 - it provides the `mount` and `dispose` methods that should be called to start and stop the streams composition. 
 - it provides the `in` object that contains the set of input streams that should be pushed to the Controller.
 - it provides the `out` object that contains the set of output streams that could be checked.

The last one is the `BehaviorSubject` that allows just check the last value of the stream with the `val` property.

Example:
```typescript
import { setUp, type SetupResult } from "jet-blaze/connector";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createInputCounterController, type Props } from "./InputCounter.ts";
import type { ViewProps } from "./InputCounterView.tsx";

describe("InputCounter Component", () => {
  let setup: SetupResult<Props, ViewProps>;
  beforeEach(() => {
    const initialProps: Props = {};
    setup = setUp(createInputCounterController(), initialProps);
    setup.mount();
  });

  afterEach(() => {
    setup.dispose();
  });

  it("onMount the val shoul be 0", () => {
    expect(setup.out.val).toBe(0);
  });

  it("onIncrementClick should add 1 to the val", () => {
    setup.in.onIncrementClick$.next();
    expect(setup.out.val).toBe(1);
  });

  it("onDecrementClick shiould descrease the val by 1", () => {
    setup.in.onDecrementClick$.next();
    expect(setup.out.val).toBe(-1);
  });

  it("onIncrementClick and then onDecrementClick should not change the value", () => {
    setup.in.onIncrementClick$.next();
    setup.in.onDecrementClick$.next();
    expect(setup.out.val).toBe(0);
  });
});
```


## Memorization
The connector provides the memorization mechanism that allows to memorize the internal View as well as the external(HOC) properties. The memorization is used to prevent the unnecessary rendering of the View and the unnecessary updates inside the streams composition. The memorization is implemented with the help of the React `memo` function with the shallow comparison of the props.

By default both layers of the memorization are enabled. It could be changed by providing the `renderStrategy` argument to the `connect` function. It is the enum with the following values:
 - `RenderStrategy.MemoizedInner` - the memorization of the internal View properties is enabled and the memorization of the external(HOC) properties is disabled.
 - `RenderStrategy.MemoizedOuter` - the memorization of the internal View properties is disabled and the memorization of the external(HOC) properties is enabled.
 - `RenderStrategy.None` - the memorization of the internal View properties is disabled and the memorization of the external(HOC) properties is disabled.
 - `RenderStrategy.Memoized` - the memorization of the internal View properties is enabled and the memorization of the external(HOC) properties is enabled. It is the default value.
