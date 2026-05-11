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
import { supabase } from '../../lib/supabase';

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
  loadFromCloud: (id: string) => Promise<void>;
  saveToCloud: () => Promise<void>;
  saveHistory: () => void;
  undo: () => void;
  redo: () => void;
  currentWorkflowId: string | null;
  setCurrentWorkflowId: (id: string | null) => void;
  workflowName: string;
  setWorkflowName: (name: string) => void;
  isAIBuilderOpen: boolean;
  setAIBuilderOpen: (isOpen: boolean) => void;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  setSaveStatus: (status: CanvasSlice['saveStatus']) => void;
  dialog: {
    isOpen: boolean;
    title: string;
    message: string;
    type: 'confirm' | 'prompt';
    defaultValue?: string;
    onConfirm: (value?: string) => void;
  };
  openDialog: (data: Omit<CanvasSlice['dialog'], 'isOpen'>) => void;
  closeDialog: () => void;
}

export const createCanvasSlice = (
  set: (fn: (state: CanvasSlice) => Partial<CanvasSlice>) => void,
  get: () => CanvasSlice
): CanvasSlice => ({
  nodes: [],
  edges: [],
  past: [],
  future: [],
  addElementPopover: { isOpen: false, x: 0, y: 0 },
  metricsPopover: { isOpen: false },
  nodeSettingsPopover: { isOpen: false },
  isCanvasLocked: false,
  isSearchOpen: false,
  searchQuery: '',
  currentWorkflowId: null,
  workflowName: 'Untitled Workflow',
  isAIBuilderOpen: false,
  saveStatus: 'idle',
  setSaveStatus: (status) => set(() => ({ saveStatus: status })),
  setAIBuilderOpen: (isOpen) => set(() => ({ isAIBuilderOpen: isOpen })),
  dialog: {
    isOpen: false,
    title: '',
    message: '',
    type: 'confirm',
    onConfirm: () => {},
  },
  openDialog: (data) => set(() => ({ dialog: { ...data, isOpen: true } })),
  closeDialog: () => set((state) => ({ dialog: { ...state.dialog, isOpen: false } })),
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
        edges: previous.edges,
        saveStatus: 'idle'
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
        edges: next.edges,
        saveStatus: 'idle'
      };
    });
  },
  onNodesChange: (changes: NodeChange[]) => {
    set((state) => {
      const isSignificantChange = changes.some(c => c.type === 'remove' || c.type === 'add');
      const newState = { nodes: applyNodeChanges(changes, state.nodes), saveStatus: 'idle' as const };
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
  onEdgesChange: (changes: EdgeChange[]) => {
    set((state) => {
      const isSignificantChange = changes.some(c => c.type === 'remove' || c.type === 'add');
      const newState = { edges: applyEdgeChanges(changes, state.edges), saveStatus: 'idle' as const };
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
      return { edges: addEdge(connection, state.edges), saveStatus: 'idle' };
    });
  },
  addNode: (node: Node) => {
    set((state) => {
      state.saveHistory();
      const newNode = { ...node, data: { ...node.data, expanded: false } };
      let newEdges = [...state.edges];
      
      if (state.addElementPopover.edgeId) {
        const edgeToSplit = state.edges.find(e => e.id === state.addElementPopover.edgeId);
        if (edgeToSplit) {
          newEdges = newEdges.filter(e => e.id !== state.addElementPopover.edgeId);
          newEdges.push(
            { id: `e-${edgeToSplit.source}-${newNode.id}`, source: edgeToSplit.source, target: newNode.id, type: 'custom' },
            { id: `e-${newNode.id}-${edgeToSplit.target}`, source: newNode.id, target: edgeToSplit.target, type: 'custom' }
          );
        }
      }

      return { nodes: [...state.nodes, newNode], edges: newEdges, saveStatus: 'idle' };
    });
  },
  addGhostNode: (node: Node) => {
    set((state) => {
      state.saveHistory();
      return { 
        nodes: [...state.nodes, { ...node, data: { ...node.data, variant: 'ghost', expanded: false } }],
        saveStatus: 'idle'
      };
    });
  },
  updateNode: (id: string, newData: Record<string, unknown>) => {
    set((state) => {
      state.saveHistory();
      return {
        nodes: state.nodes.map(node => 
          node.id === id ? { ...node, data: { ...node.data, ...newData } } : node
        ),
        saveStatus: 'idle'
      };
    });
  },
  deleteNode: (id: string) => {
    set((state) => {
      state.saveHistory();
      return {
        nodes: state.nodes.filter(n => n.id !== id),
        edges: state.edges.filter(e => e.source !== id && e.target !== id),
        saveStatus: 'idle'
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
      return { nodes: [...state.nodes, newNode], saveStatus: 'idle' };
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
          newEdges.push({
            id: `e-${sourceNodeId}-${id}`,
            source: sourceNodeId,
            target: id,
            type: 'custom'
          });
          
          ghostNode.position = {
            x: sourceNode.position.x,
            y: sourceNode.position.y + 150
          };
        }
      }

      return {
        nodes: state.nodes.map(n => n.id === id ? { ...n, data: { ...n.data, variant: 'default' } } : n),
        edges: newEdges,
        saveStatus: 'idle'
      };
    });
  },
  dismissGhostNode: (id: string) => {
    set((state) => ({
      nodes: state.nodes.filter(n => n.id !== id),
      edges: state.edges.filter(e => e.target !== id && e.source !== id),
      saveStatus: 'idle'
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
        set(() => ({ nodes: data.nodes, edges: data.edges, workflowName: data.name || 'Imported Workflow', saveStatus: 'idle' }));
      }
    } catch (e) {
      console.error("Failed to parse workflow JSON", e);
    }
  },
  exportWorkflow: () => {
    const { nodes, edges, workflowName } = get();
    return JSON.stringify({ nodes, edges, name: workflowName }, null, 2);
  },
  setCurrentWorkflowId: (id) => set(() => ({ currentWorkflowId: id })),
  setWorkflowName: (name) => set(() => ({ workflowName: name, saveStatus: 'idle' })),
  resetWorkflow: () => {
    set(() => ({ 
      nodes: [], 
      edges: [], 
      past: [], 
      future: [],
      workflowName: 'Untitled Workflow',
      addElementPopover: { isOpen: false, x: 0, y: 0 },
      currentWorkflowId: null,
      saveStatus: 'idle'
    }));
  },
  loadWorkflow: (id: string) => {
    const saved = localStorage.getItem(`synapse-workflow-${id}`);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        set(() => ({ 
          nodes: data.nodes || [], 
          edges: data.edges || [], 
          workflowName: data.name || 'Untitled Workflow',
          past: [], 
          future: [],
          currentWorkflowId: id,
          saveStatus: 'saved'
        }));
      } catch (e) {
        console.error("Failed to load workflow", e);
      }
    } else {
      get().resetWorkflow();
    }
  },
  loadFromCloud: async (id: string) => {
    set(() => ({ saveStatus: 'saving' }));
    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) {
      console.error("Failed to load from cloud", error);
      set(() => ({ saveStatus: 'error' }));
      return;
    }

    set(() => ({
      nodes: data.nodes || [],
      edges: data.edges || [],
      workflowName: data.name || 'Untitled Workflow',
      currentWorkflowId: id,
      saveStatus: 'saved',
      past: [],
      future: []
    }));

    if ((set as any).setVariables && data.variables) {
      (set as any).setVariables(data.variables);
    }
  },
  saveToCloud: async () => {
    const { currentWorkflowId, nodes, edges, workflowName } = get();
    if (!currentWorkflowId) return;

    const state = get() as any;
    const variables = state.variables || [];
    const userId = state.user?.id;

    if (!userId) {
      console.warn("Cannot save to cloud: No user ID found");
      return;
    }

    set(() => ({ saveStatus: 'saving' }));

    const { error } = await supabase
      .from('workflows')
      .upsert({
        id: currentWorkflowId,
        user_id: userId,
        name: workflowName,
        nodes,
        edges,
        variables,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error("Failed to save to cloud", error);
      set(() => ({ saveStatus: 'error' }));
    } else {
      set(() => ({ saveStatus: 'saved' }));
    }
  },});