import { Home, Folder, GitMerge, Users, Bell, Search, Settings, Lock, Unlock } from 'lucide-react';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';
import { useSynapseStore } from '../../store/useSynapseStore';

export const LeftSidebar = () => {
  const { isCanvasLocked, toggleCanvasLock, toggleSettingsModal, setSearchOpen } = useSynapseStore();

  const handleAction = (id: string) => {
    switch (id) {
      case 'home': return window.location.href = '/';
      case 'folder': return window.location.href = '/dashboard/';
      case 'orchestration': return toast.success('Currently viewing Workflow');
      case 'audiences': return toast.error('Collaboration is an upcoming feature', {
        icon: '🚧',
        style: { borderLeft: '4px solid #F59E0B' }
      });
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
              style={{ 
                color: active ? 'var(--accent)' : undefined,
                backgroundColor: active ? 'color-mix(in srgb, var(--accent), transparent 90%)' : undefined
              }}
              className={clsx(
                "p-2 rounded-md transition-colors flex items-center justify-center w-10 h-10",
                !active && "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              )}
            >
              <Icon size={20} strokeWidth={2} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-4 w-full px-2">
        {bottomIcons.map(({ Icon, id }) => (
          <div key={id} className="relative w-full flex justify-center">
            <button 
              onClick={() => handleAction(id)}
              className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 hover-text-accent transition-colors flex items-center justify-center w-10 h-10 relative"
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
