import { useSynapseStore } from '../../store/useSynapseStore';
import { X, Trash2, Copy, Square, Circle, Pipette, Plus, GripVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import { useEffect, useState, useRef } from 'react';
import { clsx } from 'clsx';
import { motion, useDragControls } from 'framer-motion';

const ACCENT_COLORS = [
  { name: 'Cyan', hex: '#06B6D4', id: 'cyan' },
  { name: 'Amber', hex: '#F59E0B', id: 'amber' },
  { name: 'Violet', hex: '#7C3AED', id: 'violet' },
  { name: 'Rose', hex: '#F43F5E', id: 'rose' },
  { name: 'Emerald', hex: '#10B981', id: 'emerald' },
  { name: 'Blue', hex: '#3B82F6', id: 'blue' },
  { name: 'Orange', hex: '#F97316', id: 'orange' },
  { name: 'Pink', hex: '#EC4899', id: 'pink' },
];

const SHAPES = [
  { id: 'rectangle', label: 'Rectangle', icon: Square },
  { id: 'rounded', label: 'Rounded', icon: Circle },
];

export const NodeSettingsPopover = () => {
  const { nodeSettingsPopover, setNodeSettingsPopover, nodes, updateNode, deleteNode, cloneNode, openDialog } = useSynapseStore();
  const popoverRef = useRef<HTMLDivElement>(null);
  
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const dragControls = useDragControls();

  const node = nodes.find(n => n.id === nodeSettingsPopover.nodeId);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (nodeSettingsPopover.isOpen && nodeSettingsPopover.nodeId && !isMobile) {
      const el = document.querySelector(`[data-id="${nodeSettingsPopover.nodeId}"]`);
      if (el) {
        const rect = el.getBoundingClientRect();
        const popoverWidth = 260;
        const gap = 16;
        
        let left = rect.right + gap;
        // If it would overflow the right edge of the screen, flip to the left
        if (left + popoverWidth > window.innerWidth - 20) {
          left = rect.left - popoverWidth - gap;
        }

        setCoords({
          top: rect.top,
          left: left
        });
      }
    }
  }, [nodeSettingsPopover.isOpen, nodeSettingsPopover.nodeId, isMobile]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as HTMLElement)) {
        const target = e.target as HTMLElement;
        if (!target.closest(`[data-id="${nodeSettingsPopover.nodeId}"]`)) {
          handleClose();
        }
      }
    };
    if (nodeSettingsPopover.isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [nodeSettingsPopover.isOpen, nodeSettingsPopover.nodeId]);

  if (!nodeSettingsPopover.isOpen || !node) return null;

  const handleClose = () => setNodeSettingsPopover({ isOpen: false });

  const handleDelete = () => {
    openDialog({
      title: 'Delete Node',
      message: `Are you sure you want to delete "${node.data.label}"? This action cannot be undone.`,
      type: 'confirm',
      onConfirm: () => {
        deleteNode(node.id);
        toast.success('Node deleted');
        handleClose();
      }
    });
  };

  const handleClone = () => {
    cloneNode(node.id);
    toast.success('Node cloned');
    handleClose();
  };

  const desktopStyle = { top: coords.top, left: coords.left };
  const mobileStyle = {};

  return (
    <>
      {isMobile && (
        <div className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm animate-in fade-in" onClick={handleClose} />
      )}
      <motion.div 
        ref={popoverRef}
        drag={!isMobile}
        dragControls={dragControls}
        dragListener={false}
        dragMomentum={false}
        initial={!isMobile ? { opacity: 0, scale: 0.95 } : undefined}
        animate={!isMobile ? { opacity: 1, scale: 1 } : undefined}
        transition={{ duration: 0.15 }}
        className="fixed inset-x-0 bottom-0 z-[70] h-[70vh] w-full bg-white rounded-t-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-full duration-300 md:absolute md:inset-auto md:w-[260px] md:h-auto md:rounded-xl md:border md:border-gray-200 md:z-[100] md:shadow-2xl"
        style={isMobile ? mobileStyle : desktopStyle}
      >
        {isMobile && (
          <div className="w-full flex justify-center pt-3 pb-1">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
          </div>
        )}
        <div 
          onPointerDown={(e) => !isMobile && dragControls.start(e)}
          className={clsx(
            "flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50",
            !isMobile && "cursor-grab active:cursor-grabbing"
          )}
        >
          <h3 className="font-bold text-gray-900 text-xs uppercase tracking-widest select-none pointer-events-none">Node Settings</h3>
          <button onPointerDown={(e) => e.stopPropagation()} onClick={handleClose} className="text-gray-400 hover:text-gray-700 transition-colors p-1 hover:bg-gray-100 rounded-md cursor-pointer">
            <X size={16} />
          </button>
        </div>

        <div className="p-4 flex flex-col gap-5 overflow-y-auto max-h-[80vh]">
          {node.data.type === 'Custom' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type Label</label>
              <input 
                value={(node.data.customTypeLabel as string) || 'CUSTOM'} 
                onChange={e => updateNode(node.id, { customTypeLabel: e.target.value.toUpperCase() })}
                placeholder="e.g. DATABASE"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/10 transition-all font-medium"
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Name</label>
            <input 
              value={(node.data.label as string) || ''} 
              onChange={e => updateNode(node.id, { label: e.target.value })}
              placeholder="Node label..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/10 transition-all font-medium"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description</label>
            <textarea 
              value={(node.data.description as string) || ''} 
              onChange={e => updateNode(node.id, { description: e.target.value })}
              placeholder="Optional details..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs md:text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/10 transition-all min-h-[60px] md:min-h-[80px] resize-none leading-relaxed text-gray-600"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Due Date</label>
            <input 
              type="date"
              value={(node.data.dueDate as string) || ''} 
              onChange={e => updateNode(node.id, { dueDate: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/10 transition-all font-medium text-gray-600"
            />
          </div>

          {node.data.type === 'Link' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-[#EC4899] uppercase tracking-widest">URL / Resource Link</label>
              <input 
                type="url"
                value={(node.data.url as string) || ''} 
                onChange={e => updateNode(node.id, { url: e.target.value })}
                placeholder="https://..."
                className="w-full border border-pink-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/10 transition-all font-medium"
              />
            </div>
          )}

          {node.data.type === 'Note' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-[#F59E0B] uppercase tracking-widest">Markdown Content</label>
              <textarea 
                value={(node.data.markdown as string) || ''} 
                onChange={e => updateNode(node.id, { markdown: e.target.value })}
                placeholder="# Heading&#10;Write your markdown here..."
                className="w-full border border-amber-200 rounded-lg px-3 py-2 text-xs md:text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all min-h-[150px] resize-y leading-relaxed text-gray-700 font-mono"
              />
            </div>
          )}

          {/* Custom Fields */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Custom Fields</label>
              <button 
                onClick={() => {
                  const fields = (node.data.customFields as any[]) || [];
                  updateNode(node.id, { customFields: [...fields, { id: crypto.randomUUID(), key: '', value: '' }] });
                }}
                className="text-[10px] font-bold text-[var(--accent)] flex items-center gap-1 hover:bg-accent/10 px-1.5 py-0.5 rounded transition-colors"
              >
                <Plus size={12} /> Add Field
              </button>
            </div>
            {((node.data.customFields as any[]) || []).map((field, index) => (
              <div key={field.id} className="flex items-center gap-2 mb-1">
                <input 
                  value={field.key}
                  onChange={e => {
                    const fields = [...((node.data.customFields as any[]) || [])];
                    fields[index].key = e.target.value;
                    updateNode(node.id, { customFields: fields });
                  }}
                  placeholder="Key"
                  className="w-1/3 border border-gray-200 rounded-md px-2 py-1.5 text-xs outline-none focus:border-[var(--accent)]"
                />
                <input 
                  value={field.value}
                  onChange={e => {
                    const fields = [...((node.data.customFields as any[]) || [])];
                    fields[index].value = e.target.value;
                    updateNode(node.id, { customFields: fields });
                  }}
                  placeholder="Value"
                  className="flex-1 border border-gray-200 rounded-md px-2 py-1.5 text-xs outline-none focus:border-[var(--accent)]"
                />
                <button 
                  onClick={() => {
                    const fields = ((node.data.customFields as any[]) || []).filter(f => f.id !== field.id);
                    updateNode(node.id, { customFields: fields });
                  }}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Checklist */}
          {node.data.type === 'Checklist' && (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Checklist Items</label>
                <button 
                  onClick={() => {
                    const list = (node.data.checklist as any[]) || [];
                    updateNode(node.id, { checklist: [...list, { id: crypto.randomUUID(), text: '', completed: false }] });
                  }}
                  className="text-[10px] font-bold text-[var(--accent)] flex items-center gap-1 hover:bg-accent/10 px-1.5 py-0.5 rounded transition-colors"
                >
                  <Plus size={12} /> Add Item
                </button>
              </div>
              {((node.data.checklist as any[]) || []).map((item, index) => (
                <div key={item.id} className="flex items-center gap-2 mb-1">
                  <div className="text-gray-300 cursor-grab"><GripVertical size={14} /></div>
                  <input 
                    value={item.text}
                    onChange={e => {
                      const list = [...((node.data.checklist as any[]) || [])];
                      list[index].text = e.target.value;
                      updateNode(node.id, { checklist: list });
                    }}
                    placeholder="Item text..."
                    className="flex-1 border border-gray-200 rounded-md px-2 py-1.5 text-xs outline-none focus:border-[var(--accent)]"
                  />
                  <button 
                    onClick={() => {
                      const list = ((node.data.checklist as any[]) || []).filter(i => i.id !== item.id);
                      updateNode(node.id, { checklist: list });
                    }}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-2.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Shape</label>
            <div className="grid grid-cols-2 gap-2">
              {SHAPES.map(s => (
                <button
                  key={s.id}
                  onClick={() => updateNode(node.id, { shape: s.id })}
                  className={clsx(
                    "flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg border transition-all",
                    node.data.shape === s.id || (!node.data.shape && s.id === 'rounded') 
                      ? "border-[var(--accent)] bg-accent/5 text-[var(--accent)] shadow-sm" 
                      : "border-gray-100 hover:border-gray-300 text-gray-400"
                  )}
                >
                  <s.icon size={20} strokeWidth={node.data.shape === s.id ? 2.5 : 2} />
                  <span className="text-[10px] font-bold uppercase tracking-tighter">{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Color</label>
            <div className="grid grid-cols-5 gap-2.5">
              {ACCENT_COLORS.map(c => (
                <button
                  key={c.id}
                  onClick={() => updateNode(node.id, { color: c.id })}
                  className={clsx(
                    "w-8 h-8 md:w-7 md:h-7 rounded-full transition-all flex items-center justify-center relative",
                    node.data.color === c.id ? "ring-2 ring-offset-2 ring-gray-200" : "hover:scale-110"
                  )}
                  style={{ backgroundColor: c.hex }}
                >
                  {node.data.color === c.id && (
                    <div className="w-5 h-5 md:w-4 md:h-4 rounded-full border-2 border-white shadow-sm" />
                  )}
                </button>
              ))}
              {/* Custom Color Picker */}
              <div className="relative">
                <button
                  className={clsx(
                    "w-8 h-8 md:w-7 md:h-7 rounded-full transition-all flex items-center justify-center relative bg-gray-100 text-gray-500 hover:bg-gray-200",
                    node.data.color?.toString().startsWith('#') ? "ring-2 ring-offset-2 ring-gray-200" : ""
                  )}
                  onClick={() => document.getElementById('customNodeColor')?.click()}
                  style={{ backgroundColor: node.data.color?.toString().startsWith('#') ? (node.data.color as string) : undefined }}
                >
                  <Pipette size={14} className={node.data.color?.toString().startsWith('#') ? "text-white shadow-sm" : ""} />
                </button>
                <input 
                  id="customNodeColor"
                  type="color"
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                  value={node.data.color?.toString().startsWith('#') ? (node.data.color as string) : '#000000'}
                  onChange={e => updateNode(node.id, { color: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-1">
            <button onClick={handleClone} className="text-[12px] md:text-[10px] font-bold text-[var(--accent)] flex items-center gap-1.5 hover:bg-accent/5 px-2 py-1.5 rounded-md transition-colors uppercase tracking-tight">
              <Copy size={isMobile ? 16 : 14} /> Clone
            </button>
            <button onClick={handleDelete} className="text-[12px] md:text-[10px] font-bold text-red-500 flex items-center gap-1.5 hover:bg-red-50 px-2 py-1.5 rounded-md transition-colors uppercase tracking-tight">
              <Trash2 size={isMobile ? 16 : 14} /> Delete
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};
