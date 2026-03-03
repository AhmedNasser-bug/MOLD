# Research & Decisions

## 1. Testing Framework

**Context**: The project currently lacks a unified testing framework for Unit & Data Migration tests (Issue #38, #52, #53). We need to establish a capability for testing Astro components, TypeScript logic, and SQLite WASM database interactions.

**Decision**: **Vitest**

**Rationale**: 
- Vitest is built on top of Vite and natively supports the exact same configuration as Astro (since Astro uses Vite under the hood). This eliminates complex setup overhead for TypeScript and ESM.
- It is significantly faster than Jest due to esbuild.
- It provides a compatible API with Jest for easy adoption.
- We can easily mock the SQLite WASM layer using Vitest's powerful stubbing mechanics for tests where we don't want a real DB connection.

**Alternatives Considered**:
- *Jest*: Requires heavy configuring (`babel-jest`, `ts-jest`) to work nicely with raw ESM and Astro files. Considerably slower.
- *Mocha/Chai*: Lacks built-in TypeScript support and is generally considered legacy compared to the Vite ecosystem.
