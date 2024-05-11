---
sidebar_label: Testing
sidebar_position: 7
---
# Testing Smart Components

Testing Smart Components is essential for verifying their behavior and ensuring their Controllers handle inputs and outputs correctly.

## Setup for Testing

Jet-Blaze provides a `setUp` function to facilitate testing:

```typescript
import { setUp, type SetupResult } from 'jet-blaze/connector';
import { createCounterController, type Props } from './CounterController.ts';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import type { ViewProps } from './CounterView.tsx';

describe('Counter Component', () => {
  let setup: SetupResult<Props, ViewProps>;

  beforeEach(() => {
    setup = setUp(createCounterController(), { initialValue: 0 });
    setup.mount();
  });

  afterEach(() => {
    setup.dispose();
  });

  it('should initialize to the correct value', () => {
    expect(setup.out.value).toBe(0);
  });

  it('should increment correctly', () => {
    setup.in.onIncrement$.next();
    expect(setup.out.value).toBe(1);
  });

  it('should decrement correctly', () => {
    setup.in.onDecrement$.next();
    expect(setup.out.value).toBe(-1);
  });
});
```

:::tip[Effective Testing]
 - **Isolate Logic**: Keep logic modular to facilitate isolated testing of each stream and behavior.
 - **Use Setup Functions**: Take advantage of the setup functions to handle input/output validation and subscription management.
 - **Use Mocks**: Use mocks to simulate external dependencies and test the contoller effects.
:::

With the information provided across these sections, you should be able to efficiently create, manage, and test Smart Components in your Jet-Blaze projects.