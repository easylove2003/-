import React from 'react';
import { CanvasBlock } from '../../lib/canvas-engine/types';
import { motion } from 'motion/react';

interface BlockProps {
  block: CanvasBlock;
}

export const ComparisonSplitBlock: React.FC<BlockProps> = ({ block }) => {
  const { data = {}, title, subtitle } = block;
  const left = data.left || { title: 'A', metrics: [] };
  const right = data.right || { title: 'B', metrics: [] };

  return (
    <div className="flex flex-col h-full w-full">
       <h3 className="text-2xl font-black mb-1 text-center">{title}</h3>
       {subtitle && <p className="text-gray-500 text-sm mb-8 text-center">{subtitle}</p>}
       
       <div className="flex flex-1 rounded-xl overflow-hidden border-2 border-[#0F0F0F]">
         {/* Left Side */}
         <div className="w-1/2 bg-blue-50/50 p-6 flex flex-col items-center border-r-2 border-[#0F0F0F]">
           <h4 className="text-xl font-bold bg-blue-100 text-blue-800 px-4 py-1 rounded inline-block mb-6 border border-blue-200">{left.title}</h4>
           <div className="w-full space-y-4">
             {left.metrics.map((m: any, i: number) => (
                <div key={i} className="flex justify-between items-center border-b border-blue-100 pb-2">
                   <span className="text-gray-600 font-medium">{m.label}</span>
                   <span className="text-xl font-black text-blue-900">{m.value}</span>
                </div>
             ))}
           </div>
         </div>
         
         {/* VS Badge */}
         <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white border-2 border-[#0F0F0F] rounded-full flex items-center justify-center font-black text-[#FF3B00] shadow-[2px_2px_0_#0F0F0F] z-10 italic">
           VS
         </div>
         
         {/* Right Side */}
         <div className="w-1/2 bg-amber-50/50 p-6 flex flex-col items-center">
           <h4 className="text-xl font-bold bg-amber-100 text-amber-800 px-4 py-1 rounded inline-block mb-6 border border-amber-200">{right.title}</h4>
           <div className="w-full space-y-4">
             {right.metrics.map((m: any, i: number) => (
                <div key={i} className="flex justify-between items-center border-b border-amber-100 pb-2">
                   <span className="text-gray-600 font-medium">{m.label}</span>
                   <span className="text-xl font-black text-amber-900">{m.value}</span>
                </div>
             ))}
           </div>
         </div>
       </div>
    </div>
  );
};

export default ComparisonSplitBlock;
