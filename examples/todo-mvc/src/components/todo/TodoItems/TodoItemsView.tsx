import React from "react";

export interface ViewProps {
  readonly listItems: readonly ListItem[];
  readonly onItemToggle: (id: string) => void;
  readonly onItemRemove: (id: string) => void;
}

export type ListItem = {
  readonly id: string;
  readonly text: string;
  readonly completed: boolean;
};

export const TodoItemsView: React.FC<ViewProps> = (props) => {
  return (
    <div className={"todo-items-container"}>
      <ul>
        {props.listItems.map((item) => (
          <li key={item.id}>
            <input
              type="checkbox"
              checked={item.completed}
              onChange={() => props.onItemToggle(item.id)}
            />
            <span>{item.text}</span>
            <button onClick={() => props.onItemRemove(item.id)}>X</button>
          </li>
        ))}
      </ul>
    </div>
  );
};
