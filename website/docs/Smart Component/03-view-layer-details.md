---
sidebar_label: View Layer
sidebar_position: 3
---
# View Layer Details

The View layer is a stateless functional React component that handles user interactions and displays data received from the Controller.

## Principles of the View Layer

- **Stateless:** The View does not hold any internal state or logic. It simply renders data and passes user events back to the Controller.
- **Callback Functions:** Define callback functions in the View that will notify the Controller of user interactions. These functions **should not return any values**.

### Example View Component

```typescript
export interface ViewProps {
  readonly value: number;
  readonly onIncrement: () => void;
  readonly onDecrement: () => void;
}

export const CounterView: React.FC<ViewProps> = (props) => {
  return (
    <>
      <div>
        <span>{props.value}</span>
      </div>
      <div>
        <button onClick={props.onIncrement}>Increment</button>
        <button onClick={props.onDecrement}>Decrement</button>
      </div>
    </>
  );
};
```

:::tip[Tips for Designing the View]
 - **Maintain Separation of Concerns**: Avoid including business logic in the View. Let the Controller handle the data processing.
 - **Clear Interfaces**: Clearly define the data and event types passed between the Controller and View.
:::
In the next section, learn about setting up the Controller for your Smart Component.