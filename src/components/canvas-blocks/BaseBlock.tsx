import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CanvasBlock } from '../../lib/canvas-engine/types';
import { useCanvasStore } from '../../lib/canvas-engine/orchestrator';
import { Pin, MessageSquare, Download, X, Maximize2, Minimize2, ChevronDown, ChevronUp } from 'lucide-react';
import { interactionBus } from '../../lib/canvas-engine/interaction-bus';

interface BaseBlockProps {
  block: CanvasBlock;
  children: React.ReactNode;
}

export const BaseBlock: React.FC<BaseBlockProps> = ({ block, children }) => {
  const store = useCanvasStore();
  const isPinned = store.pinnedBlockIds.includes(block.id);
  const isFocused = store.focusedBlockId === block.id;
  const layout = store.layout;
  const [isCollapsed, setIsCollapsed] = useState(false);

  // If loading:
  const isLoading = !block.data || Object.keys(block.data).length === 0;

  const handlePin = () => {
    isPinned ? store.unpinBlock(block.id) : store.pinBlock(block.id);
    interactionBus.emit('interaction', { type: 'block_pin', blockId: block.id });
  };

  const handleClose = () => {
    store.closeBlock(block.id);
    interactionBus.emit('interaction', { type: 'block_close', blockId: block.id });
  };
  
  const handleExport = () => {
    interactionBus.emit('interaction', { type: 'block_export', blockId: block.id });
  };

  const handleChatAnchor = () => {
    if (block.conversationAnchor) {
      const el = document.getElementById(`msg-${block.conversationAnchor}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div 
      className={`relative group bg-white border-2 border-[#0F0F0F] shadow-[8px_8px_0_#0F0F0F] flex flex-col h-full 
        font-sans transition-all duration-300
        ${isFocused ? 'scale-[1.02] shadow-[12px_12px_0_#0F0F0F] z-50' : 'hover:-translate-y-1 hover:shadow-[10px_10px_0_#0F0F0F] z-10'}
      `}
      data-id={block.id}
      data-message-id={block.conversationAnchor}
      onDoubleClick={() => layout !== 'focus' ? store.focusBlock(block.id) : store.unfocusBlock()}
    >
      {/* Top Toolbar (Appears on Hover) */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-[#0F0F0F] p-1 rounded z-50 text-white">
        <button onClick={handlePin} className={`p-1 hover:bg-gray-700 rounded ${isPinned ? 'text-red-500' : ''}`} title="Pin">
          <Pin className="w-4 h-4" />
        </button>
        {block.conversationAnchor && (
            <button onClick={handleChatAnchor} className="p-1 hover:bg-gray-700 rounded" title="Go to chat">
            <MessageSquare className="w-4 h-4" />
            </button>
        )}
        <button onClick={handleExport} className="p-1 hover:bg-gray-700 rounded" title="Export">
          <Download className="w-4 h-4" />
        </button>
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-1 hover:bg-gray-700 rounded" title="Toggle Collapse">
          {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
        {layout === 'focus' && isFocused ? (
          <button onClick={() => store.unfocusBlock()} className="p-1 hover:bg-gray-700 rounded text-blue-400">
            <Minimize2 className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={() => store.focusBlock(block.id)} className="p-1 hover:bg-gray-700 rounded">
            <Maximize2 className="w-4 h-4" />
          </button>
        )}
        <button onClick={handleClose} className="p-1 hover:bg-red-600 rounded text-red-400 hover:text-white" title="Close">
          <X className="w-4 h-4" />
        </button>
      </div>

      {isPinned && !isCollapsed && (
        <div className="absolute -top-3 -left-3 text-red-500 bg-white rounded-full border border-red-200">
          <Pin className="w-6 h-6 p-1" />
        </div>
      )}

      {/* Content */}
      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col p-6 min-h-0 overflow-y-auto"
          >
            {isLoading ? (
               <div className="w-full h-full flex flex-col gap-4 animate-pulse">
                 <div className="w-1/3 h-8 bg-gray-200"></div>
                 <div className="w-1/4 h-4 bg-gray-200 mb-6"></div>
                 <div className="flex-1 bg-gray-100 rounded"></div>
               </div>
            ) : (
               children
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Collapsed Header */}
      {isCollapsed && (
         <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => setIsCollapsed(false)}>
            <div className="font-bold text-gray-800">{block.title || block.template}</div>
            {isPinned && <Pin className="w-4 h-4 text-red-500" />}
         </div>
      )}
    </div>
  );
};
