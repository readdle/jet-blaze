import { setUp, type SetupResult } from "jet-blaze/connector";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTodoItemsController, type Props } from "./TodoItems";
import { FilterType, type ViewProps } from "./TodoItemsView";
import { BehaviorSubject } from "rxjs";
import type { Item } from "../todo-state/todo-state.ts";

describe("TodoItems Component", () => {
  let setup: SetupResult<Props, ViewProps>;
  const removeMock = vi.fn();
  const addTodoMock = vi.fn();
  const toggleMock = vi.fn();
  const removeCompletedMock = vi.fn();
  const toggleAllMock = vi.fn();
  const items$ = new BehaviorSubject<readonly Item[]>([]);

  beforeEach((): void => {
    vi.clearAllMocks();

    const initialProps: Props = {};
    setup = setUp(
      createTodoItemsController({
        items$: items$.asObservable(),
        remove: removeMock,
        addTodo: addTodoMock,
        toggle: toggleMock,
        removeCompleted: removeCompletedMock,
        toggleAll: toggleAllMock,
      }),
      initialProps,
    );

    setup.mount();
  });

  afterEach(() => {
    setup.dispose();
  });

  it("task list is empty on mount", () => {
    expect(setup.out.listItems).toEqual([]);
  });

  it("filter type is 'All' on mount", () => {
    expect(setup.out.filterType).toEqual(FilterType.All);
  });

  it("filter type is 'Active' after filter changed to 'Active'", () => {
    setup.in.onFilterChanged$.next(FilterType.Active);
    expect(setup.out.filterType).toEqual(FilterType.Active);
  });

  it("filter type is 'Completed' after filter changed to 'Completed'", () => {
    setup.in.onFilterChanged$.next(FilterType.Completed);
    expect(setup.out.filterType).toEqual(FilterType.Completed);
  });

  it("filter type is 'All' after filter changed to 'All'", () => {
    setup.in.onFilterChanged$.next(FilterType.All);
    expect(setup.out.filterType).toEqual(FilterType.All);
  });

  it("listItems updated based on date items", () => {
    const items = [
      { id: "1", name: "item1", completed: false },
      { id: "2", name: "item2", completed: true },
    ];

    items$.next(items);

    expect(setup.out.listItems).toEqual([
      { id: "1", text: "item1", completed: false },
      { id: "2", text: "item2", completed: true },
    ]);
  });

  it("listItems filtered by Active filter", () => {
    const items = [
      { id: "1", name: "item1", completed: false },
      { id: "2", name: "item2", completed: true },
    ];
    items$.next(items);

    setup.in.onFilterChanged$.next(FilterType.Active);

    expect(setup.out.listItems).toEqual([
      { id: "1", text: "item1", completed: false },
    ]);
  });

  it("listItems filtered by Completed filter", () => {
    const items = [
      { id: "1", name: "item1", completed: false },
      { id: "2", name: "item2", completed: true },
    ];
    items$.next(items);

    setup.in.onFilterChanged$.next(FilterType.Completed);

    expect(setup.out.listItems).toEqual([
      { id: "2", text: "item2", completed: true },
    ]);
  });

  it("remove effect is executed when remove button is clicked", () => {
    const items = [
      { id: "1", name: "item1", completed: false },
      { id: "2", name: "item2", completed: true },
    ];
    items$.next(items);

    setup.in.onItemRemove$.next("1");

    expect(removeMock).toHaveBeenCalledWith("1");
  });

  it("toggle effect is executed when item is clicked", () => {
    const items = [
      { id: "1", name: "item1", completed: false },
      { id: "2", name: "item2", completed: true },
    ];
    items$.next(items);

    setup.in.onItemToggle$.next("1");

    expect(toggleMock).toHaveBeenCalledWith("1");
  });

  it("toggleAll effect is executed when toggle all button is clicked", () => {
    const items = [
      { id: "1", name: "item1", completed: false },
      { id: "2", name: "item2", completed: true },
    ];
    items$.next(items);

    setup.in.onToggleAllClick$.next();

    expect(toggleAllMock).toHaveBeenCalledWith(true);
  });

  it("removeCompleted effect is executed when remove completed button is clicked", () => {
    setup.in.onRemoveCompletedClick$.next();

    expect(removeCompletedMock).toHaveBeenCalled();
  });
});
