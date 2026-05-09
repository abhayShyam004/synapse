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
  const isExpanded = data.expanded === true; // Default to collapsed

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
    data.type === 'Trigger' ? '#10B981' :
    data.type === 'Task' ? '#3B82F6' :
    data.type === 'Decision' ? '#374151' :
    data.type === 'Condition' ? '#F59E0B' :
    data.type === 'AI Prompt' ? '#8B5CF6' :
    data.type === 'Timer' ? '#D97706' :
    data.type === 'Variable' ? '#0D9488' :
    data.type === 'Loop' ? '#EC4899' :
    data.type === 'Note' ? '#6B7280' :
    '#4B5563';

  const colorMap: Record<string, string> = {
    blue: '#3B82F6',
    green: '#10B981',
    orange: '#F59E0B',
    purple: '#8B5CF6',
    gray: '#4B5563',
    cyan: '#06B6D4',
    amber: '#F59E0B',
    violet: '#7C3AED',
    rose: '#F43F5E',
    emerald: '#10B981',
    pink: '#EC4899',
  };

  const headerBgColor = 
    (data.color && data.color.startsWith('#')) ? data.color :
    (data.color && colorMap[data.color]) ? colorMap[data.color] :
    typeBgColor;

  const shape = (data.shape as string) || 'rounded';

  const borderRadius = 
    shape === 'rounded' ? 'rounded-[16px]' :
    'rounded-[8px]';

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
        "group relative min-w-[220px] flex flex-col bg-white border text-sm transition-all shadow-sm overflow-hidden",
        selected ? "border-[var(--accent)] ring-2 ring-[var(--accent)]/50 shadow-lg" : "border-gray-200",
        isGhost && "border-dashed border-[var(--accent)] !opacity-60",
        borderRadius
      )}
    >
      {/* Header Bar */}
      <div 
        className={clsx(`text-white px-4 py-2.5 h-[60px] flex flex-col justify-center relative cursor-pointer group/header`)}
        style={{ backgroundColor: headerBgColor }}
        onClick={toggleExpand}
      >        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 leading-none mb-1">
            {data.type || 'Stage'}
          </span>
          {!isGhost && (
            <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={18} className="opacity-80" />
            </motion.div>
          )}
        </div>
        <span className="font-bold text-sm leading-none truncate pr-6">
          {data.label || 'New Node'}
        </span>
        
        {isGhost && (
          <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-white/20 text-white px-2 py-0.5 rounded-full text-[8px] font-bold flex items-center gap-1 border border-white/20 whitespace-nowrap z-10">
            <Sparkles size={8} /> AI Suggestion
          </div>
        )}
      </div>

      {/* Body Section */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden bg-white"
          >
            <div className="p-4 border-t border-gray-100">
              {data.description ? (
                <p className="text-xs text-gray-500 leading-relaxed mb-4">{data.description}</p>
              ) : null}
              
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-tight">
                  {connectedEdgesCount} Connection{connectedEdgesCount !== 1 ? 's' : ''}
                </span>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={handleAddElement}
                    className="p-1.5 rounded-md text-[var(--accent)] hover:bg-accent/10 transition-colors"
                    title="Add following node"
                  >
                    <Plus size={16} strokeWidth={2.5} />
                  </button>
                  <button 
                    onClick={handleSettings}
                    className="p-1.5 rounded-md text-gray-400 hover:text-[#F59E0B] hover:bg-amber-50 transition-colors"
                    title="Settings"
                  >
                    <Pencil size={16} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Handles */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-2.5 h-2.5 bg-[var(--accent)] border-2 border-white rounded-full z-20 opacity-0 group-hover:opacity-100 transition-opacity cursor-crosshair !-top-1.25 !left-1/2 !-translate-x-1/2"
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-2.5 h-2.5 bg-[var(--accent)] border-2 border-white rounded-full z-20 opacity-0 group-hover:opacity-100 transition-opacity cursor-crosshair !-bottom-1.25 !left-1/2 !-translate-x-1/2"
      />

      {isGhost && (
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex gap-2 justify-center z-20">
          <button 
            onClick={(e) => { e.stopPropagation(); acceptGhostNode(id); }}
            className="flex items-center gap-1 bg-emerald-50 text-emerald-600 border border-emerald-200 px-3 py-1 rounded-lg text-[10px] font-bold hover:bg-emerald-100 transition-colors shadow-sm whitespace-nowrap"
          >
            <Check size={12} /> Accept
          </button>
          <button 
            onClick={handleDismiss}
            className="flex items-center gap-1 bg-red-50 text-red-600 border border-red-200 px-3 py-1 rounded-lg text-[10px] font-bold hover:bg-red-100 transition-colors shadow-sm whitespace-nowrap"
          >
            <X size={12} /> Dismiss
          </button>
        </div>
      )}
    </motion.div>
  );
};
