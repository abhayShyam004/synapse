# Ghost Cards & AI Tooling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement functional Ghost Cards (AI suggestions) that can be accepted or dismissed, and add AI-powered auto-suggest to the new card form.

**Architecture:** Extend the Zustand store with ghost node management actions, wire up React Flow custom nodes to these actions, and integrate the NVIDIA NIM AI utility into the sidebar form.

**Tech Stack:** React, TypeScript, Zustand, React Flow, Lucide React, NVIDIA NIM API.

---

### Task 1: Store Actions for Ghost Nodes

**Files:**
- Modify: `src/store/slices/canvasSlice.ts`

- [ ] **Step 1: Update CanvasSlice interface**

```typescript
export interface CanvasSlice {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
  addNode: (node: Node) => void;
  addGhostNode: (node: Node) => void;
  updateNode: (id: string, data: any) => void;
  acceptGhostNode: (id: string) => void;
  dismissGhostNode: (id: string) => void;
}
```

- [ ] **Step 2: Implement acceptGhostNode and dismissGhostNode**

```typescript
  acceptGhostNode: (id: string) => {
    set((state) => ({
      nodes: state.nodes.map(n => n.id === id ? { ...n, data: { ...n.data, variant: 'default' } } : n)
    }));
  },
  dismissGhostNode: (id: string) => {
    set((state) => ({
      nodes: state.nodes.filter(n => n.id !== id),
      edges: state.edges.filter(e => e.target !== id && e.source !== id)
    }));
  },
```

- [ ] **Step 3: Commit changes**

```bash
git add src/store/slices/canvasSlice.ts
git commit -m "feat: add accept and dismiss ghost node actions to store"
```

---

### Task 2: Wire Up BaseNode Buttons

**Files:**
- Modify: `src/components/canvas/nodes/BaseNode.tsx`

- [ ] **Step 1: Import store hook and wire buttons**

```typescript
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { clsx } from 'clsx';
import { SHAPES, COLORS } from './NodeStyles';
import { motion } from 'framer-motion';
import { useSynapseStore } from '../../../store/useSynapseStore';

// ... (BaseNode component)

export const BaseNode = ({ id, data, selected }: NodeProps<BaseNodeProps>) => {
  const acceptGhostNode = useSynapseStore(state => state.acceptGhostNode);
  const dismissGhostNode = useSynapseStore(state => state.dismissGhostNode);
  
  // ... (existing logic)

  return (
    // ...
      {isGhost && (
        <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 flex gap-3 w-[200px] justify-center">
          <button 
            onClick={() => acceptGhostNode(id)}
            className="bg-green-400 border-2 border-black text-black text-xs px-4 py-2 font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-px hover:shadow-none transition-all"
          >
            Accept
          </button>
          <button 
            onClick={() => dismissGhostNode(id)}
            className="bg-red-400 border-2 border-black text-black text-xs px-4 py-2 font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-px hover:shadow-none transition-all"
          >
            Dismiss
          </button>
        </div>
      )}
    </motion.div>
  );
};
```

- [ ] **Step 2: Commit changes**

```bash
git add src/components/canvas/nodes/BaseNode.tsx
git commit -m "feat: wire accept/dismiss buttons to store actions in BaseNode"
```

---

### Task 3: AI Auto-Suggest in LeftSidebar

**Files:**
- Modify: `src/components/sidebar/LeftSidebar.tsx`

- [ ] **Step 1: Implement handleAISuggest**

```typescript
import { useState } from 'react';
import { useSynapseStore } from '../../store/useSynapseStore';
import { NODE_TYPES } from '../canvas/nodes/NodeStyles';
import { Sparkles, Loader2 } from 'lucide-react';
import { fetchAISuggestion } from '../../lib/ai/nvidiaNim';
import { toast } from 'sonner';

export const LeftSidebar = () => {
  const addNode = useSynapseStore(state => state.addNode);
  const [formData, setFormData] = useState({ label: '', type: 'Task', color: 'yellow', shape: 'rounded' });
  const [isSuggesting, setIsSuggesting] = useState(false);

  const handleAISuggest = async () => {
    if (isSuggesting) return;
    setIsSuggesting(true);
    try {
      const prompt = `Suggest a short, punchy name and a 1-sentence description for a workflow node of type "${formData.type}". Return JSON format: {"name": "...", "description": "..."}`;
      const result = await fetchAISuggestion(prompt);
      const cleaned = result.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      setFormData(prev => ({ ...prev, label: parsed.name }));
      toast.success('AI Suggestion applied!');
    } catch (error) {
      console.error('AI Suggestion failed:', error);
      toast.error('AI Suggestion failed');
    } finally {
      setIsSuggesting(false);
    }
  };

  // ... (rest of the component)
```

- [ ] **Step 2: Update JSX to use handleAISuggest and loading state**

```typescript
          <div className="flex gap-2">
            <input 
              placeholder="Card Name" 
              className="flex-1 p-3 border-2 border-black rounded-none outline-none focus:ring-4 focus:ring-synapse-cyan font-bold" 
              value={formData.label}
              onChange={e => setFormData({...formData, label: e.target.value})}
            />
            <button 
              onClick={handleAISuggest}
              disabled={isSuggesting}
              className="p-3 border-2 border-black bg-synapse-yellow hover:bg-yellow-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSuggesting ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
            </button>
          </div>
```

- [ ] **Step 3: Commit changes**

```bash
git add src/components/sidebar/LeftSidebar.tsx
git commit -m "feat: implement AI auto-suggest in LeftSidebar card form"
```

---

### Task 4: Verification

- [ ] **Step 1: Check build**

Run: `npm run build`
Expected: Success

- [ ] **Step 2: Verify linting**

Run: `npm run lint`
Expected: Success

- [ ] **Step 3: Final Commit**

```bash
git commit --allow-empty -m "chore: complete task 6 - ghost cards and AI tooling"
```
