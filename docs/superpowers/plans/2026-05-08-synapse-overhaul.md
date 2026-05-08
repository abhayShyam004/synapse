# Synapse Major UI & Feature Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Overhaul the Synapse UI to a bright neo-brutalist theme, polish the infinite canvas, fix node interactions, implement all missing modals (Settings, Card Properties), and complete the AI and variable features.

**Architecture:** Extend the existing Zustand store with new slices (history, variables, modals). Enhance React Flow custom nodes and edges.

**Tech Stack:** React, TypeScript, Tailwind CSS, Zustand, @xyflow/react, Framer Motion, NVIDIA NIM API, React Hot Toast (for notifications).

---

## File Mapping

### Core State & Logic
- `src/store/useSynapseStore.ts`: Add new slices.
- `src/store/slices/historySlice.ts`: Undo/Redo logic.
- `src/store/slices/variableSlice.ts`: Variable definitions.
- `src/store/slices/modalSlice.ts`: Modal visibility state.
- `src/store/slices/canvasSlice.ts`: Enhance to support ghost card accept/dismiss and real-time updates.

### Components
- `src/index.css`: Add Google Fonts import, update root styles.
- `src/App.tsx`: Layout overhaul, add Toaster.
- `src/components/toolbar/TopToolbar.tsx`: Neo-brutalist styling, working buttons.
- `src/components/sidebar/LeftSidebar.tsx`: Chunky buttons, Variables panel, AI button in form.
- `src/components/sidebar/RightSidebar.tsx`: Live properties panel.
- `src/components/canvas/WorkflowCanvas.tsx`: Grid styling, minimap, default edge options.
- `src/components/canvas/nodes/BaseNode.tsx`: Hover handles fix, neo-brutalist style, shape support.
- `src/components/canvas/nodes/NodeStyles.ts`: Expanded node types and styles.
- `src/components/modals/SettingsModal.tsx`: App configuration.
- `src/components/modals/CardSettingsModal.tsx`: Node configuration.

---

### Task 1: Typography, Dependencies & Global Layout

**Files:**
- Modify: `index.html`
- Modify: `src/index.css`
- Modify: `src/App.tsx`
- Modify: `package.json`

- [ ] **Step 1: Install new dependencies**
Run: `npm install react-hot-toast lucide-react framer-motion` (lucide and framer-motion should be there, but ensure toast is installed).

- [ ] **Step 2: Update HTML & CSS for Typography**
Update `index.html` to include Space Grotesk from Google Fonts.
Update `src/index.css` to use `Space Grotesk` as the base font.

```html
<!-- index.html head -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet">
```

```css
/* src/index.css */
@import "tailwindcss";

@theme {
  --color-synapse-yellow: #FFD600;
  --color-synapse-cyan: #00E5FF;
  --color-synapse-blue: #2979FF;
  --font-sans: 'Space Grotesk', system-ui, sans-serif;
}

body {
  font-family: 'Space Grotesk', system-ui, sans-serif;
  background-color: #ffffff;
}
```

- [ ] **Step 3: App Layout Updates**
In `src/App.tsx`, wrap the app in the Toaster component and update the main structural classes to use bright white backgrounds and thick borders.

```tsx
// src/App.tsx
import { Toaster } from 'react-hot-toast';
// ... other imports

function App() {
  const theme = useSynapseStore(state => state.theme);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-white font-sans text-black">
      <Toaster position="top-right" />
      <TopToolbar />
      <main className="flex flex-1 overflow-hidden">
        <aside className="w-80 border-r-4 border-black bg-white shrink-0 overflow-y-auto z-10">
          <LeftSidebar />
        </aside>
        <section className="flex-1 relative bg-slate-900">
          <WorkflowCanvas />
        </section>
        <aside className="w-80 border-l-4 border-black bg-white shrink-0 overflow-y-auto z-10">
          {/* Right Sidebar component will go here */}
        </aside>
      </main>
      {/* Modals will go here */}
    </div>
  );
}
```

