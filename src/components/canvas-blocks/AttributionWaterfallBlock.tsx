import React from 'react';
import { CanvasBlock } from '../../lib/canvas-engine/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { interactionBus } from '../../lib/canvas-engine/interaction-bus';

interface BlockProps {
  block: CanvasBlock;
}

export const AttributionWaterfallBlock: React.FC<BlockProps> = ({ block }) => {
  const { data = {}, title, subtitle } = block;

  // Process data for waterfall chart
  const { baseline = 0, result = 0, contributors = [] } = data;
  
  let chartData: any[] = [];
  let currentValue = baseline;
  
  chartData.push({ name: 'Baseline', value: baseline, isTotal: true, color: '#333333' });
  
  if (contributors && Array.isArray(contributors)) {
    contributors.forEach((c: any) => {
        chartData.push({
            name: c.name,
            value: Math.abs(c.delta),
            start: c.delta < 0 ? currentValue + c.delta : currentValue,
            end: c.delta < 0 ? currentValue : currentValue + c.delta,
            delta: c.delta,
            color: c.color || (c.delta > 0 ? '#10B981' : '#EF4444')
        });
        currentValue += c.delta;
    });
  }
  
  chartData.push({ name: 'Result', value: result, isTotal: true, color: '#4F46E5' });

  // Add dummy array for BarChart to render floating bars
  const finalData = chartData.map(d => {
      if (d.isTotal) {
          return { name: d.name, base: 0, val: d.value, color: d.color, isTotal: true, original: d };
      }
      return {
          name: d.name,
          base: d.start,
          val: d.end - d.start,
          color: d.color,
          isTotal: false,
          original: d
      }
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const p = payload[0].payload.original;
      return (
        <div className="bg-white border-2 border-black shadow-[4px_4px_0_#0F0F0F] p-3 pointer-events-none">
          <p className="font-bold text-sm mb-1">{label}</p>
          <p className="text-gray-700 text-xs">
            {p.isTotal ? `Value: ${p.value}` : `Delta: ${p.delta > 0 ? '+' : ''}${p.delta}`}
          </p>
        </div>
      );
    }
    return null;
  };

  const handleBarClick = (data: any) => {
    if (data && data.original) {
      interactionBus.emit('interaction', {
        type: 'chart_point_click',
        blockId: block.id,
        dataPoint: data.original
      });
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
       <h3 className="text-2xl font-black mb-1">{title}</h3>
       {subtitle && <p className="text-gray-500 text-sm mb-6">{subtitle}</p>}
       
       <div className="flex-1 w-full min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={finalData}
              layout="horizontal"
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#666' }} />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} cursor={{fill: '#f5f5f5'}} />
              <Bar dataKey="base" stackId="a" fill="transparent" />
              <Bar dataKey="val" stackId="a" isAnimationActive={true} onClick={handleBarClick} className="cursor-pointer">
                 {finalData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} className="hover:opacity-80 transition-opacity" />
                  ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
       </div>
    </div>
  );
};

export default AttributionWaterfallBlock;
