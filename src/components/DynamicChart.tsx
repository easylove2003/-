import React from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, ScatterChart, Scatter, 
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

export interface ChartConfig {
  chartType: "bar" | "line" | "pie" | "scatter" | "funnel";
  title: string;
  xKey: string;
  yKey: string;
  data: any[];
  insight?: string;
}

interface DynamicChartProps {
  config: ChartConfig;
  onDrilldown?: (query: string) => void;
}

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

export function DynamicChart({ config, onDrilldown }: DynamicChartProps) {
  const { chartType, title, xKey, yKey, data, insight } = config;

  const handleClick = (dataPoint: any) => {
    if (onDrilldown && dataPoint && dataPoint[xKey]) {
      onDrilldown(`为什么 ${dataPoint[xKey]} 的 ${yKey} 是 ${dataPoint[yKey]}？分析其深层原因。`);
    }
  };

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis type="number" />
              <YAxis dataKey={xKey} type="category" width={100} tick={{fontSize: 12}} />
              <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
              <Legend />
              <Bar dataKey={yKey} fill="#4F46E5" radius={[0, 4, 4, 0]} onClick={handleClick} className="cursor-pointer">
                {data.map((entry, index) => (
                  <Cell key={`cell-\${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey={xKey} tick={{fontSize: 12}} />
              <YAxis />
              <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey={yKey} 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{r: 4, fill: '#10B981', strokeWidth: 2}}
                activeDot={{r: 8, onClick: handleClick, className: 'cursor-pointer'}} 
              />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'pie':
        // Handle > 6 categories
        let pieData = [...data];
        if (pieData.length > 6) {
           pieData.sort((a,b) => b[yKey] - a[yKey]);
           const top5 = pieData.slice(0, 5);
           const others = pieData.slice(5).reduce((acc, curr) => acc + (curr[yKey] || 0), 0);
           pieData = [...top5, { [xKey]: 'Others', [yKey]: others }];
        }
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey={yKey}
                nameKey={xKey}
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }) => `\${name} (\${(percent * 100).toFixed(0)}%)`}
                onClick={handleClick}
                className="cursor-pointer"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-\${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey={xKey} name={xKey} tick={{fontSize: 12}} />
              <YAxis type="number" dataKey={yKey} name={yKey} tick={{fontSize: 12}} />
              <RechartsTooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
              <Legend />
              <Scatter name={title} data={data} fill="#8B5CF6" onClick={handleClick} className="cursor-pointer" />
            </ScatterChart>
          </ResponsiveContainer>
        );
      case 'funnel':
        // Recharts has FunnelChart
        // We need to import FunnelChart, Funnel, LabelList at the top
        // FunnelChart works with data containing value and name
        // we'll map xKey to name and yKey to value just in case
        return (
          <ResponsiveContainer width="100%" height="100%">
             {/* Using Bar as fallback if recharts version doesn't export Funnel correctly, 
                 but recharts >= 2.x supports FunnelChart. let's assume it works.
                 If it fails to compile, we can use BarChart to simulate funnel or just use Recharts FunnelChart */}
                 <BarChart data={data} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                   <XAxis type="number" hide />
                   <YAxis dataKey={xKey} type="category" width={100} tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                   <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                   <Bar dataKey={yKey} fill="#F59E0B" barSize={30} onClick={handleClick} className="cursor-pointer">
                     {data.map((entry, index) => (
                        <Cell key={`cell-\${index}`} fill={COLORS[index % COLORS.length]} />
                     ))}
                   </Bar>
                 </BarChart>
          </ResponsiveContainer>
        );
      default:
        return <div className="text-gray-400 flex items-center justify-center h-full">Unsupported Chart Type</div>;
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      <h4 className="text-lg font-bold text-gray-800 mb-1">{title}</h4>
      {insight && <p className="text-sm text-gray-500 mb-4">{insight}</p>}
      <div className="flex-1 min-h-[250px] w-full relative">
        {renderChart()}
      </div>
    </div>
  );
}
