import { BaseEdge, EdgeLabelRenderer, type EdgeProps, getSmoothStepPath } from '@xyflow/react';
import { Plus } from 'lucide-react';
import { useSynapseStore } from '../../../store/useSynapseStore';

export const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 8,
  });

  const setAddElementPopover = useSynapseStore((state) => state.setAddElementPopover);

  const onEdgeClick = (evt: React.MouseEvent) => {
    evt.stopPropagation();
    setAddElementPopover({
      isOpen: true,
      x: evt.clientX,
      y: evt.clientY,
      edgeId: id,
    });
  };

  return (
    <>
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={{ 
          ...style, 
          strokeWidth: 1.5, 
          stroke: '#94A3B8',
          strokeDasharray: '5, 5',
          animation: 'dashdraw 0.5s linear infinite'
        }} 
      />
      <style>{`
        @keyframes dashdraw {
          from { stroke-dashoffset: 10; }
          to { stroke-dashoffset: 0; }
        }
      `}</style>
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <button
            className="w-5 h-5 rounded-full flex items-center justify-center text-white hover:brightness-90 hover:scale-110 shadow-lg transition-all cursor-pointer"
            style={{ backgroundColor: 'var(--accent)' }}
            onClick={onEdgeClick}
          >
            <Plus size={14} strokeWidth={3} />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};
