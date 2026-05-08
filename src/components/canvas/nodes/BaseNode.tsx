import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useSynapseStore } from '../../../store/useSynapseStore';
import { ChevronDown, Copy, List, Plus, Pencil, Sparkles, Check, X } from 'lucide-react';

export interface BaseNodeData {
  label: string;
  type?: string;
  description?: string;
  color?: string;
  shape?: string;
  variant?: 'default' | 'ghost';
  expanded?: boolean;
  [key: string]: unknown;
}

export type BaseNodeProps = Node<BaseNodeData, 'custom'>;

export const BaseNode = ({ id, data, selected }: NodeProps<BaseNodeProps>) => {
  const { acceptGhostNode, dismissGhostNode, updateNode, setAddElementPopover, setNodeSettingsPopover } = useSynapseStore();
  
  const isGhost = data.variant === 'ghost';
  const isExpanded = data.expanded !== false;

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

  const headerBgColor = 
    data.color === 'blue' ? 'bg-[#3B82F6]' :
    data.color === 'green' ? 'bg-[#10B981]' :
    data.color === 'orange' ? 'bg-[#F59E0B]' :
    data.color === 'purple' ? 'bg-[#8B5CF6]' :
    'bg-gray-600';

  return (
    <motion.div 
      initial={isGhost ? { opacity: 0.2 } : { scale: 0.9, opacity: 0 }}
      animate={isGhost ? { opacity: [0.4, 0.7, 0.4], transition: { repeat: Infinity, duration: 2 } } : { scale: 1, opacity: 1 }}
      className={clsx(
        "relative w-52 flex flex-col rounded-md bg-white border text-sm transition-all",
        selected ? "border-[#06B6D4] shadow-md ring-2 ring-[#06B6D4]/50" : "border-gray-200 shadow-sm",
        isGhost && "border-dashed border-[#0078D4] !opacity-60"
      )}
    >
      {isGhost && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 border border-purple-200 whitespace-nowrap">
          <Sparkles size={10} /> AI Suggestion
        </div>
      )}

      {/* Header */}
      <div 
        className={clsx(`${headerBgColor} text-white px-3 py-2 flex items-center justify-between cursor-pointer`, 
          isExpanded ? "rounded-t-md" : "rounded-md"
        )}
        onClick={toggleExpand}
      >
        <span className="font-semibold text-xs tracking-wide">{data.type || 'Stage'}</span>
        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={14} className="opacity-80" />
        </motion.div>
      </div>

      {/* Expandable Body */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            {/* Body Row 1: Label */}
            <div className="px-3 py-2 flex items-center justify-between border-b border-gray-100 bg-white">
              <span className="text-xs text-gray-800 truncate font-medium">{data.label || 'Action'}</span>
              <ChevronDown size={14} className="text-gray-400" />
            </div>

            {/* Body Row 2: Icons & Actions */}
            <div className="px-3 py-1.5 flex items-center justify-between border-b border-gray-100 bg-white">
              <div className="flex items-center gap-3 text-gray-400">
                <div className="flex items-center gap-1 text-[10px] font-medium">
                  <Copy size={12} /> 2
                </div>
                <div className="flex items-center gap-1 text-[10px] font-medium">
                  <List size={12} /> 2
                </div>
              </div>
              <button 
                onClick={handleAddElement}
                className="text-[#06B6D4] hover:bg-cyan-50 p-0.5 rounded-sm transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>

            {/* Footer Row: Description/Triggers */}
            <div className="bg-gray-50 px-3 py-2 rounded-b-md flex items-center justify-between">
              <span className="text-[10px] font-medium text-gray-500 truncate mr-2">{data.description || '1 Trigger'}</span>
              <button 
                onClick={handleSettings}
                className="text-gray-400 hover:text-[#F59E0B] transition-colors"
              >
                <Pencil size={12} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connection Handles */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-0 h-0 border-0 opacity-0 bg-transparent pointer-events-none"
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-0 h-0 border-0 opacity-0 bg-transparent pointer-events-none"
      />

      {isGhost && (
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex gap-2 justify-center z-10">
          <button 
            onClick={() => acceptGhostNode(id)}
            className="flex items-center gap-1 bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-1 rounded-md text-[10px] font-bold hover:bg-emerald-100 transition-colors shadow-sm"
          >
            <Check size={12} /> Accept
          </button>
          <button 
            onClick={() => dismissGhostNode(id)}
            className="flex items-center gap-1 bg-red-50 text-red-600 border border-red-200 px-2 py-1 rounded-md text-[10px] font-bold hover:bg-red-100 transition-colors shadow-sm"
          >
            <X size={12} /> Dismiss
          </button>
        </div>
      )}
    </motion.div>
  );
};
