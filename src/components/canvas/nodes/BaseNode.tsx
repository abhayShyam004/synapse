import { useState } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useSynapseStore } from '../../../store/useSynapseStore';
import { ChevronDown, Plus, Pencil, Sparkles, Check, X } from 'lucide-react';

export interface BaseNodeData {
  label: string;
  type?: string;
  description?: string;
  color?: string;
  shape?: string;
  variant?: 'default' | 'ghost';
  expanded?: boolean;
  sourceNodeId?: string;
  [key: string]: unknown;
}

export type BaseNodeProps = Node<BaseNodeData, 'custom'>;

export const BaseNode = ({ id, data, selected }: NodeProps<BaseNodeProps>) => {
  const { acceptGhostNode, dismissGhostNode, updateNode, setAddElementPopover, setNodeSettingsPopover, edges } = useSynapseStore();
  const [isDismissing, setIsDismissing] = useState(false);
  
  const isGhost = data.variant === 'ghost';
  const isExpanded = data.expanded !== false;

  const connectedEdgesCount = edges.filter(e => e.source === id || e.target === id).length;

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateNode(id, { expanded: !isExpanded });
  };

  const handleAddElement = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAddElementPopover({ isOpen: true, x: e.clientX, y: e.clientY });
  };

  const handleSettings = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNodeSettingsPopover({ isOpen: true, nodeId: id });
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissing(true);
    setTimeout(() => {
      dismissGhostNode(id);
    }, 200);
  };

  const typeBgColor = 
    data.type === 'Trigger' ? 'bg-[#10B981]' :
    data.type === 'Task' ? 'bg-[#3B82F6]' :
    data.type === 'Decision' ? 'bg-[#374151]' :
    data.type === 'Condition' ? 'bg-[#F59E0B]' :
    data.type === 'AI Prompt' ? 'bg-[#8B5CF6]' :
    data.type === 'Timer' ? 'bg-[#D97706]' :
    data.type === 'Variable' ? 'bg-[#0D9488]' :
    data.type === 'Loop' ? 'bg-[#EC4899]' :
    data.type === 'Note' ? 'bg-[#6B7280]' :
    'bg-gray-600';

  const headerBgColor = 
    data.color === 'blue' ? 'bg-[#3B82F6]' :
    data.color === 'green' ? 'bg-[#10B981]' :
    data.color === 'orange' ? 'bg-[#F59E0B]' :
    data.color === 'purple' ? 'bg-[#8B5CF6]' :
    data.color === 'gray' ? 'bg-[#4B5563]' :
    data.color === 'cyan' ? 'bg-[#06B6D4]' :
    data.color === 'amber' ? 'bg-[#F59E0B]' :
    data.color === 'violet' ? 'bg-[#7C3AED]' :
    data.color === 'rose' ? 'bg-[#F43F5E]' :
    data.color === 'emerald' ? 'bg-[#10B981]' :
    data.color === 'pink' ? 'bg-[#EC4899]' :
    typeBgColor;

  // Shape Mapping
  const defaultShape = 
    data.type === 'Task' || data.type === 'Note' ? 'rectangle' :
    data.type === 'Decision' || data.type === 'Condition' ? 'diamond' :
    data.type === 'Timer' || data.type === 'Variable' ? 'pill' :
    'rounded';

  const shape = (data.shape as string) || defaultShape;

  const shapeClasses = clsx(
    shape === 'rounded' && "rounded-[20px]",
    shape === 'diamond' && "rotate-45 w-[160px] h-[140px] flex items-center justify-center",
    shape === 'pill' && "rounded-[50px]",
    shape === 'rectangle' && "rounded-md"
  );

  return (
    <motion.div 
      initial={isGhost ? { opacity: 0.2 } : { scale: 0.9, opacity: 0 }}
      animate={
        isDismissing ? { opacity: 0, scale: 0.95 } :
        isGhost ? { opacity: [0.4, 0.7, 0.4], transition: { repeat: Infinity, duration: 2 } } : 
        { scale: 1, opacity: 1 }
      }
      transition={{ duration: isDismissing ? 0.2 : 0.4 }}
      className={clsx(
        "group relative min-w-[180px] min-h-[56px] flex flex-col bg-white border text-sm transition-all overflow-visible",
        selected ? "border-[var(--accent)] shadow-lg ring-2 ring-[var(--accent)]/50" : "border-gray-200 shadow-sm",
        isGhost && "border-dashed border-[var(--accent)] !opacity-60",
        shapeClasses
      )}
    >
      {/* Content wrapper for diamond to un-rotate text */}
      <div className={clsx("w-full h-full flex flex-col", shape === 'diamond' && "-rotate-45")}>
        {isGhost && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 border border-purple-200 whitespace-nowrap z-10">
            <Sparkles size={10} /> AI Suggestion
          </div>
        )}

        {/* Header */}
        <div 
          className={clsx(`${headerBgColor} text-white px-4 py-2 flex flex-col cursor-pointer`, 
            !isExpanded && (shape === 'pill' || shape === 'rounded') ? "rounded-full" : "rounded-t-[10px]",
            shape === 'diamond' && "rounded-none h-full justify-center"
          )}
          onClick={toggleExpand}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{data.type || 'Stage'}</span>
            {!isGhost && shape !== 'diamond' && (
              <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown size={14} className="opacity-80" />
              </motion.div>
            )}
          </div>
          <span className="font-bold text-sm mt-0.5 leading-tight">{data.label || 'Action'}</span>
        </div>

        {/* Expandable Body */}
        <AnimatePresence initial={false}>
          {isExpanded && shape !== 'diamond' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              {data.description && (
                <div className="px-4 py-3 border-b border-gray-100 bg-white">
                  <p className="text-xs text-gray-500 leading-relaxed">{data.description}</p>
                </div>
              )}

              {/* Footer Row */}
              <div className="bg-gray-50 px-4 py-2 flex items-center justify-between">
                <span className="text-[10px] font-medium text-gray-400">
                  {connectedEdgesCount} connection{connectedEdgesCount !== 1 ? 's' : ''}
                </span>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={handleAddElement}
                    className="text-[var(--accent)] hover:bg-accent/10 p-1 rounded-md transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                  <button 
                    onClick={handleSettings}
                    className="text-gray-400 hover:text-[#F59E0B] transition-colors p-1 rounded-md hover:bg-amber-50"
                  >
                    <Pencil size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Connection Handles */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-2.5 h-2.5 bg-[var(--accent)] border-2 border-white rounded-full z-20 opacity-0 group-hover:opacity-100 transition-opacity cursor-crosshair !-top-1.25"
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-2.5 h-2.5 bg-[var(--accent)] border-2 border-white rounded-full z-20 opacity-0 group-hover:opacity-100 transition-opacity cursor-crosshair !-bottom-1.25"
      />

      {isGhost && (
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex gap-2 justify-center z-20">
          <button 
            onClick={(e) => { e.stopPropagation(); acceptGhostNode(id); }}
            className="flex items-center gap-1 bg-emerald-50 text-emerald-600 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors shadow-sm whitespace-nowrap"
          >
            <Check size={14} /> Accept
          </button>
          <button 
            onClick={handleDismiss}
            className="flex items-center gap-1 bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors shadow-sm whitespace-nowrap"
          >
            <X size={14} /> Dismiss
          </button>
        </div>
      )}
    </motion.div>
  );
};
