---
sidebar_label: Smart Components
sidebar_position: 4
---
# Smart components
Smart Componet based on Contorller and View.
They are conected together with help of `connect` function that returns the new React component (HOC).
To create the new component should use CLI command.
```bash
npx jb create component <name>
```
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
Controller could be imagine like state machine. It has the inputs strems and output streams. Internally it creates the composition of RxJS streams. The goal is composing the output streams based on input streams.

![Controller State Machine](/img/controller-state-machine.png)

The example:
```typescript
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

Controller should create next output streams:
 - Streams that provide values for View value properties - `viewState` property.
 - Streams that fire events for every external(HOC component) callbacks - `externalEvents` property.
 - Streams that introduce side effects perofmed by Component - `effects` property.
`viewState`, `externalEvents` and `effects` are the property of object that should be created by Controller factory function.

### Composing View state
`viewState` contains the object. It should contains the definition of the stream composition for every value in the `ViewProps`. If any of thease streams are changed that push new state to the View. In the example aboove the `val$` variable contains the stream for the correspondent `val` propery in the `ViewProps`. To bind the `val$` to `val` should also provide initial value. As result stream and value are combined to the tupple `[val$, 0]` and set to the correspondent property `val`.

### Input Streams

#### View callbacks
#### Component life cycle events
#### External properties

### Inject dependencies

### External(HOC) events

### Effects

### Memorization
### Static values
### Passthrow props
### React children
