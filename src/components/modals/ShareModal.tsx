import { useSynapseStore } from '../../store/useSynapseStore';
import { X, Copy, Check, Globe, Eye, Users } from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';

export const ShareModal = () => {
  const { currentWorkflowId, isShareModalOpen, setShareModalOpen } = useSynapseStore();
  const [copiedPlay, setCopiedPlay] = useState(false);
  const [copiedCollab, setCopiedCollab] = useState(false);

  if (!isShareModalOpen) return null;

  const baseUrl = window.location.origin;
  const playLink = `${baseUrl}/work/?share=${currentWorkflowId}`;
  const collabLink = `${baseUrl}/work/?collab=${currentWorkflowId}`; // collab is technically just standard edit mode if RLS allows it

  const handleCopy = (link: string, type: 'play' | 'collab') => {
    navigator.clipboard.writeText(link);
    toast.success('Link copied to clipboard!');
    if (type === 'play') {
      setCopiedPlay(true);
      setTimeout(() => setCopiedPlay(false), 2000);
    } else {
      setCopiedCollab(true);
      setTimeout(() => setCopiedCollab(false), 2000);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] animate-in fade-in" onClick={() => setShareModalOpen(false)} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-[110] w-[90vw] max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2 text-gray-900">
            <Globe size={18} className="text-[var(--accent)]" />
            <h2 className="font-bold">Share Synapse</h2>
          </div>
          <button onClick={() => setShareModalOpen(false)} className="text-gray-400 hover:text-gray-700 bg-white hover:bg-gray-100 rounded-full p-1.5 transition-colors shadow-sm border border-gray-100">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-6">
          {/* Play-Only Link */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Eye size={16} className="text-[#0D9488]" />
              <h3 className="font-bold text-sm text-gray-900">Play-Only Link (Recommended)</h3>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed mb-1">
              Anyone with this link can view and play with the nodes locally. Their changes will <span className="font-bold text-gray-700">not</span> affect your original synapse. If you update the original, they will see it!
            </p>
            <div className="flex items-center gap-2">
              <input 
                readOnly 
                value={playLink} 
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600 outline-none select-all font-mono"
              />
              <button 
                onClick={() => handleCopy(playLink, 'play')}
                className={clsx(
                  "flex items-center justify-center w-10 h-9 rounded-lg transition-all shrink-0",
                  copiedPlay ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-[var(--accent)] text-white hover:brightness-110 shadow-sm"
                )}
              >
                {copiedPlay ? <Check size={16} strokeWidth={3} /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          <div className="h-px bg-gray-100 w-full" />

          {/* Collaborative Link */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-[#F59E0B]" />
              <h3 className="font-bold text-sm text-gray-900">Collaborative Link</h3>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed mb-1">
              Anyone with this link can directly edit your synapse. Their changes <span className="font-bold text-[#F59E0B]">will be saved globally</span> for everyone to see.
            </p>
            <div className="flex items-center gap-2">
              <input 
                readOnly 
                value={collabLink} 
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600 outline-none select-all font-mono"
              />
              <button 
                onClick={() => handleCopy(collabLink, 'collab')}
                className={clsx(
                  "flex items-center justify-center w-10 h-9 rounded-lg transition-all shrink-0",
                  copiedCollab ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 shadow-sm"
                )}
              >
                {copiedCollab ? <Check size={16} strokeWidth={3} /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
