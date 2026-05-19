import React, { useState, useRef } from 'react';
import { GitCompare, ArrowRight, Upload, Loader2, AlertTriangle, FileText, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'motion/react';
import { ThinkingProcess } from '../components/ThinkingProcess';
import { MarkdownWithChart } from '../components/MarkdownWithChart';
import { fetchChatStream } from '../lib/api';
import { buildSystemPrompt } from '../prompts';
import { useLanguage } from '../lib/LanguageContext';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import * as ss from 'simple-statistics';

interface DatasetSlot {
  name: string;
  data: any[];
  columns: string[];
  stats: Record<string, { mean: number; min: number; max: number; count: number }>;
}

function parseFile(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const isXlsx = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
    if (isXlsx) {
      file.arrayBuffer().then(buffer => {
        const wb = XLSX.read(buffer, { type: 'array' });
        const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
        resolve(data);
      }).catch(reject);
    } else {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (r) => resolve(r.data),
        error: (e) => reject(e),
      });
    }
  });
}

function computeStats(data: any[]): DatasetSlot['stats'] {
  if (!data.length) return {};
  const keys = Object.keys(data[0]);
  const stats: DatasetSlot['stats'] = {};
  keys.forEach(key => {
    const nums = data.map(r => Number(r[key])).filter(n => !isNaN(n));
    if (nums.length > 0) {
      stats[key] = {
        mean: ss.mean(nums),
        min: ss.min(nums),
        max: ss.max(nums),
        count: nums.length,
      };
    }
  });
  return stats;
}

