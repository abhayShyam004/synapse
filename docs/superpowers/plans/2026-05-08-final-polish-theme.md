# Final Polish & Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the final polish for Synapse, including a settings store, top toolbar, layout updates, and AI ghost cards.

**Architecture:** 
- Add `settingsSlice` to the Zustand store for theme and behavior preferences.
- Create a `TopToolbar` component to host global actions and settings.
- Update `App.tsx` layout to include the toolbar.
- Extend `canvasSlice` or `WorkflowCanvas` to handle "ghost node" generation upon connection.

**Tech Stack:** React, TypeScript, Zustand, React Flow (xyflow), Tailwind CSS.

---

### Task 1: Create Settings Slice

**Files:**
- Create: `src/store/slices/settingsSlice.ts`

- [ ] **Step 1: Define SettingsSlice interface and implementation**

```typescript
export interface SettingsSlice {
  theme: 'dark' | 'light' | 'cyberpunk';
  accentColor: string;
  ghostCardsEnabled: boolean;
  setTheme: (theme: 'dark' | 'light' | 'cyberpunk') => void;
  setAccentColor: (color: string) => void;
  toggleGhostCards: () => void;
}

export const createSettingsSlice = (
  set: (fn: (state: SettingsSlice) => Partial<SettingsSlice>) => void
): SettingsSlice => ({
  theme: 'dark',
  accentColor: '#0070F3',
  ghostCardsEnabled: true,
  setTheme: (theme) => set(() => ({ theme })),
  setAccentColor: (accentColor) => set(() => ({ accentColor })),
  toggleGhostCards: () => set((state) => ({ ghostCardsEnabled: !state.ghostCardsEnabled })),
});
```

- [ ] **Step 2: Initialize Settings in Main Store**

**Files:**
- Modify: `src/store/useSynapseStore.ts`

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createCanvasSlice } from './slices/canvasSlice';
import { createSettingsSlice } from './slices/settingsSlice';
import type { CanvasSlice } from './slices/canvasSlice';
import type { SettingsSlice } from './slices/settingsSlice';

type StoreState = CanvasSlice & SettingsSlice;

export const useSynapseStore = create<StoreState>()(
  persist(
    (set) => ({
      ...createCanvasSlice(set as any),
      ...createSettingsSlice(set as any),
    }),
    { name: 'synapse-storage' }
  )
);
```

- [ ] **Step 3: Commit changes**

```bash
git add src/store/slices/settingsSlice.ts src/store/useSynapseStore.ts
git commit -m "feat: add settings slice to store"
```

---

### Task 2: Implement Top Toolbar

**Files:**
- Create: `src/components/toolbar/TopToolbar.tsx`

- [ ] **Step 1: Create TopToolbar component**

```tsx
import { useSynapseStore } from '../../store/useSynapseStore';

export const TopToolbar = () => {
  const { theme, setTheme, toggleGhostCards, ghostCardsEnabled } = useSynapseStore();

  return (
    <header className="h-14 border-b bg-white dark:bg-slate-900 flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
      <div className="flex items-center gap-4">
        <h1 className="font-bold text-xl text-synapse-blue flex items-center gap-2">
          <span className="w-8 h-8 bg-synapse-blue rounded flex items-center justify-center text-white text-xs">S</span>
          Synapse
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <button className="text-xs font-bold px-3 py-1.5 border rounded hover:bg-slate-50 transition-colors">
          Save
        </button>
        <button className="text-xs font-bold px-3 py-1.5 border rounded hover:bg-slate-50 transition-colors text-synapse-blue border-synapse-blue/30 bg-synapse-blue/5">
          AI Suggest
        </button>
        
        <div className="h-6 w-px bg-slate-200 mx-2" />
        
        <select 
          value={theme}
          onChange={(e) => setTheme(e.target.value as any)}
          className="text-xs border rounded p-1 focus:ring-2 focus:ring-synapse-blue outline-none"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="cyberpunk">Cyberpunk</option>
        </select>

        <button 
          onClick={toggleGhostCards}
          className={`text-xs font-bold px-3 py-1.5 rounded border transition-all ${
            ghostCardsEnabled 
              ? 'bg-synapse-yellow/10 border-synapse-yellow text-amber-700' 
              : 'bg-slate-50 border-slate-200 text-slate-400'
          }`}
        >
          Ghost: {ghostCardsEnabled ? 'ON' : 'OFF'}
        </button>
      </div>
    </header>
  );
};
```

- [ ] **Step 2: Commit changes**

```bash
git add src/components/toolbar/TopToolbar.tsx
git commit -m "feat: implement TopToolbar component"
```

---

### Task 3: Update App Layout

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Integrate TopToolbar into App**

```tsx
import { WorkflowCanvas } from './components/canvas/WorkflowCanvas';
import { LeftSidebar } from './components/sidebar/LeftSidebar';
import { TopToolbar } from './components/toolbar/TopToolbar';
import { useSynapseStore } from './store/useSynapseStore';
import { clsx } from 'clsx';

