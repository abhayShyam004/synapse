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
    ghostCardsEnabled, idleSuggestionEnabled, idleTimeout, 
    accentColor, updateSetting 
  } = useSynapseStore();

  const [activeTab, setActiveTab] = useState<'general' | 'canvas' | 'ai' | 'appearance' | 'shortcuts'>('general');

  if (!isSettingsOpen) return null;

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'canvas', label: 'Canvas', icon: Monitor },
    { id: 'ai', label: 'AI', icon: Sparkles },
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

              {activeTab === 'ai' && (
                <div className="flex flex-col gap-8">
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">AI Configuration</h3>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between h-12">
                        <span className="text-sm font-medium text-gray-700">Enable Ghost Cards</span>
                        <Toggle checked={ghostCardsEnabled} onChange={v => updateSetting('ghostCardsEnabled', v)} />
                      </div>
                      <div className="flex items-center justify-between h-12">
                        <span className="text-sm font-medium text-gray-700">Idle suggestions</span>
                        <Toggle checked={idleSuggestionEnabled} onChange={v => updateSetting('idleSuggestionEnabled', v)} />
                      </div>
                      <div className="flex items-center justify-between h-12">
                        <span className="text-sm font-medium text-gray-700">Idle timeout</span>
                        <select 
                          value={idleTimeout}
                          onChange={e => updateSetting('idleTimeout', Number(e.target.value))}
                          className="text-sm border border-gray-200 rounded-md px-2 py-1 outline-none"
                        >
                          <option value={4}>4 seconds</option>
                          <option value={8}>8 seconds</option>
                          <option value={12}>12 seconds</option>
                        </select>
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
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Accent color</span>
                        <div className="flex gap-3">
                          <button 
                            onClick={() => updateSetting('accentColor', 'cyan')}
                            className={clsx(
                              "w-8 h-8 rounded-full bg-[#06B6D4] transition-all",
                              accentColor === 'cyan' ? "ring-2 ring-offset-2 ring-[#06B6D4] scale-110" : "opacity-60 hover:opacity-100"
                            )} 
                          />
                          <button 
                            onClick={() => updateSetting('accentColor', 'yellow')}
                            className={clsx(
                              "w-8 h-8 rounded-full bg-[#F59E0B] transition-all",
                              accentColor === 'yellow' ? "ring-2 ring-offset-2 ring-[#F59E0B] scale-110" : "opacity-60 hover:opacity-100"
                            )} 
                          />
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
