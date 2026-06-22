import { useState } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useSynapseStore } from '../../../store/useSynapseStore';
import { ChevronDown, Plus, Pencil, Sparkles, Check, X, Calendar, ExternalLink } from 'lucide-react';

export interface BaseNodeData {
  label: string;
  type?: string;
  description?: string;
  color?: string;
  shape?: string;
  variant?: 'default' | 'ghost';
  expanded?: boolean;
  sourceNodeId?: string;
  checklist?: { id: string; text: string; completed: boolean }[];
  customFields?: { id: string; key: string; value: string }[];
  customTypeLabel?: string;
  url?: string;
  markdown?: string;
  completed?: boolean;
  [key: string]: unknown;
}

export type BaseNodeProps = Node<BaseNodeData, 'custom'>;

export const BaseNode = ({ id, data, selected }: NodeProps<BaseNodeProps>) => {
  const { acceptGhostNode, dismissGhostNode, updateNode, setAddElementPopover, setNodeSettingsPopover, edges, nodes } = useSynapseStore();
  const [isDismissing, setIsDismissing] = useState(false);
  
  const isGhost = data.variant === 'ghost';
  const isExpanded = data.expanded === true; // Default to collapsed

  const connectedEdgesCount = edges.filter(e => e.source === id || e.target === id).length;

  // Calculate Progress for Goals/Milestones based on their children's checklists
  let progress = 0;
  let hasChecklistItems = false;
  if (data.type === 'Goal' || data.type === 'Milestone') {
    const childNodeIds = edges.filter(e => e.source === id).map(e => e.target);
    const childNodes = nodes.filter(n => childNodeIds.includes(n.id));
    
    let totalItems = 0;
    let completedItems = 0;
    
    childNodes.forEach(child => {
      if (child.data.checklist && child.data.checklist.length > 0) {
        totalItems += child.data.checklist.length;
        completedItems += child.data.checklist.filter((item: any) => item.completed).length;
      }
    });
    
    hasChecklistItems = totalItems > 0;
    if (hasChecklistItems) {
      progress = Math.round((completedItems / totalItems) * 100);
    }
  }

  const toggleChecklistItem = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    if (!data.checklist) return;
    const newChecklist = data.checklist.map((item: any) => 
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    updateNode(id, { checklist: newChecklist });
  };

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
    data.type === 'Goal' ? '#8B5CF6' :
    data.type === 'Milestone' ? '#F59E0B' :
    data.type === 'Task' ? '#3B82F6' :
    data.type === 'Practice' ? '#10B981' :
    data.type === 'Checklist' ? '#0D9488' :
    data.type === 'Custom' ? '#4B5563' :
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

  const isDueSoon = () => {
    if (!data.dueDate) return false;
    const due = new Date(data.dueDate as string);
    const now = new Date();
    const diff = due.getTime() - now.getTime();
    return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000; // Less than 3 days
  };

  const isOverdue = () => {
    if (!data.dueDate) return false;
    const due = new Date(data.dueDate as string);
    const now = new Date();
    return due.getTime() < now.getTime();
  };

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
        "group relative min-w-[160px] md:min-w-[220px] flex flex-col bg-white border text-sm transition-all shadow-sm",
        selected ? "border-[var(--accent)] ring-2 ring-[var(--accent)]/50 shadow-lg" : "border-gray-200",
        isGhost && "border-dashed border-[var(--accent)] !opacity-60",
        borderRadius
      )}
    >
      {data.dueDate && (
        <div className={clsx(
          "absolute -top-2 -right-2 z-30 px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1 shadow-sm border",
          isOverdue() ? "bg-red-100 text-red-600 border-red-200" :
          isDueSoon() ? "bg-amber-100 text-amber-600 border-amber-200" :
          "bg-white text-gray-500 border-gray-200"
        )}>
          <Calendar size={10} />
          {new Date(data.dueDate as string).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </div>
      )}

      {/* Header Bar */}
      <div 
        className={clsx(`text-white px-3 md:px-4 py-2 md:py-2.5 h-[52px] md:h-[60px] flex flex-col justify-center relative cursor-pointer group/header overflow-hidden`,
          isExpanded ? "rounded-t-[inherit]" : borderRadius
        )}
        style={{ backgroundColor: headerBgColor }}
        onClick={toggleExpand}
      >        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest opacity-80 leading-none mb-1">
              {data.customTypeLabel ? (data.customTypeLabel as string) : (data.type || 'Stage')}
            </span>
            {(data.type === 'Goal' || data.type === 'Milestone') && hasChecklistItems && (
              <span className="text-[8px] font-bold bg-black/10 px-1.5 py-0.5 rounded-full mb-1">
                {progress}%
              </span>
            )}
          </div>
          {!isGhost && (
            <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={16} className="opacity-80 md:w-[18px] md:h-[18px]" />
            </motion.div>
          )}
        </div>
        <span className="font-bold text-[13px] md:text-sm leading-none truncate pr-6">
          {data.label || 'New Node'}
        </span>
        
        {(data.type === 'Goal' || data.type === 'Milestone') && hasChecklistItems && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10">
            <div 
              className="h-full bg-white transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        
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



              {data.type === 'Link' && data.url && (
                <a 
                  href={data.url as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between bg-pink-50 border border-pink-100 p-2 rounded-lg text-xs font-bold text-pink-600 hover:bg-pink-100 transition-colors mb-4 group/link"
                  onClick={e => e.stopPropagation()}
                >
                  <span className="truncate pr-2">{(data.url as string).replace(/^https?:\/\//, '')}</span>
                  <ExternalLink size={14} className="group-hover/link:scale-110 transition-transform shrink-0" />
                </a>
              )}

              {data.type === 'Note' && data.markdown && (
                <div className="bg-amber-50/50 border border-amber-100 rounded-lg p-3 mb-4 max-h-[200px] overflow-y-auto">
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono leading-relaxed" style={{ fontFamily: 'inherit' }}>
                    {data.markdown as string}
                  </pre>
                </div>
              )}
              
              {data.customFields && data.customFields.length > 0 && (
                <div className="flex flex-col gap-1.5 mb-4">
                  {data.customFields.map(field => (
                    <div key={field.id} className="flex flex-col border-l-2 border-[var(--accent)] pl-2">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{field.key}</span>
                      <span className="text-xs text-gray-700">{field.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {data.checklist && data.checklist.length > 0 && (
                <div className="flex flex-col gap-2 mb-4">
                  {data.checklist.map(item => (
                    <div 
                      key={item.id} 
                      className="flex items-start gap-2 cursor-pointer group/item"
                      onClick={(e) => toggleChecklistItem(e, item.id)}
                    >
                      <div className={clsx(
                        "mt-0.5 w-3.5 h-3.5 rounded-sm border flex items-center justify-center transition-colors flex-shrink-0",
                        item.completed ? "bg-[var(--accent)] border-[var(--accent)]" : "border-gray-300 group-hover/item:border-[var(--accent)]"
                      )}>
                        {item.completed && <Check size={10} className="text-white" strokeWidth={3} />}
                      </div>
                      <span className={clsx(
                        "text-xs transition-colors leading-tight pt-[1px]",
                        item.completed ? "text-gray-400 line-through" : "text-gray-700"
                      )}>
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              
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
