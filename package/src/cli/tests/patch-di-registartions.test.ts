import { describe, expect, it } from "vitest";
import {
  patchControllerDIRegistration,
  patchServiceDIRegistration,
} from "../patch-di-registartions";

describe("patch-di-registrations", () => {
  it("should patch component controller DI registrations", async () => {
    const src = `
import { type Module } from "jet-blaze/di";

export const mainModule: Module = (_container) => {
    _container.register(myTestComponentKey1, (_c) => createMyTestComponent1()); 
    _container.register(myTestComponentKey2, (_c) => createMyTestComponent2()); 
};
`;
    const result = await patchControllerDIRegistration({
      code: src,
      targetComponentFilePath: "targetComponentFilePath",
      targetComponentKeyFilePath: "targetComponentKeyFilePath",
      componentNameCamelCase: "myTestComponent",
      pascalCaseComponentName: "MyTestComponent",
    });

    expect(result.trim()).toBe(
      `
import { type Module } from "jet-blaze/di";
import { myTestComponentControllerKey } from "targetComponentKeyFilePath"; 
import { createMyTestComponentController } from "targetComponentFilePath"; 

export const mainModule: Module = _container => {
  _container.register(myTestComponentKey1, _c => createMyTestComponent1());
  _container.register(myTestComponentKey2, _c => createMyTestComponent2());
  _container.register(myTestComponentControllerKey, _c => createMyTestComponentController()); 
};`.trim(),
    );
  });

  it("should patch component controller DI registrations if module is empty", async () => {
    const src = `
import { type Module } from "jet-blaze/di";

export const mainModule: Module = (_container) => {};
`;
    const result = await patchControllerDIRegistration({
      code: src,
      targetComponentFilePath: "targetComponentFilePath",
      targetComponentKeyFilePath: "targetComponentKeyFilePath",
      componentNameCamelCase: "myTestComponent",
      pascalCaseComponentName: "MyTestComponent",
    });

    expect(result.trim()).toBe(
      `
import { type Module } from "jet-blaze/di";
import { myTestComponentControllerKey } from "targetComponentKeyFilePath"; 
import { createMyTestComponentController } from "targetComponentFilePath"; 

export const mainModule: Module = _container => {
  _container.register(myTestComponentControllerKey, _c => createMyTestComponentController()); 
};`.trim(),
    );
  });

  it("should patch service DI registrations if module is empty", async () => {
    const src = `
import { type Module } from "jet-blaze/di";

export const mainModule: Module = (_container) => {};
`;
    const result = await patchServiceDIRegistration({
      code: src,
      targetServiceFilePath: "../components/todo/todo-state/todo-state",
      serviceNameCamelCase: "todoState",
      pascalCaseServiceName: "TodoState",
    });

    expect(result.trim()).toBe(
      `
import { type Module, key } from "jet-blaze/di";
import { createTodoStateService, type TodoStateService } from "../components/todo/todo-state/todo-state"; 

const todoStateServiceKey = key<TodoStateService>("TodoStateService"); 

export const mainModule: Module = _container => {
  _container.register(todoStateServiceKey, _c => createTodoStateService()); 
};`.trim(),
    );
  });
});