export function DataCompare() {
  const { t } = useLanguage();
  const fileRefA = useRef<HTMLInputElement>(null);
  const fileRefB = useRef<HTMLInputElement>(null);

  const [slotA, setSlotA] = useState<DatasetSlot | null>(null);
  const [slotB, setSlotB] = useState<DatasetSlot | null>(null);
  const [report, setReport] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (file: File, slot: 'A' | 'B') => {
    try {
      const data = await parseFile(file);
      if (!data || data.length === 0) throw new Error('文件为空');
      const columns = Object.keys(data[0]);
      const stats = computeStats(data);
      const ds: DatasetSlot = { name: file.name, data, columns, stats };
      if (slot === 'A') setSlotA(ds);
      else setSlotB(ds);
      setError(null);
    } catch (e: any) {
      setError(`解析失败：${e.message}`);
    }
  };

  const handleCompare = async () => {
    if (!slotA || !slotB) return;
    setIsAnalyzing(true);
    setReport('');
    setError(null);

    // 找出共同的数值字段
    const commonKeys = Object.keys(slotA.stats).filter(k => k in slotB.stats);
    const fieldComparison = commonKeys.map(k => {
      const a = slotA.stats[k];
      const b = slotB.stats[k];
      const diff = b.mean - a.mean;
      const relDiff = a.mean !== 0 ? (diff / Math.abs(a.mean)) * 100 : 0;
      return { field: k, meanA: a.mean.toFixed(2), meanB: b.mean.toFixed(2), diff: diff.toFixed(2), relDiff: relDiff.toFixed(1) + '%' };
    });

    const prompt = `你是一位资深业务分析师。以下是两份数据集的对比摘要：

**数据集 A（基准）**：${slotA.name}，${slotA.data.length} 行，${slotA.columns.length} 个字段
**数据集 B（对比）**：${slotB.name}，${slotB.data.length} 行，${slotB.columns.length} 个字段

**共同数值字段对比**：
${fieldComparison.map(f => `- ${f.field}：A 均值=${f.meanA}, B 均值=${f.meanB}, 变化=${f.relDiff}`).join('\n')}

**数据集 A 前 5 行样本**：
${JSON.stringify(slotA.data.slice(0, 5), null, 2)}

**数据集 B 前 5 行样本**：
${JSON.stringify(slotB.data.slice(0, 5), null, 2)}

请完成以下分析（用中文回答，遵循倒金字塔结构——结论先行）：

## 1. 核心结论
一句话总结两份数据最大的差异是什么，对业务意味着什么。

## 2. 关键差异指标（Top 3-5）
按变化幅度排序，每个指标说明：变化了多少、可能的业务原因、建议的行动。

## 3. 归因瀑布
用 \`\`\`chart 代码块生成一个 waterfall 瀑布图，展示从 A 到 B 的主要贡献因子。

## 4. 辛普森悖论风险
分析是否存在"整体改善但某些分层恶化"的可能性。

## 5. 行动建议
给出 1-2 条 P0 级行动建议，明确"谁做什么、什么时候、预期效果"。`;

    try {
      await fetchChatStream(
        [{ role: 'user', parts: [{ text: prompt }] }],
        buildSystemPrompt('compare'),
        (chunk) => setReport(prev => prev + chunk),
        (errMsg) => setError(errMsg)
      );
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Chart data for quick visual
  const chartData = slotA && slotB ? (() => {
    const commonKeys = Object.keys(slotA.stats).filter(k => k in slotB.stats).slice(0, 6);
    return commonKeys.map(k => ({
      name: k.length > 12 ? k.slice(0, 12) + '…' : k,
      'A (基准)': Number(slotA.stats[k].mean.toFixed(2)),
      'B (对比)': Number(slotB.stats[k].mean.toFixed(2)),
    }));
  })() : [];

  return (
    <div className="min-h-screen bg-[#F5F1EA] pt-20 pb-16 px-4 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <header>
          <div className="text-xs uppercase tracking-[0.2em] text-[#1A1A1A]/50 mb-3">— Compare & Attribution</div>
          <h1 className="text-3xl lg:text-5xl tracking-tight font-bold leading-[0.95]">
            <span className="serif-italic text-[#2962FF]">A/B</span> 对比归因
          </h1>
          <p className="text-base text-[#1A1A1A]/60 leading-relaxed max-w-2xl mt-3">
            上传两份数据（不同时间段、不同渠道、不同人群），AI 自动找出差异根因，生成归因瀑布图。回答"为什么 B 比 A 好/差"。
          </p>
        </header>

        {/* Upload Slots */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Slot A */}
          <div className={`relative rounded-2xl border-2 border-dashed p-6 transition-all ${slotA ? 'border-[#1A1A1A]/20 bg-white' : 'border-[#1A1A1A]/10 bg-white/50 hover:border-[#2962FF]/40'}`}>
            <input type="file" ref={fileRefA} className="hidden" accept=".csv,.xlsx,.xls,.txt" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0], 'A')} />
            {slotA ? (
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-[#1A1A1A]/40 font-semibold mb-1">数据集 A · 基准</div>
                  <h3 className="font-semibold text-[#1A1A1A] text-sm">{slotA.name}</h3>
                  <p className="text-xs text-[#1A1A1A]/50 mt-1">{slotA.data.length} 行 · {slotA.columns.length} 字段 · {Object.keys(slotA.stats).length} 个数值字段</p>
                </div>
                <button onClick={() => setSlotA(null)} className="p-1.5 hover:bg-red-50 rounded-lg text-[#1A1A1A]/30 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 cursor-pointer" onClick={() => fileRefA.current?.click()}>
                <div className="w-12 h-12 rounded-xl bg-[#2962FF]/10 flex items-center justify-center mb-3">
                  <Upload className="w-5 h-5 text-[#2962FF]" />
                </div>
                <div className="text-sm font-semibold text-[#1A1A1A]">上传数据集 A（基准）</div>
                <div className="text-xs text-[#1A1A1A]/40 mt-1">CSV / Excel / TXT</div>
              </div>
            )}
          </div>

          {/* Slot B */}
          <div className={`relative rounded-2xl border-2 border-dashed p-6 transition-all ${slotB ? 'border-[#1A1A1A]/20 bg-white' : 'border-[#1A1A1A]/10 bg-white/50 hover:border-[#FF5722]/40'}`}>
            <input type="file" ref={fileRefB} className="hidden" accept=".csv,.xlsx,.xls,.txt" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0], 'B')} />
            {slotB ? (
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-[#1A1A1A]/40 font-semibold mb-1">数据集 B · 对比</div>
                  <h3 className="font-semibold text-[#1A1A1A] text-sm">{slotB.name}</h3>
                  <p className="text-xs text-[#1A1A1A]/50 mt-1">{slotB.data.length} 行 · {slotB.columns.length} 字段 · {Object.keys(slotB.stats).length} 个数值字段</p>
                </div>
                <button onClick={() => setSlotB(null)} className="p-1.5 hover:bg-red-50 rounded-lg text-[#1A1A1A]/30 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 cursor-pointer" onClick={() => fileRefB.current?.click()}>
                <div className="w-12 h-12 rounded-xl bg-[#FF5722]/10 flex items-center justify-center mb-3">
                  <Upload className="w-5 h-5 text-[#FF5722]" />
                </div>
                <div className="text-sm font-semibold text-[#1A1A1A]">上传数据集 B（对比）</div>
                <div className="text-xs text-[#1A1A1A]/40 mt-1">CSV / Excel / TXT</div>
              </div>
            )}
          </div>
        </div>

        {/* Compare Button */}
        {slotA && slotB && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <button
              onClick={handleCompare}
              disabled={isAnalyzing}
              className="w-full py-4 bg-[#1A1A1A] text-[#F5F1EA] font-semibold rounded-xl hover:bg-[#FF5722] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <GitCompare className="w-5 h-5" />}
              {isAnalyzing ? '正在分析差异...' : '开始对比归因分析'}
            </button>
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-xs font-semibold hover:text-red-600">关闭</button>
          </div>
        )}

        {/* Quick Chart Preview */}
        {slotA && slotB && chartData.length > 0 && !report && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl border border-[#1A1A1A]/10 p-6">
            <h3 className="text-sm font-semibold text-[#1A1A1A]/70 mb-4 flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-[#2962FF]" />
              数值字段均值快速对比
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="A (基准)" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="B (对比)" fill="#2962FF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* Report Output */}
        {report && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-[#1A1A1A]/10 overflow-hidden">
            <div className="px-6 py-4 border-b border-[#1A1A1A]/10 flex items-center justify-between bg-[#F5F1EA]/50">
              <div>
                <h2 className="text-base font-semibold text-[#1A1A1A]">对比归因报告</h2>
                <p className="text-xs text-[#1A1A1A]/50 mt-0.5">{slotA?.name} vs {slotB?.name}</p>
              </div>
              {isAnalyzing && <Loader2 className="w-4 h-4 animate-spin text-[#2962FF]" />}
            </div>
            <div className="p-6 lg:p-8">
              <ThinkingProcess rawText={report} isStreaming={isAnalyzing} />
            </div>
          </motion.div>
        )}

        {/* Empty state hint */}
        {!slotA && !slotB && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-[#2962FF]/10 flex items-center justify-center mx-auto mb-4">
              <GitCompare className="w-7 h-7 text-[#2962FF]" />
            </div>
            <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">上传两份数据开始对比</h3>
            <p className="text-sm text-[#1A1A1A]/50 max-w-md mx-auto">
              例如：上月 vs 本月的订单数据、A 渠道 vs B 渠道的转化数据、实验组 vs 对照组的用户行为数据。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
