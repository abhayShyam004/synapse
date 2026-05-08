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
});
