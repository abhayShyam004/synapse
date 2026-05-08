import { create } from 'zustand';
import type { StateCreator } from 'zustand';
import { persist } from 'zustand/middleware';
import { createCanvasSlice } from './slices/canvasSlice';
import { createSettingsSlice } from './slices/settingsSlice';
import { createVariableSlice } from './slices/variableSlice';
import type { CanvasSlice } from './slices/canvasSlice';
import type { SettingsSlice } from './slices/settingsSlice';
import type { VariableSlice } from './slices/variableSlice';

type StoreState = CanvasSlice & SettingsSlice & VariableSlice;

const storeCreator: StateCreator<StoreState, [["zustand/persist", unknown]]> = (set) => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...createCanvasSlice(set as unknown as any),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...createSettingsSlice(set as unknown as any),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...createVariableSlice(set as unknown as any),
});

export const useSynapseStore = create<StoreState>()(
  persist(
    storeCreator,
    { name: 'synapse-storage' }
  )
);
