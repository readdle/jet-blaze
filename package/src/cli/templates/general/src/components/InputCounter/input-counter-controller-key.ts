import type { Controller } from "jet-blaze/connector";
import { key } from "jet-blaze/di";
import type { Props } from "./InputCounter.ts";
import type { ViewProps } from "./InputCounterView.tsx";

export const inputCounterControllerKey = key<Controller<Props, ViewProps>>(
  "InputCounterController",
);
