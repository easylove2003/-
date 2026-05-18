import React, { useState, useEffect } from 'react';
import { useMemory, UploadRecord } from '../hooks/useMemory';
import { Layers, ArrowRight, Zap, Target, BrainCircuit, Loader2, ArrowUpRight, ArrowDownRight, GitMerge } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { ThinkingProcess } from '../components/ThinkingProcess';
import { fetchChatStream } from '../lib/api';
import { buildSystemPrompt } from '../prompts';

export function DataCompare() {
  const { records, updateRecordTags } = useMemory();
  const [baseRecord, setBaseRecord] = useState<UploadRecord | null>(null);
  const [compareRecord, setCompareRecord] = useState<UploadRecord | null>(null);
  const [report, setReport] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Tag editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');

  const recentRecords = records.slice(0, 5);

  const calculateMapping = (rA: UploadRecord, rB: UploadRecord) => {
    let statsA = {};
    let statsB = {};
    try { if (rA.stats) statsA = JSON.parse(rA.stats); } catch(e){}
    try { if (rB.stats) statsB = JSON.parse(rB.stats); } catch(e){}

    const mapping: any[] = [];
    const keysA = Object.keys(statsA);
    const keysB = Object.keys(statsB);
    const commonKeys = keysA.filter(k => keysB.includes(k));

    commonKeys.forEach(k => {
      const a = (statsA as any)[k];
      const b = (statsB as any)[k];
      if (a.type === b.type && a.type === 'number') {
        const meanA = a.mean || 0;
        const meanB = b.mean || 0;
        const diff = meanB - meanA;
        const relDiff = meanA !== 0 ? diff / Math.abs(meanA) : 0;
        mapping.push({ key: k, type: 'number', meanA, meanB, diff, relDiff });
      } else if (a.type === b.type && a.type === 'category') {
         mapping.push({ key: k, type: 'category', uniqueA: a.uniqueCount, uniqueB: b.uniqueCount });
      }
    });
    return { statsA, statsB, mapping };
  };

  const handleCompare = async () => {
    if (!baseRecord || !compareRecord) return;
    setIsAnalyzing(true);
    setReport('');

    const { statsA, statsB, mapping } = calculateMapping(baseRecord, compareRecord);
    
    const fieldMapping = mapping.map(m => {
        if (m.type === 'number') return `[数值] ${m.key}: 基准均值=${m.meanA?.toFixed(2)}, 对比均值=${m.meanB?.toFixed(2)}, 变化=${(m.relDiff*100).toFixed(2)}%`;
        return `[分类] ${m.key}: 基准类别数=${m.uniqueA}, 对比类别数=${m.uniqueB}`;
    }).join('\n');

    const prompt = `你是一个专业的业务分析师。以下是两个数据集的统计摘要对比：\n\n数据集A（基准期）：${JSON.stringify(statsA)}\n数据集B（对比期）：${JSON.stringify(statsB)}\n\n字段映射关系：\n${fieldMapping}\n\n请完成以下分析：\n1. 找出变化最显著的3-5个指标（需要量化变化幅度）\n2. 推断可能的业务原因（用'如果...那么...'的假设框架）\n3. 识别潜在的辛普森悖论风险（整体改善但分层恶化的潜在可能性分析）\n4. 给出P1优先级的行动建议（1个，明确责任人和时间节点格式）\n请用中文回复，每个部分用##标题分隔。必要时可以使用之前约定的 chart JSON 块来输出可视化建议。`;

    try {
      await fetchChatStream(
        [{ role: 'user', parts: [{ text: prompt }] }],
        buildSystemPrompt('analysis'),
        (chunk) => {
           setReport(prev => prev + chunk);
        },
        (errMsg) => {
           setReport(prev => prev + `\n\n**Error:** ${errMsg}`);
        }
      );
    } catch (e: any) {
      console.error(e);
      setReport("分析失败: " + e.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const addTag = (id: string, newTag: string) => {
     if (!newTag.trim()) return;
     const record = records.find(r => r.id === id);
     if (record) {
       const existing = record.tags || [];
       if (!existing.includes(newTag)) {
          updateRecordTags(id, [...existing, newTag]);
       }
     }
     setEditingId(null);
     setTagInput('');
  };

  const renderMetricChart = () => {
    if (!baseRecord || !compareRecord) return null;
    const { mapping } = calculateMapping(baseRecord, compareRecord);
    const numericMappings = mapping.filter(m => m.type === 'number').slice(0, 5); // top 5
    if (numericMappings.length === 0) return null;

    const chartData = numericMappings.map(m => ({
        name: m.key,
        "Base (A)": Number(m.meanA?.toFixed(2)),
        "Compare (B)": Number(m.meanB?.toFixed(2)),
        diff: Number(m.diff?.toFixed(2)),
        relDiff: Number((m.relDiff * 100).toFixed(2))
    }));

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-8 mb-8">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 h-80">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><GitMerge className="w-5 h-5 text-indigo-500" /> 核心指标对比 (均值)</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{fontSize: 10}} interval={0} angle={-20} textAnchor="end" />
                        <YAxis tick={{fontSize: 12}} />
                        <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                        <Legend />
                        <Bar dataKey="Base (A)" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Compare (B)" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 h-80">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><ArrowUpRight className="w-5 h-5 text-emerald-500" /> 变化幅度剖析 (Delta %)</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{fontSize: 10}} interval={0} angle={-20} textAnchor="end" />
                        <YAxis tick={{fontSize: 12}} />
                        <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                        <Bar dataKey="relDiff" name="相对变化率(%)" radius={[4, 4, 4, 4]}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-\${index}`} fill={entry.relDiff >= 0 ? '#10B981' : '#EF4444'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
  };

  return (
    <div className="flex h-screen w-full bg-[#FAFAFA] overflow-y-auto">
        <div className="w-full max-w-6xl mx-auto p-6 lg:p-10 flex flex-col gap-8">
            <div>
               <h1 className="text-3xl font-serif font-bold text-gray-900 flex items-center gap-3">
                   <Layers className="w-8 h-8 text-indigo-600" /> 
                   双数据集横向对比 (Dual Dataset Benchmark)
               </h1>
               <p className="text-gray-500 mt-2">选择历史加载的两个数据集，自动执行基准对比指标漂移检测与诊断反馈。</p>
            </div>

            {records.length < 2 ? (
                <div className="bg-white p-10 rounded-3xl border border-gray-200 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Layers className="w-8 h-8 text-gray-400" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-800 mb-2">数据不足</h2>
                    <p className="text-gray-500">此模块需要至少 2 个已上传的数据集记录。请先至分析模块上传数据。</p>
                </div>
            ) : (
                <div className="flex flex-col xl:flex-row gap-8">
                    {/* Records Selection Sidebar */}
                    <div className="w-full xl:w-1/3 flex flex-col gap-4">
                       <h3 className="font-bold text-gray-800 text-sm uppercase tracking-widest border-b border-gray-200 pb-2">Recent Datasets</h3>
                       {recentRecords.map(record => (
                           <div key={record.id} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-3 relative group">
                               <div className="flex items-start justify-between">
                                  <div className="flex-1 min-w-0 pr-4">
                                     <h4 className="font-bold text-gray-800 text-sm truncate">{record.fileName}</h4>
                                     <p className="text-xs text-gray-500">{record.fieldCount} fields • {record.rowCount} rows</p>
                                  </div>
                               </div>
                               <div className="flex flex-wrap gap-2 text-xs">
                                   {record.tags?.map((t, i) => (
                                     <span key={i} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md font-mono">{t}</span>
                                   ))}
                                   {editingId === record.id ? (
                                       <input 
                                         autoFocus
                                         type="text" 
                                         value={tagInput}
                                         onChange={e => setTagInput(e.target.value)}
                                         onBlur={() => addTag(record.id, tagInput)}
                                         onKeyDown={e => e.key === 'Enter' && addTag(record.id, tagInput)}
                                         className="px-2 py-0.5 border border-indigo-300 rounded-md outline-none focus:ring-2 focus:ring-indigo-100 text-xs w-20"
                                         placeholder="Tag..."
                                       />
                                   ) : (
                                       <button onClick={() => { setEditingId(record.id); setTagInput(''); }} className="px-2 py-0.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors">+ Tag</button>
                                   )}
                               </div>
                               <div className="flex border-t border-gray-100 pt-3 mt-1 items-center gap-2">
                                  <button 
                                     onClick={() => setBaseRecord(baseRecord?.id === record.id ? null : record)}
                                     className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors \${baseRecord?.id === record.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                  >
                                    As Baseline (A)
                                  </button>
                                  <button 
                                     onClick={() => setCompareRecord(compareRecord?.id === record.id ? null : record)}
                                     className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors \${compareRecord?.id === record.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                  >
                                    As Compare (B)
                                  </button>
                               </div>
                           </div>
                       ))}
                    </div>

                    {/* Main Analysis Area */}
                    <div className="w-full xl:w-2/3 flex flex-col gap-6">
                        {baseRecord && compareRecord ? (
                            <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm min-h-[500px] flex flex-col">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="flex-1 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                       <span className="text-xs font-mono text-gray-400 uppercase font-bold block mb-1">Baseline A</span>
                                       <h4 className="font-bold text-gray-800 text-sm truncate">{baseRecord.fileName}</h4>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                                       <ArrowRight className="w-4 h-4 text-indigo-600" />
                                    </div>
                                    <div className="flex-1 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                       <span className="text-xs font-mono text-gray-400 uppercase font-bold block mb-1">Comparison B</span>
                                       <h4 className="font-bold text-gray-800 text-sm truncate">{compareRecord.fileName}</h4>
                                    </div>
                                </div>

                                <button 
                                   onClick={handleCompare}
                                   disabled={isAnalyzing}
                                   className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl shadow-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 mb-8"
                                >
                                   {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <BrainCircuit className="w-5 h-5" />}
                                   Generate Delta Analysis Report
                                </button>
                                
                                {renderMetricChart()}

                                {report && (
                                   <div className="flex-1 w-full border-t border-gray-100 pt-8 mt-2">
                                       <ThinkingProcess rawText={report} isStreaming={isAnalyzing} />
                                   </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-gray-50 border-2 border-dashed border-gray-200 p-10 rounded-3xl text-center h-full flex flex-col items-center justify-center">
                                <Target className="w-12 h-12 text-gray-300 mb-4" />
                                <h3 className="text-xl font-bold text-gray-600">选择对比基准</h3>
                                <p className="text-gray-400 text-sm mt-2">请在左侧选择一个基准数据集(A)和一个对比数据集(B)以启动变更分析引擎。</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    </div>
  );
}
