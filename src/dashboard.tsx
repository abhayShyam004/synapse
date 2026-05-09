import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Toaster } from 'react-hot-toast'
import { ArrowLeft, Plus, Folder, Clock, MoreVertical, Search } from 'lucide-react'

const Dashboard = () => {
  const synapses = [
    { id: 1, name: 'Customer Onboarding', lastModified: '2 hours ago', nodes: 12 },
    { id: 2, name: 'Data Sync Pipeline', lastModified: 'Yesterday', nodes: 8 },
    { id: 3, name: 'AI Lead Scraper', lastModified: '3 days ago', nodes: 15 },
  ];

  return (
    <div className="min-h-screen bg-[#F3F4F6] font-sans">
      <Toaster position="bottom-right" />
      
      {/* Header */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10">
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
              className="pl-10 pr-4 py-2 bg-gray-100 border-none rounded-lg text-sm w-64 focus:ring-2 focus:ring-[#06B6D4] outline-none"
            />
          </div>
          <button 
            onClick={() => window.location.href = '/work/'}
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
            <Folder size={16} /> {synapses.length} Workflows
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {synapses.map(s => (
            <div 
              key={s.id}
              onClick={() => window.location.href = '/work/'}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:border-[#06B6D4] hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-cyan-50 rounded-lg flex items-center justify-center text-[#06B6D4]">
                  <Folder size={20} />
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreVertical size={18} />
                </button>
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
            onClick={() => window.location.href = '/work/'}
            className="border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center p-8 text-gray-400 hover:border-[#06B6D4] hover:text-[#06B6D4] transition-all cursor-pointer bg-gray-50/50"
          >
            <Plus size={32} className="mb-2" />
            <span className="font-semibold">Create new synapse</span>
          </div>
        </div>
      </main>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Dashboard />
  </StrictMode>,
)
