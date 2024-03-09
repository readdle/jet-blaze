import { setUp, type SetupResult } from "jet-blaze/connector";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createInputCounterController, type Props } from "./InputCounter.ts";
import type { ViewProps } from "./InputCounterView.tsx";

describe("InputCounter Component", () => {
  let setup: SetupResult<Props, ViewProps>;
  beforeEach(() => {
    const initialProps: Props = {};
    setup = setUp(createInputCounterController(), initialProps);
    setup.mount();
  });

  afterEach(() => {
    setup.dispose();
  });

  it("onMount", () => {
    expect(setup.out.val).toBe(0);
  });

  it("onIncrement", () => {
    setup.in.onIncrementClick$.next();
    expect(setup.out.val).toBe(1);
  });

  it("onDecrement", () => {
    setup.in.onDecrementClick$.next();
    expect(setup.out.val).toBe(-1);
  });

  it("onIncrement and onDecrement", () => {
    setup.in.onIncrementClick$.next();
    setup.in.onDecrementClick$.next();
    expect(setup.out.val).toBe(0);
  });
});
