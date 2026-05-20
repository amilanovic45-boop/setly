'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppSettings, Balance, Generation } from '@/types';

interface AppState {
  isOnboarded: boolean;
  apiKey: string | null;
  balance: Balance | null;
  generations: Generation[];
  settings: AppSettings;

  setOnboarded: (value: boolean) => void;
  setApiKey: (key: string | null) => void;
  setBalance: (balance: Balance | null) => void;
  addGeneration: (generation: Generation) => void;
  updateGeneration: (id: string, updates: Partial<Generation>) => void;
  removeGeneration: (id: string) => void;
  setGenerations: (generations: Generation[]) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
  isOnboarded: false,
  apiKey: null,
  balance: null,
  generations: [],
  settings: {
    defaultImageModel: 'soul_2',
    defaultVideoModel: 'seedance_2_0',
    defaultAspectRatio: '1:1',
    theme: 'dark',
    notificationsEnabled: true,
  },

  setOnboarded: (value) => set({ isOnboarded: value }),
  setApiKey: (key) => set({ apiKey: key }),
  setBalance: (balance) => set({ balance }),
  addGeneration: (generation) =>
    set((state) => ({ generations: [generation, ...state.generations] })),
  updateGeneration: (id, updates) =>
    set((state) => ({
      generations: state.generations.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    })),
  removeGeneration: (id) =>
    set((state) => ({
      generations: state.generations.filter((g) => g.id !== id),
    })),
  setGenerations: (generations) => set({ generations }),
  updateSettings: (settings) =>
    set((state) => ({ settings: { ...state.settings, ...settings } })),
    }),
    { name: 'visioai-store' },
  ),
);
