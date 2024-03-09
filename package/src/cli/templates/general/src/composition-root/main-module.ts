import { type Module } from "jet-blaze/di";
import { inputCounterControllerKey } from "../components/InputCounter/input-counter-controller-key.ts";
import { createInputCounterController } from "../components/InputCounter/InputCounter.ts";

export const mainModule: Module = (container) => {
  container.register(inputCounterControllerKey, () =>
    createInputCounterController(),
  );
};
