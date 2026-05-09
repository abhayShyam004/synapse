import { Toaster } from 'react-hot-toast';
import { WorkflowCanvas } from './components/canvas/WorkflowCanvas';
import { LeftSidebar } from './components/sidebar/LeftSidebar';
import { TopToolbar } from './components/toolbar/TopToolbar';
import { SettingsModal } from './components/modals/SettingsModal';
import { SearchOverlay } from './components/canvas/SearchOverlay';
import { useSynapseStore } from './store/useSynapseStore';
import { useEffect } from 'react';
import { ReactFlowProvider } from '@xyflow/react';

function App() {
  const accentColor = useSynapseStore(state => state.accentColor);

  useEffect(() => {
    const root = document.documentElement;
    if (accentColor === 'cyan') {
      root.style.setProperty('--color-brand', '#06B6D4');
    } else if (accentColor === 'yellow') {
      root.style.setProperty('--color-brand', '#F59E0B');
    }
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
