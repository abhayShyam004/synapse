import { ReactFlow, Background, Controls, MiniMap, type Connection } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useSynapseStore } from '../../store/useSynapseStore';
import { BaseNode } from './nodes/BaseNode';

const nodeTypes = {
  custom: BaseNode,
};

export const WorkflowCanvas = () => {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, ghostCardsEnabled, addGhostNode } = useSynapseStore();

  const handleConnect = (connection: Connection) => {
    onConnect(connection);
    
    if (ghostCardsEnabled) {
      // Simulate AI suggestion
      const sourceNode = nodes.find(n => n.id === connection.source);
      if (sourceNode) {
        addGhostNode({
          id: `ghost-${crypto.randomUUID()}`,
          type: 'custom',
          position: { x: sourceNode.position.x + 200, y: sourceNode.position.y },
          data: { label: 'Suggested Task', type: 'AI Suggestion', color: 'bg-white' },
        });
      }
    }
  };

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background color="#334155" gap={20} />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
};
