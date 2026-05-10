import { StrictMode, useState, useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Toaster, toast } from 'react-hot-toast'
import { ArrowLeft, Plus, Folder, Clock, MoreVertical, Search, LogOut, Layout, Copy } from 'lucide-react'
import { useSynapseStore } from './store/useSynapseStore'
import { GlobalDialog } from './components/modals/GlobalDialog'
import { AuthModal } from './components/modals/AuthModal'
import { supabase } from './lib/supabase'

interface WorkflowMetadata {
  id: string;
  name: string;
  updated_at: string;
  nodes_count?: number;
}

const Dashboard = () => {
  const { openDialog, accentColor, updateSetting, user, setUser, setSession, setAuthModalOpen } = useSynapseStore();
  const [workflows, setWorkflows] = useState<WorkflowMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    // Initial load from localStorage
    const savedAccent = localStorage.getItem('synapse-accent') as any;
    if (savedAccent && (ACCENT_COLORS as any)[savedAccent]) {
      updateSetting('accentColor', savedAccent);
    } else {
      updateSetting('accentColor', 'cyan');
    }

    // Supabase auth listener
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      const u = session?.user ?? null;
      setUser(u);
      if (!u) {
        const params = new URLSearchParams(window.location.search);
        if (params.get('auth') === 'signin') {
          setAuthModalOpen(true, 'signin');
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
      if (isMenuOpen && !(event.target as HTMLElement).closest('.menu-trigger')) {
        setIsMenuOpen(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const baseHex = (ACCENT_COLORS as any)[accentColor] || ACCENT_COLORS.cyan;
    root.style.setProperty('--accent', baseHex);
    root.style.setProperty('--accent-light', `${baseHex}26`);
    root.style.setProperty('--accent-dot', `${baseHex}66`);
  }, [accentColor]);

  // Load workflows from Supabase or localStorage
  useEffect(() => {
    const loadWorkflows = async () => {
      setLoading(true);
      if (user) {
        const { data, error } = await supabase
          .from('workflows')
          .select('id, name, updated_at, nodes')
          .order('updated_at', { ascending: false });

        if (error) {
          toast.error('Failed to load workflows');
        } else {
          setWorkflows(data.map(w => ({
            id: w.id,
            name: w.name,
            updated_at: w.updated_at,
            nodes_count: Array.isArray(w.nodes) ? w.nodes.length : 0
          })));
        }
      } else {
        const saved = localStorage.getItem('synapse-workflows-list');
        if (saved) {
          const list = JSON.parse(saved);
          setWorkflows(list.map((w: any) => ({
            id: w.id,
            name: w.name,
            updated_at: w.lastModified === 'Just now' ? new Date().toISOString() : w.lastModified,
            nodes_count: w.nodes || 0
          })));
        }
      }
      setLoading(false);
    };

    loadWorkflows();
  }, [user]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success('Signed out');
    setIsUserDropdownOpen(false);
    window.location.href = '/';
  };

  const createNewSynapse = async () => {
    const id = crypto.randomUUID();
    const newName = `New Synapse ${workflows.length + 1}`;
    
    if (user) {
      const { error } = await supabase.from('workflows').insert({
        id,
        user_id: user.id,
        name: newName,
        nodes: [],
        edges: [],
        variables: []
      });

      if (error) {
        toast.error('Failed to create workflow');
        return;
      }
    } else {
      const newList = [{
        id,
        name: newName,
        updated_at: new Date().toISOString(),
        nodes_count: 0
      }, ...workflows];
      setWorkflows(newList);
      localStorage.setItem('synapse-workflows-list', JSON.stringify(newList.map(w => ({
        id: w.id,
        name: w.name,
        lastModified: 'Just now',
        nodes: 0
      }))));
    }

    toast.success('Synapse created!');
    setTimeout(() => {
      window.location.href = `/work/?id=${id}`;
    }, 800);
  };

  const renameWorkflow = (e: React.MouseEvent, id: string, currentName: string) => {
    e.stopPropagation();
    setIsMenuOpen(null);
    openDialog({
      title: 'Rename Synapse',
      message: 'Enter a new name for this workflow:',
      type: 'prompt',
      defaultValue: currentName,
      onConfirm: async (newName) => {
        if (newName && newName !== currentName) {
          if (user) {
            const { error } = await supabase
              .from('workflows')
              .update({ name: newName, updated_at: new Date().toISOString() })
              .eq('id', id);
            
            if (error) {
              toast.error('Failed to rename');
              return;
            }
          }

          setWorkflows(prev => prev.map(w => w.id === id ? { ...w, name: newName, updated_at: new Date().toISOString() } : w));
          
          if (!user) {
            const savedList = JSON.parse(localStorage.getItem('synapse-workflows-list') || '[]');
            localStorage.setItem('synapse-workflows-list', JSON.stringify(
              savedList.map((w: any) => w.id === id ? { ...w, name: newName, lastModified: 'Just now' } : w)
            ));
            const savedWorkflow = localStorage.getItem(`synapse-workflow-${id}`);
            if (savedWorkflow) {
              const data = JSON.parse(savedWorkflow);
              data.name = newName;
              localStorage.setItem(`synapse-workflow-${id}`, JSON.stringify(data));
            }
          }
          
          toast.success('Synapse renamed');
        }
      }
    });
  };

  const duplicateWorkflow = async (e: React.MouseEvent, workflow: WorkflowMetadata) => {
    e.stopPropagation();
    setIsMenuOpen(null);
    const newId = crypto.randomUUID();
    const newName = `${workflow.name} (Copy)`;

    if (user) {
      const { data, error: fetchError } = await supabase
        .from('workflows')
        .select('*')
        .eq('id', workflow.id)
        .single();
      
      if (fetchError || !data) {
        toast.error('Failed to duplicate');
        return;
      }

      const { error: insertError } = await supabase.from('workflows').insert({
        ...data,
        id: newId,
        name: newName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      if (insertError) {
        toast.error('Failed to duplicate');
        return;
      }
    } else {
      const savedWorkflow = localStorage.getItem(`synapse-workflow-${workflow.id}`);
      if (savedWorkflow) {
        const data = JSON.parse(savedWorkflow);
        data.name = newName;
        localStorage.setItem(`synapse-workflow-${newId}`, JSON.stringify(data));
      }
      const newList = [{
        id: newId,
        name: newName,
        updated_at: new Date().toISOString(),
        nodes_count: workflow.nodes_count
      }, ...workflows];
      setWorkflows(newList);
      localStorage.setItem('synapse-workflows-list', JSON.stringify(newList.map(w => ({
        id: w.id,
        name: w.name,
        lastModified: 'Just now',
        nodes: w.nodes_count
      }))));
    }

    toast.success('Synapse duplicated');
    setWorkflows(prev => [{
      id: newId,
      name: newName,
      updated_at: new Date().toISOString(),
      nodes_count: workflow.nodes_count
    }, ...prev]);
  };

  const deleteWorkflow = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setIsMenuOpen(null);
    openDialog({
      title: 'Delete Synapse',
      message: 'Are you sure you want to delete this synapse permanently? This cannot be undone.',
      type: 'confirm',
      onConfirm: async () => {
        if (user) {
          const { error } = await supabase.from('workflows').delete().eq('id', id);
          if (error) {
            toast.error('Failed to delete');
            return;
          }
        } else {
          localStorage.removeItem(`synapse-workflow-${id}`);
          const newList = workflows.filter(w => w.id !== id);
          localStorage.setItem('synapse-workflows-list', JSON.stringify(newList.map(w => ({
            id: w.id,
            name: w.name,
            lastModified: w.updated_at,
            nodes: w.nodes_count
          }))));
        }
        setWorkflows(prev => prev.filter(w => w.id !== id));
        toast.success('Synapse deleted');
      }
    });
  };

  const filteredWorkflows = workflows.filter(w => 
    w.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (diffInSeconds < 60) return 'Just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      return date.toLocaleDateString();
    } catch (e) {
      return 'Recently';
    }
  };

  return (
    <div className="min-h-screen font-sans relative" style={{ 
      backgroundColor: '#F3F4F6',
      backgroundImage: 'radial-gradient(var(--accent-dot) 1.5px, transparent 1.5px)',
      backgroundSize: '20px 20px'
    }}>
      <Toaster position="bottom-right" />
      <GlobalDialog />
      <AuthModal />
      
      {/* Header */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-6">
          <button onClick={() => window.location.href = '/'} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="grid grid-cols-2 gap-0.5 w-5 h-5">
              <div className="w-2 h-2 rounded-full bg-[var(--accent)]"></div>
              <div className="w-2 h-2 rounded-full bg-gray-900"></div>
              <div className="w-2 h-2 rounded-full bg-gray-900"></div>
              <div className="w-2 h-2 rounded-full bg-gray-900"></div>
            </div>
            <span className="font-bold text-xl text-gray-900 tracking-tight">Synapse</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              placeholder="Search synapses..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-100 border-none rounded-lg text-sm w-64 focus:ring-2 focus:ring-[var(--accent)] outline-none"
            />
          </div>
          <button 
            onClick={createNewSynapse}
            className="bg-[var(--accent)] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:brightness-90 transition-all flex items-center gap-2 shadow-sm"
          >
            <Plus size={18} /> New Synapse
          </button>

          <div className="w-px h-6 bg-gray-200 mx-1" />

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="w-8 h-8 rounded-full bg-[var(--accent)] text-white font-bold text-sm flex items-center justify-center hover:brightness-110 transition-all shadow-sm"
              >
                {user.email?.[0].toUpperCase()}
              </button>

              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-[100] py-2 animate-in fade-in slide-in-from-top-1">
                  <div className="px-4 py-2 border-b border-gray-100 mb-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Signed in as</p>
                    <p className="text-xs font-semibold text-gray-900 truncate">{user.email}</p>
                  </div>
                  <button 
                    onClick={() => setIsUserDropdownOpen(false)}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--accent)] bg-accent/5 font-semibold"
                  >
                    <Layout size={16} /> My Workflows
                  </button>
                  <div className="h-px bg-gray-100 my-1" />
                  <button 
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={() => setAuthModalOpen(true, 'signin')}
              className="text-sm font-bold text-[var(--accent)] hover:brightness-90 transition-all px-2"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto py-10 px-4 md:px-8">
        {!user && (
          <div className="mb-8 p-4 bg-[var(--accent)]/10 border border-[var(--accent)]/20 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-700 font-medium text-center md:text-left">
              👋 You're in <span className="font-bold text-[var(--accent)]">Guest Mode</span>. Your workflows are saved locally to this browser only. 
              <button onClick={() => setAuthModalOpen(true, 'signin')} className="ml-1 text-[var(--accent)] font-bold hover:underline underline-offset-4">Sign in</button> to sync across devices.
            </p>
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Synapses</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Folder size={16} /> {filteredWorkflows.length} Workflows
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white border border-gray-100 rounded-xl p-5 h-40 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkflows.map(s => (
              <div 
                key={s.id}
                onClick={() => window.location.href = `/work/?id=${s.id}`}
                className="bg-white border border-gray-200 rounded-xl p-5 hover:border-[var(--accent)] hover:shadow-md transition-all cursor-pointer group relative"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 bg-accent/5 rounded-lg flex items-center justify-center text-[var(--accent)]" style={{ backgroundColor: 'var(--accent-light)' }}>
                    <Folder size={20} />
                  </div>
                  <div className="relative">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setIsMenuOpen(isMenuOpen === s.id ? null : s.id); }}
                      className="menu-trigger p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <MoreVertical size={16} />
                    </button>
                    {isMenuOpen === s.id && (
                      <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-xl z-20 py-1 animate-in fade-in zoom-in-95">
                        <button 
                          onClick={(e) => renameWorkflow(e, s.id, s.name)}
                          className="w-full text-left px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                        >
                          Rename
                        </button>
                        <button 
                          onClick={(e) => duplicateWorkflow(e, s)}
                          className="w-full text-left px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Copy size={12} /> Duplicate
                        </button>
                        <div className="h-px bg-gray-100 my-1" />
                        <button 
                          onClick={(e) => deleteWorkflow(e, s.id)}
                          className="w-full text-left px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 mb-1 group-hover:text-[var(--accent)] transition-colors truncate pr-4">{s.name}</h3>
                <div className="flex items-center gap-4 text-xs text-gray-400 font-medium">
                  <span className="flex items-center gap-1"><Clock size={14} /> {formatTime(s.updated_at)}</span>
                  <span>{s.nodes_count || 0} nodes</span>
                </div>
              </div>
            ))}

            {/* Create New Placeholder */}
            <div 
              onClick={createNewSynapse}
              className="border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center p-8 text-gray-400 hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all cursor-pointer bg-white/50 group"
            >
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3 group-hover:bg-accent/5 transition-colors" style={{ backgroundColor: 'var(--accent-light)' }}>
                <Plus size={24} className="group-hover:text-[var(--accent)]" />
              </div>
              <span className="font-semibold">Create new synapse</span>
            </div>
          </div>
        )}

        {!loading && filteredWorkflows.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-white/30 rounded-2xl border border-dashed border-gray-300 mt-8">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-300">
              <Folder size={40} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">{searchQuery ? 'No results found' : 'No synapses yet'}</h3>
            <p className="text-sm text-gray-500 mb-6 text-center max-w-xs">
              {searchQuery ? `We couldn't find anything matching "${searchQuery}"` : 'Start your journey by creating your first intelligent workflow.'}
            </p>
            {!searchQuery && (
              <button 
                onClick={createNewSynapse}
                className="bg-[var(--accent)] text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:brightness-90 transition-all shadow-lg shadow-[var(--accent)]/20"
              >
                Create your first synapse
              </button>
            )}
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
