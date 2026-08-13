import { create } from 'zustand'

interface ThemeState {
  navBgColor: string | null
  navTextColor: string | null
  setNavColors: (bg: string | null, text: string | null) => void
  resetNavColors: () => void
}

export const useThemeStore = create<ThemeState>((set) => ({
  navBgColor: null,
  navTextColor: null,
  setNavColors: (bg, text) => set({ navBgColor: bg, navTextColor: text }),
  resetNavColors: () => set({ navBgColor: null, navTextColor: null }),
}))
