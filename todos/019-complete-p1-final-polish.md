---
status: pending
priority: p1
dependencies: []
---

# UI Polish, Functional Wiring, and Rebranding

- [ ] Update `src/index.css` with `--color-brand-cyan` and `--color-brand-yellow`.
- [ ] Modify `src/store/slices/canvasSlice.ts` to add expandAllNodes, popover states (metrics, settings), toggleLock, delete/clone node functions.
- [ ] Configure `react-hot-toast` in `src/App.tsx`.
- [ ] Create `src/components/popovers/MetricsPopover.tsx` and `src/components/popovers/NodeSettingsPopover.tsx`.
- [ ] Update `src/components/toolbar/TopToolbar.tsx` (Rename to Synapse, wire Expand All, Metrics, Test Run, Publish, Settings).
- [ ] Update `src/components/sidebar/LeftSidebar.tsx` (Add lock icon, active cyan state, toast wirings).
- [ ] Update `src/components/canvas/edges/CustomEdge.tsx` (Cyan fill, white plus).
- [ ] Update `src/components/canvas/nodes/BaseNode.tsx` (Framer motion collapsible state, cyan active border, link to settings popover).
- [ ] Mount new popovers in `WorkflowCanvas.tsx`.
- [ ] Verify tests and build.
