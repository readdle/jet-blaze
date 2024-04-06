import { setUp, type SetupResult } from "jet-blaze/connector";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createTodoInputController, type Props } from "./TodoInput";
import type { ViewProps } from "./TodoInputView";

describe("TodoInput Component", () => {
  let setup: SetupResult<Props, ViewProps>;
  beforeEach(() => {
    const initialProps: Props = {};
    setup = setUp(createTodoInputController(), initialProps);
    setup.mount();
  });

  afterEach(() => {
    setup.dispose();
  });

  it("renders", () => {
    expect(setup.out.name).toBe("TodoInput");
  });
});
