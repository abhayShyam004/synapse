// src/components/canvas/nodes/BaseNode.tsx
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { clsx } from 'clsx';
import { SHAPES, COLORS } from './NodeStyles';

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

export const BaseNode = ({ data, selected }: NodeProps<BaseNodeProps>) => {
  const colorClass = COLORS[data.color || 'white'];
  const shapeClass = SHAPES[data.shape || 'rounded'];

  return (
    <div className={clsx(
      "min-w-[150px] p-4 border-2 shadow-lg transition-all relative",
      colorClass,
      shapeClass,
      selected ? "ring-4 ring-[#0070F3] ring-offset-2 ring-offset-slate-900" : "ring-0",
      data.variant === 'ghost' && "opacity-40 border-dashed"
    )}>
      {/* Content wrapper for counter-rotation if diamond */}
      <div className={clsx(data.shape === 'diamond' && "-rotate-45")}>
        <Handle 
          type="target" 
          position={Position.Top} 
          className="w-3 h-3 bg-[#0070F3] !border-white" 
        />
        
        <div className="flex flex-col gap-1">
          {data.type && (
            <div className="text-[10px] font-bold uppercase opacity-60 tracking-wider">
              {data.type}
            </div>
          )}
          <div className="font-bold text-sm">{data.label}</div>
          {data.description && (
            <div className="text-xs opacity-80 leading-tight mt-1">
              {data.description}
            </div>
          )}
        </div>

        <Handle 
          type="source" 
          position={Position.Bottom} 
          className="w-3 h-3 bg-[#0070F3] !border-white" 
        />
      </div>

      {data.variant === 'ghost' && (
        <div className="absolute -bottom-10 left-0 right-0 flex justify-center gap-2">
          <button className="bg-green-500 text-white text-[10px] px-2 py-1 rounded shadow-sm font-bold">Accept</button>
          <button className="bg-red-500 text-white text-[10px] px-2 py-1 rounded shadow-sm font-bold">Dismiss</button>
        </div>
      )}

      {/* Plus Symbol on Hover placeholder */}
      <div className="absolute -right-3 top-1/2 -translate-y-1/2 opacity-0 hover:opacity-100 cursor-pointer bg-white rounded-full border shadow-sm p-1 flex items-center justify-center w-6 h-6 text-[#0070F3] font-bold z-10">
        +
      </div>
    </div>
  );
};
