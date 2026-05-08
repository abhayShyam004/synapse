# Left Sidebar & Neo-Brutalism Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a neo-brutalist Left Sidebar with a library of node types and an "Add New Card" form, while expanding the node styles to support more variety.

**Architecture:** Update `NodeStyles.ts` with more shapes and colors using Tailwind classes. Rewrite `LeftSidebar.tsx` using neo-brutalist design principles (thick borders, heavy shadows, vibrant colors).

**Tech Stack:** React, Tailwind CSS, Lucide React, Zustand (via `useSynapseStore`).

---

### Task 1: Expand NodeStyles

**Files:**
- Modify: `src/components/canvas/nodes/NodeStyles.ts`

- [ ] **Step 1: Update SHAPES, COLORS, and add NODE_TYPES**

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

- [ ] **Step 2: Commit changes**

```bash
git add src/components/canvas/nodes/NodeStyles.ts
git commit -m "feat: expand node styles and define node types"
```

### Task 2: Neo-Brutalist Left Sidebar

**Files:**
- Modify: `src/components/sidebar/LeftSidebar.tsx`

- [ ] **Step 1: Rewrite LeftSidebar with Neo-Brutalist styling and node library**

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
    // Reset form after adding
    setFormData({ label: '', type: 'Task', color: 'yellow', shape: 'rounded' });
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
              className="p-3 border-2 border-black rounded-none font-bold text-xs hover:translate-y-px hover:shadow-none transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-left"
              style={{ 
                backgroundColor: t.color === 'white' 
                  ? '#fff' 
                  : t.color === 'yellow'
                  ? 'var(--color-synapse-yellow)'
                  : t.color === 'cyan'
                  ? 'var(--color-synapse-cyan)'
                  : t.color === 'blue'
                  ? 'var(--color-synapse-blue)'
                  : t.color // fallback for hex or tailwind named colors
              }}
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
            onChange={e => {
              const selectedType = NODE_TYPES.find(t => t.type === e.target.value);
              setFormData({
                ...formData, 
                type: e.target.value,
                color: selectedType?.color || 'white',
                shape: selectedType?.defaultShape || 'rounded'
              });
            }}
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

- [ ] **Step 2: Commit changes**

```bash
git add src/components/sidebar/LeftSidebar.tsx
git commit -m "feat: neo-brutalist left sidebar with node library"
```

### Task 3: Verification & Final Polish

**Files:**
- N/A

- [ ] **Step 1: Verify the build**

Run: `npm run build`
Expected: SUCCESS

- [ ] **Step 2: Run linting**

Run: `npm run lint` (if available) or `npx eslint src`
Expected: No major errors in modified files.
