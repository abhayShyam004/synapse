---
status: pending
priority: p1
dependencies: []
---

# UI Overhaul: 1:1 Reference Replication

- [ ] Update `src/index.css` to clean up root variables and themes.
- [ ] Update `src/App.tsx` layout structure (thin sidebar, hide right sidebar).
- [ ] Rebuild `TopToolbar.tsx` and `LeftSidebar.tsx` to match the exact elements in the image while cleanly embedding Undo/Redo, AI toggle, and Settings.
- [ ] Create `AddElementPopover.tsx` and integrate it into the canvas or layout.
- [ ] Update `WorkflowCanvas.tsx` (step-path edges, edge "+" buttons, dot background, minimap).
- [ ] Overhaul `BaseNode.tsx` and `NodeStyles.ts` to construct the multi-row "Stage" card design and handle ghost variants.
- [ ] Update Settings modal UI to be clean and minimal.
