import { useState } from 'react';
import { useSynapseStore } from '../../store/useSynapseStore';
import { Search, Folder, Globe, MessageSquare, MousePointerClick, ArrowRight, PieChart, LayoutTemplate, Send, X, Plus, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { fetchAISuggestion } from '../../lib/ai/nvidiaNim';
import toast from 'react-hot-toast';

export const AddElementPopover = () => {
  const { addElementPopover, setAddElementPopover, addNode, variables, addVariable, removeVariable } = useSynapseStore();
  const [activeTab, setActiveTab] = useState<'elements' | 'variables'>('elements');
  const [varKey, setVarKey] = useState('');
  const [varValue, setVarValue] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);

  if (!addElementPopover.isOpen) return null;

  const handleClose = () => {
    setAddElementPopover({ isOpen: false, x: 0, y: 0 });
  };

  const handleAdd = (label: string, type: string) => {
    addNode({
      id: crypto.randomUUID(),
      type: 'custom',
      position: { x: 250, y: 250 },
      data: { label, type, description: 'New element added', color: 'gray', shape: 'rounded' },
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
      const prompt = `Suggest a short name and 1-sentence description for an element about "${aiPrompt}". Return JSON: {"name": "...", "description": "..."}`;
      const result = await fetchAISuggestion(prompt);
      const cleaned = result.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      addNode({
        id: crypto.randomUUID(),
        type: 'custom',
        position: { x: 250, y: 250 },
        data: { label: parsed.name, type: 'AI Generated', description: parsed.description, color: 'purple', shape: 'rounded' },
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
          className={`flex-1 py-2 text-xs font-medium ${activeTab === 'elements' ? 'text-[#0078D4] border-b-2 border-[#0078D4]' : 'text-gray-500'}`}
        >
          Elements
        </button>
        <button 
          onClick={() => setActiveTab('variables')} 
          className={`flex-1 py-2 text-xs font-medium ${activeTab === 'variables' ? 'text-[#0078D4] border-b-2 border-[#0078D4]' : 'text-gray-500'}`}
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
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4]"
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

          <div className="px-2 mb-1">
            <p className="text-[11px] font-semibold text-gray-900 mb-1">Copy From</p>
            <button onClick={() => handleAdd('Asset Library', 'Copy')} className="w-full flex items-center gap-2 text-sm text-gray-700 hover:bg-gray-50 px-2 py-1.5 rounded-md">
              <Folder size={14} className="text-emerald-500" /> Asset Library
            </button>
          </div>

          <div className="px-2 mb-1 mt-2">
            <p className="text-[11px] font-semibold text-gray-900 mb-1">Ad Group</p>
            <button onClick={() => handleAdd('Standard Ad Group', 'Ad Group')} className="w-full flex items-center gap-2 text-sm text-gray-700 bg-blue-50 px-2 py-1.5 rounded-md">
              <Globe size={14} className="text-blue-500" /> Standard Ad Group
            </button>
            <button onClick={() => handleAdd('LinkedIn Ad Group', 'Ad Group')} className="w-full flex items-center gap-2 text-sm text-gray-700 hover:bg-gray-50 px-2 py-1.5 rounded-md">
              <Globe size={14} className="text-blue-600" /> LinkedIn Ad Group
            </button>
          </div>

          <div className="px-2 mb-1 mt-2">
            <p className="text-[11px] font-semibold text-gray-900 mb-1">Web Personalization</p>
            <button onClick={() => handleAdd('Message', 'Web')} className="w-full flex items-center gap-2 text-sm text-gray-700 hover:bg-gray-50 px-2 py-1.5 rounded-md">
              <MessageSquare size={14} className="text-orange-400" /> Message
            </button>
            <button onClick={() => handleAdd('Overlay CTA', 'Web')} className="w-full flex items-center gap-2 text-sm text-gray-700 hover:bg-gray-50 px-2 py-1.5 rounded-md">
              <MousePointerClick size={14} className="text-orange-400" /> Overlay CTA
            </button>
            <button onClick={() => handleAdd('Redirect', 'Web')} className="w-full flex items-center gap-2 text-sm text-gray-700 hover:bg-gray-50 px-2 py-1.5 rounded-md">
              <ArrowRight size={14} className="text-orange-400" /> Redirect
            </button>
            <button onClick={() => handleAdd('Google Segment', 'Web')} className="w-full flex items-center gap-2 text-sm text-gray-700 hover:bg-gray-50 px-2 py-1.5 rounded-md">
              <PieChart size={14} className="text-orange-400" /> Google Segment
            </button>
          </div>

          <div className="px-2 mb-1 mt-2">
            <p className="text-[11px] font-semibold text-gray-900 mb-1">Add To</p>
            <button onClick={() => handleAdd('Smart Page', 'Add')} className="w-full flex items-center gap-2 text-sm text-gray-700 hover:bg-gray-50 px-2 py-1.5 rounded-md">
              <LayoutTemplate size={14} className="text-purple-400" /> Smart Page
            </button>
            <button onClick={() => handleAdd('Marketo Campaign', 'Add')} className="w-full flex items-center gap-2 text-sm text-gray-700 hover:bg-gray-50 px-2 py-1.5 rounded-md">
              <Send size={14} className="text-purple-400" /> Marketo Campaign
            </button>
          </div>
        </div>
      )}

      {activeTab === 'variables' && (
        <div className="p-4 flex flex-col h-[300px]">
          <div className="flex flex-col gap-2 mb-4">
            <input 
              placeholder="Variable Key" 
              className="px-2 py-1.5 text-sm border border-gray-200 rounded-md outline-none focus:border-[#0078D4]" 
              value={varKey}
              onChange={e => setVarKey(e.target.value)}
            />
            <input 
              placeholder="Variable Value" 
              className="px-2 py-1.5 text-sm border border-gray-200 rounded-md outline-none focus:border-[#0078D4]" 
              value={varValue}
              onChange={e => setVarValue(e.target.value)}
            />
            <button 
              onClick={handleAddVariable}
              className="flex items-center justify-center gap-2 bg-[#0078D4] text-white py-1.5 rounded-md text-sm font-medium hover:bg-blue-700"
            >
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
