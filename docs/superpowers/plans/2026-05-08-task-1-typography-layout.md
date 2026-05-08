# Task 1: Typography, Dependencies & Global Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Overhaul the typography and global layout to a neo-brutalist style with bold borders and high contrast.

**Architecture:** Update the root HTML for font loading, configure Tailwind theme with new fonts and colors, and restructure the main App component with thick black borders and responsive layout.

**Tech Stack:** React, Tailwind CSS, Lucide React, Framer Motion, React Hot Toast, Space Grotesk.

---

### Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install react-hot-toast**
Run: `npm install react-hot-toast`
Expected: `react-hot-toast` added to `dependencies`.

- [ ] **Step 2: Re-install lucide-react and framer-motion (optional but requested)**
Run: `npm install lucide-react framer-motion`
Expected: Packages updated if necessary.

- [ ] **Step 3: Commit**
```bash
git add package.json package-lock.json
git commit -m "chore: install ui dependencies"
```

### Task 2: Typography & Base Styles

**Files:**
- Modify: `index.html`
- Modify: `src/index.css`

- [ ] **Step 1: Update index.html for Google Fonts**
Add Space Grotesk links to `<head>`.

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet">
```

- [ ] **Step 2: Update src/index.css theme**
Update `@theme` and base styles.

```css
@import "tailwindcss";

@theme {
  --color-synapse-yellow: #FFD600;
  --color-synapse-cyan: #00E5FF;
  --color-synapse-blue: #2979FF;
  --font-sans: 'Space Grotesk', system-ui, sans-serif;
}

:root {
  font-family: 'Space Grotesk', system-ui, sans-serif;
  color-scheme: light;
}

body {
  margin: 0;
  padding: 0;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  background-color: #ffffff;
}

#root {
  width: 100%;
  height: 100vh;
}
```

- [ ] **Step 3: Commit**
```bash
git add index.html src/index.css
git commit -m "style: update typography to Space Grotesk"
```

### Task 3: App Layout Overhaul

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Update App.tsx layout and styling**
Wrap with `Toaster` and apply neo-brutalist border styles.

```tsx
import { Toaster } from 'react-hot-toast';
import { WorkflowCanvas } from './components/canvas/WorkflowCanvas';
import { LeftSidebar } from './components/sidebar/LeftSidebar';
import { TopToolbar } from './components/toolbar/TopToolbar';
import { useSynapseStore } from './store/useSynapseStore';
import { clsx } from 'clsx';

function App() {
  const theme = useSynapseStore(state => state.theme);

  return (
    <div className={clsx(
      "flex flex-col h-screen w-screen overflow-hidden font-sans",
      theme === 'dark' && "dark bg-slate-900 text-white",
      theme === 'light' && "bg-white text-black",
      theme === 'cyberpunk' && "bg-black text-cyan-400"
    )}>
      <Toaster position="top-right" />
      <TopToolbar />
      <main className="flex flex-1 overflow-hidden">
        <aside className="w-80 border-r-4 border-black bg-white shrink-0 overflow-y-auto z-10">
          <LeftSidebar />
        </aside>
        <section className="flex-1 relative bg-[#0a0a0f]">
          <WorkflowCanvas />
        </section>
        <aside className="w-80 border-l-4 border-black bg-white shrink-0 overflow-y-auto z-10 p-4">
          <p className="text-sm text-black font-bold">Properties</p>
        </aside>
      </main>
    </div>
  );
}

export default App;
```

- [ ] **Step 2: Verify build**
Run: `npm run build`
Expected: Build passes.

- [ ] **Step 3: Commit**
```bash
git add src/App.tsx
git commit -m "feat: overhaul app layout with neo-brutalist style"
```
