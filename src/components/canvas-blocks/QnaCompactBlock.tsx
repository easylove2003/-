import React from 'react';
import { CanvasBlock } from '../../lib/canvas-engine/types';
import { motion } from 'motion/react';

interface BlockProps {
  block: CanvasBlock;
}

export const QnaCompactBlock: React.FC<BlockProps> = ({ block }) => {
  const { data = {}, title, subtitle } = block;
  const answer = data.answer || '';

  return (
    <div className="flex flex-col h-full w-full">
       <h3 className="text-xl font-bold mb-2 text-[#0F0F0F]">{title}</h3>
       {subtitle && <p className="text-gray-500 text-sm mb-4 font-medium italic">{subtitle}</p>}
       
       <div className="text-gray-800 leading-relaxed text-base">
         {answer}
       </div>
    </div>
  );
};

export default QnaCompactBlock;
