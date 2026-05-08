# Left Sidebar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the left sidebar with a node library and a form to add new nodes to the canvas.

**Architecture:**
- Create `src/components/sidebar/LeftSidebar.tsx` as a React component.
- Use `useSynapseStore` to access `addNode`.
- Integrate `LeftSidebar` into `src/App.tsx`.

**Tech Stack:** React, TypeScript, Zustand, Tailwind CSS.

---

### Task 1: Create LeftSidebar Component

**Files:**
- Create: `src/components/sidebar/LeftSidebar.tsx`

- [ ] **Step 1: Create the directory for the sidebar**
Run: `mkdir -p src/components/sidebar`

- [ ] **Step 2: Create LeftSidebar.tsx**

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
    // Optional: Reset form after adding
    setFormData({ label: '', type: 'Task', color: 'bg-white' });
  };

  return (
    <div className="p-4 flex flex-col gap-6">
      <section>
        <h3 className="font-bold mb-2 text-synapse-blue">Library</h3>
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
            className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-synapse-blue" 
            value={formData.label}
            onChange={e => setFormData({...formData, label: e.target.value})}
          />
          <select 
            className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-synapse-blue"
            value={formData.type}
            onChange={e => setFormData({...formData, type: e.target.value})}
          >
            <option>Task</option>
            <option>Decision</option>
            <option>Note</option>
          </select>
          <button 
            onClick={handleAdd}
            className="bg-synapse-blue text-white p-2 rounded font-bold hover:bg-blue-600 transition-colors"
          >
            Add to Canvas
          </button>
        </div>
      </section>
    </div>
  );
};
```

### Task 2: Integrate LeftSidebar into App.tsx

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Update App.tsx**

```tsx
import { WorkflowCanvas } from './components/canvas/WorkflowCanvas';
import { LeftSidebar } from './components/sidebar/LeftSidebar';

function App() {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-white">
      {/* Top Toolbar Placeholder */}
      <header className="h-14 border-b bg-white flex items-center px-4 shrink-0">
        <h1 className="font-bold text-xl text-synapse-blue">Synapse</h1>
      </header>
      
      <main className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-64 border-r bg-slate-50 shrink-0 overflow-y-auto">
          <LeftSidebar />
        </aside>
        
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

### Task 3: Verify and Commit

- [ ] **Step 1: Verify changes**
Check if the sidebar is visible and if adding a node works.

- [ ] **Step 2: Commit changes**

```bash
git add src/components/sidebar/LeftSidebar.tsx src/App.tsx
git commit -m "feat: left sidebar with node library and add form"
```
