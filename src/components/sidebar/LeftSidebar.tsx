// src/components/sidebar/LeftSidebar.tsx
import { useState } from 'react';
import { useSynapseStore } from '../../store/useSynapseStore';
import { NODE_TYPES } from '../canvas/nodes/NodeStyles';
import { Sparkles } from 'lucide-react';

export const LeftSidebar = () => {
  const addNode = useSynapseStore(state => state.addNode);
  const [formData, setFormData] = useState({ label: '', type: 'Task', color: 'yellow', shape: 'rounded' });

  const handleAdd = () => {
    addNode({
      id: crypto.randomUUID(),
      type: 'custom',
      position: { x: 250, y: 250 },
      data: { ...formData },
    });
    // Reset form after adding
    setFormData({ label: '', type: 'Task', color: 'yellow', shape: 'rounded' });
  };

  return (
    <div className="p-6 flex flex-col gap-8">
      <section>
        <h3 className="font-bold mb-4 text-black uppercase tracking-wider text-lg">Library</h3>
        <div className="grid grid-cols-2 gap-3">
          {NODE_TYPES.map(t => (
            <button 
              key={t.type} 
              onClick={() => setFormData({...formData, type: t.type, color: t.color, shape: t.defaultShape})}
              className="p-3 border-2 border-black rounded-none font-bold text-xs hover:translate-y-px hover:shadow-none transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-left"
              style={{ 
                backgroundColor: t.color === 'white' 
                  ? '#fff' 
                  : t.color === 'yellow'
                  ? 'var(--color-synapse-yellow)'
                  : t.color === 'cyan'
                  ? 'var(--color-synapse-cyan)'
                  : t.color === 'blue'
                  ? 'var(--color-synapse-blue)'
                  : t.color // fallback for hex or tailwind named colors
              }}
            >
              {t.type}
            </button>
          ))}
        </div>
      </section>

      <section className="p-5 border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <h3 className="font-bold mb-4 text-black uppercase tracking-wider">Add New Card</h3>
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <input 
              placeholder="Card Name" 
              className="flex-1 p-3 border-2 border-black rounded-none outline-none focus:ring-4 focus:ring-synapse-cyan font-bold" 
              value={formData.label}
              onChange={e => setFormData({...formData, label: e.target.value})}
            />
            <button className="p-3 border-2 border-black bg-synapse-yellow hover:bg-yellow-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Sparkles size={20} />
            </button>
          </div>
          <select 
            className="p-3 border-2 border-black rounded-none font-bold outline-none focus:ring-4 focus:ring-synapse-cyan"
            value={formData.type}
            onChange={e => {
              const selectedType = NODE_TYPES.find(t => t.type === e.target.value);
              setFormData({
                ...formData, 
                type: e.target.value,
                color: selectedType?.color || 'white',
                shape: selectedType?.defaultShape || 'rounded'
              });
            }}
          >
            {NODE_TYPES.map(t => <option key={t.type} value={t.type}>{t.type}</option>)}
          </select>
          <button 
            onClick={handleAdd}
            className="w-full bg-black text-white p-4 rounded-none font-bold text-lg hover:bg-gray-800 transition-colors"
          >
            Add to Canvas
          </button>
        </div>
      </section>
    </div>
  );
};
