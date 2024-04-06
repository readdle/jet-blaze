import { setUp, type SetupResult } from "jet-blaze/connector";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createTodoItemsController, type Props } from "./TodoItems";
import type { ViewProps } from "./TodoItemsView";

describe("TodoItems Component", () => {
    let setup: SetupResult<Props, ViewProps>;
    beforeEach(() => {
        const initialProps: Props = {};
        setup = setUp(createTodoItemsController(), initialProps);
        setup.mount();
    });

    afterEach(() => {
        setup.dispose();
    });

    it("renders", () => {
        expect(setup.out.val).toBe("TodoItems");
    });
});
