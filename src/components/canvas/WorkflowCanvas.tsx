import { ReactFlow, Background, Controls, MiniMap, type Connection, BackgroundVariant } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useSynapseStore } from '../../store/useSynapseStore';
import { BaseNode } from './nodes/BaseNode';
import { CustomEdge } from './edges/CustomEdge';
import { AddElementPopover } from '../popovers/AddElementPopover';
import { MetricsPopover } from '../popovers/MetricsPopover';
import { NodeSettingsPopover } from '../popovers/NodeSettingsPopover';

const nodeTypes = { custom: BaseNode };
const edgeTypes = { custom: CustomEdge };

const defaultEdgeOptions = {
  type: 'custom',
  animated: false,
};

export const WorkflowCanvas = () => {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, ghostCardsEnabled, addGhostNode, isCanvasLocked } = useSynapseStore();

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

  return (
    <div className="w-full h-full bg-[#F3F4F6]">
      <ReactFlow
        nodes={nodes}
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
        fitView
      >
        <Background color="#CBD5E1" gap={20} size={1.5} variant={BackgroundVariant.Dots} />
        <Controls className="bg-white border border-gray-200 shadow-sm [&>button]:border-b [&>button]:border-gray-100" />
        <MiniMap 
          nodeColor="#9CA3AF" 
          maskColor="rgba(243, 244, 246, 0.7)"
          className="bg-white border border-gray-200 shadow-sm rounded-md overflow-hidden"
          position="bottom-right"
        />
      </ReactFlow>
      
      <AddElementPopover />
      <MetricsPopover />
      <NodeSettingsPopover />
    </div>
  );
};
