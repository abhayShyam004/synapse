import { ReactFlow, Background, Controls, MiniMap, type Connection, BackgroundVariant, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useSynapseStore } from '../../store/useSynapseStore';
import { BaseNode } from './nodes/BaseNode';
import { CustomEdge } from './edges/CustomEdge';
import { AddElementPopover } from '../popovers/AddElementPopover';
import { MetricsPopover } from '../popovers/MetricsPopover';
import { NodeSettingsPopover } from '../popovers/NodeSettingsPopover';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';

const nodeTypes = { custom: BaseNode };
const edgeTypes = { custom: CustomEdge };

const defaultEdgeOptions = {
  type: 'custom',
  animated: false,
};

export const WorkflowCanvas = () => {
  const { 
    nodes, edges, onNodesChange, onEdgesChange, onConnect, 
    isCanvasLocked, 
    undo, redo, deleteNode,
    snapToGrid, showMinimap, canvasBackground,
    searchQuery, setSearchOpen, setAddElementPopover
  } = useSynapseStore();

  const { fitView } = useReactFlow();
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number } | null>(null);

  useEffect(() => {
    fitView();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if ((e.key === 'Backspace' || e.key === 'Delete') && !isCanvasLocked) {
        const selectedNodes = nodes.filter(n => n.selected);
        if (selectedNodes.length > 0) {
          selectedNodes.forEach(n => deleteNode(n.id));
        }
      }

      if (e.key === 'Escape') {
        setSearchOpen(false);
        setContextMenu(null);
      }
      
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
          e.preventDefault();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
        } else if (e.key === 'y') {
          e.preventDefault();
          redo();
        } else if (e.key === 's') {
          e.preventDefault();
          toast.success('Synapse saved manually');
        } else if (e.key === 'd') {
          e.preventDefault();
          const selectedNode = nodes.find(n => n.selected);
          if (selectedNode) {
            const { cloneNode } = useSynapseStore.getState();
            cloneNode(selectedNode.id);
            toast.success('Node duplicated');
          }
        } else if (e.key === 'F' && e.shiftKey) {
          e.preventDefault();
          fitView();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nodes, isCanvasLocked, deleteNode, undo, redo, fitView, setSearchOpen]);

  const handleConnect = async (connection: Connection) => {
    onConnect(connection);
  };

  const filteredNodes = nodes.filter(n => 
    !searchQuery || (n.data.label as string || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onPaneContextMenu = (event: React.MouseEvent | MouseEvent) => {
    event.preventDefault();
    if ('clientX' in event) {
      setContextMenu({ x: event.clientX, y: event.clientY });
    }
  };

  const handleAddNodeFromContext = () => {
    if (contextMenu) {
      setAddElementPopover({
        isOpen: true,
        x: contextMenu.x,
        y: contextMenu.y,
      });
      setContextMenu(null);
    }
  };

  const ACCENT_COLORS_MAP = {
    cyan: '#06B6D4',
    amber: '#F59E0B',
    violet: '#7C3AED',
    rose: '#F43F5E',
    emerald: '#10B981',
    blue: '#3B82F6',
    orange: '#F97316',
    pink: '#EC4899',
  };

  const accentColor = useSynapseStore(state => state.accentColor);
  const currentAccentHex = (ACCENT_COLORS_MAP as any)[accentColor] || '#06B6D4';

  return (
    <div className="w-full h-full relative group/canvas" style={{ backgroundColor: '#F3F4F6' }} onClick={() => setContextMenu(null)}>
      <ReactFlow
        nodes={filteredNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onPaneContextMenu={onPaneContextMenu}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        nodesDraggable={!isCanvasLocked}
        nodesConnectable={!isCanvasLocked}
        elementsSelectable={!isCanvasLocked}
        deleteKeyCode={['Backspace', 'Delete']}
        snapToGrid={snapToGrid}
        snapGrid={[20, 20]}
        fitView
        style={{ backgroundColor: '#F3F4F6' }}
      >
        {canvasBackground !== 'none' && (
          <Background 
            color={currentAccentHex}
            style={{ opacity: 0.4 }}
            gap={24} 
            size={2.5} 
            variant={canvasBackground === 'dots' ? BackgroundVariant.Dots : BackgroundVariant.Lines} 
          />
        )}
        <Controls 
          showInteractive={!isCanvasLocked}
          className="bg-white border border-gray-200 shadow-sm [&>button]:border-b [&>button]:border-gray-100 rounded-md overflow-hidden" 
        />
        {showMinimap && (
          <MiniMap 
            nodeColor="#9CA3AF" 
            maskColor="rgba(243, 244, 246, 0.7)"
            className="bg-white border border-gray-200 shadow-sm rounded-md overflow-hidden"
            position="bottom-right"
          />
        )}
      </ReactFlow>

      {/* Empty State Overlay */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setAddElementPopover({ isOpen: true, x: window.innerWidth / 2, y: window.innerHeight / 2 });
            }}
            className="w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-md hover:scale-110 active:scale-95 transition-all cursor-pointer pointer-events-auto"
            style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}
          >
            <Plus size={48} strokeWidth={2.5} />
          </button>
          <h2 className="text-xl font-bold text-gray-700 pointer-events-none">Add your first node</h2>
          <p className="text-base text-gray-400 mt-2 pointer-events-none">Click the + button or right-click to get started</p>
        </div>
      )}
      
      <AddElementPopover />

      {/* Small Context Menu */}
      {contextMenu && (
        <div 
          className="absolute z-50 bg-white border border-gray-200 shadow-xl rounded-md py-1 min-w-[140px]"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            onClick={handleAddNodeFromContext}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <Plus size={14} className="text-[var(--accent)]" /> Add Node
          </button>
        </div>
      )}

      <MetricsPopover />
      <NodeSettingsPopover />
    </div>
  );
};
