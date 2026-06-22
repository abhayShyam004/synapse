import { useState } from 'react';
import { useSynapseStore } from '../../store/useSynapseStore';
import { X, Settings, Monitor, Sparkles, Palette, Keyboard } from 'lucide-react';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';

export const SettingsModal = () => {
  const { 
    isSettingsOpen, toggleSettingsModal, 
    autoSave, snapToGrid, showMinimap, 
    canvasBackground, 
    idleSuggestionEnabled, idleTimeout, 
    accentColor, updateSetting 
  } = useSynapseStore();

  const [activeTab, setActiveTab] = useState<'general' | 'canvas' | 'appearance' | 'shortcuts'>('general');

  if (!isSettingsOpen) return null;
  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'canvas', label: 'Canvas', icon: Monitor },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'shortcuts', label: 'Shortcuts', icon: Keyboard },
  ] as const;

  const handleSave = () => {
    toast.success('Settings saved successfully');
    toggleSettingsModal(false);
  };

  const Toggle = ({ checked, onChange }: { checked: boolean, onChange: (val: boolean) => void }) => (
    <button 
      onClick={() => onChange(!checked)}
      className={clsx(
        "w-10 h-5 rounded-full relative transition-colors duration-200 ease-in-out outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand",
        checked ? "bg-[var(--accent)]" : "bg-gray-200"
      )}
    >
      <div className={clsx(
        "absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full shadow transform transition-transform duration-200 ease-in-out",
        checked ? "translate-x-5" : "translate-x-0"
      )} />
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm" onClick={() => toggleSettingsModal(false)}>
      <div 
        className="bg-white rounded-xl shadow-2xl w-[680px] h-[520px] flex flex-col overflow-hidden border border-gray-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50 shrink-0">
          <h2 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
            <Settings size={18} className="text-[var(--accent)]" /> Settings
          </h2>
          <button onClick={() => toggleSettingsModal(false)} className="text-gray-400 hover:text-gray-700 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-[180px] border-r border-gray-100 bg-gray-50 flex flex-col py-6 shrink-0">
            <div className="px-6 mb-6">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Settings</h2>
            </div>
            <nav className="flex flex-col">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={clsx(
                    "flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all text-left relative",
                    activeTab === id 
                      ? "text-[var(--accent)] border-l-4 border-[var(--accent)]" 
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-900 border-l-4 border-transparent"
                  )}
                  style={{
                    backgroundColor: activeTab === id ? 'color-mix(in srgb, var(--accent), transparent 95%)' : undefined
                  }}
                >
                  <Icon size={18} className={activeTab === id ? "text-[var(--accent)]" : "text-gray-400"} />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 p-8 overflow-y-auto bg-white">
              {activeTab === 'general' && (
                <div className="flex flex-col gap-8">
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">Workspace</h3>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between h-12">
                        <span className="text-sm font-medium text-gray-700">Auto-save changes</span>
                        <Toggle checked={autoSave} onChange={v => updateSetting('autoSave', v)} />
                      </div>
                      <div className="flex items-center justify-between h-12">
                        <span className="text-sm font-medium text-gray-700">Snap to grid</span>
                        <Toggle checked={snapToGrid} onChange={v => updateSetting('snapToGrid', v)} />
                      </div>
                      <div className="flex items-center justify-between h-12">
                        <span className="text-sm font-medium text-gray-700">Show Minimap</span>
                        <Toggle checked={showMinimap} onChange={v => updateSetting('showMinimap', v)} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'canvas' && (
                <div className="flex flex-col gap-8">
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">Canvas Style</h3>
                    <div className="flex flex-col gap-6">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Background type</span>
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                          {(['dots', 'lines', 'none'] as const).map(type => (
                            <button
                              key={type}
                              onClick={() => updateSetting('canvasBackground', type)}
                              className={clsx(
                                "px-3 py-1 text-xs font-semibold rounded-md transition-all capitalize",
                                canvasBackground === type ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                              )}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Pattern color</span>
                        <input 
                          type="color" 
                          value={useSynapseStore.getState().canvasDotColor}
                          onChange={e => updateSetting('canvasDotColor', e.target.value)}
                          className="w-8 h-8 rounded border-none cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}



              {activeTab === 'appearance' && (
                <div className="flex flex-col gap-8">
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">Visual Theme</h3>
                    <div className="flex flex-col gap-6">
                      <div>
                        <span className="text-sm font-medium text-gray-700 block mb-4">Accent color</span>
                        <div className="grid grid-cols-4 gap-y-6 gap-x-4">
                          {[
                            { name: 'Cyan', hex: '#06B6D4', id: 'cyan' },
                            { name: 'Amber', hex: '#F59E0B', id: 'amber' },
                            { name: 'Violet', hex: '#7C3AED', id: 'violet' },
                            { name: 'Rose', hex: '#F43F5E', id: 'rose' },
                            { name: 'Emerald', hex: '#10B981', id: 'emerald' },
                            { name: 'Blue', hex: '#3B82F6', id: 'blue' },
                            { name: 'Orange', hex: '#F97316', id: 'orange' },
                            { name: 'Pink', hex: '#EC4899', id: 'pink' },
                          ].map(color => (
                            <div key={color.id} className="flex flex-col items-center gap-2">
                              <button 
                                onClick={() => updateSetting('accentColor', color.id as any)}
                                className={clsx(
                                  "w-8 h-8 rounded-full transition-all relative flex items-center justify-center p-0",
                                  accentColor === color.id ? "ring-2 ring-offset-0" : "hover:scale-110"
                                )}
                                style={{ 
                                  backgroundColor: color.hex,
                                  boxShadow: accentColor === color.id ? `0 0 0 2px ${color.hex}` : 'none'
                                }}
                              >
                                {accentColor === color.id && (
                                  <div className="w-[22px] h-[22px] rounded-full border-2 border-white" />
                                )}
                              </button>
                              <span className={clsx(
                                "text-[10px] font-bold tracking-tighter uppercase",
                                accentColor === color.id ? "text-gray-900" : "text-gray-400"
                              )}>{color.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'shortcuts' && (
                <div className="flex flex-col gap-6">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Keyboard Shortcuts</h3>
                  <div className="border border-gray-100 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          <th className="text-left px-4 py-2 font-semibold text-gray-600">Action</th>
                          <th className="text-left px-4 py-2 font-semibold text-gray-600">Shortcut</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {[
                          ['Undo', 'Ctrl+Z'],
                          ['Redo', 'Ctrl+Shift+Z'],
                          ['Save Workflow', 'Ctrl+S'],
                          ['Delete Node', 'Delete'],
                          ['Clone Node', 'Ctrl+D'],
                          ['Close / Deselect', 'Escape'],
                          ['Pan Canvas', 'Space+Drag'],
                          ['Fit View', 'Ctrl+Shift+F'],
                        ].map(([action, key]) => (
                          <tr key={action}>
                            <td className="px-4 py-2 text-gray-700">{action}</td>
                            <td className="px-4 py-2 font-mono text-xs text-[var(--accent)] font-bold">{key}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-4 shrink-0">
              <button 
                onClick={() => toggleSettingsModal(false)}
                className="text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                style={{ backgroundColor: 'var(--accent)' }}
                className="text-white px-6 py-2 rounded-lg text-sm font-semibold hover:brightness-90 transition-all shadow-md shadow-cyan-100"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
