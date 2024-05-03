import { describe, expect, it } from "vitest";
import { patchDIRegistration } from "../patch-di-registartions";

describe("patch-di-registrations", () => {
  it("should patch DI component controller DI registrations", async () => {
    const src = `
import { type Module } from "jet-blaze/di";

export const mainModule: Module = (_container) => {
    _container.register(myTestComponentKey1, (_c) => createMyTestComponent1()); 
    _container.register(myTestComponentKey2, (_c) => createMyTestComponent2()); 
};
`;
    const result = await patchDIRegistration({
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

  it("should patch DI component controller DI registrations if module is empty", async () => {
    const src = `
import { type Module } from "jet-blaze/di";

export const mainModule: Module = (_container) => {};
`;
    const result = await patchDIRegistration({
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
});
