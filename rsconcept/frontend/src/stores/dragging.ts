import { create } from 'zustand';

interface DraggingStore {
  isDragging: boolean;
  setIsDragging: (value: boolean) => void;
  dropTarget: number | null;
  setDropTarget: (value: number | null) => void;
}

export const useDraggingStore = create<DraggingStore>()(set => ({
  isDragging: false,
  setIsDragging: value => set(state => (state.isDragging === value ? state : { isDragging: value })),
  dropTarget: null,
  setDropTarget: value => set(state => (state.dropTarget === value ? state : { dropTarget: value }))
}));
