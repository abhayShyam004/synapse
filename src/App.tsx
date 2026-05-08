import { Toaster } from 'react-hot-toast';
import { WorkflowCanvas } from './components/canvas/WorkflowCanvas';
import { LeftSidebar } from './components/sidebar/LeftSidebar';
import { RightSidebar } from './components/sidebar/RightSidebar';
import { TopToolbar } from './components/toolbar/TopToolbar';
import { useSynapseStore } from './store/useSynapseStore';
import { clsx } from 'clsx';

function App() {
  const theme = useSynapseStore(state => state.theme);

  return (
    <div className={clsx(
      "flex flex-col h-screen w-screen overflow-hidden font-sans",
      theme === 'dark' && "dark bg-slate-900 text-white",
      theme === 'light' && "bg-white text-black",
      theme === 'cyberpunk' && "bg-black text-cyan-400"
    )}>
      <Toaster position="top-right" />
      <TopToolbar />
      <main className="flex flex-1 overflow-hidden">
        <aside className="w-80 border-r-4 border-black bg-white shrink-0 overflow-y-auto z-10">
          <LeftSidebar />
        </aside>
        <section className="flex-1 relative bg-[#0a0a0f]">
          <WorkflowCanvas />
        </section>
        <aside className="w-80 border-l-4 border-black bg-white shrink-0 overflow-y-auto z-10">
          <RightSidebar />
        </aside>
      </main>
    </div>
  );
}

export default App;
