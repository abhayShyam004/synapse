export interface SettingsSlice {
  isSettingsOpen: boolean;
  autoSave: boolean;
  snapToGrid: boolean;
  showMinimap: boolean;
  canvasBackground: 'dots' | 'lines' | 'none';
  canvasDotColor: string;
  zoomSpeed: number;
  ghostCardsEnabled: boolean;
  idleSuggestionEnabled: boolean;
  idleTimeout: number;
  accentColor: 'cyan' | 'yellow' | 'both';
  nodeHeaderStyle: 'dark' | 'colored';
  fontSize: 'small' | 'medium' | 'large';
  
  toggleSettingsModal: (isOpen: boolean) => void;
  updateSetting: <K extends keyof Omit<SettingsSlice, 'toggleSettingsModal' | 'updateSetting' | 'toggleGhostCards'>>(key: K, value: SettingsSlice[K]) => void;
  toggleGhostCards: () => void;
}

export const createSettingsSlice = (
  set: (fn: (state: SettingsSlice) => Partial<SettingsSlice>) => void
): SettingsSlice => ({
  isSettingsOpen: false,
  autoSave: true,
  snapToGrid: true,
  showMinimap: true,
  canvasBackground: 'dots',
  canvasDotColor: '#CBD5E1',
  zoomSpeed: 1,
  ghostCardsEnabled: true,
  idleSuggestionEnabled: false,
  idleTimeout: 4,
  accentColor: 'cyan',
  nodeHeaderStyle: 'dark',
  fontSize: 'medium',

  toggleSettingsModal: (isOpen) => set(() => ({ isSettingsOpen: isOpen })),
  updateSetting: (key, value) => set((state) => ({ ...state, [key]: value })),
  toggleGhostCards: () => set((state) => ({ ghostCardsEnabled: !state.ghostCardsEnabled })),
});
