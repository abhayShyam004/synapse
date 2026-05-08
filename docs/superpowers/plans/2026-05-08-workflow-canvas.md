# Task 3: Basic Workflow Canvas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the visual infinite canvas using React Flow and integrate it into the main app layout.

**Architecture:** Create a dedicated `WorkflowCanvas` component that consumes the Synapse Zustand store and renders the `ReactFlow` component with background, controls, and minimap. Update `App.tsx` to use this new component.

**Tech Stack:** React, TypeScript, @xyflow/react, Zustand, Tailwind CSS.

---

### Task 1: Create WorkflowCanvas Component

**Files:**
- Create: `src/components/canvas/WorkflowCanvas.tsx`

- [ ] **Step 1: Create directory for canvas components**
Run: `mkdir -p src/components/canvas`

- [ ] **Step 2: Create WorkflowCanvas.tsx**
```tsx
import { ReactFlow, Background, Controls, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useSynapseStore } from '../../store/useSynapseStore';

export const WorkflowCanvas = () => {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useSynapseStore();

  return (
    <div className="w-full h-full bg-slate-900">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background color="#334155" gap={20} />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
};
```

### Task 2: Update App Layout

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Update App.tsx to include WorkflowCanvas**
```tsx
import { WorkflowCanvas } from './components/canvas/WorkflowCanvas';

function App() {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-white">
      {/* Top Toolbar Placeholder */}
      <header className="h-14 border-b bg-white flex items-center px-4 shrink-0">
        <h1 className="font-bold text-xl text-synapse-blue">Synapse</h1>
      </header>
      
      <main className="flex flex-1 overflow-hidden">
        {/* Left Sidebar Placeholder */}
        <aside className="w-64 border-r bg-slate-50 shrink-0" />
        
        {/* Canvas Area */}
        <section className="flex-1 relative">
          <WorkflowCanvas />
        </section>
        
        {/* Right Sidebar Placeholder */}
        <aside className="w-64 border-l bg-slate-50 shrink-0" />
      </main>
    </div>
  );
}

export default App;
```

### Task 3: Verification

- [ ] **Step 1: Check for TypeScript errors**
Run: `npm run build`
Expected: Successful build (exit code 0)

- [ ] **Step 2: Check for Lint errors**
Run: `npm run lint`
Expected: No lint errors (exit code 0)

### Task 4: Commit Changes

- [ ] **Step 1: Commit the changes**
Run:
```bash
git add src/components/canvas/WorkflowCanvas.tsx src/App.tsx
git commit -m "feat: basic workflow canvas with react-flow"
```