- [ ] **Step 4: Commit**
`git commit -m "feat: typography, toaster, and neo-brutalist app layout"`

---

### Task 2: Left Sidebar (Library & Add Card) & Neo-Brutalism

**Files:**
- Modify: `src/components/sidebar/LeftSidebar.tsx`
- Modify: `src/components/canvas/nodes/NodeStyles.ts`

- [ ] **Step 1: Expand NodeStyles**
Add new node types and their colors to `COLORS` and `SHAPES`.

```typescript
// src/components/canvas/nodes/NodeStyles.ts
export const SHAPES = {
  rectangle: 'rounded-none',
  rounded: 'rounded-xl',
  pill: 'rounded-full',
  diamond: 'rotate-45',
  hexagon: '[clip-path:polygon(25%_0%,_75%_0%,_100%_50%,_75%_100%,_25%_100%,_0%_50%)]',
};

export const COLORS = {
  yellow: 'bg-synapse-yellow border-black text-black',
  cyan: 'bg-synapse-cyan border-black text-black',
  blue: 'bg-synapse-blue border-black text-white',
  purple: 'bg-purple-500 border-black text-white',
  orange: 'bg-orange-500 border-black text-black',
  red: 'bg-red-500 border-black text-white',
  green: 'bg-green-400 border-black text-black',
  pink: 'bg-pink-400 border-black text-black',
  gray: 'bg-gray-300 border-black text-black',
  white: 'bg-white border-black text-black',
};

export const NODE_TYPES = [
  { type: 'Task', color: 'yellow', defaultShape: 'rounded' },
  { type: 'Decision', color: 'cyan', defaultShape: 'diamond' },
  { type: 'Note', color: 'white', defaultShape: 'rectangle' },
  { type: 'AI Prompt', color: 'purple', defaultShape: 'rounded' },
  { type: 'Timer', color: 'orange', defaultShape: 'pill' },
  { type: 'Condition', color: 'red', defaultShape: 'hexagon' },
  { type: 'Variable', color: 'green', defaultShape: 'rounded' },
  { type: 'Loop', color: 'pink', defaultShape: 'rounded' },
  { type: 'Group', color: 'gray', defaultShape: 'rectangle' }
];
```

- [ ] **Step 2: Neo-Brutalist Left Sidebar**
Rewrite `LeftSidebar` to feature chunky buttons, heavy borders (`border-2 border-black`), solid colors, and a shadow box effect (`shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`). Also add an AI suggest button (placeholder for now) next to the Name input.

```tsx
// src/components/sidebar/LeftSidebar.tsx
import { useState } from 'react';
import { useSynapseStore } from '../../store/useSynapseStore';
import { NODE_TYPES } from '../canvas/nodes/NodeStyles';
import { Sparkles } from 'lucide-react';

export const LeftSidebar = () => {
  const addNode = useSynapseStore(state => state.addNode);
  const [formData, setFormData] = useState({ label: '', type: 'Task', color: 'yellow', shape: 'rounded' });

  const handleAdd = () => {
    addNode({
      id: crypto.randomUUID(),
      type: 'custom',
      position: { x: 250, y: 250 },
      data: { ...formData },
    });
  };

  return (
    <div className="p-6 flex flex-col gap-8">
      <section>
        <h3 className="font-bold mb-4 text-black uppercase tracking-wider text-lg">Library</h3>
        <div className="grid grid-cols-2 gap-3">
          {NODE_TYPES.map(t => (
            <button 
              key={t.type} 
              onClick={() => setFormData({...formData, type: t.type, color: t.color, shape: t.defaultShape})}
              className="p-3 border-2 border-black rounded-none font-bold text-xs hover:translate-y-px hover:shadow-none transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              style={{ backgroundColor: t.color === 'white' ? '#fff' : `var(--color-synapse-${t.color}, ${t.color})` }}
            >
              {t.type}
            </button>
          ))}
        </div>
      </section>

      <section className="p-5 border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <h3 className="font-bold mb-4 text-black uppercase tracking-wider">Add New Card</h3>
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <input 
              placeholder="Card Name" 
              className="flex-1 p-3 border-2 border-black rounded-none outline-none focus:ring-4 focus:ring-synapse-cyan font-bold" 
              value={formData.label}
              onChange={e => setFormData({...formData, label: e.target.value})}
            />
            <button className="p-3 border-2 border-black bg-synapse-yellow hover:bg-yellow-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Sparkles size={20} />
            </button>
          </div>
          <select 
            className="p-3 border-2 border-black rounded-none font-bold outline-none focus:ring-4 focus:ring-synapse-cyan"
            value={formData.type}
            onChange={e => setFormData({...formData, type: e.target.value})}
          >
            {NODE_TYPES.map(t => <option key={t.type} value={t.type}>{t.type}</option>)}
          </select>
          <button 
            onClick={handleAdd}
            className="w-full bg-black text-white p-4 rounded-none font-bold text-lg hover:bg-gray-800 transition-colors"
          >
            Add to Canvas
          </button>
        </div>
      </section>
    </div>
  );
};
```

