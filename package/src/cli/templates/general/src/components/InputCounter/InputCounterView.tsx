import React from "react";

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
