import { WorkflowCanvas } from './components/canvas/WorkflowCanvas';
import { LeftSidebar } from './components/sidebar/LeftSidebar';
import { TopToolbar } from './components/toolbar/TopToolbar';
import { useSynapseStore } from './store/useSynapseStore';
import { clsx } from 'clsx';

function App() {
  const theme = useSynapseStore(state => state.theme);

  return (
    <div className={clsx(
      "flex flex-col h-screen w-screen overflow-hidden",
      theme === 'dark' && "dark bg-slate-900 text-white",
      theme === 'light' && "bg-white text-slate-900",
      theme === 'cyberpunk' && "bg-black text-cyan-400"
    )}>
      <TopToolbar />
      
      <main className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-64 border-r bg-slate-50 dark:bg-slate-800 dark:border-slate-700 shrink-0 overflow-y-auto">
          <LeftSidebar />
        </aside>
        
        {/* Canvas Area */}
        <section className="flex-1 relative">
          <WorkflowCanvas />
        </section>
        
        {/* Right Sidebar Placeholder */}
        <aside className="w-64 border-l bg-slate-50 dark:bg-slate-800 dark:border-slate-700 shrink-0 p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Properties Placeholder</p>
        </aside>
      </main>
    </div>
  );
}

export default App;
