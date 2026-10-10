import { create } from 'zustand';

interface UIState {
  is3DEnabled: boolean;
  sidebarOpen: boolean;
  toggle3D: () => void;
  set3DEnabled: (enabled: boolean) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  is3DEnabled: localStorage.getItem('3d_mode') !== 'false',
  sidebarOpen: true,

  toggle3D: () =>
    set((state) => {
      const next = !state.is3DEnabled;
      localStorage.setItem('3d_mode', String(next));
      return { is3DEnabled: next };
    }),

  set3DEnabled: (enabled) => {
    localStorage.setItem('3d_mode', String(enabled));
    set({ is3DEnabled: enabled });
  },

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
