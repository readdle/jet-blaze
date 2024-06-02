---
sidebar_label: Using DI container
sidebar_position: 2
title: Using DI container
---
# Using DI Container

Dependency Injection (DI) is a core aspect of building scalable and maintainable applications. The DI container simplifies the management of object lifecycles and dependencies. This document will guide you through the necessary steps to effectively use the DI container in your projects, including how to register and resolve dependencies, organize them with modules, and manage their lifetimes.

Usage of a DI container involves the following key steps:
- **Registering a dependency**: Build a registry of factories for later use.
- **Resolving a dependency**: Create instances of controllers, components, or services as needed throughout the application.

It is a common practice to lock down the container after the composition root has been executed to ensure the container is not altered after the initial setup. This practice helps in maintaining a predictable application state.

```Typescript
export const createContainer = (): Resolve => {
  const builder = new ContainerBuilder();

  // Register dependencies with builder

  return builder.build();
};
```

This introduction sets the context for the use of the DI container and provides a glimpse into the steps involved. 

## Register a Dependency

Understanding the registration process begins with setting up a factory function. This function is responsible for creating instances of a dependency upon request. Each dependency is registered using a unique key, which comprises a symbol and TypeScript type, ensuring accurate type resolution and dependency management.

Define a new key and register a dependency like so:

```typescript
export const todoStateServiceKey = key<TodoStateService>("TodoStateService");

export const createContainer = (): Resolve => {
  const builder = new ContainerBuilder();

  builder.register(todoStateServiceKey, () => new TodoStateService());

  return builder.build();
};
```

## Organize Dependencies with Modules

Modules play a crucial role in grouping related dependencies that are specific to a feature or domain within the application. This organization aids in maintaining a clean architecture and facilitates easier maintenance. Modules are defined as functions that accept a builder as an argument, where each function is responsible for registering the necessary dependencies.

Add modules to the container builder using the `registerModule` method like this:

```Typescript
export const todoModule: : Module = builder => {
    builder.register(todoRepositoryKey, () => new TodoRepository());
    builder.register(todoStateServiceKey, (container) => new TodoStateService(container.resolve(todoRepositoryKey)));
};

export const createContainer = (): Resolve => {
    const builder = new ContainerBuilder();

    builder.registerModule(todoModule);

    return builder.build();
};
```

Using modules helps streamline dependency management and ensures a modular and scalable application structure.

## Resolve a Dependency

Once dependencies have been registered, the next step is to resolve them when needed. The container uses a method called `build` to finalize its setup and generate a `Resolve` interface instance. The `Resolve` interface provides a `resolve` method to obtain the required dependency instance.

Here's how you can resolve a dependency using the container:

```Typescript
export const createContainer = (): Resolve => {
  const builder = new ContainerBuilder();

  builder.register(todoStateServiceKey, () => new TodoStateService());

  return builder.build();
};

const container = createContainer();
const todoStateService = container.resolve(todoStateServiceKey);
```

## Resolve a Dependency with Dependencies

When resolving a dependency that itself has dependencies, the container handles these nested dependencies automatically. This feature simplifies the management of complex dependency relationships, ensuring that all necessary components are instantiated in the correct order.

Here's an illustration of how a dependency with its own dependencies is resolved:

```Typescript
export const todoStateServiceKey = key<TodoStateService>("TodoStateService");
export const todoRepositoryKey = key<TodoRepository>("TodoRepository");

export const createContainer = (): Resolve => {
    const builder = new ContainerBuilder();

    builder.register(todoRepositoryKey, () => new TodoRepository());
    builder.register(todoStateServiceKey, (container) => new TodoStateService(container.resolve(todoRepositoryKey)));

    return builder.build();
};

const container = createContainer();
const todoStateService = container.resolve(todoStateServiceKey); // Resolves TodoStateService with TodoRepository dependency
```

This method ensures that the `TodoStateService` not only gets created but also receives a properly instantiated `TodoRepository` through the container’s resolution process.

:::tip[Debuggiing]
 - When resolving a dependency, the container will throw an error if the dependency is not registered. 
 - For tracking down issues, the container provides a `logToConsole` boolean flag that logs the resolution process to the console.
 ```Typescript
const container = createContainer();
container.logToConsole = true;
const todoStateService = container.resolve(todoStateServiceKey);
```
:::

