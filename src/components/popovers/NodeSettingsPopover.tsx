import { useSynapseStore } from '../../store/useSynapseStore';
import { X, Trash2, Copy, Square, Circle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useEffect, useState, useRef } from 'react';
import { clsx } from 'clsx';

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

  const node = nodes.find(n => n.id === nodeSettingsPopover.nodeId);

  useEffect(() => {
    if (nodeSettingsPopover.isOpen && nodeSettingsPopover.nodeId) {
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
  }, [nodeSettingsPopover.isOpen, nodeSettingsPopover.nodeId]);

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

  return (
    <div 
      ref={popoverRef}
      className="fixed z-[100] bg-white rounded-xl shadow-2xl border border-gray-200 w-[260px] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      style={{ top: coords.top, left: coords.left }}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
        <h3 className="font-bold text-gray-900 text-xs uppercase tracking-widest">Node Settings</h3>
        <button onClick={handleClose} className="text-gray-400 hover:text-gray-700 transition-colors p-1 hover:bg-gray-100 rounded-md">
          <X size={16} />
        </button>
      </div>

      <div className="p-4 flex flex-col gap-5 overflow-y-auto max-h-[80vh]">
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
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/10 transition-all min-h-[60px] resize-none leading-relaxed text-gray-600"
          />
        </div>

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
          <div className="grid grid-cols-4 gap-2.5">
            {ACCENT_COLORS.map(c => (
              <button
                key={c.id}
                onClick={() => updateNode(node.id, { color: c.id })}
                className={clsx(
                  "w-7 h-7 rounded-full transition-all flex items-center justify-center relative",
                  node.data.color === c.id ? "ring-2 ring-offset-2 ring-gray-200" : "hover:scale-110"
                )}
                style={{ backgroundColor: c.hex }}
              >
                {node.data.color === c.id && (
                  <div className="w-4 h-4 rounded-full border-2 border-white shadow-sm" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-1">
          <button onClick={handleClone} className="text-[10px] font-bold text-[var(--accent)] flex items-center gap-1.5 hover:bg-accent/5 px-2 py-1 rounded-md transition-colors uppercase tracking-tight">
            <Copy size={14} /> Clone
          </button>
          <button onClick={handleDelete} className="text-[10px] font-bold text-red-500 flex items-center gap-1.5 hover:bg-red-50 px-2 py-1 rounded-md transition-colors uppercase tracking-tight">
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};
