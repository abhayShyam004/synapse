import { useSynapseStore } from '../../store/useSynapseStore';
import { X, Trash2, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

export const NodeSettingsPopover = () => {
  const { nodeSettingsPopover, setNodeSettingsPopover, nodes, updateNode, deleteNode, cloneNode } = useSynapseStore();

  if (!nodeSettingsPopover.isOpen || !nodeSettingsPopover.nodeId) return null;

  const node = nodes.find(n => n.id === nodeSettingsPopover.nodeId);
  if (!node) return null;

  const handleClose = () => setNodeSettingsPopover({ isOpen: false });

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this node?')) {
      deleteNode(node.id);
      toast.success('Node deleted');
      handleClose();
    }
  };

  const handleClone = () => {
    cloneNode(node.id);
    toast.success('Node cloned');
    handleClose();
  };

  return (
    <div className="absolute right-4 top-20 bg-white rounded-lg shadow-xl border border-gray-200 w-72 flex flex-col z-50 overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-gray-50">
        <h3 className="font-semibold text-gray-900 text-sm">Node Settings</h3>
        <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
          <X size={16} />
        </button>
      </div>

      <div className="p-4 flex flex-col gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Name</label>
          <input 
            value={(node.data.label as string) || ''} 
            onChange={e => updateNode(node.id, { label: e.target.value })}
            className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Description</label>
          <textarea 
            value={(node.data.description as string) || ''} 
            onChange={e => updateNode(node.id, { description: e.target.value })}
            className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] min-h-[60px]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Color Header</label>
          <div className="flex gap-2">
            {['gray', 'blue', 'green', 'orange', 'purple'].map(color => (
              <button
                key={color}
                onClick={() => updateNode(node.id, { color })}
                className={`w-6 h-6 rounded-full border-2 ${node.data.color === color ? 'border-[var(--accent)]' : 'border-transparent'} hover:scale-110 transition-transform`}
                style={{
                  backgroundColor: color === 'gray' ? '#4B5563' : 
                                   color === 'blue' ? '#3B82F6' : 
                                   color === 'green' ? '#10B981' : 
                                   color === 'orange' ? '#F59E0B' : '#8B5CF6'
                }}
              />
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
          <button onClick={handleClone} className="text-sm font-medium text-[#0078D4] flex items-center gap-1 hover:text-blue-700">
            <Copy size={14} /> Clone
          </button>
          <button onClick={handleDelete} className="text-sm font-medium text-red-500 flex items-center gap-1 hover:text-red-700">
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};
