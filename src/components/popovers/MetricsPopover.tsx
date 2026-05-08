import { useSynapseStore } from '../../store/useSynapseStore';
import { X, Activity, CircleDot, Network, Variable } from 'lucide-react';

export const MetricsPopover = () => {
  const { metricsPopover, setMetricsPopover, nodes, edges, variables } = useSynapseStore();

  if (!metricsPopover.isOpen) return null;

  return (
    <div className="absolute top-16 right-40 bg-white rounded-lg shadow-xl border border-gray-200 w-64 flex flex-col z-50 overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-gray-50">
        <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
          <Activity size={14} className="text-[#06B6D4]" /> Workflow Metrics
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
