import { useState } from 'react';
import { useSynapseStore } from '../../store/useSynapseStore';
import { Search, Zap, Diamond, Settings2, CheckSquare, X, ListTodo, Link, FileText, Goal } from 'lucide-react';
import { useReactFlow } from '@xyflow/react';

export const AddElementPopover = () => {
  const { addElementPopover, setAddElementPopover, addNode } = useSynapseStore();
  const { screenToFlowPosition, getViewport } = useReactFlow();
  const [searchQuery, setSearchQuery] = useState('');

  if (!addElementPopover.isOpen) return null;

  const handleClose = () => {
    setAddElementPopover({ isOpen: false, x: 0, y: 0, edgeId: undefined });
  };

  const handleAdd = (label: string, type: string, color: string) => {
    let position;
    if (addElementPopover.edgeId) {
      position = screenToFlowPosition({ x: addElementPopover.x, y: addElementPopover.y });
    } else {
      const { x, y, zoom } = getViewport();
      // Calculate center of current viewport in flow space
      position = {
        x: -x / zoom + (window.innerWidth / 2) / zoom - 110, // -110 is half of node width
        y: -y / zoom + (window.innerHeight / 2) / zoom - 20,
      };
    }

    addNode({
      id: crypto.randomUUID(),
      type: 'custom',
      position,
      data: { label, type, description: 'New ' + type, color, shape: 'rounded', expanded: true },
    });
    handleClose();
  };



  const elements = [
    { category: 'Planning', items: [
      { label: 'Goal', type: 'Goal', color: 'purple', icon: Goal },
      { label: 'Milestone', type: 'Milestone', color: 'orange', icon: Diamond }
    ]},
    { category: 'Execution', items: [
      { label: 'Task', type: 'Task', color: 'blue', icon: CheckSquare },
      { label: 'Practice', type: 'Practice', color: 'green', icon: Zap },
      { label: 'Checklist', type: 'Checklist', color: 'teal', icon: ListTodo }
    ]},
    { category: 'Resources', items: [
      { label: 'Link', type: 'Link', color: 'pink', icon: Link },
      { label: 'Note', type: 'Note', color: 'amber', icon: FileText }
    ]},
    { category: 'Other', items: [
      { label: 'Custom', type: 'Custom', color: 'gray', icon: Settings2 }
    ]}
  ];

  return (
    <div 
      className="absolute bg-white rounded-lg shadow-xl border border-gray-200 w-80 flex flex-col z-50 overflow-hidden"
      style={{ top: Math.min(addElementPopover.y, window.innerHeight - 500), left: Math.min(addElementPopover.x, window.innerWidth - 320) }}
    >
      <div className="flex items-center justify-between p-3 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900 text-sm">Add Element</h3>
        <button onClick={handleClose} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
      </div>

      <div className="p-2 flex flex-col max-h-[400px] overflow-y-auto">
        <div className="px-2 py-2">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search Elements" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-[#06B6D4] focus:ring-1 focus:ring-[#06B6D4]"
            />
          </div>
        </div>



        {elements.map((group) => {
          const filteredItems = group.items.filter(item => item.label.toLowerCase().includes(searchQuery.toLowerCase()));
          if (filteredItems.length === 0) return null;
          return (
            <div key={group.category} className="px-2 mb-1 mt-2">
              <p className="text-[11px] font-semibold text-gray-900 mb-1">{group.category}</p>
              {filteredItems.map(item => (
                <button 
                  key={item.type}
                  onClick={() => handleAdd(item.label, item.type, item.color)} 
                  className="w-full flex items-center gap-2 text-sm text-gray-700 hover:bg-gray-50 px-2 py-1.5 rounded-md"
                >
                  <item.icon size={14} className={
                    item.color === 'green' ? 'text-[#10B981]' :
                    item.color === 'blue' ? 'text-[#3B82F6]' :
                    item.color === 'orange' ? 'text-[#F59E0B]' :
                    item.color === 'amber' ? 'text-[#F59E0B]' :
                    item.color === 'purple' ? 'text-[#8B5CF6]' :
                    item.color === 'teal' ? 'text-[#0D9488]' :
                    item.color === 'pink' ? 'text-[#EC4899]' :
                    'text-gray-500'
                  } /> {item.label}
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};
