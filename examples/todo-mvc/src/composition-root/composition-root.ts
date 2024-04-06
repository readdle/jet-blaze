import { ContainerBuilder, type Resolve } from "jet-blaze/di";
import { mainModule } from "./main-module";
import { todoModule } from "./todo-module.ts";

export const createContainer = (): Resolve => {
  const builder = new ContainerBuilder();

  builder.registerModule(mainModule);
  builder.registerModule(todoModule);

  return builder.build();
};
