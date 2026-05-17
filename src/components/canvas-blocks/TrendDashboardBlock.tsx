import React from 'react';
import { CanvasBlock } from '../../lib/canvas-engine/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { interactionBus } from '../../lib/canvas-engine/interaction-bus';

interface BlockProps {
  block: CanvasBlock;
}

export const TrendDashboardBlock: React.FC<BlockProps> = ({ block }) => {
  const { data = {}, title, subtitle } = block;
  const chartData = data.chartData || [];
  const lines = data.lines || []; // { key: string, name: string, color: string }
  const tableData = data.tableData || [];

  const handleLineClick = (data: any) => {
     if (data && data.activePayload) {
        interactionBus.emit('interaction', {
           type: 'chart_point_click',
           blockId: block.id,
           dataPoint: data.activePayload[0].payload
        });
     }
  };

  return (
    <div className="flex flex-col h-full w-full">
       <h3 className="text-2xl font-black mb-1">{title}</h3>
       {subtitle && <p className="text-gray-500 text-sm mb-6">{subtitle}</p>}
       
       <div className="flex-1 min-h-[250px] mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }} onClick={handleLineClick}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey={data.xAxisKey || "date"} tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={{ stroke: '#D1D5DB' }} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={{ stroke: '#D1D5DB' }} tickLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '0.5rem', border: '2px solid #0F0F0F', boxShadow: '4px 4px 0 #0F0F0F' }}
                itemStyle={{ fontSize: '0.875rem', fontWeight: 600 }}
                labelStyle={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.25rem' }}
              />
              <Legend wrapperStyle={{ fontSize: '0.75rem', paddingTop: '10px' }} iconType="circle" />
              {lines.map((line: any, i: number) => (
                 <Line key={i} type="monotone" dataKey={line.key} name={line.name} stroke={line.color || '#3B82F6'} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6, cursor: 'pointer' }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
       </div>

       {tableData.length > 0 && (
         <div className="overflow-x-auto border-t-2 border-[#0F0F0F] pt-4">
           <table className="w-full text-sm text-left">
             <thead className="bg-[#FAF9F6] text-[#0F0F0F] text-xs uppercase font-black tracking-wider border-b-2 border-[#0F0F0F]">
               <tr>
                 {Object.keys(tableData[0]).map((key) => (
                   <th key={key} className="px-4 py-3">{key}</th>
                 ))}
               </tr>
             </thead>
             <tbody>
               {tableData.map((row: any, i: number) => (
                 <tr key={i} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                   {Object.values(row).map((val: any, j: number) => (
                     <td key={j} className="px-4 py-3 font-medium text-gray-700">{val}</td>
                   ))}
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
       )}
    </div>
  );
};

export default TrendDashboardBlock;
