import { useState } from 'react';
import { useSynapseStore } from '../../store/useSynapseStore';
import { Search, Zap, Diamond, Settings2, Repeat, CheckSquare, Clock, Sparkles, Variable, StickyNote, X, Plus, Trash2, Loader2 } from 'lucide-react';
import { fetchAISuggestion } from '../../lib/ai/nvidiaNim';
import toast from 'react-hot-toast';

export const AddElementPopover = () => {
  const { addElementPopover, setAddElementPopover, addNode, variables, addVariable, removeVariable } = useSynapseStore();
  const [activeTab, setActiveTab] = useState<'elements' | 'variables'>('elements');
  const [varKey, setVarKey] = useState('');
  const [varValue, setVarValue] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  if (!addElementPopover.isOpen) return null;

  const handleClose = () => {
    setAddElementPopover({ isOpen: false, x: 0, y: 0, edgeId: undefined });
  };

  const handleAdd = (label: string, type: string, color: string) => {
    addNode({
      id: crypto.randomUUID(),
      type: 'custom',
      position: { x: 250, y: 250 }, // Ideally centered on canvas, but let's just use defaults unless edgeId is set
      data: { label, type, description: 'New ' + type, color, shape: 'rounded', expanded: true },
    });
    handleClose();
  };

  const handleAddVariable = () => {
    if (!varKey || !varValue) return toast.error('Key and Value required');
    if (variables.some(v => v.key === varKey)) return toast.error('Variable key already exists');
    addVariable({ key: varKey, value: varValue });
    setVarKey('');
    setVarValue('');
    toast.success('Variable added');
  };

  const handleAISuggest = async () => {
    if (!aiPrompt) return;
    setIsSuggesting(true);
    try {
      const prompt = `Suggest a short name and 1-sentence description for a workflow node about "${aiPrompt}". Return JSON: {"name": "...", "description": "..."}`;
      const result = await fetchAISuggestion(prompt);
      const cleaned = result.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      addNode({
        id: crypto.randomUUID(),
        type: 'custom',
        position: { x: 250, y: 250 },
        data: { label: parsed.name, type: 'AI Prompt', description: parsed.description, color: 'purple', shape: 'rounded', expanded: true },
      });
      setAiPrompt('');
      toast.success('AI Node generated!');
      handleClose();
    } catch (error) {
      toast.error('AI Suggestion failed');
    } finally {
      setIsSuggesting(false);
    }
  };

  const elements = [
    { category: 'Triggers', items: [{ label: 'Trigger Node', type: 'Trigger', color: 'green', icon: Zap }] },
    { category: 'Logic', items: [
      { label: 'Decision', type: 'Decision', color: 'gray', icon: Diamond },
      { label: 'Condition', type: 'Condition', color: 'orange', icon: Settings2 },
      { label: 'Loop', type: 'Loop', color: 'pink', icon: Repeat }
    ]},
    { category: 'Actions', items: [
      { label: 'Task', type: 'Task', color: 'blue', icon: CheckSquare },
      { label: 'Timer', type: 'Timer', color: 'amber', icon: Clock }
    ]},
    { category: 'AI', items: [{ label: 'AI Prompt', type: 'AI Prompt', color: 'purple', icon: Sparkles }] },
    { category: 'Data', items: [
      { label: 'Variable', type: 'Variable', color: 'teal', icon: Variable },
      { label: 'Note', type: 'Note', color: 'gray', icon: StickyNote }
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

      <div className="flex border-b border-gray-100">
        <button 
          onClick={() => setActiveTab('elements')} 
          className={`flex-1 py-2 text-xs font-medium ${activeTab === 'elements' ? 'text-[#06B6D4] border-b-2 border-[#06B6D4]' : 'text-gray-500'}`}
        >
          Elements
        </button>
        <button 
          onClick={() => setActiveTab('variables')} 
          className={`flex-1 py-2 text-xs font-medium ${activeTab === 'variables' ? 'text-[#06B6D4] border-b-2 border-[#06B6D4]' : 'text-gray-500'}`}
        >
          Variables
        </button>
      </div>

      {activeTab === 'elements' && (
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

          <div className="px-2 py-2">
             <div className="flex items-center gap-2 mb-2">
               <input 
                 value={aiPrompt}
                 onChange={e => setAiPrompt(e.target.value)}
                 placeholder="Describe a node to generate..."
                 className="flex-1 text-xs border border-gray-200 rounded-md px-2 py-1.5 outline-none focus:border-purple-400"
               />
               <button 
                 onClick={handleAISuggest}
                 disabled={isSuggesting || !aiPrompt}
                 className="bg-purple-100 text-purple-700 p-1.5 rounded-md hover:bg-purple-200 disabled:opacity-50"
               >
                 {isSuggesting ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
               </button>
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
      )}

      {activeTab === 'variables' && (
        <div className="p-4 flex flex-col h-[300px]">
          <div className="flex flex-col gap-2 mb-4">
            <input 
              placeholder="Variable Key" 
              className="px-2 py-1.5 text-sm border border-gray-200 rounded-md outline-none focus:border-[#06B6D4]" 
              value={varKey}
              onChange={e => setVarKey(e.target.value)}
            />
            <input 
              placeholder="Variable Value" 
              className="px-2 py-1.5 text-sm border border-gray-200 rounded-md outline-none focus:border-[#06B6D4]" 
              value={varValue}
              onChange={e => setVarValue(e.target.value)}
            />
            <button 
              onClick={handleAddVariable}
              className="flex items-center justify-center gap-2 bg-[#06B6D4] text-white py-1.5 rounded-md text-sm font-medium hover:bg-cyan-600"            >
              <Plus size={14} /> Add Variable
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {variables.map(v => (
              <div key={v.key} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex flex-col overflow-hidden">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase truncate">{v.key}</span>
                  <span className="text-xs font-medium text-gray-700 truncate">{v.value}</span>
                </div>
                <button onClick={() => removeVariable(v.key)} className="text-gray-400 hover:text-red-500">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {variables.length === 0 && (
              <p className="text-center text-xs text-gray-400 mt-4">No variables set</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
