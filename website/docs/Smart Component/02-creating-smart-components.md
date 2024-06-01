---
sidebar_label: Creating Smart Components
sidebar_position: 2
---
# Creating Smart Components

To streamline the development process, Jet-Blaze provides a CLI command for generating a new Smart Component with the necessary files.

## Creating a New Component

1. Run the following command in your project directory:

    ```bash
    npx jb create component <name>
    ```
    Replace `<name>` with your desired component name.

2. This command generates a new folder named after your component, containing:
    - **Controller:** Manages the application's logic.
    - **View:** Displays the component's UI.
    - **Tests:** Sets up unit tests for the Controller.
    - **DI Key:** The key used for dependency injection.

3. The CLI automatically registers the new component in the DI module using Babel.

## Folder Structure Example

After running the command, the following structure will be created:

    ```
    <project-root>
    └── src/
        └── components/
            └── <name>
                ├── <name>.ts
                ├── <name>View.tsx
                ├── <name>.test.ts
                └── <name>-controller-key.ts
    ```

This structure ensures each new component is well-organized, facilitating the setup of View, Controller, and [Dependency Injection](../Dependency%20Injection%20Container/di-container-overview).
