import React from 'react';
import { CanvasBlock } from '../../lib/canvas-engine/types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { motion } from 'motion/react';

interface BlockProps {
  block: CanvasBlock;
}

export const DataHealthBlock: React.FC<BlockProps> = ({ block }) => {
  const { data = {}, title, subtitle } = block;

  const radarData = [
    { subject: '完整性', A: data.completeness || 0, fullMark: 10 },
    { subject: '一致性', A: data.consistency || 0, fullMark: 10 },
    { subject: '准确性', A: data.accuracy || 0, fullMark: 10 },
    { subject: '唯一性', A: data.uniqueness || 0, fullMark: 10 },
    { subject: '时效性', A: data.timeliness || 0, fullMark: 10 },
  ];

  return (
    <div className="bg-[#1C1C1C] text-white flex flex-col h-full w-full p-4 shrink-0 rounded-sm">
       <div className="flex items-center gap-3 mb-1">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
          <h3 className="text-2xl font-black text-[#F5F4F0]">{title}</h3>
       </div>
       {subtitle && <p className="text-gray-400 text-sm mb-6">{subtitle}</p>}
       
       <div className="flex flex-1 gap-6">
          <div className="w-1/2 h-full min-h-[250px]">
             <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#444" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#A3A3A3', fontSize: 12 }} />
                  <Radar name="健康度" dataKey="A" stroke="#FF3B00" fill="#FF3B00" fillOpacity={0.4} />
                </RadarChart>
             </ResponsiveContainer>
          </div>
          
          <div className="w-1/2 flex flex-col justify-center space-y-4">
             {data.red_flags && data.red_flags.length > 0 && (
                <div className="bg-red-900/30 border border-red-800 p-4 rounded-md">
                   <h4 className="text-red-400 font-bold mb-2 text-sm flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                      异常红旗 (Red Flags)
                   </h4>
                   <ul className="list-disc pl-5 text-xs text-red-300 space-y-1">
                      {data.red_flags.map((flag: string, idx: number) => (
                         <li key={idx}>{flag}</li>
                      ))}
                   </ul>
                </div>
             )}
          </div>
       </div>
    </div>
  );
};

export default DataHealthBlock;
