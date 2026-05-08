// src/components/canvas/nodes/BaseNode.tsx
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { clsx } from 'clsx';
import { SHAPES, COLORS } from './NodeStyles';
import { motion } from 'framer-motion';
import { useSynapseStore } from '../../../store/useSynapseStore';

export interface BaseNodeData {
  label: string;
  type?: string;
  description?: string;
  color?: keyof typeof COLORS;
  shape?: keyof typeof SHAPES;
  variant?: 'default' | 'ghost';
  [key: string]: unknown;
}

export type BaseNodeProps = Node<BaseNodeData, 'custom'>;

export const BaseNode = ({ id, data, selected }: NodeProps<BaseNodeProps>) => {
  const acceptGhostNode = useSynapseStore(state => state.acceptGhostNode);
  const dismissGhostNode = useSynapseStore(state => state.dismissGhostNode);
  const colorClass = COLORS[data.color || 'white'];
  const shapeClass = SHAPES[data.shape || 'rounded'];
  const isGhost = data.variant === 'ghost';

  return (
    <motion.div 
      initial={isGhost ? { opacity: 0.2 } : { scale: 0.9, opacity: 0 }}
      animate={isGhost ? { opacity: [0.3, 0.6, 0.3], transition: { repeat: Infinity, duration: 2 } } : { scale: 1, opacity: 1 }}
      className={clsx(
        "group relative min-w-[180px] border-4 border-black transition-all",
        colorClass,
        shapeClass,
        selected ? "shadow-[8px_8px_0px_0px_rgba(0,229,255,1)] translate-y-[-4px]" : "shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]",
        isGhost && "!border-dashed !shadow-none"
      )}
    >
      <div className={clsx("p-5", data.shape === 'diamond' && "-rotate-45 p-8")}>
        <div className="text-[11px] font-black uppercase tracking-widest mb-2 opacity-80">
          {data.type || 'Node'}
        </div>
        <div className="font-bold text-lg leading-tight">{data.label}</div>
        {data.description && (
          <div className="text-sm font-medium opacity-90 mt-2">
            {data.description}
          </div>
        )}
      </div>

      {/* Handles - visible on node hover */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-4 h-4 bg-white border-2 border-black opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center -top-2"
      >
        <span className="text-[10px] text-black font-bold leading-none">+</span>
      </Handle>
      
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-4 h-4 bg-white border-2 border-black opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center -bottom-2"
      >
        <span className="text-[10px] text-black font-bold leading-none">+</span>
      </Handle>

      {isGhost && (
        <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 flex gap-3 w-[200px] justify-center">
          <button 
            onClick={() => acceptGhostNode(id)}
            className="bg-green-400 border-2 border-black text-black text-xs px-4 py-2 font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-px hover:shadow-none transition-all"
          >
            Accept
          </button>
          <button 
            onClick={() => dismissGhostNode(id)}
            className="bg-red-400 border-2 border-black text-black text-xs px-4 py-2 font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-px hover:shadow-none transition-all"
          >
            Dismiss
          </button>
        </div>
      )}
    </motion.div>
  );
};
