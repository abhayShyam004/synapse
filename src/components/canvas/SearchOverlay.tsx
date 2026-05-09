import { useSynapseStore } from '../../store/useSynapseStore';
import { Search } from 'lucide-react';

export const SearchOverlay = () => {
  const { isSearchOpen, searchQuery, setSearchQuery, setSearchOpen } = useSynapseStore();

  if (!isSearchOpen) return null;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-white rounded-lg shadow-lg border border-gray-200 p-2 w-[600px] flex items-center gap-2">
      <Search size={18} className="text-gray-400 shrink-0 ml-1" />
      <input
        autoFocus
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Find nodes by name..."
        className="flex-1 outline-none text-sm px-1 py-1 text-gray-900 placeholder:text-gray-400"
        onKeyDown={(e) => {
          if (e.key === 'Escape') setSearchOpen(false);
        }}
        onBlur={() => {
          // Add a small delay so we don't close instantly if clicking a node
          setTimeout(() => setSearchOpen(false), 200);
        }}
      />
    </div>
  );
};