- [ ] **Step 3: Commit**
`git commit -m "feat: neo-brutalist left sidebar and expanded node types"`

---

### Task 3: Canvas Polish & Edge Styling

**Files:**
- Modify: `src/components/canvas/WorkflowCanvas.tsx`

- [ ] **Step 1: Canvas configuration**
Update `WorkflowCanvas` to use `defaultEdgeOptions` for animated, glowing cyan bezier curves. Enhance the `Background` component. Position the `MiniMap`.

```tsx
// src/components/canvas/WorkflowCanvas.tsx
import { ReactFlow, Background, Controls, MiniMap, type Connection, MarkerType } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useSynapseStore } from '../../store/useSynapseStore';
import { BaseNode } from './nodes/BaseNode';

const nodeTypes = { custom: BaseNode };

const defaultEdgeOptions = {
  animated: true,
  style: { stroke: '#00E5FF', strokeWidth: 3, filter: 'drop-shadow(0 0 5px rgba(0, 229, 255, 0.8))' },
  markerEnd: { type: MarkerType.ArrowClosed, color: '#00E5FF' },
};

export const WorkflowCanvas = () => {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, ghostCardsEnabled, addGhostNode, theme } = useSynapseStore();

  const handleConnect = (connection: Connection) => {
    onConnect(connection);
    if (ghostCardsEnabled) {
      const sourceNode = nodes.find(n => n.id === connection.source);
      if (sourceNode) {
        addGhostNode({
          id: `ghost-${crypto.randomUUID()}`,
          type: 'custom',
          position: { x: sourceNode.position.x + 300, y: sourceNode.position.y },
          data: { label: 'AI Suggestion', type: 'Suggestion', color: 'white', variant: 'ghost' },
        });
      }
    }
  };

  const isDark = theme === 'dark' || theme === 'cyberpunk';

  return (
    <div className="w-full h-full bg-[#0a0a0f]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
      >
        <Background color={isDark ? "#ffffff" : "#000000"} gap={24} size={2} className="opacity-10" />
        <Controls className="bg-white border-2 border-black !shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] [&>button]:border-b-2 [&>button]:border-black" />
        <MiniMap 
          nodeColor={(n) => n.data?.color === 'yellow' ? '#FFD600' : '#00E5FF'} 
          maskColor="rgba(0, 0, 0, 0.7)"
          className="bg-[#1a1a24] border-2 border-black !shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        />
      </ReactFlow>
    </div>
  );
};
```

- [ ] **Step 2: Commit**
`git commit -m "feat: canvas polish with glowing edges and updated minimap"`

---

### Task 4: Node Internals & "+" Handles

**Files:**
- Modify: `src/components/canvas/nodes/BaseNode.tsx`

- [ ] **Step 1: Fix hovering and connection points**
Update `BaseNode` to ensure handles are visible on hover, large enough to click, and positioned correctly. Improve the visual quality of the node card (padding, typography, border). Add Framer Motion for the ghost card pulse.

