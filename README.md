# Jet-Blaze Framework

<p align="center">
  <img src="https://github.com/readdle/jet-blaze/blob/main/assets/logo/jet-blaze-logo-128x128.png?raw=true" alt="Jet-Blaze Logo"/>
</p>

Jet-Blaze is a cutting-edge framework for building single-page applications (SPA) using TypeScript, React, and RxJS. It
provides a robust structure, combining React Views for the presentation layer, controllers for logic handling, and
services for shared logic.

## Features

- **React Views**: Utilize React for building the presentation layer with efficiency and flexibility.
- **Controllers and Services**: Controllers manage application logic and interact with services for shared logic
  functionalities.
- **RxJS Integration**: Leverage RxJS for handling asynchronous operations, streamlining the process of preparing view
  data and managing side effects.
- **Dependency Injection (DI) Container**: Easily assemble your application and manage dependencies, ensuring clean and
  maintainable code.
- **Test Bed**: Includes a test environment specifically designed for testing the controllers within the framework.
- **CLI Tooling**: Simplify the creation of new components with a convenient CLI command.

## Getting Started

### Installation

To begin using Jet-Blaze, bootstrap your application with the following command:

```bash
npm create jet-blaze@latest
```

Navigate to your application folder and install dependencies:

```bash
npm install
```

### Running Your Application

To run your application in development mode:

```bash
npm run dev
``` 

To run test:

```bash
npm run test
```

### Creating Components

To create a new component using Jet-Blaze's CLI:

```bash
npx jb create component [componentName]
```

The command created the folder that contains

- react view
- controller
- setup for writing unit tests for the controller
- DI key for the controller

Also, the command added the component to the DI module.

### Creating Services

To create a new service using Jet-Blaze's CLI:

```bash
npx jb create service [serviceName]
```

The command created the service file and added the service to the DI module.

### Documentation

For more information on how to use Jet-Blaze, please refer to the [documentation](https://readdle.github.io/jet-blaze/).

### License

This project is licensed under the MIT License - see the LICENSE file for details.
