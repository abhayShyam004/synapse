import { create } from 'zustand';
import type { StateCreator } from 'zustand';
import { persist } from 'zustand/middleware';
import { createCanvasSlice } from './slices/canvasSlice';
import { createSettingsSlice } from './slices/settingsSlice';
import { createVariableSlice } from './slices/variableSlice';
import { createAuthSlice } from './slices/authSlice';
import type { CanvasSlice } from './slices/canvasSlice';
import type { SettingsSlice } from './slices/settingsSlice';
import type { VariableSlice } from './slices/variableSlice';
import type { AuthSlice } from './slices/authSlice';

type StoreState = CanvasSlice & SettingsSlice & VariableSlice & AuthSlice;

const storeCreator: StateCreator<StoreState, [["zustand/persist", unknown]]> = (set, get) => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...createCanvasSlice(set as unknown as any, get as unknown as any),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...createSettingsSlice(set as unknown as any),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...createVariableSlice(set as unknown as any),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...createAuthSlice(set as unknown as any),
});

export const useSynapseStore = create<StoreState>()(
  persist(
    storeCreator,
    { 
      name: 'synapse-storage',
      partialize: (state) => ({
        accentColor: state.accentColor,
        canvasBackground: state.canvasBackground,
        ghostCardsEnabled: state.ghostCardsEnabled,
        snapToGrid: state.snapToGrid,
        showMinimap: state.showMinimap,
      }),
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        accentColor: persistedState?.accentColor ?? currentState.accentColor,
        canvasBackground: persistedState?.canvasBackground ?? currentState.canvasBackground,
        ghostCardsEnabled: persistedState?.ghostCardsEnabled ?? currentState.ghostCardsEnabled,
        snapToGrid: persistedState?.snapToGrid ?? currentState.snapToGrid,
        showMinimap: persistedState?.showMinimap ?? currentState.showMinimap,
      })
    }
  )
);
