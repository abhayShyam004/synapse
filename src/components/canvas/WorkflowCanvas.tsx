import { ReactFlow, Background, Controls, MiniMap, type Connection, MarkerType } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useSynapseStore } from '../../store/useSynapseStore';
import { BaseNode } from './nodes/BaseNode';

const nodeTypes = { custom: BaseNode };

const defaultEdgeOptions = {
  animated: true,
  style: { stroke: '#00E5FF', strokeWidth: 3, filter: 'drop-shadow(0 0 5px rgba(0, 229, 255, 0.8))' },
  markerEnd: { type: MarkerType.ArrowClosed, color: '#00E5FF' },
};

export const WorkflowCanvas = () => {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, ghostCardsEnabled, addGhostNode, theme } = useSynapseStore();

  const handleConnect = (connection: Connection) => {
    onConnect(connection);
    if (ghostCardsEnabled) {
      const sourceNode = nodes.find(n => n.id === connection.source);
      if (sourceNode) {
        addGhostNode({
          id: `ghost-${crypto.randomUUID()}`,
          type: 'custom',
          position: { x: sourceNode.position.x + 300, y: sourceNode.position.y },
          data: { label: 'AI Suggestion', type: 'Suggestion', color: 'white', variant: 'ghost' },
        });
      }
    }
  };

  const isDark = theme === 'dark' || theme === 'cyberpunk';

  return (
    <div className="w-full h-full bg-[#0a0a0f]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
      >
        <Background color={isDark ? "#ffffff" : "#000000"} gap={24} size={2} className="opacity-10" />
        <Controls className="bg-white border-2 border-black !shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] [&>button]:border-b-2 [&>button]:border-black" />
        <MiniMap 
          nodeColor={(n) => n.data?.color === 'yellow' ? '#FFD600' : '#00E5FF'} 
          maskColor="rgba(0, 0, 0, 0.7)"
          className="bg-[#1a1a24] border-2 border-black !shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        />
      </ReactFlow>
    </div>
  );
};