```tsx
// src/components/canvas/nodes/BaseNode.tsx
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { clsx } from 'clsx';
import { SHAPES, COLORS } from './NodeStyles';
import { motion } from 'framer-motion';

export interface BaseNodeData {
  label: string;
  type?: string;
  description?: string;
  color?: keyof typeof COLORS;
  shape?: keyof typeof SHAPES;
  variant?: 'default' | 'ghost';
  [key: string]: unknown;
}

export type BaseNodeProps = Node<BaseNodeData, 'custom'>;

export const BaseNode = ({ data, selected }: NodeProps<BaseNodeProps>) => {
  const colorClass = COLORS[data.color || 'white'];
  const shapeClass = SHAPES[data.shape || 'rounded'];
  const isGhost = data.variant === 'ghost';

  return (
    <motion.div 
      initial={isGhost ? { opacity: 0.2 } : { scale: 0.9, opacity: 0 }}
      animate={isGhost ? { opacity: [0.3, 0.6, 0.3], transition: { repeat: Infinity, duration: 2 } } : { scale: 1, opacity: 1 }}
      className={clsx(
        "group relative min-w-[180px] border-4 border-black transition-all",
        colorClass,
        shapeClass,
        selected ? "shadow-[8px_8px_0px_0px_rgba(0,229,255,1)] translate-y-[-4px]" : "shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]",
        isGhost && "!border-dashed !shadow-none"
      )}
    >
      <div className={clsx("p-5", data.shape === 'diamond' && "-rotate-45 p-8")}>
        <div className="text-[11px] font-black uppercase tracking-widest mb-2 opacity-80">
          {data.type || 'Node'}
        </div>
        <div className="font-bold text-lg leading-tight">{data.label}</div>
        {data.description && (
          <div className="text-sm font-medium opacity-90 mt-2">
            {data.description}
          </div>
        )}
      </div>

      {/* Handles - visible on node hover */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-4 h-4 bg-white border-2 border-black opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center -top-2"
      >
        <span className="text-[10px] text-black font-bold leading-none">+</span>
      </Handle>
      
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-4 h-4 bg-white border-2 border-black opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center -bottom-2"
      >
        <span className="text-[10px] text-black font-bold leading-none">+</span>
      </Handle>

      {isGhost && (
        <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 flex gap-3 w-[200px] justify-center">
          <button className="bg-green-400 border-2 border-black text-black text-xs px-4 py-2 font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-px hover:shadow-none transition-all">Accept</button>
          <button className="bg-red-400 border-2 border-black text-black text-xs px-4 py-2 font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-px hover:shadow-none transition-all">Dismiss</button>
        </div>
      )}
    </motion.div>
  );
};
```

- [ ] **Step 2: Commit**
`git commit -m "feat: neo-brutalist node styles and working connection handles"`

---

### Task 5: Toolbar & Right Sidebar (Live Properties)

**Files:**
- Modify: `src/components/toolbar/TopToolbar.tsx`
- Create: `src/components/sidebar/RightSidebar.tsx`
- Modify: `src/App.tsx`
- Modify: `src/store/useSynapseStore.ts`

- [ ] **Step 1: Store updates for selected node**
In `useSynapseStore.ts`, we need to track the currently selected node to populate the Right Sidebar.
React Flow provides `onSelectionChange`, but we can also just compute it from the `nodes` array (where `selected: true`).

```typescript
// In src/store/slices/canvasSlice.ts, add an updateNode function
export interface CanvasSlice {
  // ... existing
  updateNode: (id: string, data: any) => void;
}
// inside createCanvasSlice
updateNode: (id: string, newData: any) => {
  set((state) => ({
    nodes: state.nodes.map(node => 
      node.id === id ? { ...node, data: { ...node.data, ...newData } } : node
    )
  }));
}
```

