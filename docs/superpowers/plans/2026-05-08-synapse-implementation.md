# Synapse Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a visual workflow planning system with an infinite canvas, custom node library, and AI suggestions.

**Architecture:** Centralized Zustand store managing React Flow nodes/edges, templates, and variables. Persistence via localStorage.

**Tech Stack:** React, TypeScript, Vite, Tailwind CSS, Zustand, @xyflow/react, Framer Motion, NVIDIA NIM API.

---

## File Mapping

### Core State & Logic
- `src/store/useSynapseStore.ts`: Main Zustand store with slices.
- `src/store/slices/canvasSlice.ts`: React Flow state logic.
- `src/store/slices/librarySlice.ts`: Template management.
- `src/store/slices/variableSlice.ts`: Variable registry.
- `src/store/slices/settingsSlice.ts`: UI/AI configuration.
- `src/lib/ai/nvidiaNim.ts`: API client for AI features.
- `src/lib/utils/persistence.ts`: LocalStorage sync utility.

### Components
- `src/components/canvas/WorkflowCanvas.tsx`: Main React Flow container.
- `src/components/canvas/nodes/BaseNode.tsx`: Wrapper for all node types.
- `src/components/canvas/nodes/NodeStyles.ts`: Shape/Color mapping logic.
- `src/components/sidebar/LeftSidebar.tsx`: Library + Variable panel.
- `src/components/sidebar/RightSidebar.tsx`: Property editor.
- `src/components/toolbar/TopToolbar.tsx`: Global actions.
- `src/components/ui/Modal.tsx`: Reusable modal for settings/node config.

---

### Task 1: Project Setup & Dependencies

**Files:**
- Modify: `package.json`
- Modify: `tailwind.config.js`

- [ ] **Step 1: Install dependencies**

Run: `npm install @xyflow/react zustand framer-motion lucide-react clsx tailwind-merge`

- [ ] **Step 2: Configure Tailwind colors**

```javascript
// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        synapse: {
          yellow: "#FFD600",
          cyan: "#00E5FF",
          blue: "#2979FF",
        },
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 3: Commit**

```bash
git add package.json tailwind.config.js
git commit -m "chore: setup dependencies and tailwind theme"
```

---

### Task 2: Centralized Store (Zustand)

**Files:**
- Create: `src/store/useSynapseStore.ts`
- Create: `src/store/slices/canvasSlice.ts`

- [ ] **Step 1: Create Canvas Slice**

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

export const createCanvasSlice = (set: any, get: any) => ({
  nodes: [],
  edges: [],
  onNodesChange: (changes: any) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) });
  },
  onEdgesChange: (changes: any) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },
  onConnect: (connection: Connection) => {
    set({ edges: addEdge(connection, get().edges) });
  },
  addNode: (node: Node) => {
    set({ nodes: [...get().nodes, node] });
  },
});
```

- [ ] **Step 2: Initialize Main Store**

```typescript
// src/store/useSynapseStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createCanvasSlice, CanvasSlice } from './slices/canvasSlice';

type StoreState = CanvasSlice; // Add other slices here as built

export const useSynapseStore = create<StoreState>()(
  persist(
    (set, get) => ({
      ...createCanvasSlice(set, get),
    }),
    { name: 'synapse-storage' }
  )
);
```

- [ ] **Step 3: Commit**

```bash
git add src/store/
git commit -m "feat: initialize zustand store with canvas slice"
```

---

### Task 3: Basic Workflow Canvas

**Files:**
- Create: `src/components/canvas/WorkflowCanvas.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Implement WorkflowCanvas**

```tsx
// src/components/canvas/WorkflowCanvas.tsx
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

- [ ] **Step 2: Update App Layout**

```tsx
// src/App.tsx
import { WorkflowCanvas } from './components/canvas/WorkflowCanvas';

function App() {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
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

- [ ] **Step 3: Commit**

```bash
git add src/components/canvas/WorkflowCanvas.tsx src/App.tsx
git commit -m "feat: basic workflow canvas with react-flow"
```

---

### Task 4: Custom Node Wrapper (BaseNode)

**Files:**
- Create: `src/components/canvas/nodes/BaseNode.tsx`
- Create: `src/components/canvas/nodes/NodeStyles.ts`

- [ ] **Step 1: Define Shape/Color Utils**

```typescript
// src/components/canvas/nodes/NodeStyles.ts
export const SHAPES = {
  rectangle: 'rounded-none',
  rounded: 'rounded-lg',
  pill: 'rounded-full',
  diamond: 'rotate-45', // Needs nested content counter-rotation
  hexagon: 'clip-path-hexagon', // Needs custom CSS
};

