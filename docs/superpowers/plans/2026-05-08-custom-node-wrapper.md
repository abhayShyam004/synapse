# Custom Node Wrapper (BaseNode) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a custom `BaseNode` component and its associated styles for ReactFlow to provide a branded, flexible UI for nodes.

**Architecture:** Define style constants in `NodeStyles.ts` and use them in a functional React component `BaseNode.tsx` registered with ReactFlow.

**Tech Stack:** React, TypeScript, @xyflow/react, clsx, Tailwind CSS

---

### Task 1: Define Node Styles

**Files:**
- Create: `src/components/canvas/nodes/NodeStyles.ts`

- [ ] **Step 1: Create the styles utility file**

```typescript
// src/components/canvas/nodes/NodeStyles.ts
export const SHAPES = {
  rectangle: 'rounded-none',
  rounded: 'rounded-lg',
  pill: 'rounded-full',
  diamond: 'rotate-45', // Needs nested content counter-rotation
  hexagon: 'clip-path-hexagon', // Needs custom CSS in index.css
};

export const COLORS = {
  yellow: 'bg-[#FFD700] border-[#FFD700] text-black',
  cyan: 'bg-[#00FFFF] border-[#00FFFF] text-black',
  blue: 'bg-[#0070F3] border-[#0070F3] text-white',
  white: 'bg-white border-gray-200 text-black',
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/canvas/nodes/NodeStyles.ts
git commit -m "style: define node shape and color constants"
```

### Task 2: Implement BaseNode Component

**Files:**
- Create: `src/components/canvas/nodes/BaseNode.tsx`

- [ ] **Step 1: Create the BaseNode component**

```tsx
// src/components/canvas/nodes/BaseNode.tsx
import { Handle, Position, NodeProps } from '@xyflow/react';
import { clsx } from 'clsx';
import { SHAPES, COLORS } from './NodeStyles';

export interface BaseNodeData {
  label: string;
  type?: string;
  description?: string;
  color?: keyof typeof COLORS;
  shape?: keyof typeof SHAPES;
  variant?: 'default' | 'ghost';
}

export const BaseNode = ({ data, selected }: NodeProps<any>) => {
  const nodeData = data as BaseNodeData;
  const colorClass = COLORS[nodeData.color || 'white'];
  const shapeClass = SHAPES[nodeData.shape || 'rounded'];

  return (
    <div className={clsx(
      "min-w-[150px] p-4 border-2 shadow-lg transition-all relative",
      colorClass,
      shapeClass,
      selected ? "ring-4 ring-[#0070F3] ring-offset-2 ring-offset-slate-900" : "ring-0",
      nodeData.variant === 'ghost' && "opacity-40 border-dashed"
    )}>
      {/* Content wrapper for counter-rotation if diamond */}
      <div className={clsx(nodeData.shape === 'diamond' && "-rotate-45")}>
        <Handle 
          type="target" 
          position={Position.Top} 
          className="w-3 h-3 bg-[#0070F3] !border-white" 
        />
        
        <div className="flex flex-col gap-1">
          {nodeData.type && (
            <div className="text-[10px] font-bold uppercase opacity-60 tracking-wider">
              {nodeData.type}
            </div>
          )}
          <div className="font-bold text-sm">{nodeData.label}</div>
          {nodeData.description && (
            <div className="text-xs opacity-80 leading-tight mt-1">
              {nodeData.description}
            </div>
          )}
        </div>

        <Handle 
          type="source" 
          position={Position.Bottom} 
          className="w-3 h-3 bg-[#0070F3] !border-white" 
        />
      </div>

      {/* Plus Symbol on Hover placeholder */}
      <div className="absolute -right-3 top-1/2 -translate-y-1/2 opacity-0 hover:opacity-100 cursor-pointer bg-white rounded-full border shadow-sm p-1 flex items-center justify-center w-6 h-6 text-[#0070F3] font-bold z-10">
        +
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/canvas/nodes/BaseNode.tsx
git commit -m "feat: implement BaseNode component with handles and styles"
```

### Task 3: Register Custom Node and Verify

**Files:**
- Modify: `src/components/canvas/WorkflowCanvas.tsx`
- Modify: `src/store/slices/canvasSlice.ts` (to add a test node)

- [ ] **Step 1: Register nodeTypes in WorkflowCanvas**

```tsx
// src/components/canvas/WorkflowCanvas.tsx
import { ReactFlow, Background, Controls, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useSynapseStore } from '../../store/useSynapseStore';
import { BaseNode } from './nodes/BaseNode';

const nodeTypes = {
  custom: BaseNode,
};

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
        nodeTypes={nodeTypes}
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

- [ ] **Step 2: Add a test node to initial state in canvasSlice**

```tsx
// src/store/slices/canvasSlice.ts
// ... imports
export const createCanvasSlice = (
  set: (fn: (state: CanvasSlice) => Partial<CanvasSlice>) => void
): CanvasSlice => ({
  nodes: [
    {
      id: 'test-1',
      type: 'custom',
      position: { x: 100, y: 100 },
      data: { 
        label: 'Custom Node', 
        type: 'TRIGGER', 
        description: 'This is a custom node test',
        color: 'yellow',
        shape: 'rounded'
      },
    }
  ],
  // ... rest
});
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: SUCCESS

- [ ] **Step 4: Commit**

```bash
git add src/components/canvas/WorkflowCanvas.tsx src/store/slices/canvasSlice.ts
git commit -m "feat: register custom node type and add test node"
```
