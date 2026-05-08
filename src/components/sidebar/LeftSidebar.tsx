import { Home, Folder, GitMerge, Users, BarChart2, Bell, Search, Settings, Lock, Unlock, Download, Upload } from 'lucide-react';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';
import { useSynapseStore } from '../../store/useSynapseStore';
import { useState, useRef, useEffect } from 'react';

export const LeftSidebar = () => {
  const { setMetricsPopover, isCanvasLocked, toggleCanvasLock, toggleSettingsModal, setSearchOpen, exportWorkflow, importWorkflow } = useSynapseStore();
  const [isFolderOpen, setIsFolderOpen] = useState(false);
  const folderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (folderRef.current && !folderRef.current.contains(event.target as Node)) {
        setIsFolderOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = () => {
    const json = exportWorkflow();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'synapse-workflow.json';
    a.click();
    toast.success('Workflow exported successfully');
    setIsFolderOpen(false);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            importWorkflow(e.target.result as string);
            toast.success('Workflow imported successfully');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
    setIsFolderOpen(false);
  };

  const handleAction = (id: string) => {
    switch (id) {
      case 'home': return toast.success('Synapse Home');
      case 'folder': return setIsFolderOpen(!isFolderOpen);
      case 'audiences': return toast.success('Collaboration — coming soon');
      case 'metrics': return setMetricsPopover(true);
      case 'notifications': return toast.success('No new notifications');
      case 'search': return setSearchOpen(true);
      case 'settings': return toggleSettingsModal(true);
    }
  };

  const icons = [
    { Icon: Home, id: 'home', active: false },
    { Icon: Folder, id: 'folder', active: false },
    { Icon: GitMerge, id: 'orchestration', active: true },
    { Icon: Users, id: 'audiences', active: false },
    { Icon: BarChart2, id: 'metrics', active: false },
  ];

  const bottomIcons = [
    { Icon: Bell, id: 'notifications', active: false },
    { Icon: Search, id: 'search', active: false },
    { Icon: Settings, id: 'settings', active: false },
  ];

  return (
    <div className="h-full w-16 bg-white flex flex-col justify-between py-4 items-center relative">
      <div className="flex flex-col gap-4 w-full px-2">
        {icons.map(({ Icon, id, active }) => (
          <div key={id} className="relative w-full flex justify-center">
            <button 
              onClick={() => handleAction(id)}
              className={clsx(
                "p-2 rounded-md transition-colors flex items-center justify-center w-10 h-10",
                active ? "text-[#06B6D4] bg-cyan-50" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100 hover:text-[#06B6D4]"
              )}
            >
              <Icon size={20} strokeWidth={2} />
            </button>
            {id === 'folder' && isFolderOpen && (
              <div ref={folderRef} className="absolute left-14 top-0 bg-white border border-gray-200 shadow-lg rounded-md w-48 py-1 z-50">
                <button onClick={handleImport} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                  <Upload size={14} /> Import JSON
                </button>
                <button onClick={handleExport} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                  <Download size={14} /> Export JSON
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-4 w-full px-2">
        {bottomIcons.map(({ Icon, id }) => (
          <div key={id} className="relative w-full flex justify-center">
            <button 
              onClick={() => handleAction(id)}
              className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 hover:text-[#06B6D4] transition-colors flex items-center justify-center w-10 h-10 relative"
            >
              <Icon size={20} strokeWidth={2} />
              {id === 'notifications' && (
                <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#F59E0B] rounded-full border border-white" />
              )}
            </button>
          </div>
        ))}
        <div className="w-full flex justify-center">
          <button 
            onClick={toggleCanvasLock}
            className={clsx(
              "p-2 rounded-md transition-colors flex items-center justify-center mt-2 w-10 h-10",
              isCanvasLocked ? "text-red-500 bg-red-50" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            )}
            title={isCanvasLocked ? "Unlock Canvas" : "Lock Canvas"}
          >
            {isCanvasLocked ? <Lock size={20} strokeWidth={2} /> : <Unlock size={20} strokeWidth={2} />}
          </button>
        </div>
      </div>
    </div>
  );
};
