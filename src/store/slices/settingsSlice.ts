export interface SettingsSlice {
  ghostCardsEnabled: boolean;
  toggleGhostCards: () => void;
}

export const createSettingsSlice = (
  set: (fn: (state: SettingsSlice) => Partial<SettingsSlice>) => void
): SettingsSlice => ({
  ghostCardsEnabled: true,
  toggleGhostCards: () => set((state) => ({ ghostCardsEnabled: !state.ghostCardsEnabled })),
});
