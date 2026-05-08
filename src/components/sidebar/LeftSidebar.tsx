import { Home, Folder, GitMerge, Users, BarChart2, Bell, Search, Settings, Lock, Unlock } from 'lucide-react';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';
import { useSynapseStore } from '../../store/useSynapseStore';

export const LeftSidebar = () => {
  const { setMetricsPopover, isCanvasLocked, toggleCanvasLock } = useSynapseStore();

  const handleAction = (id: string) => {
    switch (id) {
      case 'home': return toast.success('Dashboard opened');
      case 'folder': return toast.success('Export / Import options');
      case 'audiences': return toast.success('Collaboration coming soon');
      case 'metrics': return setMetricsPopover(true);
      case 'notifications': return toast.success('No notifications');
      case 'search': return toast.success('Search overlay opened');
      case 'settings': return toast.success('Settings modal opened');
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
    <div className="h-full w-16 bg-white flex flex-col justify-between py-4 items-center">
      <div className="flex flex-col gap-4">
        {icons.map(({ Icon, id, active }) => (
          <button 
            key={id}
            onClick={() => handleAction(id)}
            className={clsx(
              "p-2 rounded-md transition-colors flex items-center justify-center",
              active ? "text-[#06B6D4] bg-cyan-50" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100 hover:text-[#06B6D4]"
            )}
          >
            <Icon size={20} strokeWidth={2} />
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-4">
        {bottomIcons.map(({ Icon, id }) => (
          <button 
            key={id}
            onClick={() => handleAction(id)}
            className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 hover:text-[#06B6D4] transition-colors flex items-center justify-center relative"
          >
            <Icon size={20} strokeWidth={2} />
            {id === 'notifications' && (
              <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#F59E0B] rounded-full border border-white" />
            )}
          </button>
        ))}
        <button 
          onClick={toggleCanvasLock}
          className={clsx(
            "p-2 rounded-md transition-colors flex items-center justify-center mt-2",
            isCanvasLocked ? "text-red-500 bg-red-50" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
          )}
          title={isCanvasLocked ? "Unlock Canvas" : "Lock Canvas"}
        >
          {isCanvasLocked ? <Lock size={20} strokeWidth={2} /> : <Unlock size={20} strokeWidth={2} />}
        </button>
      </div>
    </div>
  );
};