export const COLORS = {
  yellow: 'bg-synapse-yellow border-synapse-yellow',
  cyan: 'bg-synapse-cyan border-synapse-cyan',
  blue: 'bg-synapse-blue border-synapse-blue text-white',
};
```

- [ ] **Step 2: Implement BaseNode**

```tsx
// src/components/canvas/nodes/BaseNode.tsx
import { Handle, Position, NodeProps } from '@xyflow/react';
import { clsx } from 'clsx';

export const BaseNode = ({ data, selected }: NodeProps) => {
  return (
    <div className={clsx(
      "min-w-[150px] p-4 border-2 shadow-lg transition-all",
      data.color || "bg-white",
      data.shape || "rounded-lg",
      selected ? "ring-4 ring-synapse-blue" : "ring-0",
      data.variant === 'ghost' && "opacity-40 border-dashed"
    )}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-synapse-blue" />
      
      <div className="flex flex-col gap-1">
        <div className="text-xs font-bold uppercase opacity-60">{data.type}</div>
        <div className="font-bold">{data.label}</div>
        {data.description && <div className="text-xs opacity-80">{data.description}</div>}
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-synapse-blue" />
      
      {/* Plus Symbol on Hover placeholder */}
      <div className="absolute -right-2 top-1/2 -translate-y-1/2 opacity-0 hover:opacity-100 cursor-pointer bg-white rounded-full border shadow-sm p-1">
        +
      </div>
    </div>
  );
};
```

- [ ] **Step 3: Register Custom Node**

Modify `src/components/canvas/WorkflowCanvas.tsx` to include `nodeTypes`:
```tsx
const nodeTypes = {
  custom: BaseNode,
};
// ... pass to ReactFlow
```

- [ ] **Step 4: Commit**

```bash
git add src/components/canvas/nodes/ src/components/canvas/WorkflowCanvas.tsx
git commit -m "feat: custom basenode component"
```

---

### Task 5: Left Sidebar - Node Library & Add Form

**Files:**
- Create: `src/components/sidebar/LeftSidebar.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Implement Library & Add Form**

```tsx
// src/components/sidebar/LeftSidebar.tsx
import { useState } from 'react';
import { useSynapseStore } from '../../store/useSynapseStore';

export const LeftSidebar = () => {
  const addNode = useSynapseStore(state => state.addNode);
  const [formData, setFormData] = useState({ label: '', type: 'Task', color: 'bg-white' });

  const handleAdd = () => {
    addNode({
      id: crypto.randomUUID(),
      type: 'custom',
      position: { x: 100, y: 100 },
      data: { ...formData },
    });
  };

  return (
    <div className="p-4 flex flex-col gap-6">
      <section>
        <h3 className="font-bold mb-2">Library</h3>
        <div className="grid grid-cols-2 gap-2">
          {['Task', 'Decision', 'Note'].map(t => (
            <div key={t} className="p-2 border rounded cursor-move bg-white text-xs text-center hover:bg-slate-100">
              {t}
            </div>
          ))}
        </div>
      </section>

      <section className="p-4 bg-synapse-yellow/10 rounded-lg border border-synapse-yellow">
        <h3 className="font-bold mb-4">Add New Card</h3>
        <div className="flex flex-col gap-3">
          <input 
            placeholder="Name" 
            className="p-2 border rounded" 
            value={formData.label}
            onChange={e => setFormData({...formData, label: e.target.value})}
          />
          <button 
            onClick={handleAdd}
            className="bg-synapse-blue text-white p-2 rounded font-bold hover:bg-blue-600"
          >
            Add to Canvas
          </button>
        </div>
      </section>
    </div>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/sidebar/LeftSidebar.tsx
git commit -m "feat: left sidebar with node library and add form"
```

---

### Task 6: AI Features (NVIDIA NIM Integration)

**Files:**
- Create: `src/lib/ai/nvidiaNim.ts`

- [ ] **Step 1: Implement AI Client**

```typescript
// src/lib/ai/nvidiaNim.ts
const API_KEY = import.meta.env.VITE_NVIDIA_NIM_API_KEY;
const BASE_URL = 'https://integrate.api.nvidia.com/v1';

export const fetchAISuggestion = async (prompt: string) => {
  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'meta/llama-3.1-8b-instruct',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 150,
    }),
  });

  if (!response.ok) throw new Error('AI API Error');
  const data = await response.json();
  return data.choices[0].message.content;
};
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/ai/nvidiaNim.ts
git commit -m "feat: nvidia nim api client"
```

---

### Task 7: Final Polish & Theme

- [ ] **Step 1: Add Settings Slice to Store**
- [ ] **Step 2: Implement Top Toolbar with Save/Export**
- [ ] **Step 3: Implement Ghost Card logic (Triggers in Canvas)**
- [ ] **Step 4: Commit final changes**

```bash
git commit -m "feat: finalize synapse prototype"
```
