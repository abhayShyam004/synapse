export interface SettingsSlice {
  theme: 'dark' | 'light' | 'cyberpunk';
  accentColor: string;
  ghostCardsEnabled: boolean;
  setTheme: (theme: 'dark' | 'light' | 'cyberpunk') => void;
  setAccentColor: (color: string) => void;
  toggleGhostCards: () => void;
}

export const createSettingsSlice = (
  set: (fn: (state: SettingsSlice) => Partial<SettingsSlice>) => void
): SettingsSlice => ({
  theme: 'dark',
  accentColor: '#0070F3',
  ghostCardsEnabled: true,
  setTheme: (theme) => set(() => ({ theme })),
  setAccentColor: (accentColor) => set(() => ({ accentColor })),
  toggleGhostCards: () => set((state) => ({ ghostCardsEnabled: !state.ghostCardsEnabled })),
});
