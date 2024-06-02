---
sidebar_label: Integration with React
sidebar_position: 3
title: Integration with React
---
# Integration with React

The [Dependency Injection (DI)](./01-di-container-overview.md) container is a powerful tool for managing dependencies in applications. Integrating the DI container with React applications is essential for managing dependencies in a scalable and maintainable way.

Jet-Blaze provides a React component, `DIContainer`, that integrates the DI container with React applications. The `DIContainer` component provides the DI container to the React tree, allowing [smart components](../Smart%20Component/01-overview.md) to access dependencies.

## Add container to the react tree

To integrate the DI container with React, we need to add the container to the React tree with the DIContainer component. 

The DIContainer has a prop `container` that accepts the [factory function](02-di-container-usage.md) that creates the container. The container is created once and passed to the context provider. The context provider provides the container to the DIContainer component and its children.

```typescript
function App() {
  return (
    <DIContainer container={createContainer}>
        // Add your components here
    </DIContainer>
  );
}
```

## Hook useDIContainer

The `useDIContainer` hook allows components to access the DI container from the React context. The hook returns the container instance, which can be used to resolve dependencies.

```typescript
function MyComponent() {
  const container = useDIContainer();
  const todoService = container.resolve(todoServiceKey);
  // Use todoService
}
```

## Define a scope

Scope defines the lifecycle of a dependency. It could be usful in cases where you want to share the same instance of a dependency across multiple components that belong to the same scope or if you want to create a new instance of complex component.

For example we want to create a new instance of `TodoMVC` component at the same app. For this we need to wrap the `TodoMVC` component with `Scope` component. After the could add second `TodoMVC` component to the React tree. Every `TodoMVC` component will have its own instances of scoped services like `TodoServiceState` etc.

To define a scope, wrap the components with the `DIScope` component. It has a prop `scopeName` that accept the uniq symbol as a scope identifier.

```typescript

function App() {
  return (
    <DIContainer container={createContainer}>
        <DIScope scopeName={todoMVCScope1}>
            <TodoMVC />
        </DIScope>
        <DIScope scopeName={todoMVCScope2}>
            <TodoMVC />
        </DIScope>
    </DIContainer>
  );
}
```

### Disposing a scope

On unmouting the `DIScope` component, the scope will be [disposed](./02-di-container-usage.md#dispose-pattern). It will dispose all the dependencies that were registered with the scope.
