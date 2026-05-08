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
}

export const createCanvasSlice = (
  set: (fn: (state: CanvasSlice) => Partial<CanvasSlice>) => void
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
  addElementPopover: { isOpen: false, x: 0, y: 0 },
  metricsPopover: { isOpen: false },
  nodeSettingsPopover: { isOpen: false },
  isCanvasLocked: false,
  onNodesChange: (changes: NodeChange[]) => {
    set((state) => ({ nodes: applyNodeChanges(changes, state.nodes) }));
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    set((state) => ({ edges: applyEdgeChanges(changes, state.edges) }));
  },
  onConnect: (connection: Connection) => {
    set((state) => ({ edges: addEdge(connection, state.edges) }));
  },
  addNode: (node: Node) => {
    set((state) => ({ nodes: [...state.nodes, { ...node, data: { ...node.data, expanded: false } }] }));
  },
  addGhostNode: (node: Node) => {
    set((state) => ({ 
      nodes: [...state.nodes, { ...node, data: { ...node.data, variant: 'ghost', expanded: false } }] 
    }));
  },
  updateNode: (id: string, newData: Record<string, unknown>) => {
    set((state) => ({
      nodes: state.nodes.map(node => 
        node.id === id ? { ...node, data: { ...node.data, ...newData } } : node
      )
    }));
  },
  deleteNode: (id: string) => {
    set((state) => ({
      nodes: state.nodes.filter(n => n.id !== id),
      edges: state.edges.filter(e => e.source !== id && e.target !== id)
    }));
  },
  cloneNode: (id: string) => {
    set((state) => {
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
  setAddElementPopover: (data) => {
    set(() => ({ addElementPopover: data }));
  },
  setMetricsPopover: (isOpen) => set(() => ({ metricsPopover: { isOpen } })),
  setNodeSettingsPopover: (data) => set(() => ({ nodeSettingsPopover: data })),
  toggleCanvasLock: () => set((state) => ({ isCanvasLocked: !state.isCanvasLocked })),
});
