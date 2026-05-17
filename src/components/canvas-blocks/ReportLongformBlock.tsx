import React from 'react';
import { CanvasBlock } from '../../lib/canvas-engine/types';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface BlockProps {
  block: CanvasBlock;
}

export const ReportLongformBlock: React.FC<BlockProps> = ({ block }) => {
  const { data = {}, title, subtitle } = block;
  const content = data.content || '';

  return (
    <div className="flex flex-col h-full w-full">
       <div className="border-b-4 border-[#FF3B00] pb-6 mb-8">
         <h3 className="text-4xl font-black mb-2 tracking-tight text-[#0F0F0F]">{title}</h3>
         {subtitle && <p className="text-lg text-gray-600 font-medium">{subtitle}</p>}
       </div>
       
       <div className="prose prose-lg prose-headings:font-black prose-headings:text-[#0F0F0F] prose-p:text-gray-700 prose-a:text-blue-600 prose-a:font-bold prose-strong:text-black max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
       </div>
    </div>
  );
};

export default ReportLongformBlock;
