import { create } from 'zustand'

interface AdminSidebarState {
  isOpen: boolean
  toggle: () => void
  close: () => void
  open: () => void
}

export const useAdminSidebarStore = create<AdminSidebarState>((set) => ({
  isOpen: false,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  close: () => set({ isOpen: false }),
  open: () => set({ isOpen: true }),
}))