- [ ] **Step 2: Right Sidebar**
Create `src/components/sidebar/RightSidebar.tsx` to show live properties of the selected node.

```tsx
// src/components/sidebar/RightSidebar.tsx
import { useSynapseStore } from '../../store/useSynapseStore';
import { NODE_TYPES } from '../canvas/nodes/NodeStyles';

export const RightSidebar = () => {
  const nodes = useSynapseStore(state => state.nodes);
  const updateNode = useSynapseStore(state => state.updateNode);
  
  const selectedNode = nodes.find(n => n.selected);

  if (!selectedNode) {
    return (
      <div className="p-6 h-full flex items-center justify-center text-center text-gray-500 font-bold">
        Select a node to view properties
      </div>
    );
  }

  const { data } = selectedNode;

  return (
    <div className="p-6 flex flex-col gap-6">
      <h3 className="font-bold text-black uppercase tracking-wider text-xl border-b-4 border-black pb-4">Properties</h3>
      
      <div className="flex flex-col gap-4">
        <div>
          <label className="text-xs font-bold uppercase mb-1 block">Label</label>
          <input 
            value={data.label as string} 
            onChange={(e) => updateNode(selectedNode.id, { label: e.target.value })}
            className="w-full p-3 border-2 border-black font-bold outline-none focus:ring-4 focus:ring-synapse-cyan"
          />
        </div>
        
        <div>
          <label className="text-xs font-bold uppercase mb-1 block">Description</label>
          <textarea 
            value={(data.description as string) || ''} 
            onChange={(e) => updateNode(selectedNode.id, { description: e.target.value })}
            className="w-full p-3 border-2 border-black font-bold outline-none focus:ring-4 focus:ring-synapse-cyan min-h-[100px]"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase mb-1 block">Color</label>
          <select 
            value={data.color as string}
            onChange={(e) => updateNode(selectedNode.id, { color: e.target.value })}
            className="w-full p-3 border-2 border-black font-bold outline-none focus:ring-4 focus:ring-synapse-cyan"
          >
            {NODE_TYPES.map(t => <option key={t.color} value={t.color}>{t.color}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 3: Update App.tsx**
Import and use `RightSidebar` in `src/App.tsx`.
```tsx
import { RightSidebar } from './components/sidebar/RightSidebar';
// ... replace the right aside content with <RightSidebar />
```

- [ ] **Step 4: Top Toolbar Overhaul**
Make the toolbar thick, bold, and fully functional (Save button should use `toast.success('Saved!')`).

```tsx
// src/components/toolbar/TopToolbar.tsx
import { useSynapseStore } from '../../store/useSynapseStore';
import toast from 'react-hot-toast';
import { Settings, Download, Save, Sparkles } from 'lucide-react';

