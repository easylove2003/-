// Smart Report Generation Module
import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Upload, Database, LayoutTemplate, AlertTriangle, FileText, Download, Loader2, PlayCircle, BarChart2, Zap } from 'lucide-react';
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
import { RateLimitBanner } from '../components/RateLimitBanner';
import { exportToPDF, exportToPPT, shareReport } from '../lib/exportUtils';
import { Share2, Presentation } from 'lucide-react';
import { buildSystemPrompt } from '../prompts';
import { listAllTemplates } from '../data/reportTemplates';
import { TemplateEditor } from '../components/TemplateEditor';

function splitMarkdownByH2(md: string) {
  const parts = md.split(/(?=^## )/m);
  if (parts.length === 0) return { before: '', sections: [] };
  
  const before = parts[0].startsWith('## ') ? '' : parts.shift() || '';
  
  const sections = parts.map(part => {
    const lines = part.split('\n');
    const headingLine = lines[0];
    const heading = headingLine.replace(/^##\s*/, '').trim();
    const body = lines.slice(1).join('\n');
    return { heading, body };
  });
  
  return { before, sections };
}

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

  const [expressMode, setExpressMode] = useState(false);
  const [rewritingSectionIdx, setRewritingSectionIdx] = useState<number | null>(null);
  const [rewriteHint, setRewriteHint] = useState('');
  const [rewriteOpen, setRewriteOpen] = useState<number | null>(null);
  const [originalMetadata, setOriginalMetadata] = useState<any>(null);
  const [originalRawData, setOriginalRawData] = useState<any[]>([]);

  const [selectedTemplateId, setSelectedTemplateId] = useState('pyramid_business');
  const [templates, setTemplates] = useState(() => listAllTemplates());
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);

  const REPORT_STAGES = useMemo(() => {
    const tpl = templates.find(t => t.id === selectedTemplateId) || templates[0];
    return tpl.sections.map((s, i) => ({
      id: i + 1,
      label: s.title,
      anchor: `## ${i + 1}.`
    }));
  }, [selectedTemplateId, templates]);

  const reachedStageId = useMemo(() => {
    let max = 0;
    REPORT_STAGES.forEach(s => { if (reportMarkdown.includes(s.anchor)) max = s.id; });
    return max;
  }, [reportMarkdown, REPORT_STAGES]);

  useEffect(() => {
    let cancelled = false;
    const tryRestore = () => {
      try {
        const url = new URL(window.location.href);
        if (url.searchParams.get('from') !== 'data-analysis') return;
        const raw = sessionStorage.getItem('dc_pending_dataset');
        if (!raw) return;
        const payload = JSON.parse(raw);
        sessionStorage.removeItem('dc_pending_dataset');
        if (cancelled) return;
        setUploadedFileName(payload.fileName + (payload._truncated ? ' (前5000行采样)' : ''));
        const meta = extractMetadata(payload.data, { fields: payload.columns.map((c: any) => c.key) });
        setOriginalMetadata(meta);
        setOriginalRawData(payload.data);
        // Defer the generateReport call to avoid race with React 19 StrictMode double-mount
        setTimeout(() => {
          if (!cancelled) generateReport(meta, payload.data, false);
        }, 0);
      } catch (e) {
        console.error('Restore from DataAnalysis failed', e);
      }
    };
    tryRestore();
    return () => { cancelled = true; };
  }, []);

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
          setOriginalMetadata(metadata);
          setOriginalRawData(results.data);
          await generateReport(metadata, results.data, expressMode);
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

  const generateReport = async (metadata: any, rawData: any[], isExpress: boolean = expressMode) => {
    setIsAnalyzing(true);
    setReportMarkdown('');
    setError(null);

    const qs = calculateQualityScore(rawData);

    const tpl = templates.find(t => t.id === selectedTemplateId) || templates[0];
    const sectionList = tpl.sections.map((s, i) => `## ${i + 1}. ${s.title}\n（章节要点：${s.hint}）`).join('\n\n');

    const isPyramid = selectedTemplateId === 'pyramid_business';

    const pyramidInstructions = isPyramid ? `

【金字塔原理输出规范】

## 1. 核心结论与行动建议
格式要求：
- 开头用一个加粗的"一句话结论"（不超过 30 字），概括整份数据最重要的业务信号
- 然后用表格列出 P0/P1/P2 行动建议：
  | 优先级 | 行动 | 预期收益 | 负责方 | 时间线 |
- P0 = 本周必须做（止血/抓住窗口期）
- P1 = 两周内启动（结构性改善）
- P2 = 月度规划（长期建设）
- 每个行动用 ICE 评分（Impact/Confidence/Ease 各 1-10 分）排序

## 2. 关键发现（支撑论据）
格式要求：
- 列出 3-5 个关键发现，每个发现用以下结构：
  ### 发现 N：[一句话结论]
  **数据事实**：具体数字是什么
  **业务解读**：这意味着什么（So What?）
  **建议行动**：应该怎么做（Now What?）
  [配一个图表]
- 发现之间要有逻辑关系（因果/并列/递进），不是随机罗列

## 3. 业务全景看板
格式要求：
- 先给出 4-6 个核心 KPI 的"数字卡片"（当前值 + 环比变化 + 健康状态）
- 然后配 2-3 个趋势/结构图表
- KPI 分四类：规模（量有多大）、效率（转化有多快）、质量（体验有多好）、结构（组成是否健康）

## 4. 归因分析与根因拆解
格式要求：
- 选取最重要的 1-2 个指标，做维度下钻
- 用瀑布图展示"谁贡献了增长/谁拖了后腿"
- 回答"为什么会这样"而不只是"发生了什么"

## 5. 风险预警与数据质量
格式要求：
- 明确告诉决策者：哪些结论置信度高可以直接用，哪些需要进一步验证
- 列出数据盲区（这份数据回答不了什么问题）
- 如果有异常值或数据质量问题，说明对结论的影响程度

## 6. 附录：数据明细与方法论
格式要求：
- 字段说明表
- 样本量与时间范围
- 分析方法说明
- 局限性声明
` : '';

    const sysPrompt = buildSystemPrompt('report') + `\n\n你是企业级商业分析顾问。本次报告必须严格按以下章节结构输出（不要增减章节，不要改章节标题）：

# ${tpl.name}

${sectionList}

${pyramidInstructions}

每节请给出充实内容（300-600 字 + 必要的图表 chart 代码块）。

CRITICAL: You MUST respond strictly in ${lang === 'en' ? 'English' : 'Chinese'}.

请严格遵守以下规则：

1. 只能使用上传数据中真实存在的字段，严禁编造字段。
2. 如果某个指标缺少必要字段，必须说明无法计算原因，并给出替代指标。
3. 业务大于技术：先说"对生意意味着什么"，再说"数据是怎么算的"。
4. 每个图表必须服务于一个明确的业务论点，不要为了展示而展示。
5. 结论必须可执行：不要说"建议优化转化率"，要说"建议在结账页增加微信支付入口，预计提升转化率 3-5%"。
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

我们在前端系统已算出本数据集的综合质量评分：${Math.round(qs.overall)}/100，存在以下问题：${qs.lowConfidenceReasons.join(', ') || '无明显问题'}。请在输出 LOW 或 MEDIUM 信心时结合这些先验信息。`;

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

  const handleRewriteSection = async (idx: number, hint: string) => {
    if (!originalMetadata) return;
    setRewritingSectionIdx(idx);
    
    const cleanMarkdown = processConfidenceTags(reportMarkdown);
    const sections = splitMarkdownByH2(cleanMarkdown);
    const target = sections.sections[idx];
    
    const sysPrompt = buildSystemPrompt('report') + `
你只需重写下面这一节，不要输出其他章节、不要输出主标题。
保持原章节的 H2 标题不变（${target.heading}），但内容要根据用户 hint 调整。
用户 hint：${hint || '请把这节写得更具体、更贴近实际业务'}
原节内容供参考（你可以推翻重写）：
${target.body}`;

    let newSection = `## ${target.heading}\n\n`;
    
    await fetchChatStream(
      [{ role: 'user', parts: [{ text: `数据元信息：${JSON.stringify(originalMetadata.columns)}` }] }],
      sysPrompt,
      (chunk) => {
        newSection += chunk;
        const newSections = [...sections.sections];
        newSections[idx] = { heading: target.heading, body: newSection.replace(`## ${target.heading}\n\n`, '') };
        const merged = sections.before + '\n\n' + newSections.map(s => `## ${s.heading}\n${s.body}`).join('\n\n');
        setReportMarkdown(merged);
      },
      (errMsg) => setError(errMsg)
    );
    setRewritingSectionIdx(null);
    setRewriteOpen(null);
    setRewriteHint('');
  };

  const MarkdownComponents: Components = useMemo(() => ({
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
           
           // Attempt to fix common LLM JSON formatting errors
           jsonStr = jsonStr.replace(/}\s*{/g, '},{')
                            .replace(/]\s*\[/g, '],[')
                            .replace(/,\s*}/g, '}')
                            .replace(/,\s*]/g, ']');
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
  }), []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F1EA] pt-20 pb-16 px-4 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <header className="flex flex-col gap-3 w-full max-w-4xl">
           {(() => { try { return new URL(window.location.href).searchParams.get('from') === 'data-analysis'; } catch { return false; } })() && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FF5722]/10 text-[#FF5722] text-[11px] font-medium rounded-md mb-2 w-max border border-[#FF5722]/20">
                <FileText className="w-3 h-3" />
                从数据分析继承数据集
              </span>
           )}
           <div className="text-xs uppercase tracking-[0.2em] opacity-50">— Smart Report</div>
           <h1 className="text-4xl lg:text-6xl tracking-tight font-bold leading-[0.95]">
             Pyramid <span className="serif-italic text-[#FF5722]">Reports</span>
           </h1>
           <p className="text-base text-[#1A1A1A]/60 leading-relaxed max-w-2xl mt-2">
             上传数据，自动生成金字塔原理结构的业务分析报告。结论先行、论据支撑、数据佐证。
           </p>
        </header>

        {/* Upload Zone */}
        {!reportMarkdown && !isAnalyzing && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full flex flex-col items-center"
          >
             <div className="w-full max-w-2xl flex items-center justify-center gap-3 mb-4 hidden">
               <button
                 onClick={() => setExpressMode(false)}
                 className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${!expressMode ? 'bg-[#0F0F0F] text-white shadow-lg' : 'bg-white text-gray-500 border border-gray-200'}`}
               >
                 完整模式（7 段 · 60s+）
               </button>
               <button
                 onClick={() => setExpressMode(true)}
                 className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${expressMode ? 'bg-[#FF3B00] text-white shadow-lg' : 'bg-white text-gray-500 border border-gray-200'}`}
               >
                 ⚡ Express 模式（3 段 · 15s）
               </button>
             </div>

             <div className="w-full max-w-2xl mb-4">
               <label className="block text-xs font-bold text-gray-700 mb-2">📋 报告模板</label>
               <div className="flex gap-2 items-center">
                 <select
                   value={selectedTemplateId}
                   onChange={(e) => setSelectedTemplateId(e.target.value)}
                   className="flex-1 bg-white border border-gray-300 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none"
                 >
                   {templates.map(t => (
                     <option key={t.id} value={t.id}>
                       {t.name}{t.isBuiltIn ? '（内置）' : '（自定义）'} — {t.sections.length} 段
                     </option>
                   ))}
                 </select>
                 <button
                   onClick={() => setShowTemplateEditor(true)}
                   className="px-3 py-2 text-xs bg-gray-900 text-white rounded-xl hover:bg-gray-700 font-bold"
                 >
                   ✏️ 自定义
                 </button>
               </div>
               <p className="text-[10px] text-gray-500 mt-1">
                 提示：不同模板会改变报告章节结构与重点
               </p>
             </div>

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
        {isAnalyzing && !reportMarkdown && (
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
              <ul className="space-y-4 text-sm font-mono flex flex-col items-center opacity-80">
                {REPORT_STAGES.map(s => {
                  const isDone = s.id <= reachedStageId;
                  const isCurrent = s.id === reachedStageId + 1;
                  return (
                    <li key={s.id} className={`flex items-center gap-2 ${isDone ? 'text-green-600' : isCurrent ? 'text-orange-500 animate-pulse font-bold' : 'text-gray-400'}`}>
                      <span>[{s.id}/{REPORT_STAGES.length}]</span> {s.label}
                    </li>
                  );
                })}
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

        {/* Results - Two Column Layout */}
        {reportMarkdown && (
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="flex flex-col gap-4"
           >
              {expressMode && !isAnalyzing && (
                <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <Zap className="w-4 h-4 text-amber-500" />
                     <span className="font-medium text-sm">快速预览版，可基于此确认数据方向。</span>
                   </div>
                   <button 
                     onClick={() => { setExpressMode(false); generateReport(originalMetadata, originalRawData, false); }} 
                     className="px-3 py-1.5 bg-white rounded-lg text-xs font-bold border border-amber-300 hover:bg-amber-50 transition-colors"
                   >
                     升级完整报告
                   </button>
                </div>
              )}

              {isAnalyzing && rewritingSectionIdx === null && (
                 <div className="bg-gray-900 rounded-xl p-3 flex items-center justify-between sticky top-16 z-40">
                    <div className="flex items-center gap-3">
                       <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                       <span className="text-white text-sm font-medium">正在生成报告...</span>
                    </div>
                    <div className="flex items-center gap-3">
                       {REPORT_STAGES.map(s => {
                          const isDone = s.id <= reachedStageId;
                          const isCurrent = s.id === reachedStageId + 1;
                          return (
                            <div key={s.id} className="flex items-center gap-1.5">
                               <div className={`w-1.5 h-1.5 rounded-full ${isDone ? 'bg-emerald-400' : isCurrent ? 'bg-indigo-400 animate-pulse' : 'bg-gray-600'}`}></div>
                               <span className={`text-[10px] hidden lg:inline-block ${isDone ? 'text-emerald-400' : isCurrent ? 'text-white' : 'text-gray-500'}`}>{s.label}</span>
                            </div>
                          );
                       })}
                    </div>
                 </div>
              )}

              <div id="report-content-panel" className="flex-1 min-w-0 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                 <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                   <div>
                     <h2 className="text-lg font-semibold text-gray-900">业务决策报告</h2>
                     <p className="text-xs text-gray-500 mt-0.5">{uploadedFileName} · 金字塔原理结构</p>
                   </div>
                   {!isAnalyzing && (
                     <div className="flex gap-1">
                        {REPORT_STAGES.map(s => (
                           <div key={s.id} className={`w-2 h-2 rounded-full ${s.id <= reachedStageId ? 'bg-emerald-400' : 'bg-gray-200'}`} title={s.label}></div>
                        ))}
                     </div>
                   )}
                 </div>
                 
                 <div className="p-8 lg:p-10 prose prose-slate prose-base max-w-none 
                    prose-headings:font-semibold prose-headings:tracking-tight 
                    prose-h1:text-2xl prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:pb-3 prose-h2:border-b prose-h2:border-gray-100
                    prose-h3:text-lg prose-h3:mt-6 
                    prose-a:text-[#FF5722] prose-a:no-underline hover:prose-a:underline
                    prose-blockquote:border-l-4 prose-blockquote:border-[#FF5722] prose-blockquote:bg-[#FF5722]/5 prose-blockquote:py-2 prose-blockquote:px-5 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
                    prose-table:w-full prose-table:text-sm
                    prose-th:bg-gray-50 prose-th:p-3 prose-th:text-left prose-th:font-semibold prose-th:text-xs prose-th:uppercase prose-th:tracking-wider prose-th:text-gray-500
                    prose-td:p-3 prose-td:border-b prose-td:border-gray-100 prose-td:align-top
                    prose-li:marker:text-[#FF5722]
                    prose-strong:font-semibold prose-strong:text-gray-900
                    prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-normal"
                 >
                    {isAnalyzing && rewritingSectionIdx === null ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={MarkdownComponents}>
                         {processConfidenceTags(reportMarkdown)}
                      </ReactMarkdown>
                    ) : (() => {
                        const sections = splitMarkdownByH2(processConfidenceTags(reportMarkdown));
                        return (
                          <>
                             <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={MarkdownComponents}>
                               {sections.before}
                             </ReactMarkdown>
                             {sections.sections.map((sec, idx) => (
                               <div key={idx} className={`relative mb-8 ${rewritingSectionIdx === idx ? 'bg-orange-50 rounded-xl p-4' : ''}`}>
                                  <div className="flex items-center justify-between group">
                                     <h2 className="text-2xl mt-12 mb-6 pb-2 border-b border-gray-100 font-serif font-normal tracking-tight flex-1">
                                       {sec.heading}
                                     </h2>
                                     {!isAnalyzing && (
                                       <button onClick={() => setRewriteOpen(rewriteOpen === idx ? null : idx)} className="opacity-0 group-hover:opacity-100 transition-opacity ml-4 text-xs font-medium text-gray-500 hover:text-[#FF3B00] flex items-center gap-1 bg-gray-50 hover:bg-orange-50 px-2 py-1 rounded">
                                          ✏️ 重写本节
                                       </button>
                                     )}
                                  </div>
                                  
                                  <AnimatePresence>
                                     {rewriteOpen === idx && rewritingSectionIdx !== idx && (
                                       <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} exit={{opacity:0, height:0}} className="overflow-hidden mb-6">
                                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col gap-3">
                                             <textarea 
                                               value={rewriteHint}
                                               onChange={e => setRewriteHint(e.target.value)}
                                               placeholder="请输入修改意见，例如：将这部分写得更具体、补充转化漏斗相关说明..."
                                               className="w-full bg-white border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-[#FF3B00]"
                                               rows={3}
                                             />
                                             <div className="flex justify-end gap-2">
                                                <button onClick={() => setRewriteOpen(null)} className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">取消</button>
                                                <button onClick={() => handleRewriteSection(idx, rewriteHint)} className="px-4 py-2 text-xs font-bold text-white bg-[#0F0F0F] hover:bg-[#FF3B00] rounded-lg transition-colors shadow-md">确认重写</button>
                                             </div>
                                          </div>
                                       </motion.div>
                                     )}
                                  </AnimatePresence>
                                  
                                  {rewritingSectionIdx === idx ? (
                                     <div className="flex flex-col items-center justify-center p-8 text-orange-500">
                                        <Loader2 className="w-8 h-8 animate-spin mb-2" />
                                        <span className="text-xs font-mono font-medium tracking-widest uppercase">Rewriting Section...</span>
                                     </div>
                                  ) : (
                                     <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={MarkdownComponents}>
                                        {sec.body}
                                     </ReactMarkdown>
                                  )}
                               </div>
                             ))}
                          </>
                        );
                    })()}
                 </div>
              </div>

              <div className="xl:col-span-3">
                  <div className="sticky top-20 bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-5">
                    <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-3">导出与操作</h3>
                    
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
                       <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-gray-500">方法论</h4>
                       <p className="text-xs text-gray-500 leading-relaxed">
                         本报告遵循《金字塔原理》结构：结论先行 → 以上统下 → 归类分组 → 逻辑递进。业务大于技术，每个数据点都服务于可执行的商业决策。
                       </p>
                    </div>
                 </div>
              </div>
           </motion.div>
        )}

      </div>

      {showTemplateEditor && (
        <TemplateEditor 
          onClose={() => setShowTemplateEditor(false)}
          onSaved={() => setTemplates(listAllTemplates())}
        />
      )}

    </div>
  );
}
