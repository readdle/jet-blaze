import { ContainerBuilder, type Resolve } from "jet-blaze/di";
import { mainModule } from "./main-module";

export const createContainer = (): Resolve => {
  const builder = new ContainerBuilder();

  builder.registerModule(mainModule);

  return builder.build();
};
