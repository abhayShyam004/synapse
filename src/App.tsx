import { Toaster, toast } from 'react-hot-toast';
import { WorkflowCanvas } from './components/canvas/WorkflowCanvas';
import { LeftSidebar, MobileBottomNav } from './components/sidebar/LeftSidebar';
import { TopToolbar } from './components/toolbar/TopToolbar';
import { SettingsModal } from './components/modals/SettingsModal';
import { GlobalDialog } from './components/modals/GlobalDialog';
import { AIBuilderModal } from './components/modals/AIBuilderModal';
import { AuthModal } from './components/modals/AuthModal';
import { ShareModal } from './components/modals/ShareModal';
import { SearchOverlay } from './components/canvas/SearchOverlay';
import { useSynapseStore } from './store/useSynapseStore';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';

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
  const { 
    accentColor, 
    updateSetting, 
    user, 
    setUser, 
    setSession,
    currentWorkflowId,
    setCurrentWorkflowId,
    loadFromCloud,
    saveToCloud,
    nodes,
    edges,
    workflowName,
    setAuthModalOpen,
    setSaveStatus,
    resetWorkflow,
    isSharedPlayMode
  } = useSynapseStore();

  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    // Initial load from localStorage if present
    const savedAccent = localStorage.getItem('synapse-accent') as any;
    if (savedAccent && ACCENT_COLORS[savedAccent as keyof typeof ACCENT_COLORS]) {
      updateSetting('accentColor', savedAccent);
    } else {
      // Force default to cyan if nothing or invalid is saved
      updateSetting('accentColor', 'cyan');
    }

    // Supabase auth listener
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsAuthLoading(false);
    });

    // Load workflow if ID, Collab, or Share in URL
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const collabId = params.get('collab');
    const shareId = params.get('share');
    
    const targetId = id || collabId || shareId;
    if (targetId) {
      if (targetId !== useSynapseStore.getState().currentWorkflowId) {
        resetWorkflow();
      }
      setCurrentWorkflowId(targetId);
      if (shareId) {
        useSynapseStore.getState().setSharedPlayMode(true);
      }
    }

    // Welcome toast for new users
    if (params.get('welcome') === 'true') {
      supabase.auth.getUser().then(({ data: { user } }) => {
        const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'there';
        const firstName = fullName.split(' ')[0];
        toast.success(`Welcome to Synapse, ${firstName}! 🎉`, {
          duration: 5000,
          icon: '👋'
        });
        // Remove the param from URL without refreshing
        window.history.replaceState({}, document.title, window.location.pathname);
      });
    }

    return () => subscription.unsubscribe();
  }, []);

  // Fetch from cloud if ID is present
  useEffect(() => {
    if (isAuthLoading || !currentWorkflowId) return;

    const isShared = useSynapseStore.getState().isSharedPlayMode || new URLSearchParams(window.location.search).has('collab') || new URLSearchParams(window.location.search).has('share');

    if (user || isShared) {
      loadFromCloud(currentWorkflowId).then(() => {
         if (useSynapseStore.getState().saveStatus === 'error' && !isShared) {
            const saved = localStorage.getItem(`synapse-workflow-${currentWorkflowId}`);
            if (saved) {
              useSynapseStore.getState().loadWorkflow(currentWorkflowId);
            }
         }
      });
    } else {
      // Guest mode load from local storage
      const saved = localStorage.getItem(`synapse-workflow-${currentWorkflowId}`);
      if (saved) {
        useSynapseStore.getState().loadWorkflow(currentWorkflowId);
      }
    }
  }, [currentWorkflowId, user, isAuthLoading]);

  // Auto-save logic
  useEffect(() => {
    if (isAuthLoading || !currentWorkflowId || useSynapseStore.getState().isInitialLoading) return;

    const timer = setTimeout(() => {
      const isCollab = new URLSearchParams(window.location.search).has('collab');
      if (user || isCollab) {
        saveToCloud();
      } else {
        // Save to local storage for guest
        const data = { nodes, edges, name: workflowName };
        localStorage.setItem(`synapse-workflow-${currentWorkflowId}`, JSON.stringify(data));
        setSaveStatus('saved');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [nodes, edges, workflowName, currentWorkflowId, user, isAuthLoading]);

  useEffect(() => {
    const root = document.documentElement;
    const baseHex = ACCENT_COLORS[accentColor as keyof typeof ACCENT_COLORS] || ACCENT_COLORS.cyan;

    root.style.setProperty('--accent', baseHex);
    root.style.setProperty('--accent-light', `${baseHex}26`); // 15% opacity
    root.style.setProperty('--accent-dot', `${baseHex}66`);   // 40% opacity

    localStorage.setItem('synapse-accent', accentColor);
  }, [accentColor]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden font-sans bg-white text-gray-900 relative">
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
      <AIBuilderModal />
      <AuthModal />
      <ShareModal />
      
      {isSharedPlayMode && (
        <div className="h-9 bg-[#0D9488] text-white flex items-center justify-center px-4 gap-2 z-[60] shadow-md border-b border-white/10 shrink-0 overflow-hidden">
          <span className="text-[11px] md:text-xs font-bold tracking-wide uppercase opacity-90 truncate">Play-Only Mode — Your changes won't be saved</span>
          {!user && (
            <button 
              onClick={() => setAuthModalOpen(true, 'signin')}
              className="text-[10px] md:text-xs bg-white text-[#0D9488] px-3 py-1 rounded-full font-bold hover:bg-gray-50 transition-all shrink-0 shadow-sm"
            >
              Sign In to save a copy
            </button>
          )}
        </div>
      )}

      {!user && !isSharedPlayMode && (
        <div className="h-9 bg-[var(--accent)] text-white flex items-center justify-center px-4 gap-2 z-[60] shadow-md border-b border-white/10 shrink-0 overflow-hidden">
          <span className="text-[11px] md:text-xs font-bold tracking-wide uppercase opacity-90 truncate">You're in Guest Mode — Sign in to save across devices</span>
          <button 
            onClick={() => setAuthModalOpen(true, 'signin')}
            className="text-[10px] md:text-xs bg-white text-[var(--accent)] px-3 py-1 rounded-full font-bold hover:bg-gray-50 transition-all shrink-0 shadow-sm"
          >
            Sign In
          </button>
        </div>
      )}

      <TopToolbar />
      <main className="flex flex-1 overflow-hidden relative pb-[56px] md:pb-0">
        <aside className="hidden md:flex w-16 border-r border-gray-200 bg-white shrink-0 overflow-y-auto z-10 flex-col">
          <LeftSidebar />
        </aside>
        <section className="flex-1 relative bg-[#F3F4F6]">
          <SearchOverlay />
          <WorkflowCanvas />
        </section>
      </main>
      <MobileBottomNav />
    </div>
  );
}

export default App;
