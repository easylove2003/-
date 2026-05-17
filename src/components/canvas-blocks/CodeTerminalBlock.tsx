import React from 'react';
import { CanvasBlock } from '../../lib/canvas-engine/types';
import { motion } from 'motion/react';

interface BlockProps {
  block: CanvasBlock;
}

export const CodeTerminalBlock: React.FC<BlockProps> = ({ block }) => {
  const { data = {}, title, subtitle } = block;
  const code = data.code || '';
  const language = data.language || 'sql';
  const result = data.result || '';

  return (
    <div className="flex flex-col h-full w-full bg-[#1E1E1E]">
       <div className="bg-[#2D2D2D] px-4 py-3 flex items-center justify-between border-b border-[#0F0F0F]">
         <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
         </div>
         <div className="text-gray-400 text-xs font-mono lowercase">{title} - {language}</div>
       </div>
       
       <div className="p-4 flex-1 overflow-auto bg-[#1E1E1E]">
         {subtitle && <p className="text-gray-400 text-sm mb-4 font-mono">// {subtitle}</p>}
         <pre className="text-blue-300 font-mono text-sm leading-relaxed whitespace-pre-wrap break-all">
           <code className={`language-${language}`}>{code}</code>
         </pre>
       </div>
       
       {result && (
         <div className="border-t border-[#333] bg-black p-4">
           <div className="text-gray-500 text-xs mb-2 font-mono uppercase tracking-widest">Execution Result</div>
           <pre className="text-green-400 font-mono text-xs whitespace-pre-wrap">{result}</pre>
         </div>
       )}
    </div>
  );
};

export default CodeTerminalBlock;
