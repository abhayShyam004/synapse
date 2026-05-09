import { useSynapseStore } from '../../store/useSynapseStore';
import toast from 'react-hot-toast';
import { ArrowLeft, ChevronDown, Sparkles, Settings as SettingsIcon } from 'lucide-react';
import { clsx } from 'clsx';

export const TopToolbar = () => {
  const { ghostCardsEnabled, toggleGhostCards, expandAllNodes, setMetricsPopover, toggleSettingsModal, workflowName, setWorkflowName } = useSynapseStore();

  const handleTestRun = () => {
    toast.success('Test run started');
  };

  const handlePublish = () => {
    toast.success('Workflow activated!');
  };

  return (
    <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4 shrink-0 z-20 relative shadow-sm">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => window.location.href = '/'}
          className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 transition-colors hover:text-[var(--accent)]"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="grid grid-cols-2 gap-0.5 w-5 h-5">
              <div className="w-2 h-2 rounded-full bg-[var(--accent)]"></div>
              <div className="w-2 h-2 rounded-full bg-gray-900"></div>
              <div className="w-2 h-2 rounded-full bg-gray-900"></div>
              <div className="w-2 h-2 rounded-full bg-gray-900"></div>
            </div>
            <span className="font-bold text-lg text-gray-900 tracking-tight">Synapse</span>
          </div>
          <div className="w-px h-4 bg-gray-200 mx-1"></div>
          <input 
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="font-medium text-[15px] text-gray-600 outline-none hover:bg-gray-50 focus:bg-gray-50 px-1 rounded border border-transparent focus:border-gray-200 transition-all"
          />
          <span className="text-[10px] font-bold bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-sm uppercase tracking-widest border border-gray-200">
            Draft
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={() => expandAllNodes(true)} className="text-sm font-medium text-gray-500 hover:text-[var(--accent)] transition-colors">
          Expand All
        </button>
        
        <button onClick={() => setMetricsPopover(true)} className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-[#0078D4] px-2 py-1.5 rounded-md border border-transparent hover:border-gray-200 transition-all">
          Metrics <ChevronDown size={14} className="text-gray-400" />
        </button>

        <button 
          onClick={handleTestRun}
          className="text-sm font-medium text-[#0078D4] border border-[#0078D4] px-4 py-1.5 rounded-md hover:bg-blue-50 transition-colors"
        >
          Test Run
        </button>

        <button 
          onClick={handlePublish} 
          style={{ backgroundColor: 'var(--accent)' }}
          className="flex items-center gap-1 text-sm font-semibold text-white hover:brightness-90 px-4 py-1.5 rounded-md transition-all shadow-sm shadow-cyan-100"
        >
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
