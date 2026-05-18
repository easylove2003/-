import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { ConfidenceBadge, processConfidenceTags } from '../components/ConfidenceBadge';
import { BarChart2, Loader2, AlertTriangle } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';

const RenderChart = ({ config }: { config: any }) => {
  if (!config || !config.data || !Array.isArray(config.data) || config.data.length === 0 || !Array.isArray(config.series)) return null;

  if (config.type === 'pie') {
    const dataKey = config.series[0]?.key || Object.keys(config.data[0])[1];
    const nameKey = config.xAxisKey;
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 w-full h-[360px] flex flex-col my-8 not-prose">
         <h3 className="text-lg font-bold text-gray-900 mb-4">{config.title || 'Chart'}</h3>
         <div className="flex-1 w-full relative">
           <ResponsiveContainer width="100%" height="100%">
             <PieChart>
               <Pie 
                  data={config.data} 
                  dataKey={dataKey} 
                  nameKey={nameKey} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={60} 
                  outerRadius={100} 
                  fill="#8884d8" 
                  paddingAngle={2}
               >
                 {config.data.map((entry: any, index: number) => (
                   <Cell key={`cell-${index}`} fill={entry.fill || config.series[0]?.color || '#3B82F6'} />
                 ))}
               </Pie>
               <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
               <Legend wrapperStyle={{ fontSize: '12px' }} />
             </PieChart>
           </ResponsiveContainer>
         </div>
      </div>
    );
  }

  const ChartComponent = config.type === 'area' ? AreaChart : config.type === 'bar' ? BarChart : LineChart;
  
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 w-full h-[360px] flex flex-col my-8 not-prose">
       <h3 className="text-lg font-bold text-gray-900 mb-4">{config.title || 'Chart'}</h3>
       <div className="flex-1 w-full relative">
         <ResponsiveContainer width="100%" height="100%">
           <ChartComponent data={config.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
             <XAxis dataKey={config.xAxisKey} axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#6B7280'}} />
             <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#6B7280'}} tickFormatter={(v: any) => !isNaN(v) && v >= 1000 ? `${(v/1000).toFixed(1)}k` : v} />
             <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
             <Legend wrapperStyle={{ fontSize: '12px' }} />
             {config.series.map((s: any, idx: number) => {
               if (config.type === 'area') {
                 return <Area key={idx} type="monotone" dataKey={s.key} name={s.name || s.key} stroke={s.color || '#3B82F6'} fill={s.color || '#3B82F6'} fillOpacity={0.2} strokeWidth={2} />
               } else if (config.type === 'bar') {
                 return <Bar key={idx} dataKey={s.key} name={s.name || s.key} fill={s.color || '#10B981'} radius={[4,4,0,0]} />
               } else {
                 return <Line key={idx} type="monotone" dataKey={s.key} name={s.name || s.key} stroke={s.color || '#F59E0B'} strokeWidth={3} dot={false} />
               }
             })}
           </ChartComponent>
         </ResponsiveContainer>
       </div>
    </div>
  );
};

export function SharedReportView() {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/report/get/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("报告不存在或已被删除");
        return res.json();
      })
      .then(data => {
        setReport(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const MarkdownComponents: Components = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      const isChart = match && match[1] === 'chart';
      if (!inline && isChart) {
         try {
           let jsonStr = String(children).trim();
           const startIdx = jsonStr.indexOf('{');
           const endIdx = jsonStr.lastIndexOf('}');
           if (startIdx !== -1 && endIdx !== -1) {
               jsonStr = jsonStr.substring(startIdx, endIdx + 1);
           }
           jsonStr = jsonStr.replace(/}\s*{/g, '},{')
                            .replace(/]\s*\[/g, '],[')
                            .replace(/,\s*}/g, '}')
                            .replace(/,\s*]/g, ']');
           const config = JSON.parse(jsonStr);
           return <RenderChart config={config} />;
         } catch (e) {
           return (
             <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-sm font-mono text-red-600 my-4 not-prose">
                [UI Engine Error] Chart Configuration Parsing Failed
             </div>
           );
         }
      }
      return <code className={className} {...props}>{children}</code>;
    },
    // @ts-ignore custom tag
    confidence: ({ level, basis, risk }: any) => {
      return <ConfidenceBadge level={level} basis={basis} risk={risk} />;
    }
  };

  if (loading) {
     return (
       <div className="min-h-screen bg-[#F5F4F0] flex items-center justify-center">
         <Loader2 className="w-10 h-10 text-[#FF3B00] animate-spin" />
       </div>
     );
  }

  if (error) {
     return (
       <div className="min-h-screen bg-[#F5F4F0] flex items-center justify-center">
         <div className="bg-red-50 text-red-800 p-8 rounded-2xl flex flex-col items-center gap-4 max-w-md text-center shadow-lg border border-red-100">
           <AlertTriangle className="w-12 h-12 text-red-500" />
           <h2 className="text-xl font-bold">无法访问报告</h2>
           <p>{error}</p>
         </div>
       </div>
     );
  }

  return (
    <div className="min-h-screen bg-[#F5F4F0]">
      {/* Top Banner indicating read-only */}
      <div className="bg-[#0F0F0F] text-[#F5F4F0] px-6 py-3 text-center text-sm font-medium tracking-wide sticky top-0 z-50">
         此报告由 Smart Report Engine 生成于 {new Date(report.createdAt).toLocaleString()}。当前为只读快照视图。
      </div>

      <div className="max-w-4xl mx-auto py-12 px-6">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
           <div className="bg-[#FF3B00] text-white px-8 py-6 flex items-center justify-between shadow-md">
             <div className="flex items-center gap-3">
               <BarChart2 className="w-8 h-8" />
               <div>
                 <h2 className="font-serif italic text-2xl tracking-wide">Enterprise BI Blueprint</h2>
               </div>
             </div>
           </div>
           
           <div className="p-8 lg:p-12 prose prose-slate prose-lg max-w-none 
              prose-headings:font-serif prose-headings:font-normal prose-headings:tracking-tight 
              prose-h1:text-3xl prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-2 prose-h2:border-b prose-h2:border-gray-100
              prose-h3:text-xl prose-h3:mt-8 
              prose-a:pointer-events-none prose-a:text-[#FF3B00] 
              prose-blockquote:border-l-4 prose-blockquote:border-[#FF3B00] prose-blockquote:bg-orange-50 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-xl prose-blockquote:font-medium prose-blockquote:italic
              prose-table:w-full prose-table:text-sm
              prose-th:bg-gray-50 prose-th:p-4 prose-th:text-left prose-th:font-semibold prose-th:uppercase prose-th:text-[10px] prose-th:tracking-wider prose-th:text-gray-500
              prose-td:p-4 prose-td:border-b prose-td:border-gray-100 prose-td:align-top
              prose-li:marker:text-[#FF3B00]
              prose-strong:font-semibold prose-strong:text-gray-900"
           >
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={MarkdownComponents}>
                 {processConfidenceTags(report.content.markdown)}
              </ReactMarkdown>
           </div>
        </div>
      </div>
    </div>
  );
}
