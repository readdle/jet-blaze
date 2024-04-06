import React from "react";

export interface ViewProps {
  readonly listItems: readonly ListItem[];
  readonly onItemToggle: (id: string) => void;
  readonly onItemRemove: (id: string) => void;

  readonly filterType: FilterType;
  readonly onFilterChanged: (filterType: FilterType) => void;
}

export const enum FilterType {
  All,
  Active,
  Completed,
}

export type ListItem = {
  readonly id: string;
  readonly text: string;
  readonly completed: boolean;
};

const FilterButton: React.FC<{
  readonly name: string;
  readonly selected: boolean;
  readonly onClick: () => void;
}> = (props) => {
  return (
    <button
      className={props.selected ? "selected" : undefined}
      onClick={() => props.onClick()}
    >
      {props.name}
    </button>
  );
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
      <FilterButton
        name="All"
        selected={props.filterType === FilterType.All}
        onClick={() => props.onFilterChanged(FilterType.All)}
      />
      <FilterButton
        name="Active"
        selected={props.filterType === FilterType.Active}
        onClick={() => props.onFilterChanged(FilterType.Active)}
      />
      <FilterButton
        name="Completed"
        selected={props.filterType === FilterType.Completed}
        onClick={() => props.onFilterChanged(FilterType.Completed)}
      />
    </div>
  );
};
