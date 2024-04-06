import type { Controller } from "jet-blaze/connector";
import { key } from "jet-blaze/di";
import type { Props } from "./TodoInput";
import type { ViewProps } from "./TodoInputView";

export const todoInputControllerKey = key<Controller<Props, ViewProps>>(
  "TodoInputController",
);
