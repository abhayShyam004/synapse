import { useState } from 'react';
import { useSynapseStore } from '../../store/useSynapseStore';
import { X, Settings, Monitor, Sparkles, Palette, Keyboard, Eye, EyeOff } from 'lucide-react';
import { clsx } from 'clsx';

export const SettingsModal = () => {
  const { 
    isSettingsOpen, toggleSettingsModal, 
    autoSave, snapToGrid, showMinimap, 
    canvasBackground, 
    nimApiKey, ghostCardsEnabled, 
    accentColor, updateSetting 
  } = useSynapseStore();

  const [activeTab, setActiveTab] = useState<'general' | 'canvas' | 'ai' | 'appearance' | 'shortcuts'>('general');
  const [showKey, setShowKey] = useState(false);

  if (!isSettingsOpen) return null;

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'canvas', label: 'Canvas', icon: Monitor },
    { id: 'ai', label: 'AI', icon: Sparkles },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'shortcuts', label: 'Shortcuts', icon: Keyboard },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm" onClick={() => toggleSettingsModal(false)}>
      <div 
        className="bg-white rounded-xl shadow-2xl w-[560px] h-[480px] flex flex-col overflow-hidden border border-gray-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50 shrink-0">
          <h2 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
            <Settings size={18} className="text-[#06B6D4]" /> Settings
          </h2>
          <button onClick={() => toggleSettingsModal(false)} className="text-gray-400 hover:text-gray-700 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-40 border-r border-gray-100 bg-gray-50 flex flex-col py-2 shrink-0">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors text-left",
                  activeTab === id ? "bg-white text-[#06B6D4] border-r-2 border-[#06B6D4]" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Icon size={16} /> {label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto bg-white">
            {activeTab === 'general' && (
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Workspace</h3>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-700">Auto-save</span>
                    <input type="checkbox" checked={autoSave} onChange={e => updateSetting('autoSave', e.target.checked)} className="accent-[#06B6D4] w-4 h-4" />
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-700">Snap to grid</span>
                    <input type="checkbox" checked={snapToGrid} onChange={e => updateSetting('snapToGrid', e.target.checked)} className="accent-[#06B6D4] w-4 h-4" />
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-700">Show Minimap</span>
                    <input type="checkbox" checked={showMinimap} onChange={e => updateSetting('showMinimap', e.target.checked)} className="accent-[#06B6D4] w-4 h-4" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'canvas' && (
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Canvas Style</h3>
                  <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input type="radio" checked={canvasBackground === 'dots'} onChange={() => updateSetting('canvasBackground', 'dots')} className="accent-[#06B6D4]" /> Dots
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input type="radio" checked={canvasBackground === 'lines'} onChange={() => updateSetting('canvasBackground', 'lines')} className="accent-[#06B6D4]" /> Lines
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input type="radio" checked={canvasBackground === 'none'} onChange={() => updateSetting('canvasBackground', 'none')} className="accent-[#06B6D4]" /> None
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">NVIDIA NIM</h3>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500">API Key</label>
                    <div className="relative">
                      <input 
                        type={showKey ? "text" : "password"} 
                        value={nimApiKey}
                        onChange={e => updateSetting('nimApiKey', e.target.value)}
                        placeholder="nvapi-..."
                        className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm outline-none focus:border-[#06B6D4] focus:ring-1 focus:ring-[#06B6D4] pr-10"
                      />
                      <button onClick={() => setShowKey(!showKey)} className="absolute right-2 top-1.5 text-gray-400 hover:text-gray-600">
                        {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Features</h3>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-700">AI Ghost Cards</span>
                    <input type="checkbox" checked={ghostCardsEnabled} onChange={e => updateSetting('ghostCardsEnabled', e.target.checked)} className="accent-[#06B6D4] w-4 h-4" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Accent Color</h3>
                  <div className="flex gap-3">
                    <button onClick={() => updateSetting('accentColor', 'cyan')} className={`w-8 h-8 rounded-full bg-[#06B6D4] border-2 ${accentColor === 'cyan' ? 'border-gray-900 ring-2 ring-offset-1 ring-cyan-200' : 'border-transparent'}`} />
                    <button onClick={() => updateSetting('accentColor', 'yellow')} className={`w-8 h-8 rounded-full bg-[#F59E0B] border-2 ${accentColor === 'yellow' ? 'border-gray-900 ring-2 ring-offset-1 ring-yellow-200' : 'border-transparent'}`} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'shortcuts' && (
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Keyboard Shortcuts</h3>
                <div className="grid grid-cols-2 gap-y-3">
                  <div className="text-sm text-gray-600">Undo</div>
                  <div className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-0.5 rounded w-fit">Ctrl+Z</div>
                  <div className="text-sm text-gray-600">Redo</div>
                  <div className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-0.5 rounded w-fit">Ctrl+Y</div>
                  <div className="text-sm text-gray-600">Save</div>
                  <div className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-0.5 rounded w-fit">Ctrl+S</div>
                  <div className="text-sm text-gray-600">Delete Node</div>
                  <div className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-0.5 rounded w-fit">Backspace / Del</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
