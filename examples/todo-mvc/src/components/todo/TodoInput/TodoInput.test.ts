import { setUp, type SetupResult } from "jet-blaze/connector";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTodoInputController, type Props } from "./TodoInput";
import type { ViewProps } from "./TodoInputView";

describe("TodoInput Component", () => {
  let setup: SetupResult<Props, ViewProps>;
  const addTodoMock = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();

    const initialProps: Props = {};
    setup = setUp(
      createTodoInputController({
        addTodo: addTodoMock,
      }),
      initialProps,
    );
    setup.mount();
  });

  afterEach(() => {
    setup.dispose();
  });

  it("init 'name' on mount", () => {
    expect(setup.out.name).toBe("");
  });

  it("skip adding todo with empty 'name'", () => {
    setup.in.onAddButtonClick$.next();
    expect(addTodoMock).toHaveBeenCalledTimes(0);
  });

  it("add todo by button click", () => {
    setup.in.onChange$.next("new todo");
    setup.in.onAddButtonClick$.next();
    expect(addTodoMock).toHaveBeenCalledTimes(1);
    expect(addTodoMock).toHaveBeenCalledWith("new todo");
  });

  it("add todo by pressing ENTER key", () => {
    setup.in.onChange$.next("new todo");
    setup.in.onKeyDownEnter$.next();
    expect(addTodoMock).toHaveBeenCalledTimes(1);
    expect(addTodoMock).toHaveBeenCalledWith("new todo");
  });

  it("clear text after adding todo", async () => {
    setup.in.onChange$.next("new todo");
    setup.in.onAddButtonClick$.next();
    await vi.advanceTimersToNextTimerAsync();
    expect(setup.out.name).toBe("");
  });
});
