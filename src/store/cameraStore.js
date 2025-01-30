import { create } from 'zustand'

const DEFAULT_POSITION = [5, 5, 5]

export const useCameraStore = create((set) => ({
  position: DEFAULT_POSITION,
  setPosition: (newPosition) => set({ position: newPosition }),
  isOrthographic: false,
  toggleProjection: () => set((state) => ({ isOrthographic: !state.isOrthographic })),
  resetPosition: () => set({ position: DEFAULT_POSITION }),
})) 