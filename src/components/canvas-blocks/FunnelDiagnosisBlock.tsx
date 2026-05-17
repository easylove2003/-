import React from 'react';
import { CanvasBlock } from '../../lib/canvas-engine/types';
import { interactionBus } from '../../lib/canvas-engine/interaction-bus';

interface BlockProps {
  block: CanvasBlock;
}

export const FunnelDiagnosisBlock: React.FC<BlockProps> = ({ block }) => {
  const { data = {}, title, subtitle } = block;
  const stages = data.stages || [];
  
  if (stages.length === 0) return null;
  const maxVal = stages[0].value;

  const handleStageClick = (stage: any) => {
    interactionBus.emit('interaction', {
      type: 'block_question',
      blockId: block.id,
      question: `Why is the drop-off at stage "${stage.name}" at this rate? Can we diagnose the root cause?`
    });
  };

  return (
    <div className="flex flex-col h-full w-full">
       <h3 className="text-2xl font-black mb-1 text-gray-900">{title}</h3>
       {subtitle && <p className="text-gray-500 text-sm mb-6">{subtitle}</p>}
       
       <div className="flex-1 flex flex-col w-full justify-center px-4">
          {stages.map((stage: any, index: number) => {
             const pct = Math.max(10, (stage.value / maxVal) * 100);
             return (
               <div key={index} className="flex flex-col items-center mb-2">
                 <div className="w-full flex items-center justify-between text-xs font-bold text-gray-600 mb-1 px-8">
                    <span>{stage.name}</span>
                    <span>{stage.value.toLocaleString()}</span>
                 </div>
                 <div onClick={() => handleStageClick(stage)} className={`h-12 cursor-pointer hover:opacity-80 border-2 ${stage.is_critical ? 'border-red-500 bg-red-100' : 'border-[#0F0F0F] bg-blue-100'} shadow-[4px_4px_0_#0F0F0F] flex items-center justify-center relative transition-all duration-500`}
                      style={{ width: `${pct}%`, zIndex: 10 - index }}>
                      {stage.is_critical && (
                         <div className="absolute -left-6 top-1/2 -translate-y-1/2 text-red-500">
                             <svg className="w-5 h-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                         </div>
                      )}
                 </div>
                 {index < stages.length - 1 && (
                     <div className="text-[10px] text-gray-400 py-1 font-mono">
                        ↓ 流失 {stages[index+1].drop_pct}%
                     </div>
                 )}
               </div>
             )
          })}
       </div>
    </div>
  );
};

export default FunnelDiagnosisBlock;
