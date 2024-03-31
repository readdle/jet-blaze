---
sidebar_label: Quick Start Guide
sidebar_position: 2
---

# Quick Start Guide

This guide will instruct you on the basic procedures to initiate an application using the Jet-Blaze framework,
incorporating a new component, and executing the application.

### 1. Create Your Application

#### Prerequisite

Ensure Node.js and npm are installed on your system.

#### Steps

1. **Bootstrap Your Application:**
    - Initiate a new Jet-Blaze application, which sets up the essential structure for an SPA, by executing:
      ```bash
      npm create jet-blaze@latest
      ```
    - The CLI will request your application's name and establish the application in the designated folder.

2. **Navigate to Your Application Folder:**
    - Change your directory to the newly created application folder:
      ```bash
      cd [your-application-name]
      ```

3. **Install Dependencies:**
    - Install all necessary dependencies for your application:
      ```bash
      npm install
      ```

4. **Run Your Application:**
    - Start your application in development mode:
      ```bash
      npm run dev
      ```
    - Access your application at `http://localhost:3000`.

### 2. Add a New Component

1. **Generate a New Component:**
    - Create a new component using the Jet-Blaze CLI:
      ```bash
      npx jb create component MyComponent
      ```
    - Replace `MyComponent` with your component's name.
    - The command will generate a new folder in `src/components` with the following structure:
      ```plaintext
      src/
      ├── components/
      │   ├── MyComponent/
      │   │   ├── MyComponent.ts
      │   │   ├── MyComponent.test.ts
      │   │   ├── MyComponentView.tsx
      │   │   ├── my-component-controller-key.ts
      ```

2. **Manual Addition to the DI Module:**
    - The CLI currently does not auto-add the component to the DI module. However, it generates the corresponding code
      at the controller file's end.
    - Manually add the component to the DI module:
        - Open the controller file and locate the TODO comment with the generated code to register the controller in the
          DI container:
          ```javascript title="src/components/MyComponent/MyComponent.ts"
          
          // TODO: Add the line to the DI module to register the component
          // container.register(myComponentControllerKey, c => createMyComponentController());
          
          export const MyComponent = connect(MyComponentView, myComponentControllerKey);
          ```
        - Copy this code and insert it into `src/composition-root/main-module.ts`:
          ```javascript title="src/composition-root/main-module.ts"
          // ... other imports and registrations
   
          import { myComponentControllerKey } from "../components/MyComponent/my-component-controller-key.ts";
          import { createMyComponentController } from "../components/MyComponent/MyComponent.ts";
           
          export const mainModule: Module = (container) => {
             // ... other registrations
             container.register(myComponentControllerKey, c => createMyComponentController());
          };
          ```
        - Add the component to your application's JSX in `src/App.tsx` within the `DIContainer` component.

### 3. Run Your Application

1. **Development Mode:**
    - Run the application in development mode:
      ```bash
      npm run dev
      ```

2. **Run Tests:**
    - Execute tests in your application:
      ```bash
      npm run test
      ```
