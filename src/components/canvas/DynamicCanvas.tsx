import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCanvasStore } from '../../lib/canvas-engine/orchestrator';
import { renderBlock } from '../../lib/canvas-engine/registry';

interface DynamicCanvasProps {
  uploadedFileName?: string;
  uploadedData?: any;
}

export const DynamicCanvas: React.FC<DynamicCanvasProps> = ({ uploadedFileName, uploadedData }) => {
  const store = useCanvasStore();

  if (store.blocks.length === 0 && store.layout === 'idle') {
    return (
      <div className="w-full h-full flex flex-col pt-12 items-center bg-[#FAF9F6] p-8 overflow-y-auto">
         <div className="text-center max-w-lg mb-12">
           <h2 className="text-3xl font-serif italic mb-4 text-[#0F0F0F]">Data Intelligence Workspace</h2>
           <p className="text-gray-500 mb-8">Waiting for data or commands...</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
            {uploadedFileName && (
              <div className="bg-white border-2 border-[#0F0F0F] p-5 shadow-[4px_4px_0_#0F0F0F] relative">
                <div className="absolute top-0 right-0 bg-[#0F0F0F] text-white text-[10px] uppercase font-mono px-2 py-1 font-bold">Context</div>
                <h4 className="font-bold text-gray-900 mb-2 mt-2">Active Database</h4>
                <div className="flex bg-[#F5F4F0] p-3 border border-gray-200 mt-3">
                  <div className="flex-1 font-mono text-sm text-gray-700 font-bold truncate">
                    {uploadedFileName}
                  </div>
                </div>
                {uploadedData && (
                  <div className="mt-4 border-t border-gray-200 pt-3">
                    <p className="text-xs text-gray-500 font-mono">
                      Loaded {Array.isArray(uploadedData) ? uploadedData.length : '1'} records.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="bg-white border-2 border-[#0F0F0F] p-5 shadow-[4px_4px_0_#0F0F0F] relative">
               <div className="absolute top-0 right-0 bg-[#FF3B00] text-white text-[10px] uppercase font-mono px-2 py-1 font-bold">Capabilities</div>
               <h4 className="font-bold text-gray-900 mb-2 mt-2">Agent System</h4>
               <ul className="text-sm text-gray-600 space-y-2 mt-4 font-mono">
                 <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-[#FF3B00] rounded-full"></span> Data Diagnosis</li>
                 <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-[#FF3B00] rounded-full"></span> Multi-dimensional Attribution</li>
                 <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-[#FF3B00] rounded-full"></span> Strategy Recommendation</li>
               </ul>
            </div>
         </div>
      </div>
    );
  }

  // Handle focus layout specifically
  if (store.layout === 'focus' && store.focusedBlockId) {
    const focusedBlock = store.blocks.find(b => b.id === store.focusedBlockId);
    const otherBlocks = store.blocks.filter(b => b.id !== store.focusedBlockId);
    
    return (
      <div className="flex w-full h-full bg-[#FAF9F6] overflow-hidden p-6 gap-6 relative">
         <div className="w-24 shrink-0 flex flex-col gap-4 overflow-y-auto pr-2 pb-12">
            <div className="font-mono text-xs text-gray-400 font-bold uppercase tracking-widest text-center sticky top-0 bg-[#FAF9F6] py-2">Others</div>
            {otherBlocks.map(b => (
                <div key={b.id} onClick={() => store.focusBlock(b.id)} className="w-full aspect-square bg-gray-100 border-2 border-gray-300 hover:border-[#0F0F0F] cursor-pointer flex items-center justify-center p-2 text-center text-[10px] overflow-hidden shadow-sm transition-colors">
                  {b.title}
                </div>
            ))}
         </div>
         <div className="flex-1 min-w-0 relative h-full">
            <AnimatePresence mode="wait">
              {focusedBlock && (
                <motion.div 
                  key={focusedBlock.id} 
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full h-full"
                >
                   {renderBlock(focusedBlock)}
                </motion.div>
              )}
            </AnimatePresence>
         </div>
      </div>
    );
  }

  // Determine grid classes based on layout
  let gridClass = 'grid-cols-1';
  if (store.layout === 'grid_2x2' && store.blocks.length > 1) {
    gridClass = 'grid-cols-1 xl:grid-cols-2';
  } else if (store.layout === 'split') {
    gridClass = 'grid-cols-1 lg:grid-cols-2';
  }

  return (
    <div className="w-full h-full bg-[#FAF9F6] overflow-y-auto p-6 md:p-12 relative">
       <div className={`grid gap-8 pb-32 ${gridClass} mx-auto max-w-7xl`}>
          <AnimatePresence>
            {store.blocks.map((block) => (
               <motion.div 
                 layout
                 key={block.id}
                 initial={{ opacity: 0, scale: 0.95, y: 20 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
                 transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                 className="min-h-[400px]"
                 layoutId={block.id}
               >
                 {renderBlock(block)}
               </motion.div>
            ))}
          </AnimatePresence>
       </div>
    </div>
  );
};
