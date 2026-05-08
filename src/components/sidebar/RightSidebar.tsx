// src/components/sidebar/RightSidebar.tsx
import { useSynapseStore } from '../../store/useSynapseStore';
import { NODE_TYPES } from '../canvas/nodes/NodeStyles';

export const RightSidebar = () => {
  const nodes = useSynapseStore(state => state.nodes);
  const updateNode = useSynapseStore(state => state.updateNode);
  
  const selectedNode = nodes.find(n => n.selected);

  if (!selectedNode) {
    return (
      <div className="p-6 h-full flex items-center justify-center text-center text-gray-500 font-bold">
        Select a node to view properties
      </div>
    );
  }

  const { data } = selectedNode;

  return (
    <div className="p-6 flex flex-col gap-6">
      <h3 className="font-bold text-black uppercase tracking-wider text-xl border-b-4 border-black pb-4">Properties</h3>
      
      <div className="flex flex-col gap-4">
        <div>
          <label className="text-xs font-bold uppercase mb-1 block">Label</label>
          <input 
            value={data.label as string} 
            onChange={(e) => updateNode(selectedNode.id, { label: e.target.value })}
            className="w-full p-3 border-2 border-black font-bold outline-none focus:ring-4 focus:ring-synapse-cyan"
          />
        </div>
        
        <div>
          <label className="text-xs font-bold uppercase mb-1 block">Description</label>
          <textarea 
            value={(data.description as string) || ''} 
            onChange={(e) => updateNode(selectedNode.id, { description: e.target.value })}
            className="w-full p-3 border-2 border-black font-bold outline-none focus:ring-4 focus:ring-synapse-cyan min-h-[100px]"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase mb-1 block">Color</label>
          <select 
            value={data.color as string}
            onChange={(e) => updateNode(selectedNode.id, { color: e.target.value })}
            className="w-full p-3 border-2 border-black font-bold outline-none focus:ring-4 focus:ring-synapse-cyan"
          >
            {NODE_TYPES.map(t => <option key={t.color} value={t.color}>{t.color}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
};