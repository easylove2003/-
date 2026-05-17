import React from 'react';
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, LabelList,
  LineChart, Line,
  PieChart, Pie, Cell,
  ComposedChart,
  AreaChart, Area
} from 'recharts';
import type { ChartConfig } from '../data/cases';

interface ChartRendererProps {
  chart: ChartConfig;
}

const COLORS = ['#1A1A1A', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444'];

export function ChartRenderer({ chart }: ChartRendererProps) {
  if (chart.chartType === 'grouped-bar') {
    const data = chart.dimensions?.map((dim, i) => ({
      name: dim,
      Before: chart.beforeData?.[i] || 0,
      After: chart.afterData?.[i] || 0,
      unit: chart.unit?.[i] || ''
    })) || [];

    return (
      <div className="w-full bg-white border border-[#E5E5E1] p-6 mb-8 shadow-sm">
        <h4 className="font-serif font-bold text-lg text-[#1A1A1A] border-b border-[#E5E5E1] pb-3 mb-6 flex items-center justify-between">
          <span>{chart.chartName}</span>
          <span className="text-[10px] font-sans font-normal uppercase tracking-widest text-[#4A4A4A] bg-[#F5F2F0] px-2 py-1">前后对比度量</span>
        </h4>
        <div className="h-72 sm:h-80 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 30, right: 30, left: 0, bottom: 5 }} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E1" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#1A1A1A', fontWeight: 'bold' }} axisLine={{ stroke: '#E5E5E1' }} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#4A4A4A' }} axisLine={false} tickLine={false} />
              <RechartsTooltip cursor={{ fill: '#F5F2F0' }} contentStyle={{ borderRadius: 0, border: '1px solid #1A1A1A', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: '20px' }} iconType="circle" />
              <Bar dataKey="Before" fill="#94a3b8" radius={[2, 2, 0, 0]} maxBarSize={50}>
                 <LabelList dataKey="Before" position="top" style={{ fontSize: '11px', fill: '#64748b', fontWeight: 'bold' }} formatter={(val: number) => `${val}${data[0].unit}`} />
              </Bar>
              <Bar dataKey="After" fill="#10b981" radius={[2, 2, 0, 0]} maxBarSize={50}>
                 <LabelList dataKey="After" position="top" style={{ fontSize: '11px', fill: '#059669', fontWeight: 'bold' }} formatter={(val: number) => `${val}${data[0].unit}`} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-6 bg-[#F5F2F0] p-4 border-l-4 border-[#10b981]">
           <p className="text-[#1A1A1A] text-sm leading-relaxed"><span className="font-bold">业务洞察：</span>{chart.chartDescription}</p>
        </div>
      </div>
    );
  }

  if (chart.chartType === 'dual-line' || chart.chartType === 'area') {
    const maxLen = Math.max(chart.beforeTrend?.length || 0, chart.afterTrend?.length || 0);
    const data = Array.from({ length: maxLen }).map((_, i) => {
      const isAfter = i >= (chart.afterTrend?.findIndex(v => v !== chart.beforeTrend?.[i]) || 0);
      return {
        step: i + 1,
        Baseline: chart.baselineTrend?.[i],
        Actual: chart.afterTrend?.[i],
      };
    });

    return (
      <div className="w-full bg-white border border-[#E5E5E1] p-6 mb-8 shadow-sm">
        <h4 className="font-serif font-bold text-lg text-[#1A1A1A] border-b border-[#E5E5E1] pb-3 mb-6 flex items-center justify-between">
          <span>{chart.chartName}</span>
          <span className="text-[10px] font-sans font-normal uppercase tracking-widest text-[#4A4A4A] bg-[#F5F2F0] px-2 py-1">时序趋势追踪</span>
        </h4>
        <div className="h-72 sm:h-80 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 30, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E1" />
              <XAxis dataKey="step" tick={{ fontSize: 12, fill: '#4A4A4A' }} axisLine={{ stroke: '#E5E5E1' }} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#4A4A4A' }} axisLine={false} tickLine={false} />
              <RechartsTooltip contentStyle={{ borderRadius: 0, border: '1px solid #1A1A1A', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: '20px' }} iconType="plainline" />
              <Line type="monotone" name="基准线 (Before/预期)" dataKey="Baseline" stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={2} dot={false} />
              <Line type="monotone" name="实际发生 (After/演变)" dataKey="Actual" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-6 bg-[#F5F2F0] p-4 border-l-4 border-[#10b981]">
           <p className="text-[#1A1A1A] text-sm leading-relaxed"><span className="font-bold">业务洞察：</span>{chart.chartDescription}</p>
        </div>
      </div>
    );
  }

  if (chart.chartType === 'dual-pie') {
    const dataBefore = chart.categories?.map((cat, i) => ({ name: cat, value: chart.beforeDistribution?.[i] || 0 })) || [];
    const dataAfter = chart.categories?.map((cat, i) => ({ name: cat, value: chart.afterDistribution?.[i] || 0 })) || [];

    return (
      <div className="w-full bg-white border border-[#E5E5E1] p-6 mb-8 shadow-sm">
        <h4 className="font-serif font-bold text-lg text-[#1A1A1A] border-b border-[#E5E5E1] pb-3 mb-6 flex items-center justify-between">
          <span>{chart.chartName}</span>
          <span className="text-[10px] font-sans font-normal uppercase tracking-widest text-[#4A4A4A] bg-[#F5F2F0] px-2 py-1">构成比例变迁</span>
        </h4>
        <div className="flex flex-col md:flex-row h-auto md:h-80 justify-around items-center gap-8 md:gap-4 mt-6">
          <div className="w-full md:w-1/2 h-64 md:h-full relative border border-[#E5E5E1] bg-[#F9F9F9] p-4">
            <span className="absolute top-4 left-4 font-bold text-xs uppercase tracking-widest bg-[#64748b] text-white px-3 py-1 z-10 shadow-sm">实施前 (Before)</span>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={dataBefore} cx="50%" cy="50%" innerRadius={50} outerRadius={85} dataKey="value" stroke="#fff" strokeWidth={2} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={true}>
                  {dataBefore.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} opacity={0.6} />)}
                </Pie>
                <RechartsTooltip contentStyle={{ borderRadius: 0, border: '1px solid #1A1A1A', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="hidden md:flex items-center justify-center text-4xl text-[#1A1A1A]">→</div>
          <div className="w-full md:w-1/2 h-64 md:h-full relative border border-[#1A1A1A] bg-white p-4 shadow-[4px_4px_0_#1A1A1A]">
            <span className="absolute top-4 left-4 font-bold text-xs uppercase tracking-widest bg-[#10b981] text-white px-3 py-1 z-10 shadow-sm">实施后 (After)</span>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={dataAfter} cx="50%" cy="50%" innerRadius={50} outerRadius={85} dataKey="value" stroke="#fff" strokeWidth={2} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={true}>
                  {dataAfter.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <RechartsTooltip contentStyle={{ borderRadius: 0, border: '1px solid #1A1A1A', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="mt-8 bg-[#F5F2F0] p-4 border-l-4 border-[#10b981]">
           <p className="text-[#1A1A1A] text-sm leading-relaxed"><span className="font-bold">业务洞察：</span>{chart.chartDescription}</p>
        </div>
      </div>
    );
  }

  if (chart.chartType === 'waterfall') {
    let runningTotal = chart.baseValue || 0;
    const waterfallData = [{
      name: '实施前',
      start: 0,
      value: runningTotal,
      fill: '#64748b',
      label: `基准: ${runningTotal}`
    }];
    
    chart.components?.forEach(comp => {
      const isPositive = comp.type === 'positive' || comp.value > 0;
      const val = Math.abs(comp.value);
      waterfallData.push({
        name: comp.name,
        start: isPositive ? runningTotal : runningTotal - val,
        value: val,
        fill: isPositive ? '#10b981' : '#ef4444',
        label: `${isPositive ? '+' : '-'}${val}`
      });
      runningTotal += isPositive ? val : -val;
    });

    waterfallData.push({
      name: '实施后',
      start: 0,
      value: chart.finalValue || runningTotal,
      fill: '#1A1A1A',
      label: `最终: ${chart.finalValue || runningTotal}`
    });

    return (
      <div className="w-full bg-white border border-[#E5E5E1] p-6 mb-8 shadow-sm">
        <h4 className="font-serif font-bold text-lg text-[#1A1A1A] border-b border-[#E5E5E1] pb-3 mb-6 flex items-center justify-between">
          <span>{chart.chartName}</span>
          <span className="text-[10px] font-sans font-normal uppercase tracking-widest text-[#4A4A4A] bg-[#F5F2F0] px-2 py-1">指标增量归因</span>
        </h4>
        <div className="h-72 sm:h-96 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={waterfallData} margin={{ top: 30, right: 30, left: 20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E1" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#1A1A1A', fontWeight: 'bold' }} axisLine={{ stroke: '#E5E5E1' }} tickLine={false} interval={0} angle={-25} textAnchor="end" />
              <YAxis tick={{ fontSize: 12, fill: '#4A4A4A' }} axisLine={false} tickLine={false} domain={[0, 'auto']} />
              <RechartsTooltip contentStyle={{ borderRadius: 0, border: '1px solid #1A1A1A', fontSize: 12 }} />
              <Bar dataKey="start" stackId="a" fill="transparent" isAnimationActive={false} />
              <Bar dataKey="value" stackId="a" isAnimationActive={true} maxBarSize={60}>
                {waterfallData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
                <LabelList dataKey="label" position="top" style={{ fontSize: '11px', fill: '#1A1A1A', fontWeight: 'bold' }} />
              </Bar>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-8 bg-[#F5F2F0] p-4 border-l-4 border-[#10b981]">
           <p className="text-[#1A1A1A] text-sm leading-relaxed"><span className="font-bold">业务洞察：</span>{chart.chartDescription}</p>
        </div>
      </div>
    );
  }

  return null;
}

