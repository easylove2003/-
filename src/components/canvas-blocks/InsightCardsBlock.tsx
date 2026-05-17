import React from 'react';
import { CanvasBlock } from '../../lib/canvas-engine/types';
import { motion } from 'motion/react';

interface BlockProps {
  block: CanvasBlock;
}

export const InsightCardsBlock: React.FC<BlockProps> = ({ block }) => {
  const { data = {}, title, subtitle } = block;
  const cards = data.cards || [];

  return (
    <div className="flex flex-col h-full w-full">
       <div className="mb-6 flex border-b-4 border-[#0F0F0F] pb-4 items-end justify-between">
         <div>
            <h3 className="text-3xl font-black italic tracking-tighter uppercase text-[#0F0F0F]">{title}</h3>
            {subtitle && <p className="text-gray-500 mt-1 font-medium">{subtitle}</p>}
         </div>
         <div className="text-5xl font-black text-[#FF3B00]">TOP {cards.length}</div>
       </div>
       
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
          {cards.map((card: any, i: number) => (
             <motion.div 
               whileHover={{ y: -5, scale: 1.02 }}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               key={i} 
               className="bg-white border-4 border-[#0F0F0F] p-5 shadow-[8px_8px_0_#0F0F0F] flex flex-col relative overflow-hidden group"
             >
                <div className="absolute -right-4 -top-6 text-9xl font-black text-gray-100 italic select-none group-hover:text-blue-50 transition-colors z-0">
                  {i+1}
                </div>
                <div className="relative z-10">
                   <h4 className="text-xl font-bold mb-3 leading-tight">{card.title}</h4>
                   <p className="text-gray-600 text-sm mb-4 line-clamp-4">{card.description}</p>
                   {card.metric && (
                     <div className="mt-auto bg-gray-100 p-3 border border-gray-200">
                        <span className="text-xs text-gray-500 uppercase tracking-widest">{card.metric_label}</span><br />
                        <span className="text-2xl font-black text-blue-600">{card.metric}</span>
                     </div>
                   )}
                </div>
             </motion.div>
          ))}
       </div>
    </div>
  );
};

export default InsightCardsBlock;
