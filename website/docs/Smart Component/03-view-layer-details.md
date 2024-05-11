---
sidebar_label: View Layer
sidebar_position: 3
---
# View Layer Details

The View layer in the Jet-Blaze framework consists of stateless functional React components that handle user interactions and display data received from the Controller. This layer is designed to be simple, focusing solely on rendering UI elements and passing user events back to the Controller.

## Principles of the View Layer

- **Stateless:** The View does not hold any internal state or logic, ensuring that all data and event management is handled by the Controller.
- **Callback Functions:** Define callback functions in the View that will notify the Controller of user interactions. These functions **should not return any values** and are purely for event notification.

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
            <button onClick={() => props.onIncrement()}>Increment</button>
            <button onClick={() => props.onDecrement()}>Decrement</button>
          </div>
        </>
      );
    };
    ```

:::tip[Tips for Designing the View]
- **Maintain Separation of Concerns:** Avoid including business logic in the View. Let the Controller handle the data processing.
- **Clear Interfaces:** Clearly define the data and event types passed between the Controller and View to maintain clean and manageable code.
:::

In the next section, you'll learn about setting up the Controller for your Smart Component.
