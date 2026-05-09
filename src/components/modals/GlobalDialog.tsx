import { useState, useEffect } from 'react';
import { useSynapseStore } from '../../store/useSynapseStore';
import { X, HelpCircle, Edit3 } from 'lucide-react';

export const GlobalDialog = () => {
  const { dialog, closeDialog } = useSynapseStore();
  const [value, setValue] = useState('');

  useEffect(() => {
    if (dialog.isOpen) {
      setValue(dialog.defaultValue || '');
    }
  }, [dialog.isOpen, dialog.defaultValue]);

  if (!dialog.isOpen) return null;

  const handleConfirm = () => {
    dialog.onConfirm(dialog.type === 'prompt' ? value : undefined);
    closeDialog();
  };

  const handleCancel = () => {
    closeDialog();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
      <div 
        className="bg-white rounded-xl shadow-2xl w-[400px] flex flex-col overflow-hidden border border-gray-200 animate-in fade-in zoom-in duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            {dialog.type === 'confirm' ? (
              <HelpCircle size={18} className="text-[var(--accent)]" />
            ) : (
              <Edit3 size={18} className="text-[var(--accent)]" />
            )}
            {dialog.title}
          </h2>
          <button onClick={handleCancel} className="text-gray-400 hover:text-gray-700 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4 leading-relaxed">
            {dialog.message}
          </p>
          
          {dialog.type === 'prompt' && (
            <input 
              autoFocus
              value={value}
              onChange={e => setValue(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleConfirm();
                if (e.key === 'Escape') handleCancel();
              }}
              className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all"
            />
          )}
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
          <button 
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm}
            style={{ backgroundColor: 'var(--accent)' }}
            className="px-6 py-2 rounded-lg text-sm font-semibold text-white hover:brightness-90 transition-all shadow-md"
          >
            {dialog.type === 'confirm' ? 'Confirm' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};