## Life Time Management

Effective life time management is crucial for ensuring that dependencies are instantiated and disposed of at appropriate times, which helps in optimizing resource utilization and maintaining application performance.

There are three types of life time scopes in the DI container:
- **Singleton**: This scope creates a single instance of a dependency and uses that same instance throughout the application lifecycle.
- **Transient**: This scope creates a new instance of a dependency each time it is resolved.
- **Scoped**: This scope creates an instance of a dependency once per scope, typically per request in web applications or per React tree node in frontend applications.

### Example of Singleton and Transient life time scopes
```Typescript
export const todoStateServiceKey = key<TodoStateService>("TodoStateService");
export const todoRepositoryKey = key<TodoRepository>("TodoRepository");

export const createContainer = (): Resolve => {
    const builder = new ContainerBuilder();

    builder.register(
        todoRepositoryKey, 
        () => new TodoRepository(), 
        LifeTimeScope.Singleton
    );
    builder.register(
        todoStateServiceKey, 
        (container) => new TodoStateService(container.resolve(todoRepositoryKey)),
        LifeTimeScope.Transient);

    return builder.build();
};

const container = createContainer();
const todoStateService1 = container.resolve(todoStateServiceKey);
const todoStateService2 = container.resolve(todoStateServiceKey);

// todoStateService1 and todoStateService2 are same instance
console.log(todoStateService1 === todoStateService2); // true

const todoRepository1 = container.resolve(todoRepositoryKey);
const todoRepository2 = container.resolve(todoRepositoryKey);

// todoRepository1 and todoRepository2 are different instances
console.log(todoRepository1 === todoRepository2); // false

```

### Scoped life time

For creating a scope, the container has a method `createScope` that creates a new scope. The scope is used to manage the life time of dependencies. When the scope is disposed, all dependencies that were created in the scope are disposed.

```Typescript
export const todoStateServiceKey = key<TodoStateService>("TodoStateService");
export const todoRepositoryKey = key<TodoRepository>("TodoRepository");

export const createContainer = (): Resolve => {
    const builder = new ContainerBuilder();

    builder.register(
        todoRepositoryKey, 
        () => new TodoRepository(), 
        LifeTimeScope.Singleton
    );
    builder.register(
        todoStateServiceKey, 
        (container) => new TodoStateService(container.resolve(todoRepositoryKey)),
        LifeTimeScope.Scoped);

    return builder.build();
};

const container = createContainer();
const scope1 = container.createScope(Symbol.for("scope1"));
const scope2 = container.createScope(Symbol.for("scope2"));

const todoStateService1 = scope1.resolve(todoStateServiceKey);
const todoStateService2 = scope2.resolve(todoStateServiceKey);

// todoStateService1 and todoStateService2 are different instances
console.log(todoStateService1 === todoStateService2); // false
```

Understanding these scopes and their appropriate use cases will allow developers to make informed decisions about the lifecycle management of their application’s dependencies.

## Dispose Pattern

The dispose pattern is essential for the proper management of resources, especially those not handled by the garbage collector, such as connections and subscriptions. This pattern ensures that resources are released appropriately to prevent memory leaks and other resource-related issues.

In the DI container, disposing of dependencies that implement the `Disposable` or `AsyncDisposable` interfaces is handled through specific methods:

```Typescript

type Service = {
    // methods
} & Disposable;

const createService = (): Service => {
    const subject = new Subject();
    const service: Service = {
        [Symbol.dispose]() {
            // dispose resources
            subject.complete();
        }
    };

    return service;
};


export const serviceKey = key<Service>("Service");

export const createContainer = (): Resolve => {
    const builder = new ContainerBuilder();

    builder.register(serviceKey, () => createService());

    return builder.build();
};

const container = createContainer();
const service = container.resolve(serviceKey);

// dispose the container
container.dispose(); // dispose the service
```

Using the dispose pattern, developers can ensure that every component cleans up after itself, preventing resource wastage and potential application instability. This is particularly important in applications with complex life cycles or those that manage many external resources.

At the next step of the guide, we will explore how to itegrte the DI container with a React application.