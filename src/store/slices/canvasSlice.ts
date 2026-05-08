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
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
  addNode: (node: Node) => void;
  addGhostNode: (node: Node) => void;
  updateNode: (id: string, data: any) => void;
  acceptGhostNode: (id: string) => void;
  dismissGhostNode: (id: string) => void;
}

export const createCanvasSlice = (
  set: (fn: (state: CanvasSlice) => Partial<CanvasSlice>) => void
): CanvasSlice => ({
  nodes: [
    {
      id: 'test-1',
      type: 'custom',
      position: { x: 100, y: 100 },
      data: { 
        label: 'Custom Node', 
        type: 'TRIGGER', 
        description: 'This is a custom node test',
        color: 'yellow',
        shape: 'rounded'
      },
    }
  ],
  edges: [],
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
    set((state) => ({ nodes: [...state.nodes, node] }));
  },
  addGhostNode: (node: Node) => {
    set((state) => ({ 
      nodes: [...state.nodes, { ...node, data: { ...node.data, variant: 'ghost' } }] 
    }));
  },
  updateNode: (id: string, newData: any) => {
    set((state) => ({
      nodes: state.nodes.map(node => 
        node.id === id ? { ...node, data: { ...node.data, ...newData } } : node
      )
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
});
