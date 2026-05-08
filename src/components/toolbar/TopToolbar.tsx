import { useSynapseStore } from '../../store/useSynapseStore';
import toast from 'react-hot-toast';
import { ArrowLeft, ChevronDown, Sparkles, Settings as SettingsIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { useState } from 'react';

export const TopToolbar = () => {
  const { ghostCardsEnabled, toggleGhostCards, expandAllNodes, setMetricsPopover, toggleSettingsModal } = useSynapseStore();
  const [workflowName, setWorkflowName] = useState('Synapse Workflow');

  const handleTestRun = () => {
    toast.success('Test run started');
  };

  const handlePublish = () => {
    toast.success('Workflow activated!');
  };

  return (
    <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4 shrink-0 z-20 relative shadow-sm">
      <div className="flex items-center gap-4">
        <button className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 transition-colors hover:text-[#F59E0B]">
          <ArrowLeft size={18} />
        </button>
        <div className="w-8 h-8 bg-gray-900 rounded-md flex items-center justify-center text-white font-bold text-lg leading-none">
          S
        </div>
        <div className="flex items-center gap-2">
          <input 
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="font-semibold text-[15px] text-gray-900 outline-none hover:bg-gray-50 focus:bg-gray-50 px-1 rounded border border-transparent focus:border-gray-200 transition-all"
          />
          <span className="text-[10px] font-bold bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-sm uppercase tracking-wide">
            Draft
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={() => expandAllNodes(true)} className="text-sm font-medium text-[#0078D4] hover:text-[#06B6D4] hover:underline mr-2 transition-colors">
          Expand All
        </button>
        
        <button onClick={() => setMetricsPopover(true)} className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-[#0078D4] px-2 py-1.5 rounded-md border border-transparent hover:border-gray-200 transition-all">
          Metrics <ChevronDown size={14} className="text-gray-400" />
        </button>

        <button 
          onClick={handleTestRun}
          className="text-sm font-medium text-[#0078D4] border border-[#0078D4] px-3 py-1.5 rounded-md hover:bg-blue-50 transition-colors"
        >
          Test Run
        </button>

        <button onClick={handlePublish} className="flex items-center gap-1 text-sm font-medium text-white bg-[#06B6D4] hover:bg-cyan-600 px-3 py-1.5 rounded-md transition-colors">
          Publish <ChevronDown size={14} className="text-white/80" />
        </button>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        <button 
          onClick={toggleGhostCards}
          className={clsx(
            "p-1.5 rounded-md transition-colors",
            ghostCardsEnabled ? "text-[#F59E0B] bg-yellow-50" : "text-gray-400 hover:bg-gray-100 hover:text-[#F59E0B]"
          )}
          title={`AI Ghost Cards: ${ghostCardsEnabled ? 'ON' : 'OFF'}`}
        >
          <Sparkles size={18} />
        </button>

        <button onClick={() => toggleSettingsModal(true)} className="p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-md transition-colors" title="Settings">
          <SettingsIcon size={18} />
        </button>
      </div>
    </header>
  );
};
