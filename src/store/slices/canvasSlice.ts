import { addEdge, applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
import type { 
  Node, 
  Edge, 
  Connection, 
  OnNodesChange, 
  OnEdgesChange, 
  NodeChange, 
  EdgeChange 
} from '@xyflow/react';

export interface CanvasSlice {
  nodes: Node[];
  edges: Edge[];
  past: { nodes: Node[], edges: Edge[] }[];
  future: { nodes: Node[], edges: Edge[] }[];
  addElementPopover: { isOpen: boolean; x: number; y: number; edgeId?: string };
  metricsPopover: { isOpen: boolean };
  nodeSettingsPopover: { isOpen: boolean; nodeId?: string };
  isCanvasLocked: boolean;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
  addNode: (node: Node) => void;
  addGhostNode: (node: Node) => void;
  updateNode: (id: string, data: Record<string, unknown>) => void;
  deleteNode: (id: string) => void;
  cloneNode: (id: string) => void;
  expandAllNodes: (expand: boolean) => void;
  acceptGhostNode: (id: string) => void;
  dismissGhostNode: (id: string) => void;
  setAddElementPopover: (data: { isOpen: boolean; x: number; y: number; edgeId?: string }) => void;
  setMetricsPopover: (isOpen: boolean) => void;
  setNodeSettingsPopover: (data: { isOpen: boolean; nodeId?: string }) => void;
  toggleCanvasLock: () => void;
  isSearchOpen: boolean;
  searchQuery: string;
  setSearchOpen: (isOpen: boolean) => void;
  setSearchQuery: (query: string) => void;
  importWorkflow: (json: string) => void;
  exportWorkflow: () => string;
  resetWorkflow: () => void;
  loadWorkflow: (id: string) => void;
  saveHistory: () => void;
  undo: () => void;
  redo: () => void;
  currentWorkflowId: string | null;
  setCurrentWorkflowId: (id: string | null) => void;
}

export const createCanvasSlice = (
  set: (fn: (state: CanvasSlice) => Partial<CanvasSlice>) => void,
  get: () => CanvasSlice
): CanvasSlice => ({
  nodes: [
    {
      id: 'test-1',
      type: 'custom',
      position: { x: 250, y: 100 },
      data: { 
        label: 'Audience Segment', 
        type: 'Stage 1', 
        description: '3 Triggers',
        color: 'gray',
        shape: 'rounded',
        expanded: false
      },
    }
  ],
  edges: [],
  past: [],
  future: [],
  addElementPopover: { isOpen: false, x: 0, y: 0 },
  metricsPopover: { isOpen: false },
  nodeSettingsPopover: { isOpen: false },
  isCanvasLocked: false,
  isSearchOpen: false,
  searchQuery: '',
  saveHistory: () => {
    set((state) => ({
      past: [...state.past, { nodes: state.nodes, edges: state.edges }].slice(-50),
      future: []
    }));
  },
  undo: () => {
    set((state) => {
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      const newPast = state.past.slice(0, -1);
      return {
        past: newPast,
        future: [{ nodes: state.nodes, edges: state.edges }, ...state.future],
        nodes: previous.nodes,
        edges: previous.edges
      };
    });
  },
  redo: () => {
    set((state) => {
      if (state.future.length === 0) return state;
      const next = state.future[0];
      const newFuture = state.future.slice(1);
      return {
        past: [...state.past, { nodes: state.nodes, edges: state.edges }],
        future: newFuture,
        nodes: next.nodes,
        edges: next.edges
      };
    });
  },
  onNodesChange: (changes: NodeChange[]) => {
    set((state) => {
      const isSignificantChange = changes.some(c => c.type === 'remove' || c.type === 'add');
      const newState = { nodes: applyNodeChanges(changes, state.nodes) };
      if (isSignificantChange) {
        return {
          ...newState,
          past: [...state.past, { nodes: state.nodes, edges: state.edges }].slice(-50),
          future: []
        };
      }
      // For position changes (dragging), wait until drag ends to save history, 
      // or rely on a specific hook. For now, we only save history on add/remove automatically.
      return newState;
    });
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    set((state) => {
      const isSignificantChange = changes.some(c => c.type === 'remove' || c.type === 'add');
      const newState = { edges: applyEdgeChanges(changes, state.edges) };
      if (isSignificantChange) {
        return {
          ...newState,
          past: [...state.past, { nodes: state.nodes, edges: state.edges }].slice(-50),
          future: []
        };
      }
      return newState;
    });
  },
  onConnect: (connection: Connection) => {
    set((state) => {
      state.saveHistory();
      return { edges: addEdge(connection, state.edges) };
    });
  },
  addNode: (node: Node) => {
    set((state) => {
      state.saveHistory();
      const newNode = { ...node, data: { ...node.data, expanded: false } };
      let newEdges = [...state.edges];
      
      // If we are adding via an edge (edge splitting)
      if (state.addElementPopover.edgeId) {
        const edgeToSplit = state.edges.find(e => e.id === state.addElementPopover.edgeId);
        if (edgeToSplit) {
          // Remove old edge
          newEdges = newEdges.filter(e => e.id !== state.addElementPopover.edgeId);
          // Add two new edges
          newEdges.push(
            { id: `e-${edgeToSplit.source}-${newNode.id}`, source: edgeToSplit.source, target: newNode.id, type: 'custom' },
            { id: `e-${newNode.id}-${edgeToSplit.target}`, source: newNode.id, target: edgeToSplit.target, type: 'custom' }
          );
        }
      }

      return { nodes: [...state.nodes, newNode], edges: newEdges };
    });
  },
  addGhostNode: (node: Node) => {
    set((state) => {
      state.saveHistory();
      return { 
        nodes: [...state.nodes, { ...node, data: { ...node.data, variant: 'ghost', expanded: false } }] 
      };
    });
  },
  updateNode: (id: string, newData: Record<string, unknown>) => {
    set((state) => {
      state.saveHistory();
      return {
        nodes: state.nodes.map(node => 
          node.id === id ? { ...node, data: { ...node.data, ...newData } } : node
        )
      };
    });
  },
  deleteNode: (id: string) => {
    set((state) => {
      state.saveHistory();
      return {
        nodes: state.nodes.filter(n => n.id !== id),
        edges: state.edges.filter(e => e.source !== id && e.target !== id)
      };
    });
  },
  cloneNode: (id: string) => {
    set((state) => {
      state.saveHistory();
      const nodeToClone = state.nodes.find(n => n.id === id);
      if (!nodeToClone) return state;
      const newNode = {
        ...nodeToClone,
        id: crypto.randomUUID(),
        position: { x: nodeToClone.position.x + 50, y: nodeToClone.position.y + 50 },
        selected: false,
      };
      return { nodes: [...state.nodes, newNode] };
    });
  },
  expandAllNodes: (expand: boolean) => {
    set((state) => ({
      nodes: state.nodes.map(node => ({ ...node, data: { ...node.data, expanded: expand } }))
    }));
  },
  acceptGhostNode: (id: string) => {
    set((state) => {
      const ghostNode = state.nodes.find(n => n.id === id);
      if (!ghostNode) return state;

      const sourceNodeId = ghostNode.data.sourceNodeId as string | undefined;
      let newEdges = [...state.edges];

      if (sourceNodeId) {
        const sourceNode = state.nodes.find(n => n.id === sourceNodeId);
        if (sourceNode) {
          // Create connecting edge
          newEdges.push({
            id: `e-${sourceNodeId}-${id}`,
            source: sourceNodeId,
            target: id,
            type: 'custom'
          });
          
          // Ensure position is correct (source Y + 150)
          ghostNode.position = {
            x: sourceNode.position.x,
            y: sourceNode.position.y + 150
          };
        }
      }

      return {
        nodes: state.nodes.map(n => n.id === id ? { ...n, data: { ...n.data, variant: 'default' } } : n),
        edges: newEdges
      };
    });
  },
  dismissGhostNode: (id: string) => {
    set((state) => ({
      nodes: state.nodes.filter(n => n.id !== id),
      edges: state.edges.filter(e => e.target !== id && e.source !== id)
    }));
  },
  setAddElementPopover: (data) => {
    set(() => ({ addElementPopover: data }));
  },
  setMetricsPopover: (isOpen) => set(() => ({ metricsPopover: { isOpen } })),
  setNodeSettingsPopover: (data) => set(() => ({ nodeSettingsPopover: data })),
  toggleCanvasLock: () => set((state) => ({ isCanvasLocked: !state.isCanvasLocked })),
  setSearchOpen: (isOpen) => set(() => ({ isSearchOpen: isOpen, searchQuery: isOpen ? get().searchQuery : '' })),
  setSearchQuery: (query) => set(() => ({ searchQuery: query })),
  importWorkflow: (json) => {
    try {
      const data = JSON.parse(json);
      if (data.nodes && data.edges) {
        set(() => ({ nodes: data.nodes, edges: data.edges }));
      }
    } catch (e) {
      console.error("Failed to parse workflow JSON", e);
    }
  },
  exportWorkflow: () => {
    const { nodes, edges } = get();
    return JSON.stringify({ nodes, edges }, null, 2);
  },
  currentWorkflowId: null,
  setCurrentWorkflowId: (id) => set(() => ({ currentWorkflowId: id })),
  resetWorkflow: () => {
    set(() => ({ 
      nodes: [], 
      edges: [], 
      past: [], 
      future: [],
      addElementPopover: { isOpen: false, x: 0, y: 0 },
    }));
  },
  loadWorkflow: (id: string) => {
    const saved = localStorage.getItem(`synapse-workflow-${id}`);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        set(() => ({ nodes: data.nodes, edges: data.edges, past: [], future: [] }));
      } catch (e) {
        console.error("Failed to load workflow", e);
      }
    } else {
      get().resetWorkflow();
    }
  }
});
