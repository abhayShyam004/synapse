import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Toaster, toast } from 'react-hot-toast'
import { ArrowLeft, Plus, Folder, Clock, MoreVertical, Search, Trash2 } from 'lucide-react'
import { useSynapseStore } from './store/useSynapseStore'
import { GlobalDialog } from './components/modals/GlobalDialog'

interface WorkflowMetadata {
  id: string;
  name: string;
  lastModified: string;
  nodes: number;
}

const Dashboard = () => {
  const { openDialog } = useSynapseStore();
  const [workflows, setWorkflows] = useState<WorkflowMetadata[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Load workflows from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('synapse-workflows-list');
    if (saved) {
      setWorkflows(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage whenever list changes
  const saveWorkflows = (list: WorkflowMetadata[]) => {
    setWorkflows(list);
    localStorage.setItem('synapse-workflows-list', JSON.stringify(list));
  };

  const createNewSynapse = () => {
    const id = crypto.randomUUID();
    const newWorkflow: WorkflowMetadata = {
      id,
      name: `New Synapse ${workflows.length + 1}`,
      lastModified: 'Just now',
      nodes: 0,
    };
    saveWorkflows([newWorkflow, ...workflows]);
    toast.success('Synapse created!');
    setTimeout(() => {
      window.location.href = `/work/?id=${id}`;
    }, 800);
  };

  const renameWorkflow = (e: React.MouseEvent, id: string, currentName: string) => {
    e.stopPropagation();
    openDialog({
      title: 'Rename Synapse',
      message: 'Enter a new name for this workflow:',
      type: 'prompt',
      defaultValue: currentName,
      onConfirm: (newName) => {
        if (newName && newName !== currentName) {
          const updated = workflows.map(w => w.id === id ? { ...w, name: newName, lastModified: 'Just now' } : w);
          saveWorkflows(updated);
          toast.success('Synapse renamed');
        }
      }
    });
  };

  const deleteWorkflow = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    openDialog({
      title: 'Delete Synapse',
      message: 'Are you sure you want to delete this synapse permanently? This cannot be undone.',
      type: 'confirm',
      onConfirm: () => {
        const filtered = workflows.filter(w => w.id !== id);
        saveWorkflows(filtered);
        toast.success('Synapse deleted');
      }
    });
  };

  const filteredWorkflows = workflows.filter(w => 
    w.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F3F4F6] font-sans relative" style={{ 
      backgroundImage: 'radial-gradient(#C8CDD6 1.5px, transparent 1.5px)',
      backgroundSize: '20px 20px'
    }}>
      <Toaster position="bottom-right" />
      <GlobalDialog />
      
      {/* Header */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-6">
          <button onClick={() => window.location.href = '/'} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="grid grid-cols-2 gap-0.5 w-5 h-5">
              <div className="w-2 h-2 rounded-full bg-[#06B6D4]"></div>
              <div className="w-2 h-2 rounded-full bg-gray-900"></div>
              <div className="w-2 h-2 rounded-full bg-gray-900"></div>
              <div className="w-2 h-2 rounded-full bg-gray-900"></div>
            </div>
            <span className="font-bold text-xl text-gray-900 tracking-tight">Synapse</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              placeholder="Search synapses..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-100 border-none rounded-lg text-sm w-64 focus:ring-2 focus:ring-[#06B6D4] outline-none"
            />
          </div>
          <button 
            onClick={createNewSynapse}
            className="bg-[#06B6D4] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-cyan-600 transition-all flex items-center gap-2 shadow-sm"
          >
            <Plus size={18} /> New Synapse
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto py-10 px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Synapses</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Folder size={16} /> {filteredWorkflows.length} Workflows
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkflows.map(s => (
            <div 
              key={s.id}
              onClick={() => window.location.href = `/work/?id=${s.id}`}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:border-[#06B6D4] hover:shadow-md transition-all cursor-pointer group relative"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-cyan-50 rounded-lg flex items-center justify-center text-[#06B6D4]">
                  <Folder size={20} />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => deleteWorkflow(e, s.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button 
                    onClick={(e) => renameWorkflow(e, s.id, s.name)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>
              <h3 className="font-bold text-gray-900 mb-1 group-hover:text-[#06B6D4] transition-colors">{s.name}</h3>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1"><Clock size={14} /> {s.lastModified}</span>
                <span>{s.nodes} nodes</span>
              </div>
            </div>
          ))}

          {/* Create New Placeholder */}
          <div 
            onClick={createNewSynapse}
            className="border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center p-8 text-gray-400 hover:border-[#06B6D4] hover:text-[#06B6D4] transition-all cursor-pointer bg-white/50 group"
          >
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3 group-hover:bg-cyan-50 transition-colors">
              <Plus size={24} className="group-hover:text-[#06B6D4]" />
            </div>
            <span className="font-semibold">Create new synapse</span>
          </div>
        </div>

        {filteredWorkflows.length === 0 && searchQuery && (
          <div className="text-center py-20">
            <p className="text-gray-500 italic">No synapses found matching "{searchQuery}"</p>
          </div>
        )}
      </main>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Dashboard />
  </StrictMode>,
)
