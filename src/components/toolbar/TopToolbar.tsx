import { useSynapseStore } from '../../store/useSynapseStore';

export const TopToolbar = () => {
  const { theme, setTheme, toggleGhostCards, ghostCardsEnabled } = useSynapseStore();

  return (
    <header className="h-14 border-b bg-white dark:bg-slate-900 flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
      <div className="flex items-center gap-4">
        <h1 className="font-bold text-xl text-synapse-blue flex items-center gap-2">
          <span className="w-8 h-8 bg-synapse-blue rounded flex items-center justify-center text-white text-xs">S</span>
          Synapse
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <button className="text-xs font-bold px-3 py-1.5 border rounded hover:bg-slate-50 transition-colors dark:text-white dark:hover:bg-slate-800">
          Save
        </button>
        <button className="text-xs font-bold px-3 py-1.5 border rounded hover:bg-slate-50 transition-colors text-synapse-blue border-synapse-blue/30 bg-synapse-blue/5 dark:bg-synapse-blue/10">
          AI Suggest
        </button>
        
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2" />
        
        <select 
          value={theme}
          onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'cyberpunk')}
          className="text-xs border rounded p-1 focus:ring-2 focus:ring-synapse-blue outline-none dark:bg-slate-800 dark:text-white"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="cyberpunk">Cyberpunk</option>
        </select>

        <button 
          onClick={toggleGhostCards}
          className={`text-xs font-bold px-3 py-1.5 rounded border transition-all ${
            ghostCardsEnabled 
              ? 'bg-synapse-yellow/10 border-synapse-yellow text-amber-700 dark:text-amber-500' 
              : 'bg-slate-50 border-slate-200 text-slate-400 dark:bg-slate-800 dark:border-slate-700'
          }`}
        >
          Ghost: {ghostCardsEnabled ? 'ON' : 'OFF'}
        </button>
      </div>
    </header>
  );
};
