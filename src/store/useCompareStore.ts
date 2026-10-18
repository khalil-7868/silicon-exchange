import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface CompareStoreState {
  selectedIds: string[];
  addToCompare: (id: string) => boolean;
  removeFromCompare: (id: string) => void;
  toggleCompare: (id: string) => boolean;
  clearCompare: () => void;
  isCompared: (id: string) => boolean;
}

export const useCompareStore = create<CompareStoreState>()(
  persist(
    (set, get) => ({
      selectedIds: ['node-01', 'node-03', 'node-06'], // Default with 3 premier accelerators for immediate visual delight

      addToCompare: (id: string) => {
        const state = get();
        if (state.selectedIds.includes(id)) {
          return true;
        }
        if (state.selectedIds.length >= 3) {
          return false;
        }
        set({ selectedIds: [...state.selectedIds, id] });
        return true;
      },

      removeFromCompare: (id: string) => {
        set((prev) => ({
          selectedIds: prev.selectedIds.filter((item) => item !== id),
        }));
      },

      toggleCompare: (id: string) => {
        const state = get();
        if (state.selectedIds.includes(id)) {
          get().removeFromCompare(id);
          return false;
        } else {
          return get().addToCompare(id);
        }
      },

      clearCompare: () => {
        set({ selectedIds: [] });
      },

      isCompared: (id: string) => {
        return get().selectedIds.includes(id);
      },
    }),
    {
      name: 'silicon_compare_store_v1',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
