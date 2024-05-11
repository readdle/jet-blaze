---
sidebar_label: Managing React Children
sidebar_position: 5
---
# Managing React Children

To manage the React `children` property effectively within Jet-Blaze, ensure that both the View and Controller components handle it appropriately.

## Example Implementation of `children` Prop

### View Component

    ```typescript
    export interface ViewProps {
      readonly children: React.ReactNode;
    }

    // View Component handling children
    export const MyComponentView: React.FC<ViewProps> = ({ children }) => (
      <div>{children}</div>
    );
    ```

### Controller Component

    ```typescript
    export type Props = {
      readonly children: React.ReactNode;
    };

    export function createMyComponentController(): Controller<Props, ViewProps> {
      return () => {
        return {
          viewState: {
            children: passInput('children'),
          },
        };
      };
    }
    ```
In the next section, you'll learn about handling effects and external events effectively.