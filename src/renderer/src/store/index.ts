import { create } from 'zustand'

interface AppState {
  url: string
  setUrl: (url: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  url: 'https://google.com',
  setUrl: (url) => set({ url }),
}))
