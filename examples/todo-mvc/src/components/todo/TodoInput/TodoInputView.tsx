import React from "react";

export interface ViewProps {
  readonly name: string;
  readonly onChange: (val: string) => void;
  readonly onKeyDownEnter: () => void;
}

export const TodoInputView: React.FC<ViewProps> = (props) => {
  return (
    <div className={"input-container"}>
      <input
        className={"input"}
        value={props.name}
        placeholder={"What needs to be done?"}
        autoFocus={true}
        onChange={(e) => props.onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            props.onKeyDownEnter();
          }
        }}
      />
    </div>
  );
};
