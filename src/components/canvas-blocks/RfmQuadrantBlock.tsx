import React from 'react';
import { CanvasBlock } from '../../lib/canvas-engine/types';
import { motion } from 'motion/react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ZAxis, ReferenceLine } from 'recharts';

interface BlockProps {
  block: CanvasBlock;
}

export const RfmQuadrantBlock: React.FC<BlockProps> = ({ block }) => {
  const { data = {}, title, subtitle } = block;
  // data.nodes = [{ x: Recency, y: Frequency, z: Monetary, name: 'Segment Name', color: '#hex' }]
  const nodes = data.nodes || [];
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border-2 border-[#0F0F0F] p-3 shadow-[4px_4px_0_#0F0F0F]">
          <p className="font-bold mb-1 border-b border-gray-200 pb-1">{data.name}</p>
          <p className="text-xs text-gray-600">Recency: {data.x} days</p>
          <p className="text-xs text-gray-600">Frequency: {data.y} times</p>
          <p className="text-xs text-gray-600 font-bold text-green-600">Monetary: ¥{data.z}</p>
        </div>
      );
    }
    return null;
  };

  const xMid = data.xMid || 30; // Midpoint for Recency (e.g., 30 days)
  const yMid = data.yMid || 5;  // Midpoint for Frequency (e.g., 5 times)

  return (
    <div className="flex flex-col h-full w-full">
       <h3 className="text-2xl font-black mb-1">{title}</h3>
       {subtitle && <p className="text-gray-500 text-sm mb-6">{subtitle}</p>}
       
       <div className="flex-1 w-full min-h-[350px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
              <XAxis type="number" dataKey="x" name="Recency" tick={{fontSize: 12}} label={{ value: 'Recency (Days: Lower is better)', position: 'bottom', fontSize: 12 }} reversed={data.xReversed || false} />
              <YAxis type="number" dataKey="y" name="Frequency" tick={{fontSize: 12}} label={{ value: 'Frequency', angle: -90, position: 'insideLeft', fontSize: 12 }} />
              <ZAxis type="number" dataKey="z" range={[50, 400]} name="Monetary" />
              <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
              
              <ReferenceLine x={xMid} stroke="#0F0F0F" strokeWidth={2} strokeOpacity={0.5} />
              <ReferenceLine y={yMid} stroke="#0F0F0F" strokeWidth={2} strokeOpacity={0.5} />

              <Scatter name="Segments" data={nodes}>
                {nodes.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color || '#3B82F6'} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
       </div>
    </div>
  );
};

export default RfmQuadrantBlock;
