// Smart Report Generation Module
import React, { useState, useRef, useCallback } from 'react';
import { Upload, Database, LayoutTemplate, AlertTriangle, FileText, Download, Loader2, PlayCircle, BarChart2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../lib/LanguageContext';
import Papa from 'papaparse';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { ConfidenceBadge, processConfidenceTags, countLowConfidence } from '../components/ConfidenceBadge';
import { calculateQualityScore, QualityResult } from '../lib/qualityScore';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell,
  Scatter, ScatterChart, ZAxis
} from 'recharts';
import { eCommerceSampleData } from '../data/ecommerce_sample';
import { fetchChatStream } from '../lib/api';
import { exportToPDF, exportToPPT, shareReport } from '../lib/exportUtils';
import { Share2, Presentation } from 'lucide-react';
import { buildSystemPrompt } from '../prompts';

const RenderChart = ({ config }: { config: any }) => {
  if (!config || !Array.isArray(config.data) || config.data.length === 0 || !Array.isArray(config.series)) {
    return null;
  }

  const wrap = (children: React.ReactNode) => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 w-full h-[360px] flex flex-col my-8 not-prose">
      <h3 className="text-lg font-bold text-gray-900 mb-4">{config.title || 'Chart'}</h3>
      <div className="flex-1 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          {children as any}
        </ResponsiveContainer>
      </div>
    </div>
  );

  // ── pie ──────────────────────────────────────────────
  if (config.type === 'pie') {
    const dataKey = config.series[0]?.key || Object.keys(config.data[0])[1];
    const nameKey = config.xAxisKey;
    return wrap(
      <PieChart>
        <Pie data={config.data} dataKey={dataKey} nameKey={nameKey}
             cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2}>
          {config.data.map((entry: any, i: number) => (
            <Cell key={i} fill={entry.fill || config.series[0]?.color || '#3B82F6'} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
        <Legend wrapperStyle={{ fontSize: '12px' }} />
      </PieChart>
    );
  }

  // ── waterfall ────────────────────────────────────────
  // 第一项与最后一项是绝对值（起点/终点），中间项是带符号 delta。
  // 用堆叠条实现：base 透明、value 着色。正值绿、负值红、起终点蓝。
  if (config.type === 'waterfall') {
    const key = config.series[0]?.key || 'value';
    let cumulative = 0;
    const last = config.data.length - 1;
    const transformed = config.data.map((row: any, i: number) => {
      const raw = Number(row[key]) || 0;
      const isAnchor = i === 0 || i === last;
      let base = 0, value = 0, color = '#3B82F6';
      if (isAnchor) {
        value = raw;
        base = 0;
        cumulative = raw;
        color = '#3B82F6';
      } else if (raw >= 0) {
        base = cumulative;
        value = raw;
        cumulative += raw;
        color = '#10B981';
      } else {
        cumulative += raw;          // raw is negative
        base = cumulative;
        value = -raw;
        color = '#EF4444';
      }
      return { ...row, __base: base, __value: value, __color: color };
    });

    return wrap(
      <BarChart data={transformed} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
        <XAxis dataKey={config.xAxisKey} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
        <Tooltip
          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          formatter={(_v: any, _n: any, p: any) => [p?.payload?.[key], key]}
        />
        <Bar dataKey="__base" stackId="wf" fill="transparent" />
        <Bar dataKey="__value" stackId="wf" radius={[4, 4, 0, 0]}>
          {transformed.map((row: any, i: number) => <Cell key={i} fill={row.__color} />)}
        </Bar>
      </BarChart>
    );
  }

  // ── funnel ───────────────────────────────────────────
  // 用水平条形图 + 降序排序，模拟漏斗。
  if (config.type === 'funnel') {
    const key = config.series[0]?.key || 'value';
    const sorted = [...config.data].sort((a, b) => (Number(b[key]) || 0) - (Number(a[key]) || 0));
    return wrap(
      <BarChart data={sorted} layout="vertical" margin={{ top: 10, right: 30, left: 60, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
        <YAxis type="category" dataKey={config.xAxisKey} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} width={100} />
        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
        <Bar dataKey={key} name={config.series[0]?.name || key} fill={config.series[0]?.color || '#6366F1'} radius={[0, 4, 4, 0]} />
      </BarChart>
    );
  }

  // ── scatter ──────────────────────────────────────────
  // 每个 series 需要 xKey / yKey；可选 zKey 控制点大小
  if (config.type === 'scatter') {
    return wrap(
      <ScatterChart margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis type="number" dataKey={config.series[0]?.xKey || 'x'} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
        <YAxis type="number" dataKey={config.series[0]?.yKey || 'y'} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
        <ZAxis type="number" range={[60, 200]} />
        <Tooltip cursor={{ strokeDasharray: '3 3' }}
                 contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
        <Legend wrapperStyle={{ fontSize: '12px' }} />
        {config.series.map((s: any, idx: number) => (
          <Scatter
            key={idx}
            name={s.name || s.yKey || `Series ${idx + 1}`}
            data={config.data}
            fill={s.color || '#3B82F6'}
          />
        ))}
      </ScatterChart>
    );
  }

  // ── area / bar / line ────────────────────────────────
  const knownTypes = new Set(['area', 'bar', 'line']);
  if (!knownTypes.has(config.type)) {
    return (
      <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-sm text-amber-800 my-4 not-prose">
        [Chart Engine] 不支持的图表类型 "<code className="font-mono">{config.type}</code>"。
        当前支持：area / bar / line / pie / waterfall / funnel / scatter。
      </div>
    );
  }
  const ChartComponent = config.type === 'area' ? AreaChart : config.type === 'bar' ? BarChart : LineChart;

  return wrap(
    <ChartComponent data={config.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
      <XAxis dataKey={config.xAxisKey} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }}
             tickFormatter={(v: any) => !isNaN(v) && v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v} />
      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
      <Legend wrapperStyle={{ fontSize: '12px' }} />
      {config.series.map((s: any, idx: number) => {
        if (config.type === 'area') {
          return <Area key={idx} type="monotone" dataKey={s.key} name={s.name || s.key}
                       stroke={s.color || '#3B82F6'} fill={s.color || '#3B82F6'} fillOpacity={0.2} strokeWidth={2} />;
        }
        if (config.type === 'bar') {
          return <Bar key={idx} dataKey={s.key} name={s.name || s.key}
                      fill={s.color || '#10B981'} radius={[4, 4, 0, 0]} />;
        }
        return <Line key={idx} type="monotone" dataKey={s.key} name={s.name || s.key}
                     stroke={s.color || '#F59E0B'} strokeWidth={3} dot={false} />;
      })}
    </ChartComponent>
  );
};

export function SmartReport() {
  const { t, lang } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reportMarkdown, setReportMarkdown] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [confirmExport, setConfirmExport] = useState(false);

  const extractMetadata = (parsedData: any[], meta: any) => {
    if (!parsedData || parsedData.length === 0) return null;

    const rowCount = parsedData.length;
    const columns = meta.fields || Object.keys(parsedData[0]);
    
    const fieldStats = columns.map(col => {
      let nullCount = 0;
      let types = new Set();
      let uniqueValues = new Set();
      
      parsedData.forEach(row => {
        const val = row[col];
        if (val === null || val === undefined || val === '') {
          nullCount++;
        } else {
          uniqueValues.add(val);
          // Try to guess type
          if (!isNaN(Number(val))) types.add('number');
          else if (!isNaN(Date.parse(val))) types.add('date');
          else types.add('string');
        }
      });

      const typeArray = Array.from(types);
      const primaryType = typeArray.length === 1 ? typeArray[0] : (typeArray.includes('string') ? 'string' : 'mixed');

      // Samples
      const samples = parsedData
        .map(row => row[col])
        .filter(v => v !== null && v !== undefined && v !== '')
        .slice(0, 5);

      return {
        field: col,
        type: primaryType as string,
        nullRate: ((nullCount / rowCount) * 100).toFixed(2) + '%',
        uniqueCount: uniqueValues.size,
        samples: samples
      };
    });

    const sampleRows = parsedData.slice(0, 10);

    return {
      fileName: uploadedFileName,
      rowCount,
      columns: fieldStats,
      sampleRows,
      fullData: parsedData
    };
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    const isCsvOrTxt = file.name.endsWith('.csv') || file.name.endsWith('.txt');
    if (!isCsvOrTxt) {
      alert(t("Please upload a .csv or .txt file", "请上传 .csv 或 .txt 格式的文件"));
      return;
    }
    
    setUploadedFileName(file.name);
    setReportMarkdown('');
    setError(null);
    setIsAnalyzing(true);

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          if (!results.data || results.data.length === 0) {
              throw new Error(t("File parsed empty or format incorrect.", "文件解析为空或格式不正确。空文件无法分析。"));
          }
          const metadata = extractMetadata(results.data, results.meta);
          await generateReport(metadata, results.data);
        } catch (e: any) {
           setError(e.message);
           setIsAnalyzing(false);
        }
      },
      error: (error) => {
        console.error("Parse Error:", error);
        setError(t("Error parsing CSV file", "解析 CSV 文件发生错误"));
        setIsAnalyzing(false);
      }
    });
  };

  const generateReport = async (metadata: any, rawData: any[]) => {
    setIsAnalyzing(true);
    setReportMarkdown('');
    setError(null);

    const apiKey = localStorage.getItem('gemini_api_key') || '';
    const requestHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
    if (apiKey) {
      requestHeaders['Authorization'] = `Bearer ${apiKey}`;
    }

    const qs = calculateQualityScore(rawData);

    const sysPrompt = buildSystemPrompt('analysis') + `\n\n你也是一个企业级智能 BI 报表与看板生成引擎。用户会上传 Excel 或 CSV 数据，系统会提供字段名、字段类型、样例值、空值率、唯一值数量、数值分布和时间范围。你需要基于这些真实数据，自动识别业务场景、数据粒度、字段角色、核心指标、看板结构、图表配置、业务洞察和一句话策略。

CRITICAL: You MUST respond strictly in ${lang === 'en' ? 'English' : 'Chinese'}.

请严格遵守以下规则：

1. 只能使用上传数据中真实存在的字段，严禁编造字段。
2. 如果某个指标缺少必要字段，必须说明无法计算原因，并给出替代指标。
3. 指标不能只是简单 SUM/AVG，必须贴近业务场景，覆盖规模、效率、质量、结构四类。
4. 看板必须按照“概览、趋势、对比、结构、异常、明细、策略”的逻辑生成。
5. 每个图表必须说明图表类型、使用字段、X轴、Y轴、聚合方式、筛选字段、排序方式、联动方式和业务目的。
6. [非常重要 - 动态图表能力]：为了让报告更直观，请你在报告的相应部分，直接插入一个 \`\`\`chart 的代码块，我们在前端将会利用 react-markdown 拦截并渲染为酷炫的高级图表面板！
代码块内必须是一个纯JSON对象，支持的 type 与对应数据格式如下：

【area / bar / line】
\`\`\`chart
{
  "title": "月度销售趋势",
  "type": "area",
  "xAxisKey": "name",
  "series": [{ "key": "value1", "name": "GMV", "color": "#3B82F6" }],
  "data": [{ "name": "1月", "value1": 150 }, { "name": "2月", "value1": 200 }]
}
\`\`\`

【pie】series 仅一项，data 中可加 fill 指定每扇区颜色。

【waterfall（瀑布图）】data 第一项与最后一项视为绝对值（起点/终点），中间项为带符号 delta（正负皆可）：
\`\`\`chart
{
  "title": "ROI 异动归因",
  "type": "waterfall",
  "xAxisKey": "name",
  "series": [{ "key": "value", "name": "贡献" }],
  "data": [
    { "name": "上周 ROI", "value": 1.5 },
    { "name": "抖音拉新", "value": -0.6 },
    { "name": "视频号", "value": 0.1 },
    { "name": "本周 ROI", "value": 1.0 }
  ]
}
\`\`\`

【funnel（漏斗）】组件自动按 value 降序：
\`\`\`chart
{
  "title": "转化漏斗",
  "type": "funnel",
  "xAxisKey": "name",
  "series": [{ "key": "value", "name": "用户数", "color": "#6366F1" }],
  "data": [
    { "name": "曝光", "value": 100000 },
    { "name": "点击", "value": 35000 },
    { "name": "加购", "value": 8000 },
    { "name": "下单", "value": 1800 }
  ]
}
\`\`\`

【scatter（散点图）】series 必须显式声明 xKey / yKey：
\`\`\`chart
{
  "title": "RFM 分布",
  "type": "scatter",
  "series": [{ "name": "高价值", "xKey": "frequency", "yKey": "monetary", "color": "#F59E0B" }],
  "data": [
    { "frequency": 5, "monetary": 1200 },
    { "frequency": 8, "monetary": 2400 }
  ]
}
\`\`\`

每个图表生成 5~15 个数据点，颜色使用商业报表色（#3B82F6, #10B981, #F59E0B, #6366F1, #EF4444）。

[第二层：置信度自我评估指令]
在每条分析结论（包含洞察、业务场景判断、趋势分析）末尾，必须追加置信度评估，格式如下：
<confidence level="HIGH" basis="样本充足无偏" risk="低">置信度评估</confidence>
必须用 <confidence> XML HTML 标签，里面可以不写，也可以写。前端组件会自动捕获并渲染。
由于你受到指令只能生成纯正的业务洞察，请主动暴露不确定性。

我们在前端系统已算出本数据集的综合质量评分：${Math.round(qs.overall)}/100，存在以下问题：${qs.lowConfidenceReasons.join(', ') || '无明显问题'}。请在输出 LOW 或 MEDIUM 信心时结合这些先验信息。

请按照以下结构严格使用 Markdown 格式输出：

# 智能 BI 报表与看板生成结果

## 1. 数据资产识别
...

## 2. 业务场景判断
...

## 3. 数据质量评估
...

## 4. 字段语义模型
| 字段名 | 物理类型 | 逻辑角色 | 业务含义 | 基数特征 | 空值风险 | 推荐用途 |
|---|---|---|---|---|---|---|
...

## 5. 核心指标体系
| 指标层级 | 指标名称 | 业务定义 | 计算公式 | 依赖字段 | 是否可计算 | 替代方案 | 推荐图表 | 业务价值 |
|---|---|---|---|---|---|---|---|---|
...

## 6. 看板布局与图表
...

## 7. 关键业务洞察与策略 (使用 ICE 评分)
...`;

    const userPrompt = `已上传文件元数据特征如下：

1. 文件名称: ${metadata.fileName}
2. 数据总行数: ${metadata.rowCount}

3. 字段特征详情:
${JSON.stringify(metadata.columns, null, 2)}

4. 前10行数据样本:
${JSON.stringify(metadata.sampleRows, null, 2)}

请根据上述要求和提供的数据特征，执行深度的业务分析并生成完整的智能 BI 报表方案。`;

    try {
      await fetchChatStream(
        [{ role: 'user', parts: [{ text: userPrompt }] }],
        sysPrompt,
        (chunk) => {
           setReportMarkdown(prev => prev + chunk);
        },
        (errMsg) => {
           setError(errMsg);
        }
      );
    } catch (e: any) {
      setError(e.message || "Failed to generate report.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const MarkdownComponents: Components = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      const isChart = match && match[1] === 'chart';
      if (!inline && isChart) {
         try {
           const jsonStr = String(children).trim();
           const config = JSON.parse(jsonStr);
           return <RenderChart config={config} />;
         } catch (e) {
           return (
             <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-sm font-mono text-red-600 my-4 not-prose">
                [UI Engine Error] Chart Configuration Parsing Failed: Invalid JSON or data structure.
                <pre className="mt-2 text-[10px] overflow-auto max-h-[100px] bg-red-100 p-2">{String(children)}</pre>
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

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F4F0] pt-24 pb-20 px-6 lg:px-12">
      <div className="max-w-6xl mx-auto space-y-12">

        {/* Header */}
        <header className="flex flex-col gap-6 w-full max-w-4xl pt-8">
           <div className="flex items-center gap-3">
             <span className="w-10 h-10 bg-[#FF3B00] rounded-xl flex items-center justify-center shrink-0">
               <LayoutTemplate className="w-5 h-5 text-white" />
             </span>
             <h1 className="text-4xl lg:text-5xl font-serif text-[#0F0F0F] italic tracking-tight">Smart Report Generator</h1>
           </div>
           <p className="text-lg text-gray-600 leading-relaxed font-medium">
             Upload your dataset. Our enterprise-grade engine automatically infers business intent, calculates data quality, builds semantic models, and designs a comprehensive reporting dashboard complete with actionable business strategy.
           </p>
        </header>

        {/* Upload Zone */}
        {!reportMarkdown && !isAnalyzing && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full flex flex-col items-center"
          >
             <div 
               onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
               onDragLeave={() => setIsDragging(false)}
               onDrop={handleDrop}
               onClick={() => fileInputRef.current?.click()}
               className={`w-full max-w-2xl border-2 border-dashed bg-white rounded-3xl p-12 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer min-h-[320px] group relative overflow-hidden ${isDragging ? 'border-[#FF3B00] bg-orange-50' : 'border-gray-300 hover:border-[#FF3B00] hover:shadow-lg'}`}
             >
                <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                   <Upload className={`w-8 h-8 ${isDragging ? 'text-[#FF3B00]' : 'text-gray-400 group-hover:text-[#FF3B00]'}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 font-serif italic">Drop your CSV here</h3>
                <p className="text-sm text-gray-500 max-w-[260px] text-center font-medium">Auto-structure, detect anomalies, & build dashboards.</p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={(e) => e.target.files?.length && handleFileUpload(e.target.files[0])}
                  className="hidden" 
                  accept=".csv,.txt"
                />
             </div>

             <div className="flex gap-4 w-full max-w-2xl mt-6">
                <button 
                  onClick={() => {
                    const file = new File([eCommerceSampleData], 'ecommerce_q1_sales.csv', { type: 'text/csv' });
                    handleFileUpload(file);
                  }}
                  className="flex-1 bg-white border border-gray-200 text-gray-700 py-4 px-6 rounded-2xl hover:border-[#FF3B00] hover:text-[#FF3B00] transition-colors font-medium text-sm flex items-center justify-center gap-2 group shadow-sm"
                >
                   <PlayCircle className="w-5 h-5 group-hover:scale-110 transition-transform" /> Try E-Commerce Demo Dataset
                </button>
             </div>
          </motion.div>
        )}

        {/* Loading / Generating State */}
        {isAnalyzing && (
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             className="bg-white rounded-3xl border border-gray-100 shadow-sm p-16 flex flex-col items-center justify-center min-h-[50vh]"
           >
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-8 relative">
                 <Loader2 className="w-10 h-10 text-[#FF3B00] animate-spin absolute" />
                 <Database className="w-5 h-5 text-gray-400" />
              </div>
              <h3 className="text-2xl font-serif italic text-gray-900 mb-4 animate-pulse">Architecting BI Dashboard...</h3>
              <ul className="space-y-4 text-sm font-mono text-gray-500 flex flex-col items-center opacity-80">
                <li className="flex items-center gap-2"><span>[1/6]</span> Profiling Dataset Schema...</li>
                <li className="flex items-center gap-2"><span>[2/6]</span> Identifying Semantic Scenarios...</li>
                <li className="flex items-center gap-2"><span>[3/6]</span> Constructing MECE KPI Trees...</li>
                <li className="flex items-center gap-2 text-[#FF3B00] animate-pulse">Running Deep Analytics Engine...</li>
              </ul>
           </motion.div>
        )}

        {/* Error State */}
        {error && (
           <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-2xl shadow-sm flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 shrink-0 text-red-600" />
              <div>
                 <h4 className="font-bold mb-1">Analysis Failed</h4>
                 <p className="text-sm opacity-90">{error}</p>
                 <button onClick={() => { setError(null); setIsAnalyzing(false); setReportMarkdown(''); }} className="mt-4 text-xs font-bold uppercase tracking-widest bg-red-800 text-white px-4 py-2 rounded hover:bg-black transition-colors">
                   Try Again
                 </button>
              </div>
           </div>
        )}

        {/* Results */}
        {reportMarkdown && !isAnalyzing && (
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="grid grid-cols-1 xl:grid-cols-12 gap-8"
           >
              <div id="report-content-panel" className="xl:col-span-9 bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
                 <div className="bg-[#0F0F0F] text-[#F5F4F0] px-8 py-6 flex items-center justify-between sticky top-0 z-10 shadow-md">
                   <div className="flex items-center gap-3">
                     <BarChart2 className="w-6 h-6 text-[#FF3B00]" />
                     <div>
                       <h2 className="font-serif italic text-xl tracking-wide">Enterprise BI Blueprint</h2>
                       <p className="font-mono text-[10px] text-gray-400 mt-1 uppercase tracking-widest">Dataset: {uploadedFileName}</p>
                     </div>
                   </div>
                 </div>
                 
                 <div className="p-8 lg:p-12 prose prose-slate prose-lg max-w-none 
                    prose-headings:font-serif prose-headings:font-normal prose-headings:tracking-tight 
                    prose-h1:text-3xl prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-2 prose-h2:border-b prose-h2:border-gray-100
                    prose-h3:text-xl prose-h3:mt-8 
                    prose-a:text-[#FF3B00] 
                    prose-blockquote:border-l-4 prose-blockquote:border-[#FF3B00] prose-blockquote:bg-orange-50 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-xl prose-blockquote:font-medium prose-blockquote:italic
                    prose-table:w-full prose-table:text-sm
                    prose-th:bg-gray-50 prose-th:p-4 prose-th:text-left prose-th:font-semibold prose-th:uppercase prose-th:text-[10px] prose-th:tracking-wider prose-th:text-gray-500
                    prose-td:p-4 prose-td:border-b prose-td:border-gray-100 prose-td:align-top
                    prose-li:marker:text-[#FF3B00]
                    prose-strong:font-semibold prose-strong:text-gray-900"
                 >
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={MarkdownComponents}>
                       {processConfidenceTags(reportMarkdown)}
                    </ReactMarkdown>
                 </div>
              </div>

              <div className="xl:col-span-3">
                  <div className="sticky top-8 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col gap-6">
                    <h3 className="font-serif italic text-lg border-b border-gray-100 pb-4">Actions</h3>
                    
                    {(() => {
                       const lowCount = countLowConfidence(reportMarkdown);
                       if (lowCount >= 2 && !isAnalyzing) {
                         return (
                           <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 animate-in fade-in">
                             <div className="flex items-start gap-2 mb-3">
                               <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                               <span className="font-medium">本报告含 {lowCount} 条低置信度结论，导出前请确认已知晓风险。</span>
                             </div>
                             <label className="flex items-center gap-2 cursor-pointer group">
                                <input 
                                  type="checkbox" 
                                  checked={confirmExport} 
                                  onChange={(e) => setConfirmExport(e.target.checked)}
                                  className="rounded border-amber-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
                                />
                                <span className="group-hover:text-amber-900 transition-colors">已知晓决策风险并确认解锁</span>
                             </label>
                           </div>
                         );
                       }
                       return null;
                    })()}

                    <div className={((countLowConfidence(reportMarkdown) >= 2) && !confirmExport) ? 'opacity-50 pointer-events-none' : ''}>
                      <div className="flex flex-col gap-3">
                        <button 
                          className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-[#FF3B00] hover:bg-orange-50 transition-colors group"
                          onClick={() => exportToPDF('report-content-panel', uploadedFileName)}
                        >
                      <div className="flex items-center gap-3 flex-1">
                        <Download className="w-5 h-5 text-gray-400 group-hover:text-[#FF3B00]" />
                        <span className="font-medium text-sm">Download PDF</span>
                      </div>
                    </button>

                    <button 
                      className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-[#FF3B00] hover:bg-orange-50 transition-colors group"
                      onClick={() => exportToPPT(uploadedFileName, reportMarkdown)}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <Presentation className="w-5 h-5 text-gray-400 group-hover:text-[#FF3B00]" />
                        <span className="font-medium text-sm">Download PPT</span>
                      </div>
                    </button>

                    <button 
                      className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-[#FF3B00] hover:bg-orange-50 transition-colors group"
                      onClick={async () => {
                         try {
                           const shareUrl = await shareReport({ markdown: reportMarkdown, charts: [] });
                           alert(`分享链接已生成: ${window.location.origin}${shareUrl}\n(已复制到剪贴板)`);
                           navigator.clipboard.writeText(`${window.location.origin}${shareUrl}`);
                         } catch (e) {
                           alert('分享生成失败。');
                         }
                      }}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <Share2 className="w-5 h-5 text-gray-400 group-hover:text-[#FF3B00]" />
                        <span className="font-medium text-sm">Share Link</span>
                      </div>
                    </button>

                    <button 
                      onClick={() => { setReportMarkdown(''); setUploadedFileName(''); setIsAnalyzing(false); setError(null); }}
                      className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-gray-900 hover:bg-gray-900 transition-colors group"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <Upload className="w-5 h-5 text-gray-400 group-hover:text-white" />
                        <span className="font-medium text-sm group-hover:text-white transition-colors">Analyze New File</span>
                      </div>
                    </button>
                    </div>
                    </div>
                    
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl space-y-2">
                       <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-gray-500">Methodology</h4>
                       <p className="text-xs text-gray-500 leading-relaxed">
                         This blueprint acts as an exact specification for frontend engineers and data teams to construct robust, actionable dashboards. 
                       </p>
                    </div>
                 </div>
              </div>
           </motion.div>
        )}

      </div>
    </div>
  );
}