function App() {
  const theme = useSynapseStore(state => state.theme);

  return (
    <div className={clsx(
      "flex flex-col h-screen w-screen overflow-hidden",
      theme === 'dark' ? "bg-slate-950 text-white dark" : "bg-white text-slate-900"
    )}>
      <TopToolbar />
      
      <main className="flex flex-1 overflow-hidden">
        <aside className={clsx(
          "w-64 border-r shrink-0 overflow-y-auto",
          theme === 'dark' ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200"
        )}>
          <LeftSidebar />
        </aside>
        
        <section className="flex-1 relative">
          <WorkflowCanvas />
        </section>
        
        <aside className={clsx(
          "w-64 border-l shrink-0",
          theme === 'dark' ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200"
        )} />
      </main>
    </div>
  );
}

export default App;
```

- [ ] **Step 2: Commit changes**

```bash
git add src/App.tsx
git commit -m "feat: integrate TopToolbar and basic theme support"
```

---

### Task 4: Implement Ghost Card Logic

**Files:**
- Modify: `src/store/slices/canvasSlice.ts`

- [ ] **Step 1: Update onConnect to trigger ghost node**

```typescript
// Add ghost node logic to onConnect
  onConnect: (connection: Connection) => {
    set((state: any) => {
      const newEdges = addEdge(connection, state.edges);
      
      // If ghost cards are enabled, add a suggested node
      if (state.ghostCardsEnabled && connection.targetHandle === null) {
        const targetNode = state.nodes.find((n: any) => n.id === connection.target);
        if (targetNode) {
          // Logic to add a ghost node nearby (simplification for placeholder)
          const ghostId = `ghost-${crypto.randomUUID()}`;
          const ghostNode = {
            id: ghostId,
            type: 'custom',
            position: { x: targetNode.position.x + 250, y: targetNode.position.y },
            data: { 
              label: 'AI Suggestion...', 
              type: 'GHOST', 
              description: 'Next probable step',
              color: 'white',
              variant: 'ghost'
            },
          };
          return { 
            edges: newEdges,
            nodes: [...state.nodes, ghostNode]
          };
        }
      }
      
      return { edges: newEdges };
    });
  },
```

- [ ] **Step 2: Commit changes**

```bash
git add src/store/slices/canvasSlice.ts
git commit -m "feat: implement ghost node generation on connect"
```

---

### Task 5: Final Verification

- [ ] **Step 1: Run dev server and verify visually**

Run: `npm run dev`
Verify:
1. Top Toolbar is visible and matches branding.
2. Theme toggle works (at least visually switches some classes).
3. Connecting two nodes spawns a "ghost node".
4. Ghost node has 40% opacity and dashed border.

- [ ] **Step 2: Run tests**

Run: `npm test`

- [ ] **Step 3: Build check**

Run: `npm run build`
