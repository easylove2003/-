import { create } from 'zustand';
import { CanvasBlock, CanvasLayout, CanvasDirective } from './types';

export interface CanvasSnapshot {
  id: string;
  timestamp: number;
  layout: CanvasLayout;
  blocks: CanvasBlock[];
}

interface CanvasState {
  layout: CanvasLayout;
  blocks: CanvasBlock[];
  focusedBlockId?: string;
  pinnedBlockIds: string[];
  history: CanvasSnapshot[];
  
  applyDirective: (directive: CanvasDirective, isStreaming?: boolean) => void;
  focusBlock: (id: string) => void;
  unfocusBlock: () => void;
  pinBlock: (id: string) => void;
  unpinBlock: (id: string) => void;
  closeBlock: (id: string) => void;
  undo: () => void;
  pushSnapshot: () => void;
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  layout: 'idle',
  blocks: [],
  pinnedBlockIds: [],
  history: [],

  pushSnapshot: () => {
    const { layout, blocks, history } = get();
    if (blocks.length === 0) return;
    const newSnapshot: CanvasSnapshot = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      layout,
      blocks: [...blocks],
    };
    set({ history: [...history.slice(-4), newSnapshot] }); // keep last 5
  },

  applyDirective: (directive: CanvasDirective, isStreaming?: boolean) => {
    const { blocks, pinnedBlockIds, pushSnapshot } = get();
    if (!isStreaming) {
       pushSnapshot();
    }

    set((state) => {
      let newBlocks = [...state.blocks];
      let newLayout = directive.layout || state.layout;

      switch (directive.mode) {
        case 'clear':
          newBlocks = state.blocks.filter(b => pinnedBlockIds.includes(b.id));
          newLayout = newBlocks.length > 0 ? 'single' : 'idle';
          break;
        case 'switch':
          // keep pinned blocks
          const pinned = state.blocks.filter(b => pinnedBlockIds.includes(b.id));
          // merge directives without duplicates
          const newIds = new Set(directive.blocks.map(b => b.id));
          const filteredPinned = pinned.filter(b => !newIds.has(b.id));
          newBlocks = [...filteredPinned, ...directive.blocks];
          break;
        case 'append':
          const exists = new Set(state.blocks.map(b => b.id));
          const toAdd = directive.blocks.filter(b => !exists.has(b.id));
          newBlocks = [...state.blocks, ...toAdd];
          break;
        case 'update':
          newBlocks = state.blocks.map(oldBlock => {
            const updated = directive.blocks.find(b => b.id === oldBlock.id);
            return updated ? { ...oldBlock, ...updated } : oldBlock;
          });
          break;
        case 'split':
            newLayout = 'split';
            newBlocks = directive.blocks;
            break;
        case 'focus':
            newLayout = 'focus';
            if (directive.blocks.length > 0) {
              const b = directive.blocks[0];
              if (!newBlocks.find(existing => existing.id === b.id)) {
                  newBlocks.push(b);
              }
              return { layout: newLayout, blocks: newBlocks, focusedBlockId: b.id };
            }
            break;
      }
      return { layout: newLayout, blocks: newBlocks, focusedBlockId: undefined };
    });
  },

  focusBlock: (id: string) => set({ focusedBlockId: id, layout: 'focus' }),
  
  unfocusBlock: () => set(state => {
      if (state.layout === 'focus') {
          let nextLayout: CanvasLayout = state.blocks.length > 1 ? 'grid_2x2' : 'single';
          return { layout: nextLayout, focusedBlockId: undefined };
      }
      return { focusedBlockId: undefined };
  }),

  pinBlock: (id: string) => set((state) => ({ pinnedBlockIds: [...new Set([...state.pinnedBlockIds, id])] })),
  unpinBlock: (id: string) => set((state) => ({ pinnedBlockIds: state.pinnedBlockIds.filter(pid => pid !== id) })),
  
  closeBlock: (id: string) => set((state) => {
      state.pushSnapshot();
      const newBlocks = state.blocks.filter(b => b.id !== id);
      const newPinned = state.pinnedBlockIds.filter(pid => pid !== id);
      return { blocks: newBlocks, pinnedBlockIds: newPinned };
  }),

  undo: () => set((state) => {
      if (state.history.length === 0) return state;
      const last = state.history[state.history.length - 1];
      return {
          layout: last.layout,
          blocks: last.blocks,
          history: state.history.slice(0, -1),
          focusedBlockId: undefined
      };
  }),

}));
