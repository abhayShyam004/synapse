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
  const { acceptGhostNode, dismissGhostNode, updateNode, setAddElementPopover, setNodeSettingsPopover, edges, openDialog } = useSynapseStore();
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
    typeBgColor;

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
        "group relative min-w-[220px] flex flex-col rounded-md bg-white border text-sm transition-all",
        selected ? "border-[var(--accent)] shadow-md ring-2 ring-[var(--accent)]/50" : "border-gray-200 shadow-sm",
        isGhost && "border-dashed border-[var(--accent)] !opacity-60"
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
            <div 
              className="px-3 py-2 flex items-center justify-between border-b border-gray-100 bg-white group/label"
              onDoubleClick={(e) => {
                e.stopPropagation();
                openDialog({
                  title: 'Rename Node',
                  message: 'Enter a new label for this node:',
                  type: 'prompt',
                  defaultValue: data.label as string,
                  onConfirm: (newValue) => {
                    if (newValue) updateNode(id, { label: newValue });
                  }
                });
              }}
            >
              <span className="text-xs text-gray-800 truncate font-medium">{data.label || 'Action'}</span>
            </div>

            {/* Footer Row: Description/Triggers */}
            <div className="bg-gray-50 px-3 py-2 rounded-b-md flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-medium text-gray-500 truncate">
                  {data.description || `${connectedEdgesCount} connection${connectedEdgesCount !== 1 ? 's' : ''}`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleAddElement}
                  className="text-[var(--accent)] hover:bg-cyan-50 p-1 rounded-sm transition-colors"
                >
                  <Plus size={12} />
                </button>
                <button 
                  onClick={handleSettings}
                  className="text-gray-400 hover:text-[#F59E0B] transition-colors p-1"
                >
                  <Pencil size={12} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connection Handles */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-2.5 h-2.5 bg-[var(--accent)] border-2 border-white rounded-full z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-crosshair !-top-1.25"
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-2.5 h-2.5 bg-[var(--accent)] border-2 border-white rounded-full z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-crosshair !-bottom-1.25"
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
            onClick={handleDismiss}
            className="flex items-center gap-1 bg-red-50 text-red-600 border border-red-200 px-2 py-1 rounded-md text-[10px] font-bold hover:bg-red-100 transition-colors shadow-sm"
          >
            <X size={12} /> Dismiss
          </button>
        </div>
      )}
    </motion.div>
  );
};

