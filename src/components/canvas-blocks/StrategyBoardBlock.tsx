import React from 'react';
import { CanvasBlock } from '../../lib/canvas-engine/types';
import { interactionBus } from '../../lib/canvas-engine/interaction-bus';

interface BlockProps {
  block: CanvasBlock;
}

export const StrategyBoardBlock: React.FC<BlockProps> = ({ block }) => {
  const { data = {}, title, subtitle } = block;

  const handleCardDoubleClick = (item: any) => {
    interactionBus.emit('interaction', {
      type: 'block_question',
      blockId: block.id,
      question: `I want to focus on the strategy: ${item.title}. Can you expand its checklist and details?`
    });
  };

  const renderCards = (items: any[], priority: string) => {
    if (!items || items.length === 0) return <div className="text-gray-500 text-sm italic py-4">无建议</div>;
    return items.map((item, i) => (
      <div 
        key={i} 
        onDoubleClick={(e) => { e.stopPropagation(); handleCardDoubleClick(item); }}
        className="bg-white border-2 border-[#0F0F0F] rounded-lg p-4 mb-4 shadow-[4px_4px_0_#0F0F0F] hover:-translate-y-1 hover:shadow-[6px_6px_0_#0F0F0F] transition-all cursor-pointer select-none"
      >
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-bold text-gray-900 text-sm">{item.title}</h4>
        </div>
        
        {item.extended || item.checklist ? (
          <div className="mt-3 space-y-2">
            {item.checklist?.map((step: any, j: number) => (
               <div key={j} className="flex items-center text-xs justify-between pb-2 border-b border-gray-100 last:border-0 last:pb-0">
                 <div className="flex items-center gap-2">
                   <div className="w-4 h-4 rounded-full border border-gray-400 bg-gray-50"></div>
                   <span className="text-gray-700 font-medium">{step.step || step.desc || step.title}</span>
                 </div>
                 <div className="flex flex-col items-end shrink-0 ml-2">
                   {step.deadline && <span className="text-gray-500">{step.deadline}</span>}
                   {step.owner && <span className="text-gray-400 text-[10px]">{step.owner}</span>}
                 </div>
               </div>
            ))}
          </div>
        ) : (
          <>
             <p className="text-xs text-gray-600 mb-2">负责人 {item.owner} · {item.timeline}</p>
             <p className="text-xs font-semibold text-green-600 bg-green-50 inline-block px-2 py-1 border border-green-200">
               {item.impact}
             </p>
          </>
        )}
      </div>
    ));
  };

  return (
    <div className="flex flex-col h-full w-full">
      <h3 className="text-2xl font-black mb-1">{title}</h3>
      {subtitle && <p className="text-gray-500 text-sm">{subtitle}</p>}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 mt-6 pr-2">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-red-600 text-white font-bold px-2 py-1 text-xs border border-[#0F0F0F] shadow-[2px_2px_0_#0F0F0F]">P0 止血</span>
          </div>
          {renderCards(data.p0, 'P0')}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-amber-500 text-white font-bold px-2 py-1 text-xs border border-[#0F0F0F] shadow-[2px_2px_0_#0F0F0F]">P1 增长</span>
          </div>
          {renderCards(data.p1, 'P1')}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-blue-600 text-white font-bold px-2 py-1 text-xs border border-[#0F0F0F] shadow-[2px_2px_0_#0F0F0F]">P2 优化</span>
          </div>
          {renderCards(data.p2, 'P2')}
        </div>
      </div>
    </div>
  );
};

export default StrategyBoardBlock;
