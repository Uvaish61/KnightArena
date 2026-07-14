import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type AiDifficulty = 'easy' | 'medium' | 'hard';

interface SettingsStore {
  moveSuggestions: boolean;
  soundEffects: boolean;
  autoFlipBoard: boolean;
  defaultTimer: number | null;
  aiDifficulty: AiDifficulty;
  setMoveSuggestions: (value: boolean) => void;
  setSoundEffects: (value: boolean) => void;
  setAutoFlipBoard: (value: boolean) => void;
  setDefaultTimer: (value: number | null) => void;
  setAiDifficulty: (value: AiDifficulty) => void;
  resetSettings: () => void;
}

const defaults = {
  moveSuggestions: true,
  soundEffects: true,
  autoFlipBoard: false,
  defaultTimer: 5,
  aiDifficulty: 'medium' as AiDifficulty,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...defaults,
      setMoveSuggestions: (value) => set({ moveSuggestions: value }),
      setSoundEffects: (value) => set({ soundEffects: value }),
      setAutoFlipBoard: (value) => set({ autoFlipBoard: value }),
      setDefaultTimer: (value) => set({ defaultTimer: value }),
      setAiDifficulty: (value) => set({ aiDifficulty: value }),
      resetSettings: () => set(defaults),
    }),
    {
      name: 'knight-arena-settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);