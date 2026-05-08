import { useState } from 'react';
import { useSynapseStore } from '../../store/useSynapseStore';

export const LeftSidebar = () => {
  const addNode = useSynapseStore(state => state.addNode);
  const [formData, setFormData] = useState({ label: '', type: 'Task', color: 'bg-white' });

  const handleAdd = () => {
    addNode({
      id: crypto.randomUUID(),
      type: 'custom',
      position: { x: 100, y: 100 },
      data: { ...formData },
    });
    // Optional: Reset form after adding
    setFormData({ label: '', type: 'Task', color: 'bg-white' });
  };

  return (
    <div className="p-4 flex flex-col gap-6">
      <section>
        <h3 className="font-bold mb-2 text-synapse-blue">Library</h3>
        <div className="grid grid-cols-2 gap-2">
          {['Task', 'Decision', 'Note'].map(t => (
            <div key={t} className="p-2 border rounded cursor-move bg-white text-xs text-center hover:bg-slate-100">
              {t}
            </div>
          ))}
        </div>
      </section>

      <section className="p-4 bg-synapse-yellow/10 rounded-lg border border-synapse-yellow">
        <h3 className="font-bold mb-4">Add New Card</h3>
        <div className="flex flex-col gap-3">
          <input 
            placeholder="Name" 
            className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-synapse-blue" 
            value={formData.label}
            onChange={e => setFormData({...formData, label: e.target.value})}
          />
          <select 
            className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-synapse-blue"
            value={formData.type}
            onChange={e => setFormData({...formData, type: e.target.value})}
          >
            <option>Task</option>
            <option>Decision</option>
            <option>Note</option>
          </select>
          <button 
            onClick={handleAdd}
            className="bg-synapse-blue text-white p-2 rounded font-bold hover:bg-blue-600 transition-colors"
          >
            Add to Canvas
          </button>
        </div>
      </section>
    </div>
  );
};
