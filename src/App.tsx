import { Toaster } from 'react-hot-toast';
import { WorkflowCanvas } from './components/canvas/WorkflowCanvas';
import { LeftSidebar } from './components/sidebar/LeftSidebar';
import { TopToolbar } from './components/toolbar/TopToolbar';
import { SettingsModal } from './components/modals/SettingsModal';
import { GlobalDialog } from './components/modals/GlobalDialog';
import { SearchOverlay } from './components/canvas/SearchOverlay';
import { useSynapseStore } from './store/useSynapseStore';
import { useEffect } from 'react';
import { ReactFlowProvider } from '@xyflow/react';

const ACCENT_COLORS = {
  cyan: '#06B6D4',
  amber: '#F59E0B',
  violet: '#7C3AED',
  rose: '#F43F5E',
  emerald: '#10B981',
  blue: '#3B82F6',
  orange: '#F97316',
  pink: '#EC4899',
};

function App() {
  const accentColor = useSynapseStore(state => state.accentColor);
  const updateSetting = useSynapseStore(state => state.updateSetting);

  useEffect(() => {
    // Initial load from localStorage if present
    const savedAccent = localStorage.getItem('synapse-accent') as any;
    if (savedAccent && ACCENT_COLORS[savedAccent as keyof typeof ACCENT_COLORS]) {
      updateSetting('accentColor', savedAccent);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const baseHex = ACCENT_COLORS[accentColor] || ACCENT_COLORS.cyan;
    
    root.style.setProperty('--accent', baseHex);
    root.style.setProperty('--accent-light', `${baseHex}26`); // 15% opacity
    root.style.setProperty('--accent-dot', `${baseHex}66`);   // 40% opacity (66 is ~40% in hex)
    
    localStorage.setItem('synapse-accent', accentColor);
  }, [accentColor]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden font-sans bg-white text-gray-900">
      <Toaster 
        position="bottom-right" 
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#111827',
            border: '1px solid #E5E7EB',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            borderRadius: '8px',
            fontSize: '14px',
            padding: '12px 16px'
          },
        }}
      />
      <SettingsModal />
      <GlobalDialog />
      <TopToolbar />
      <main className="flex flex-1 overflow-hidden relative">
        <aside className="w-16 border-r border-gray-200 bg-white shrink-0 overflow-y-auto z-10 flex flex-col">
          <LeftSidebar />
        </aside>
        <section className="flex-1 relative bg-[#F3F4F6]">
          <SearchOverlay />
          <ReactFlowProvider>
            <WorkflowCanvas />
          </ReactFlowProvider>
        </section>
      </main>
    </div>
  );
}

export default App;
