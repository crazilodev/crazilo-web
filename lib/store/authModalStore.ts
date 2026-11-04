import { create } from 'zustand'

export type AuthModalView = 'login' | 'register'

interface AuthModalState {
  isOpen: boolean
  view: AuthModalView
  redirectUrl: string | null
  openLogin: (redirectUrl?: string) => void
  openRegister: (redirectUrl?: string) => void
  closeModal: () => void
  switchView: (view: AuthModalView) => void
}

export const useAuthModalStore = create<AuthModalState>((set) => ({
  isOpen: false,
  view: 'login',
  redirectUrl: null,
  openLogin: (redirectUrl) =>
    set({
      isOpen: true,
      view: 'login',
      redirectUrl: redirectUrl || null,
    }),
  openRegister: (redirectUrl) =>
    set({
      isOpen: true,
      view: 'register',
      redirectUrl: redirectUrl || null,
    }),
  closeModal: () =>
    set({
      isOpen: false,
      redirectUrl: null,
    }),
  switchView: (view) => set({ view }),
}))

