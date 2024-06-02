---
sidebar_label: Integration with React
sidebar_position: 3
title: Integration with React
---
# Integration with React

The [Dependency Injection (DI)](./01-di-container-overview.md) container simplifies managing dependencies in applications. Integrating the DI container with React ensures dependencies are handled efficiently in larger applications.

Jet-Blaze includes a `DIContainer` React component that connects the DI container to your React application. This component allows any [smart components](../Smart%20Component/01-overview.md) within your application to easily access necessary dependencies.

## Add the DI Container to the React Tree

To use the DI container in your React application, wrap your component tree with the `DIContainer` component. 

The `DIContainer` has a `container` prop which should be set to a factory function that creates your DI container. This container is then provided to all components within the `DIContainer` using a context provider.

```typescript
function App() {
  return (
    <DIContainer container={createContainer}>
        // Add your components here
    </DIContainer>
  );
}
```

## Using the useDIContainer Hook

The `useDIContainer` hook lets you fetch the DI container in any component, allowing you to access any dependencies you need.

```typescript
function MyComponent() {
  const container = useDIContainer();
  const todoService = container.resolve(todoServiceKey);
  // Use todoService
}
```

## Define a Scope for Dependencies

A scope determines the lifecycle of dependencies, useful for sharing the same instance across components or creating new instances in complex setups.

For instance, if you need multiple instances of the `TodoMVC` component each with its own dependencies, you can achieve this using the `DIScope` component.

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

### Disposing a Scope

When the `DIScope` component is unmounted, it automatically disposes of all dependencies associated with that scope as detailed in the [dispose pattern](./02-di-container-usage.md#dispose-pattern).