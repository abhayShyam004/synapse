// src/components/toolbar/TopToolbar.tsx
import { useSynapseStore } from '../../store/useSynapseStore';
import toast from 'react-hot-toast';
import { Settings, Download, Save, Sparkles } from 'lucide-react';

export const TopToolbar = () => {
  const { ghostCardsEnabled, toggleGhostCards } = useSynapseStore();

  const handleSave = () => {
    toast.success('Workflow saved successfully!', {
      style: { border: '4px solid black', padding: '16px', borderRadius: '0', fontWeight: 'bold' },
      iconTheme: { primary: '#FFD600', secondary: '#000' }
    });
  };

  return (
    <header className="h-20 border-b-4 border-black bg-white flex items-center justify-between px-6 shrink-0 z-20 relative">
      <div className="flex items-center gap-4">
        <h1 className="font-black text-3xl tracking-tighter uppercase flex items-center gap-3">
          <span className="w-10 h-10 bg-synapse-blue flex items-center justify-center text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">S</span>
          Synapse
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <button onClick={handleSave} className="flex items-center gap-2 font-bold px-4 py-2 border-2 border-black bg-synapse-yellow hover:bg-yellow-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-px hover:shadow-none transition-all cursor-pointer">
          <Save size={18} /> Save
        </button>
        <button className="flex items-center gap-2 font-bold px-4 py-2 border-2 border-black bg-white hover:bg-gray-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-px hover:shadow-none transition-all cursor-pointer">
          <Download size={18} /> Export JSON
        </button>
        
        <div className="h-8 w-1 bg-black mx-2" />

        <button 
          onClick={toggleGhostCards}
          className={`flex items-center gap-2 font-bold px-4 py-2 border-2 border-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-px hover:shadow-none cursor-pointer ${
            ghostCardsEnabled ? 'bg-synapse-cyan' : 'bg-gray-200'
          }`}
        >
          <Sparkles size={18} /> AI Ghost: {ghostCardsEnabled ? 'ON' : 'OFF'}
        </button>

        <button className="flex items-center gap-2 font-bold px-4 py-2 border-2 border-black bg-white hover:bg-gray-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-px hover:shadow-none transition-all cursor-pointer">
          <Settings size={18} /> Settings
        </button>
      </div>
    </header>
  );
};
