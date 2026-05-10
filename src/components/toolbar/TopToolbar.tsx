import { useSynapseStore } from '../../store/useSynapseStore';
import toast from 'react-hot-toast';
import { ArrowLeft, ChevronDown, Sparkles, Settings as SettingsIcon, Menu, X, LogOut, Layout } from 'lucide-react';
import { clsx } from 'clsx';
import { useState, useRef, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export const TopToolbar = () => {
  const { 
    ghostCardsEnabled, 
    toggleGhostCards, 
    expandAllNodes, 
    setMetricsPopover, 
    toggleSettingsModal, 
    workflowName, 
    setWorkflowName,
    user,
    setAuthModalOpen,
    saveStatus
  } = useSynapseStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTestRun = () => {
    toast.success('Test run started');
    setIsMobileMenuOpen(false);
  };

  const handlePublish = () => {
    toast.success('Workflow activated!');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success('Signed out');
    setIsUserDropdownOpen(false);
    window.location.href = '/';
  };

  const getSaveStatusDisplay = () => {
    switch (saveStatus) {
      case 'saving': return <span className="text-[10px] font-medium text-gray-400 animate-pulse">Saving...</span>;
      case 'saved': return <span className="text-[10px] font-medium text-green-500">Saved ✓</span>;
      case 'error': return <span className="text-[10px] font-medium text-red-500">⚠ Save failed</span>;
      default: return null;
    }
  };

  return (
    <>
      <header className="h-12 md:h-14 border-b border-gray-200 bg-white flex items-center justify-between px-2 md:px-4 shrink-0 z-50 relative shadow-sm">
        <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
          <button 
            onClick={() => window.location.href = '/dashboard/'}
            className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 transition-colors hover:text-[var(--accent)] shrink-0"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2 md:gap-3 overflow-hidden">
            <div className="flex items-center gap-2 shrink-0">
              <div className="grid grid-cols-2 gap-0.5 w-4 h-4 md:w-5 md:h-5">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[var(--accent)]"></div>
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-gray-900"></div>
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-gray-900"></div>
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-gray-900"></div>
              </div>
              <span className="font-bold text-base md:text-lg text-gray-900 tracking-tight hidden sm:block">Synapse</span>
            </div>
            <div className="w-px h-4 bg-gray-200 mx-1 shrink-0 hidden md:block"></div>
            
            <div className="flex flex-col">
              {isEditingName ? (
                <input 
                  ref={nameInputRef}
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  onBlur={() => setIsEditingName(false)}
                  onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                  className="font-medium text-[13px] md:text-[15px] text-gray-900 outline-none bg-gray-50 px-1 py-0.5 rounded border border-[var(--accent)] transition-all"
                  style={{ maxWidth: '180px' }}
                />
              ) : (
                <button 
                  onClick={() => setIsEditingName(true)}
                  className="font-medium text-[13px] md:text-[15px] text-gray-600 hover:text-gray-900 text-left truncate px-1 py-0.5 hover:bg-gray-50 rounded transition-all"
                  style={{ maxWidth: '180px' }}
                >
                  {workflowName || 'Untitled Workflow'}
                </button>
              )}
              <div className="px-1 -mt-0.5 h-3">
                {getSaveStatusDisplay()}
              </div>
            </div>

            <span className="text-[9px] md:text-[10px] font-bold bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-sm uppercase tracking-widest border border-gray-200 shrink-0 self-center">
              Draft
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          <button 
            onClick={handlePublish} 
            style={{ backgroundColor: 'var(--accent)' }}
            className="flex items-center gap-1 text-xs md:text-sm font-semibold text-white hover:brightness-90 px-3 py-1.5 md:px-4 rounded-md transition-all shadow-sm shadow-cyan-100"
          >
            Publish <ChevronDown size={14} className="text-white/80 hidden sm:block" />
          </button>

          {/* Desktop Only Actions */}
          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => expandAllNodes(true)} className="text-sm font-medium text-gray-500 hover:text-[var(--accent)] transition-colors">
              Expand All
            </button>
            
            <button onClick={() => setMetricsPopover(true)} className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-[#0078D4] px-2 py-1.5 rounded-md border border-transparent hover:border-gray-200 transition-all">
              Metrics <ChevronDown size={14} className="text-gray-400" />
            </button>

            <button 
              onClick={handleTestRun}
              className="text-sm font-medium text-[#0078D4] border border-[#0078D4] px-4 py-1.5 rounded-md hover:bg-blue-50 transition-colors"
            >
              Test Run
            </button>

            <div className="w-px h-6 bg-gray-200 mx-1" />

            <button 
              onClick={toggleGhostCards}
              className={clsx(
                "p-1.5 rounded-md transition-colors",
                ghostCardsEnabled ? "text-[#F59E0B] bg-yellow-50" : "text-gray-400 hover:bg-gray-100 hover:text-[#F59E0B]"
              )}
              title={`AI Ghost Cards: ${ghostCardsEnabled ? 'ON' : 'OFF'}`}
            >
              <Sparkles size={18} />
            </button>

            <button onClick={() => toggleSettingsModal(true)} className="p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-md transition-colors" title="Settings">
              <SettingsIcon size={18} />
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
                      onClick={() => window.location.href = '/dashboard/'}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-[var(--accent)] transition-colors"
                    >
                      <Layout size={16} /> My Synapses
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

          {/* Mobile Hamburger */}
          <button 
            className="p-1.5 text-gray-500 md:hidden rounded-md hover:bg-gray-100"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-12 left-0 w-full bg-white border-b border-gray-200 shadow-lg z-40 flex flex-col p-2 animate-in slide-in-from-top-2">
          {user && (
            <div className="px-4 py-3 bg-gray-50 rounded-lg mb-2 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--accent)] text-white font-bold flex items-center justify-center">
                {user.email?.[0].toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-gray-900 truncate">{user.email}</p>
              </div>
            </div>
          )}
          <button 
            onClick={() => { expandAllNodes(true); setIsMobileMenuOpen(false); }} 
            className="text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
          >
            Expand All Nodes
          </button>
          <button 
            onClick={() => { setMetricsPopover(true); setIsMobileMenuOpen(false); }} 
            className="text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
          >
            Metrics
          </button>
          <button 
            onClick={handleTestRun} 
            className="text-left px-4 py-3 text-sm font-medium text-[#0078D4] hover:bg-blue-50 rounded-lg"
          >
            Test Run
          </button>
          {!user && (
            <button 
              onClick={() => { setAuthModalOpen(true, 'signin'); setIsMobileMenuOpen(false); }} 
              className="text-left px-4 py-3 text-sm font-bold text-[var(--accent)] hover:bg-gray-50 rounded-lg"
            >
              Sign In
            </button>
          )}
          {user && (
            <button 
              onClick={handleSignOut} 
              className="text-left px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-lg flex items-center gap-2"
            >
              <LogOut size={16} /> Sign Out
            </button>
          )}
          <div className="h-px bg-gray-100 my-1 mx-4" />
          <button 
            onClick={() => { toggleGhostCards(); setIsMobileMenuOpen(false); }} 
            className="flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
          >
            <span className="flex items-center gap-2"><Sparkles size={16} className={ghostCardsEnabled ? "text-[#F59E0B]" : "text-gray-400"} /> AI Ghost Cards</span>
            <span className={clsx("text-xs font-bold px-2 py-0.5 rounded-full", ghostCardsEnabled ? "bg-yellow-100 text-[#F59E0B]" : "bg-gray-100 text-gray-500")}>
              {ghostCardsEnabled ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>
      )}
    </>
  );
};
