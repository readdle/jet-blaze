import type { Controller } from "jet-blaze/connector";
import { key } from "jet-blaze/di";
import type { Props } from "./TodoItems";
import type { ViewProps } from "./TodoItemsView";

export const todoItemsControllerKey = key<Controller<Props, ViewProps>>("TodoItemsController");