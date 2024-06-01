---
sidebar_label: Overview
sidebar_position: 1
title: Overview
---

# Overview

Handling complexity in software development is crucial, especially for large-scale applications.

Ad hoc solutions can create tangled dependencies, making the code hard to understand and maintain.

Creating monolithic applications makes them difficult to scale and maintain as they grow.

Common developer tasks include:
- Reading and understanding the codebase
- Implementing changes without causing issues
- Writing tests to ensure the application works correctly

These tasks become harder in monolithic applications due to tightly coupled components.

We need a strategy to break the application into smaller, manageable components, each with a single responsibility and few dependencies.

Small components are easier to understand, test, and maintain. Fewer dependencies reduce complexity and allow faster understanding of specific parts of the codebase.

There is SOLID software design principles that help achieve this goal. While these principles are not new, they are essential for creating maintainable and scalable applications. 
 - We split the application into smaller components, each with a single responsibility and few dependencies. 
 - We use the [Dependency Inversion Principle (DIP)](https://en.wikipedia.org/wiki/Dependency_inversion_principle) and [Interface Segregation Principle (ISP)](https://en.wikipedia.org/wiki/Interface_segregation_principle) to manage and decrease dependencies between components.
 - We use a [Composition Root](https://blog.ploeh.dk/2011/07/28/CompositionRoot/) to compose the entire object graph of the application in a single location, typically at the application's entry point.

For a more detailed understanding, you can refer to the book [Dependency Injection: Principles, Practices, and Patterns](https://www.oreilly.com/library/view/dependency-injection-principles/9781617294730/).

### What is a Dependency Injection Container

A Dependency Injection (DI) Container is a tool used at the composition root to manage and resolve dependencies. It automates the process of creating and injecting dependencies, ensuring that each component receives its required dependencies without manual instantiation.

Actully, a DI Container is a registry of factories that create instances of components and manage their lifecycles. It resolves dependencies by creating instances of components and injecting them into other components.