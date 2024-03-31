---
sidebar_label: Introduction
sidebar_position: 1
---

# Overview

## What is Jet-Blaze?

Jet-Blaze is a framework designed for developing single-page applications,
building upon React's capabilities. It employs RxJS to elegantly manage the application's
state and to script behavioral logic in a declarative manner. A pivotal feature of Jet-Blaze is its
integrated Dependency Injection (DI) container. This tool streamlines the composition of applications and
efficiently manages the lifecycle of services and controllers, enhancing both development efficiency
and application scalability.

### Motivation
React is a great library for building the presentation layer of web applications, but it lacks some features essential
for building large-scale applications.

#### React is not a Framework
Importantly, React is not a **framework**; it is a library dedicated to building user interfaces. We can build a
complete application using React, but often we need to use other libraries for state management, routing, dependency
injection, etc.

#### Lack of Scalability
However, as applications expand in size and complexity, managing the codebase becomes increasingly challenging. A
multitude of components, services, and other classes are created, leading to challenging dependency management.

#### Lack of Reactivity
Modern web frameworks like Angular, Vue.js, SolidJS, etc., have reactivity built-in, which is very useful for building
complex applications. Although FRP (Functional Reactive Programming) enhances application responsiveness, it is not
inherently built into React. FRP allows for more elegant handling of asynchronous operations and makes the code more
readable and maintainable.

Jet-Blaze is developed to bridge these gaps, ensuring developers have a comprehensive toolset to create highly efficient
and scalable applications.

### Problems Addressed by Jet-Blaze
Jet-Blaze is designed to tackle a spectrum of challenges commonly encountered in UI and application development:

- **UI Complexity**: Managing a multitude of asynchronous events to determine the state of the UI, especially when
  dealing with a mix of synchronous and asynchronous code.
- **Application Growth**: As applications expand, Jet-Blaze offers strategies to divide them into manageable parts,
  reducing complexity and dependencies.
- **Dependency Control & Scalability**: It facilitates scaling code development while controlling dependency growth.
- **Testability**: Ensuring code stability and testability during updates is crucial for progressive development.

### Solution Offered
The framework uses components, services, and controllers to manage the application's logic and presentation. A built-in
DI (Dependency Injection) container manages the lifecycle of services and controllers within the React tree structure,
allowing for scope-based lifecycle management. Finally, Jet-Blaze leverages RxJS for a declarative approach to code,
seamlessly handling both synchronous and asynchronous tasks.

These solutions enable developers to adhere to SOLID principles, fostering a well-structured codebase and reduced
coupling, thereby simplifying maintenance.
