---
sidebar_label: Introduction
sidebar_position: 1
---

# Introduction to Jet-Blaze Framework

## What is Jet-Blaze?
Jet-Blaze is a framework designed for developing 
single-page applications using TypeScript, React, and RxJS. 
It stands out in the realm of web development by offering unique solutions 
to common and complex problems encountered in large-scale applications.

### Motivation
React is great **library** for building presentation layer of web applications, 
but it lacks some features that are essential for building large-scale applications.

#### React is not a Framework
Actually React is not a **framework**, it is a library for building user interfaces.
We can build a complete application using React, 
but usually we need to use other libraries
for state management, routing, dependency injection, etc.

#### Lack of scalability
React is great for building small to medium-sized applications. 
But as the application grows, it becomes harder to manage the codebase.
A lot of components, services, and other classes are created, and it becomes harder to manage them.
They create a lot of dependencies between them, and it becomes harder to manage them.

#### Lack of Reactivity
Modern web frameworks like Angular, Vue.js, SolidJS, etc. have reactivity built-in. 
It is very useful for building complex applications. 
You can change the state of the application and the UI will be updated automatically.
But FRP (Functional Reactive Programming) is not built-in in React.
At the same time FRP allows to handle asynchronous operations in a more elegant way
and make the code more readable and maintainable.


Jet-Blaze is developed to bridge these gaps, 
ensuring developers have a comprehensive toolset 
to create highly efficient and scalable applications.

### Problems Addressed by Jet-Blaze
Jet-Blaze tackles a range of problems typically encountered in UI and application development:

- **UI Complexity**: Managing a multitude of asynchronous events to determine 
the state of the UI, especially when dealing with a mix of 
synchronous and asynchronous code.
- **Application Growth**: As applications expand, Jet-Blaze offers strategies to divide them into manageable parts, 
reducing complexity and dependencies.
- **Dependency Control & Scalability**: It facilitates scaling code development while controlling dependency growth.
- **Testability**: Ensuring code stability and testability during updates is crucial for progressive development.

### Solution Offered
The framework uses components, services, and controllers 
to manage the application's logic and presentation.
Built in DI (Dependency Injection) container manages the lifecycle of services 
and controllers within the React tree structure,
allowing for scope-based lifecycle management.
Finally, Jet-Blaze leverages RxJS for a declarative approach to code,
seamlessly handling both synchronous and asynchronous tasks.

Based on these solutions allows developers to follow 
SOLID principles for better code structure and low coupling for easier maintenance.
