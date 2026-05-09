import { ReactFlow, Background, Controls, MiniMap, type Connection, BackgroundVariant, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useSynapseStore } from '../../store/useSynapseStore';
import { BaseNode } from './nodes/BaseNode';
import { CustomEdge } from './edges/CustomEdge';
import { AddElementPopover } from '../popovers/AddElementPopover';
import { MetricsPopover } from '../popovers/MetricsPopover';
import { NodeSettingsPopover } from '../popovers/NodeSettingsPopover';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

const nodeTypes = { custom: BaseNode };
const edgeTypes = { custom: CustomEdge };

const defaultEdgeOptions = {
  type: 'custom',
  animated: false,
};

export const WorkflowCanvas = () => {
  const { 
    nodes, edges, onNodesChange, onEdgesChange, onConnect, 
    ghostCardsEnabled, addGhostNode, isCanvasLocked, 
    undo, redo, deleteNode,
    snapToGrid, showMinimap, canvasBackground, canvasDotColor,
    searchQuery, setSearchOpen
  } = useSynapseStore();

  const { fitView } = useReactFlow();

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
          toast.success('Workflow saved manually');
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
  }, [nodes, isCanvasLocked, deleteNode, undo, redo]);

  const handleConnect = (connection: Connection) => {
    onConnect(connection);
    if (ghostCardsEnabled) {
      const sourceNode = nodes.find(n => n.id === connection.source);
      if (sourceNode) {
        addGhostNode({
          id: `ghost-${crypto.randomUUID()}`,
          type: 'custom',
          position: { x: sourceNode.position.x, y: sourceNode.position.y + 150 },
          data: { label: 'AI Suggestion', type: 'Suggestion', color: 'white', variant: 'ghost', expanded: true },
        });
      }
    }
  };

  const filteredNodes = nodes.filter(n => 
    !searchQuery || (n.data.label as string).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full h-full bg-[#F3F4F6]">
      <ReactFlow
        nodes={filteredNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
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
      >
        {canvasBackground !== 'none' && (
          <Background 
            color={canvasDotColor} 
            gap={20} 
            size={canvasBackground === 'dots' ? 1.5 : 1} 
            variant={canvasBackground === 'dots' ? BackgroundVariant.Dots : BackgroundVariant.Lines} 
          />
        )}
        <Controls className="bg-white border border-gray-200 shadow-sm [&>button]:border-b [&>button]:border-gray-100" />
        {showMinimap && (
          <MiniMap 
            nodeColor="#9CA3AF" 
            maskColor="rgba(243, 244, 246, 0.7)"
            className="bg-white border border-gray-200 shadow-sm rounded-md overflow-hidden"
            position="bottom-right"
          />
        )}
      </ReactFlow>
      
      <AddElementPopover />
      <MetricsPopover />
      <NodeSettingsPopover />
    </div>
  );
};
