import { useSynapseStore } from '../../store/useSynapseStore';
import { X, Activity, CircleDot, Network, Variable } from 'lucide-react';

export const MetricsPopover = () => {
  const { metricsPopover, setMetricsPopover, nodes, edges, variables } = useSynapseStore();

  if (!metricsPopover.isOpen) return null;

  return (
    <div className="fixed inset-x-0 top-12 w-full md:absolute md:top-16 md:right-40 md:w-64 bg-white md:rounded-lg shadow-xl border-b md:border border-gray-200 flex flex-col z-[100] md:z-50 overflow-hidden animate-in slide-in-from-top-2 md:fade-in">
      <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-gray-50">
        <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
          <Activity size={14} className="text-[var(--accent)]" /> Workflow Metrics
        </h3>
        <button onClick={() => setMetricsPopover(false)} className="text-gray-400 hover:text-gray-600">
          <X size={16} />
        </button>
      </div>

      <div className="p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CircleDot size={16} className="text-gray-400" /> Total Nodes
          </div>
          <span className="font-bold text-gray-900">{nodes.length}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Network size={16} className="text-gray-400" /> Total Connections
          </div>
          <span className="font-bold text-gray-900">{edges.length}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Variable size={16} className="text-gray-400" /> Variables Configured
          </div>
          <span className="font-bold text-gray-900">{variables.length}</span>
        </div>
      </div>
    </div>
  );
};
