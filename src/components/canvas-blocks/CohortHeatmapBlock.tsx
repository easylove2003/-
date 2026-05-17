import React from 'react';
import { CanvasBlock } from '../../lib/canvas-engine/types';
import { motion } from 'motion/react';

interface BlockProps {
  block: CanvasBlock;
}

export const CohortHeatmapBlock: React.FC<BlockProps> = ({ block }) => {
  const { data = {}, title, subtitle } = block;
  const matrix = data.matrix || [];
  const yLabels = data.yLabels || [];
  const xLabels = data.xLabels || [];
  
  // Matrix is an array of arrays representing percentages 0-100

  const getColor = (val: number) => {
    if (val === null || val === undefined) return '#F3F4F6'; // Empty
    if (val >= 80) return '#1E3A8A';
    if (val >= 60) return '#2563EB';
    if (val >= 40) return '#60A5FA';
    if (val >= 20) return '#93C5FD';
    if (val > 0) return '#DBEAFE';
    return '#F3F4F6';
  };

  return (
    <div className="flex flex-col h-full w-full">
       <h3 className="text-2xl font-black mb-1">{title}</h3>
       {subtitle && <p className="text-gray-500 text-sm mb-6">{subtitle}</p>}
       
       <div className="flex-1 overflow-x-auto">
         <table className="w-full text-xs font-mono text-center border-collapse">
            <thead>
              <tr>
                <th className="p-2 border border-gray-200 bg-gray-50 text-gray-500 text-left min-w-[100px]">Cohort</th>
                {xLabels.map((lbl: string, i: number) => (
                  <th key={i} className="p-2 border border-gray-200 bg-gray-50 text-gray-500">{lbl}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.map((row: number[], i: number) => (
                <tr key={i}>
                  <td className="p-2 border border-gray-200 bg-gray-50 text-gray-700 font-bold text-left">{yLabels[i]}</td>
                  {row.map((val: number, j: number) => (
                    <td key={j} className="p-2 border border-gray-200 transition-colors" style={{ backgroundColor: getColor(val), color: val >= 40 ? 'white' : 'gray' }}>
                      {val !== null && val !== undefined ? `${val}%` : '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
         </table>
       </div>
    </div>
  );
};

export default CohortHeatmapBlock;