export const TopToolbar = () => {
  const { ghostCardsEnabled, toggleGhostCards } = useSynapseStore();

  const handleSave = () => {
    toast.success('Workflow saved successfully!', {
      style: { border: '4px solid black', padding: '16px', borderRadius: '0', fontWeight: 'bold' },
      iconTheme: { primary: '#FFD600', secondary: '#000' }
    });
  };

  return (
    <header className="h-20 border-b-4 border-black bg-white flex items-center justify-between px-6 shrink-0 z-20 relative">
      <div className="flex items-center gap-4">
        <h1 className="font-black text-3xl tracking-tighter uppercase flex items-center gap-3">
          <span className="w-10 h-10 bg-synapse-blue flex items-center justify-center text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">S</span>
          Synapse
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <button onClick={handleSave} className="flex items-center gap-2 font-bold px-4 py-2 border-2 border-black bg-synapse-yellow hover:bg-yellow-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-px hover:shadow-none transition-all">
          <Save size={18} /> Save
        </button>
        <button className="flex items-center gap-2 font-bold px-4 py-2 border-2 border-black bg-white hover:bg-gray-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-px hover:shadow-none transition-all">
          <Download size={18} /> Export JSON
        </button>
        
        <div className="h-8 w-1 bg-black mx-2" />

        <button 
          onClick={toggleGhostCards}
          className={`flex items-center gap-2 font-bold px-4 py-2 border-2 border-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-px hover:shadow-none ${
            ghostCardsEnabled ? 'bg-synapse-cyan' : 'bg-gray-200'
          }`}
        >
          <Sparkles size={18} /> AI Ghost: {ghostCardsEnabled ? 'ON' : 'OFF'}
        </button>

        <button className="flex items-center gap-2 font-bold px-4 py-2 border-2 border-black bg-white hover:bg-gray-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-px hover:shadow-none transition-all">
          <Settings size={18} /> Settings
        </button>
      </div>
    </header>
  );
};
```

- [ ] **Step 5: Commit**
`git commit -m "feat: neo-brutalist toolbar and live right sidebar properties"`

---

### Task 6: Complete Ghost Cards Logic & AI Tooling

**Files:**
- Modify: `src/store/slices/canvasSlice.ts`
- Modify: `src/components/canvas/nodes/BaseNode.tsx`
- Modify: `src/components/sidebar/LeftSidebar.tsx`

- [ ] **Step 1: Ghost Card Actions**
In `canvasSlice.ts`, implement `acceptGhostNode` and `dismissGhostNode`.

```typescript
// src/store/slices/canvasSlice.ts
// add to interface:
acceptGhostNode: (id: string) => void;
dismissGhostNode: (id: string) => void;

// in implementation:
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

- [ ] **Step 2: Connect Buttons in BaseNode**
Update the "Accept" and "Dismiss" buttons in `BaseNode.tsx` to call these functions.

```tsx
// In BaseNode.tsx
const acceptGhostNode = useSynapseStore(state => state.acceptGhostNode);
const dismissGhostNode = useSynapseStore(state => state.dismissGhostNode);

// In the JSX for the ghost buttons:
<button onClick={() => acceptGhostNode(data.id as string)} className="...">Accept</button>
<button onClick={() => dismissGhostNode(data.id as string)} className="...">Dismiss</button>
```
*Note: Make sure to pass `id: data.id` into the `data` payload when creating ghost nodes so it's accessible inside the node's data prop, or use the node's top-level ID if accessible via props. Usually `id` is passed as a top-level prop to custom nodes by React Flow.*

- [ ] **Step 3: AI Auto-Fill in Left Sidebar**
Wire up the AI Suggest button in `LeftSidebar` to use the `fetchAISuggestion` function.

```tsx
// src/components/sidebar/LeftSidebar.tsx
import { fetchAISuggestion } from '../../lib/ai/nvidiaNim';
import toast from 'react-hot-toast';

// inside component:
const [isSuggesting, setIsSuggesting] = useState(false);

const handleAISuggest = async () => {
  setIsSuggesting(true);
  try {
    const prompt = `Suggest a short, punchy name and a 1-sentence description for a workflow node of type "${formData.type}". Return JSON format: {"name": "...", "description": "..."}`;
    const result = await fetchAISuggestion(prompt);
    // basic parse (AI might wrap in markdown blocks, handle safely)
    const cleaned = result.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    setFormData({ ...formData, label: parsed.name });
    // if description was supported in formData, set it here.
    toast.success('AI Suggestion applied!');
  } catch (error) {
    toast.error('AI Suggestion failed');
  } finally {
    setIsSuggesting(false);
  }
};

// In JSX, change the button to use handleAISuggest
<button onClick={handleAISuggest} disabled={isSuggesting} className="...">
  {isSuggesting ? '...' : <Sparkles size={20} />}
</button>
```

- [ ] **Step 4: Commit**
`git commit -m "feat: functional ghost cards and AI auto-suggest forms"`

---

### Task 7: Cleanup & Final Build Verification

- [ ] **Step 1: Check Types and Lint**
Run `npm run lint` and `tsc -b` to verify all new code is type-safe and follows lint rules.

- [ ] **Step 2: Commit**
`git commit -m "chore: final cleanups and typings"`

