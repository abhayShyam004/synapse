# Synapse Design Specification
**Date:** 2026-05-08
**Status:** Approved

## 1. Overview
Synapse is a visual workflow planning system featuring an infinite canvas. It allows users to build, manage, and automate workflows using a rich node library, custom templates, and AI-driven suggestions powered by NVIDIA NIM.

## 2. Core Architecture
The application is built with **React + TypeScript**, utilizing a **Centralized State (Approach 1)** via **Zustand**.

### 2.1 State Management (`useSynapseStore`)
The store is divided into logic slices for maintainability:
- **Canvas Slice**: Manages `@xyflow/react` nodes and edges.
- **Library Slice**: Manages static app-default templates and user-created custom templates.
- **Variable Slice**: Global key-value registry for workflow-wide references.
- **History Slice**: Implements undo/redo using a snapshot stack.
- **Settings Slice**: Manages theme (Dark/Light/Cyberpunk), app accent colors, and AI behavior toggles.

### 2.2 Data Persistence
- **LocalStorage**: Auto-syncing of the store to `localStorage`.
- **Import/Export**: JSON-based serialization for sharing and backup.

## 3. Features & Implementation

### 3.1 Infinite Canvas (React Flow)
- **Controls**: Minimap, Zoom, Pan, Snap-to-Grid.
- **Custom Nodes**: A `BaseNode` component wrapper for consistent behavior (drag, resize, connection points).
- **Custom Edges**: Animated edges (Bezier, Straight, Flowing Dots) with smart routing.

### 3.2 Node Library & Creation
- **Static Templates**: Pre-defined nodes (Task, Decision, AI Prompt, etc.).
- **"Add New Card" Form**: Rich configuration (Name, Icon, Color, Shape) before adding to canvas.
- **Custom Templates**: Users can right-click/modal-save a configured node to save it as a template in their library.

### 3.3 AI Features (NVIDIA NIM)
- **Model**: `meta/llama-3.1-8b-instruct`
- **Ghost Cards**: 
  - Triggered by node connections or 4s idle.
  - Rendered with `opacity-40` and dashed borders.
  - Buttons: "Accept" (converts to real node) / "Dismiss".
- **AI Tools**: Auto-documenting flow, suggesting connections, and generating card metadata.

### 3.4 Variables System
- Sidebar management of variables.
- Support for `{{variable_name}}` syntax in node descriptions for live canvas display.

## 4. Visual Identity
- **Bold Branding**: Solid Yellow (#FFD600), Cyan (#00E5FF), Blue (#2979FF).
- **High Contrast**: White backgrounds for UI panels, dark futuristic background for the canvas.
- **Animations**: Framer Motion for all transitions and interactions.

## 5. Technical Stack
- **Frontend**: Vite + React + TypeScript
- **Styling**: Tailwind CSS + Framer Motion
- **Graph Engine**: React Flow (@xyflow/react)
- **State**: Zustand
- **AI**: NVIDIA NIM API (OpenAI-compatible)
- **Storage**: Browser LocalStorage
