Build a complete web application called "Synapse" — a visual workflow planning system with an infinite canvas. Use React + TypeScript + React Flow + Zustand + Tailwind CSS + Framer Motion. No backend needed for MVP — save/load via localStorage as JSON.

---

BRANDING & THEME:
- App name: Synapse
- Outside the canvas: bright, bold UI — solid Yellow (#FFD600), Cyan (#00E5FF), Blue (#2979FF), white backgrounds, high contrast
- Canvas: dark futuristic by default (dot-grid, dark bg)
- Settings panel lets user change canvas background, grid style, colors, effects
- Settings also lets user switch overall app theme colors

---

LAYOUT:
- Left Sidebar: Node library with detailed "Add New Card" section (fields: name, description, type, color, icon, tags — then click to add to canvas). Also has Variables panel.
- Top Toolbar: Save, Undo/Redo, Run, Export JSON, AI Tools button, Settings
- Right Sidebar: Selected node properties / validation / history
- Canvas: center, infinite, zoomable, pannable
- Bottom: minimap, zoom controls, layer controls

---

INFINITE CANVAS:
- React Flow as the core
- Infinite pan + zoom
- Dot-grid background (dark by default)
- Snap-to-grid
- Minimap navigator
- Smooth animations via Framer Motion
- Canvas color/effect options in Settings: dark, light, cyberpunk, minimal, custom color

---

NODES / CARDS:
Types: Task, Decision, Condition, Variable, AI Prompt, Timer, Group, Loop, Note

Each card:
- Freely draggable anywhere on canvas (hold and drag)
- Resizable
- Has a small subtle "+" symbol at each connection point (input/output ends) — only visible on hover
- Clicking "+" starts a new connection drag
- Clicking the card body opens a popup modal with card settings:
  - Name
  - Description
  - Color picker
  - Shape selector (rectangle, rounded, diamond, hexagon, pill)
  - Icon picker
  - Priority
  - Tags
  - Input/output limits
  - Lock / Collapse / Clone / Delete

---

CONNECTIONS / EDGES:
- Fluid, animated edges
- User can choose edge style in Settings:
  - Bezier curves (default)
  - Straight with rounded joints
  - Animated flowing dots
- Colored by type
- Dashed for conditional paths
- Labels on edges
- Draggable — user can grab and reroute edges easily
- Smart routing to avoid overlaps

---

GHOST CARDS (AI Suggestions):
- Trigger 1: After user connects two nodes, AI suggests a next logical node as a ghost card
- Trigger 2: After 4–5 seconds of canvas inactivity, AI suggests a relevant next step
- Ghost cards appear semi-transparent (opacity ~0.4), dashed border, labeled "Suggested"
- Hovering shows "Accept" and "Dismiss" buttons
- Accepting converts it to a real card

---

AI FEATURES (NVIDIA NIM API):
- Model: meta/llama-3.1-8b-instruct (fast)
- Base URL: https://integrate.api.nvidia.com/v1
- API key: read from import.meta.env.VITE_NVIDIA_NIM_API_KEY
- AI can:
  1. Suggest card name + description when adding a new card (button: "AI Suggest")
  2. Ghost card suggestions (name, type, description) triggered by connection or idle
  3. Suggest connections between existing nodes ("AI: Suggest Links" button in toolbar)
  4. Auto-document the entire flow (toolbar button)
- All AI calls: POST to OpenAI-compatible /v1/chat/completions endpoint
- Show loading spinner during AI calls
- Handle API errors gracefully with toast notifications

---

VARIABLES SYSTEM:
- Global variables panel in left sidebar
- Add key-value pairs
- Variables can be referenced inside node descriptions
- Live display on canvas as small Variable nodes

---

DATA:
- Full workflow stored as: { nodes: [], edges: [], variables: [] }
- Save to localStorage on every change
- Export as JSON file
- Import JSON to restore workflow

---

SETTINGS PANEL (modal):
- Canvas theme: Dark / Light / Cyberpunk / Minimal / Custom
- Canvas grid: Dots / Lines / None
- Edge style: Bezier / Straight / Flowing Dots
- App accent color: Yellow / Cyan / Blue / Custom
- AI behavior toggles: ghost cards on/off, idle suggestion on/off

---

STACK SUMMARY:
- React + TypeScript
- React Flow (@xyflow/react)
- Zustand for state
- Tailwind CSS
- Framer Motion
- No backend, localStorage only
- NVIDIA NIM via fetch (OpenAI-compatible)

---

