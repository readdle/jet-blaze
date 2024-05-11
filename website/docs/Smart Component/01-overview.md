---
sidebar_label: Overview
sidebar_position: 1
---
# Smart Components Overview

Smart Components in the Jet-Blaze framework utilize the Model-View-Controller (MVC) pattern to organize the application architecture effectively. A Smart Component combines a Controller (responsible for managing state and logic) and a View (a stateless functional React component that renders the UI).

The Controller is the core of the Smart Component, functioning as a state machine that defines the composition of input streams and produces output streams. The View displays the state provided by the Controller and triggers events for processing. Both elements are connected using the `connect` function, which creates a Higher-Order Component (HOC) that integrates the Controller and View, resulting in a unified, reusable component.

**Key Highlights:**

- **CLI Tooling:** The CLI generates a Smart Component's folder structure, including Controller, View, DI container key, and unit test setup.
- **MVC Pattern:** Controllers manage application logic and provide data to Views via clearly defined interfaces.
- **Streams-Based Architecture:** Controllers manage RxJS streams to ensure a clean data flow between components.

In subsequent sections, you'll find guides on creating Smart Components, configuring their View and Controller, managing side effects, and testing them effectively.
