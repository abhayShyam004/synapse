# Task 2: Centralized Store (Zustand) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Initialize the centralized Zustand store with a canvas slice to manage React Flow state (nodes, edges, changes).

**Architecture:** Zustand store with slice-based architecture. Canvas slice handles React Flow state and operations. Persistence via localStorage.

**Tech Stack:** React, TypeScript, Zustand, @xyflow/react, Vitest (for TDD).

---

### Task 0: Setup Vitest for TDD

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`

- [ ] **Step 1: Install Vitest**

Run: `npm install -D vitest @vitejs/plugin-react`
(Note: `@vitejs/plugin-react` might already be installed, but it's good to ensure).

- [ ] **Step 2: Create Vitest config**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
});
```

- [ ] **Step 3: Update package.json scripts**

Add `"test": "vitest"` to scripts.

- [ ] **Step 4: Commit**

```bash
git add package.json vitest.config.ts
git commit -m "chore: setup vitest for testing"
```

---

### Task 1: Implement Canvas Slice

**Files:**
- Create: `src/store/slices/canvasSlice.ts`
- Create: `src/store/slices/canvasSlice.test.ts`

- [ ] **Step 1: Write the failing test for initial state**

```typescript
// src/store/slices/canvasSlice.test.ts
import { describe, it, expect, vi } from 'vitest';
import { createCanvasSlice } from './canvasSlice';

describe('canvasSlice', () => {
  it('should have initial empty nodes and edges', () => {
    const set = vi.fn();
    const get = vi.fn();
    const slice = createCanvasSlice(set, get);
    
    expect(slice.nodes).toEqual([]);
    expect(slice.edges).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/store/slices/canvasSlice.test.ts`
Expected: FAIL (file not found or export missing)

- [ ] **Step 3: Implement minimal Canvas Slice**

```typescript
// src/store/slices/canvasSlice.ts
import { Node, Edge, Connection, addEdge, OnNodesChange, OnEdgesChange, applyNodeChanges, applyEdgeChanges } from '@xyflow/react';

export interface CanvasSlice {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
  addNode: (node: Node) => void;
}

export const createCanvasSlice = (set: any, get: any): CanvasSlice => ({
  nodes: [],
  edges: [],
  onNodesChange: () => {},
  onEdgesChange: () => {},
  onConnect: () => {},
  addNode: () => {},
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test src/store/slices/canvasSlice.test.ts`
Expected: PASS

- [ ] **Step 5: Write failing test for addNode**

```typescript
// Add to src/store/slices/canvasSlice.test.ts
it('should add a node', () => {
  const set = vi.fn((fn) => {
    const currentState = { nodes: [] };
    const newState = typeof fn === 'function' ? fn(currentState) : fn;
    Object.assign(currentState, newState);
  });
  const get = vi.fn(() => ({ nodes: [] }));
  const slice = createCanvasSlice(set, get);
  
  const newNode = { id: '1', position: { x: 0, y: 0 }, data: { label: 'Node 1' } };
  slice.addNode(newNode);
  
  expect(set).toHaveBeenCalled();
});
```

- [ ] **Step 6: Implement addNode**

```typescript
// Update src/store/slices/canvasSlice.ts
addNode: (node: Node) => {
  set({ nodes: [...get().nodes, node] });
},
```

- [ ] **Step 7: Verify all tests pass and continue TDD for onNodesChange, onEdgesChange, onConnect**

- [ ] **Step 8: Commit**

```bash
git add src/store/slices/canvasSlice.ts src/store/slices/canvasSlice.test.ts
git commit -m "feat: implement canvas slice with tests"
```

---

### Task 2: Initialize Main Store

**Files:**
- Create: `src/store/useSynapseStore.ts`
- Create: `src/store/useSynapseStore.test.ts`

- [ ] **Step 1: Write failing test for store initialization**

```typescript
// src/store/useSynapseStore.test.ts
import { describe, it, expect } from 'vitest';
import { useSynapseStore } from './useSynapseStore';

describe('useSynapseStore', () => {
  it('should initialize with canvas slice state', () => {
    const state = useSynapseStore.getState();
    expect(state.nodes).toEqual([]);
    expect(state.addNode).toBeDefined();
  });
});
```

- [ ] **Step 2: Implement Main Store**

```typescript
// src/store/useSynapseStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createCanvasSlice, CanvasSlice } from './slices/canvasSlice';

type StoreState = CanvasSlice;

export const useSynapseStore = create<StoreState>()(
  persist(
    (set, get) => ({
      ...createCanvasSlice(set, get),
    }),
    { name: 'synapse-storage' }
  )
);
```

- [ ] **Step 3: Run tests and verify**

- [ ] **Step 4: Commit**

```bash
git add src/store/useSynapseStore.ts src/store/useSynapseStore.test.ts
git commit -m "feat: initialize main synapse store"
```
