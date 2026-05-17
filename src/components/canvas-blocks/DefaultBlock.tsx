import React from 'react';
import { CanvasBlock } from '../../lib/canvas-engine/types';

interface BlockProps {
  block: CanvasBlock;
}

export const DefaultBlock: React.FC<BlockProps> = ({ block }) => {
  return (
    <div className="bg-[#1C1C1C] text-white p-6 rounded-xl border border-gray-800 shadow-xl w-full h-full">
      <h3 className="text-xl font-bold mb-2">{block.title || 'Unknown Block'}</h3>
      {block.subtitle && <p className="text-gray-400 text-sm mb-4">{block.subtitle}</p>}
      <pre className="text-xs text-green-400 overflow-auto bg-black p-4 rounded-lg h-48 border border-green-900">
        {JSON.stringify(block.data, null, 2)}
      </pre>
    </div>
  );
};

export default DefaultBlock;
