---
sidebar_label: Overview
sidebar_position: 1
---
# Smart Components Overview

Smart Components in the Jet-Blaze framework are built on the principles of the Model-View-Controller (MVC) pattern. A Smart Component combines a Controller (responsible for managing state and logic) and a View (a React component that renders the UI).

The Controller is the core of the Smart Component, acting as a state machine that defines input and output stream compositions. The View displays the state of the Controller and triggers events for further processing.

A Higher-Order Component (HOC), created using the `connect` function, integrates the Controller and View, providing a unified, reusable component.

**Key Highlights:**

- **CLI Tooling:** Utilize the CLI to generate a Smart Component folder structure, including Controller, View, DI container key, and unit test setup.
- **MVC Pattern:** Controllers handle application logic and interact with the View through clearly defined interfaces.
- **Streams-Based Architecture:** Controllers manage RxJS streams, ensuring clean data flow between components.

In the following sections, you'll find guides on creating Smart Components, configuring their View and Controller, managing side effects, and testing them effectively.
