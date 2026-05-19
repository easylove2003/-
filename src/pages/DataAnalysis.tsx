import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Database, LayoutDashboard, TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight, Activity, BrainCircuit, Target, Scale, Zap, Info, FileText, Trash2, ChevronRight, X, Loader2, Search, Send, PlayCircle, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../lib/LanguageContext';
import { useMemory, formatDate, formatFileSize } from '../hooks/useMemory';
import Papa from 'papaparse';
import * as ss from 'simple-statistics';
import * as XLSX from 'xlsx';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { MarkdownWithChart } from '../components/MarkdownWithChart';
import { ThinkingProcess } from '../components/ThinkingProcess';
import { fetchChatStream } from '../lib/api';
import { buildSystemPrompt } from '../prompts';
import { registerJsonAsTable, runSQL, describeTable } from '../lib/duckdb-engine';
import { WorkflowStepper } from '../components/WorkflowStepper';
import { PrivacyConsent, usePrivacyCheck } from '../components/PrivacyConsent';
import { RateLimitBanner } from '../components/RateLimitBanner';

export function DataAnalysis() {
  const { t, lang } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const privacy = usePrivacyCheck();
  const { records, selectedRecord, addRecord, deleteRecord, clearAllRecords, selectRecord } = useMemory();
  const [isDragging, setIsDragging] = useState(false);
  
  // Real Data State
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);
  const [columnStats, setColumnStats] = useState<any>({});
  const [showRealData, setShowRealData] = useState(false);
  const [fileName, setFileName] = useState('');

  // AI Diagnostic State
  const [mainDiagnosticReport, setMainDiagnosticReport] = useState<string>('');
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  
  // NL2Analysis Chat State
  const [chatQuery, setChatQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user'|'model', text: string}[]>([]);
  const [isChatting, setIsChatting] = useState(false);

  // Methodology AI Analysis State
  const [activeMethodology, setActiveMethodology] = useState<{title: string, desc: string} | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // New Upgrade States
  const [expressMode, setExpressMode] = useState(false);
  const [anomalies, setAnomalies] = useState<any[]>([]);

  // Onboarding State
  const [showWelcome, setShowWelcome] = useState(false);
  const [typingIndex, setTypingIndex] = useState(0);
  const [uploadTooltip, setUploadTooltip] = useState<string | null>(null);

  useEffect(() => {
    const hasSeen = localStorage.getItem('hasSeenOnboarding_v4');
    if (!hasSeen) {
      setShowWelcome(true);
    }
  }, []);

  const closeWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem('hasSeenOnboarding_v4', 'true');
  };

  const capabilities = [
    "① 自动化质量诊断与清洗 (Automated Quality Diagnostics)",
    "② 深度因果推断与不确定性量化 (Causal Inference & Uncertainty)",
    "③ 自然语言驱动的高级可视化 (NL-Driven Analytics & Visualization)"
  ];

  useEffect(() => {
    if (showWelcome && typingIndex < capabilities.length) {
      const timer = setTimeout(() => {
        setTypingIndex(prev => prev + 1);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [showWelcome, typingIndex]);

  const buildSysPrompt = (isExpress: boolean) => {
    let base = buildSystemPrompt('profiling') + `\n\n- CRITICAL: You MUST respond strictly in ${lang === 'en' ? 'English' : 'Chinese'}.
- 每次输出分析结论时，必须在结论后附加一个JSON代码块，格式如下（数据直接从用户上传的数据集中提取真实数值，不得编造）：
\`\`\`chart
{"chartType":"bar","title":"渠道逾期率对比","xKey":"channel","yKey":"overdue_rate","data":[{"channel":"渠道A","overdue_rate":0.05}],"insight":"A渠道逾期率比均值高47%"}
\`\`\`
- 自动选择最优图表：趋势用line，分类用bar，占比用pie(最多6类合并others)，探索两连续变量相关性用scatter，漏斗路径分析用funnel。
- 附带置信度自我评估: <confidence level="HIGH" basis="样本充足无偏" risk="低">置信度评估</confidence> 必须使用该标签。
- 在 NL2SQL 模式下，所有数字必须来自上文实际查询结果，不允许编造。
`;

    if (isExpress) {
      base += `\n【极速模式法则】\n- 严禁输出 <thinking> 思维过程。\n- 报告总字数控制在 400 字以内，快速给出最重要的 1 个数据质量发现和 1 个业务洞察即可。\n`;
    } else {
      base += `\n- 在每次深度分析前，先输出思维过程，格式严格如下（必须放在分析结论之前）：
<thinking>
STEP1: [正在做什么，如：检查数据质量，发现空值率X%]
STEP2: [正在做什么，如：计算渠道间逾期率差异]
STEP3: [正在做什么，如：运用Pearl因果阶梯识别混淆变量]
</thinking>\n`;
    }
    return base;
  };

  const runFullDiagnostic = async (data: any[], cols: any[], stats: any, fname: string, isExpress: boolean = expressMode) => {
    setIsDiagnosing(true);
    setMainDiagnosticReport('');
    
    // Sample a few rows
    const sampleRows = data.slice(0, 5);
    const dataContext = {
       fileName: fname,
       rowCount: data.length,
       columnCount: cols.length,
       schema: cols,
       preComputedStats: stats,
       samples: sampleRows
    };

    const prompt = `数据已接收。请根据【全局系统设定】的要求，立即对此数据集（${fname}，共${data.length}行）进行第一阶段的「全维度数据质量诊断」和「阶段特征报告」。\n\n数据元特征信息:\n${JSON.stringify(dataContext, null, 2)}`;

    try {
      await fetchChatStream(
        [{ role: 'user', parts: [{ text: prompt }] }],
        buildSysPrompt(isExpress),
        (chunk) => {
           setMainDiagnosticReport(prev => prev + chunk);
        },
        (errMsg) => {
           setMainDiagnosticReport(prev => prev + `\n\n**Error:** ${errMsg}`);
        }
      );
    } catch (e) {
      console.error(e);
      setMainDiagnosticReport(t('⚠️ Diagnostic core offline, check API config.', '⚠️ 诊断核心离线，请检查 API 配置。'));
    } finally {
      setIsDiagnosing(false);
    }
  };

  const handleNLQuery = async (overrideQuery?: string) => {
    const query = overrideQuery || chatQuery;
    if (!query.trim()) return;
    setChatQuery('');
    setChatHistory(prev => [...prev, { role: 'user', text: query }]);
    setIsChatting(true);

    // === Step 1: 拿真实表结构 ===
    let schema: {field: string, type: string}[] = [];
    try { schema = await describeTable('dataset'); } catch {}

    // === Step 2: 让 LLM 写 SQL ===
    setChatHistory(prev => [...prev, { role: 'model', text: '⏳ 正在生成 SQL 查询...' }]);

    const sqlPrompt = `你是 DuckDB SQL 专家。表名固定为 dataset。
表结构：${JSON.stringify(schema)}
用户问题：${query}

请只输出一段 DuckDB SQL（不要解释、不要代码块标记），LIMIT 默认 100。
如果问题无法用 SQL 回答（如纯概念解释），输出单词 NOSQL。`;

    let sqlText = '';
    await fetchChatStream(
      [{ role: 'user', parts: [{ text: sqlPrompt }] }],
      'You are a DuckDB SQL generator. Output only SQL or the literal word NOSQL.',
      (chunk) => { sqlText += chunk; },
      (errMsg) => { sqlText = ''; }
    );
    sqlText = sqlText.replace(/```sql|```/g, '').trim();

    // === Step 3: 跑 SQL ===
    let sqlResult: any = null;
    let executionBlock = '';
    if (sqlText && sqlText !== 'NOSQL' && /^(SELECT|WITH)/i.test(sqlText)) {
      sqlResult = await runSQL(sqlText);
      const preview = sqlResult.error
        ? `❌ SQL 执行失败：${sqlResult.error}`
        : `✅ 返回 ${sqlResult.rowCount} 行（${sqlResult.elapsedMs}ms）`;
      executionBlock = `\n\n**📋 执行 SQL：**\n\`\`\`sql\n${sqlText}\n\`\`\`\n\n${preview}\n`;
      if (!sqlResult.error && sqlResult.rowCount > 0) {
        executionBlock += `\n**前 10 行结果：**\n\`\`\`json\n${JSON.stringify(sqlResult.rows.slice(0, 10), null, 2)}\n\`\`\`\n`;
      }
    }

    // === Step 4: 用真实结果再让 LLM 写洞察（流式） ===
    setChatHistory(prev => {
      const newH = [...prev];
      newH[newH.length - 1] = { role: 'model', text: executionBlock };
      return newH;
    });

    const insightPrompt = sqlResult && !sqlResult.error
      ? `基于以下真实查询结果，回答用户问题"${query}"。
SQL：${sqlText}
返回行数：${sqlResult.rowCount}
结果（前30行）：${JSON.stringify(sqlResult.rows.slice(0, 30))}

请输出：1) 一句直接结论 2) 1-2 个关键数字解读 3) 一个推荐图表（直接生成 \`\`\`chart 代码块，xKey/yKey 必须是上面 SQL 返回的真实列名，data 直接用上面结果）。`
      : `用户问题"${query}"无法直接通过 SQL 回答。请用通用分析方法解答，引用已有 schema：${JSON.stringify(schema)}`;

    await fetchChatStream(
      [{ role: 'user', parts: [{ text: insightPrompt }] }],
      buildSysPrompt(false),
      (chunk) => {
        setChatHistory(prev => {
          const newH = [...prev];
          newH[newH.length - 1].text += chunk;
          return newH;
        });
      },
      (errMsg) => {
        setChatHistory(prev => {
          const newH = [...prev];
          newH[newH.length - 1].text += `\n\n**Error:** ${errMsg}`;
          return newH;
        });
      }
    );
    setIsChatting(false);
  };

  const handleMethodologyClick = async (title: string, desc: string) => {
    setActiveMethodology({ title, desc });
    setAnalysisResult('');
    setIsAnalyzing(true);

    const dataSummary = {
      totalRows: parsedData.length,
      columns: columns.map(c => c.key),
      stats: columnStats
    };

    const prompt = `请作为专业的数据分析师，结合以下我上传的数据集摘要信息，运用【${title} (${desc})】的方法输出分析思路、预期结论及商业建议。这应该是详尽的高级分析。数据摘要: ${JSON.stringify(dataSummary)}`;

    try {
      await fetchChatStream(
        [{ role: 'user', parts: [{ text: prompt }] }],
        buildSystemPrompt('analysis'),
        (chunk) => {
           setAnalysisResult(prev => prev + chunk);
        },
        (errMsg) => {
           setAnalysisResult(prev => prev + `\n\n**Error:** ${errMsg}`);
        }
      );
    } catch (e: any) {
      console.error(e);
      setAnalysisResult(t(`Generating analysis failed: ${e.message || 'Please check network or API Key.'}`, `生成分析失败: ${e.message || '请检查网络或配置正确的 API Key。'}`));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    // 隐私检查：首次上传时弹窗确认
    privacy.checkAndProceed(() => doFileUpload(file));
  };

  const doFileUpload = async (file: File) => {
    const isCsvOrTxt = file.name.endsWith('.csv') || file.name.endsWith('.txt');
    const isXlsx = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

    if (!isCsvOrTxt && !isXlsx) {
      alert(t("Unsupported file format. Please upload CSV, TXT, or Excel.", "不支持的文件格式。请上传 CSV、TXT 或 Excel。"));
      return;
    }

    try {
      let resultData: any[] = [];
      if (isCsvOrTxt) {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            processData(results.data, file);
          }
        });
      } else if (isXlsx) {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        resultData = XLSX.utils.sheet_to_json(worksheet);
        processData(resultData, file);
      }
    } catch (e) {
      console.error(e);
      alert(t("Error parsing file.", "解析文件时发生错误。"));
    }
  };

  const processData = (data: any[], file: File) => {
    if (!data || data.length === 0) return;
    
    // Create copy & limit to 50k rows for client side
    let processedData = data;
    let _truncated = false;
    if (processedData.length > 50000) {
      processedData = processedData.slice(0, 50000);
      _truncated = true;
    }

    const sample = processedData[0];
    const detectedAnomalies: any[] = [];
    
    const cols = Object.keys(sample).map(key => {
      // Basic type inference & Null Check
      const vals = processedData.map(d => d[key]);
      const validVals = vals.filter(v => v !== null && v !== undefined && v !== '');
      const missingCount = vals.length - validVals.length;
      const missingRateNum = (missingCount / processedData.length) * 100;
      
      const isNumeric = validVals.length > 0 && validVals.slice(0, 100).every(v => !isNaN(Number(v)));
      const isDate = validVals.length > 0 && validVals.slice(0, 100).some(v => typeof v === 'string' && /^\d{4}[-/]\d{2}[-/]\d{2}/.test(v));
      const uniqueVals = new Set(validVals.slice(0, 1000)).size;

      let inferredType = 'TEXT-FREE';
      if (isDate) inferredType = 'DATETIME';
      else if (isNumeric) inferredType = 'NUMERIC';
      else if (uniqueVals <= 20 && validVals.length > 100) inferredType = 'CATEGORICAL-LOW';
      else if (uniqueVals > 20 && uniqueVals < 500) inferredType = 'CATEGORICAL-HIGH';

      if (missingRateNum > 50) {
        detectedAnomalies.push({ type: 'danger', field: key, msg: `缺失值超过 50% (${missingRateNum.toFixed(1)}%)，可能影响分析` });
      } else if (missingRateNum > 20) {
        detectedAnomalies.push({ type: 'warning', field: key, msg: `存在 ${missingRateNum.toFixed(1)}% 缺失值，建议清洗` });
      }

      if (inferredType === 'TEXT-FREE' && uniqueVals > 500 && validVals.length > 1000) {
         detectedAnomalies.push({ type: 'warning', field: key, msg: '基数过高的自由文本，推荐使用 NER 实体提取' });
      }

      return {
        key,
        type: inferredType,
        missingRate: missingRateNum.toFixed(1) + '%',
      };
    });

    // Compute basic stats
    const stats: any = {};
    cols.filter(c => c.type === 'NUMERIC').forEach(c => {
      const numVals = processedData.map(d => Number(d[c.key])).filter(v => !isNaN(v));
      if (numVals.length > 0) {
        let std = 0, mean = 0, minVal = 0, maxVal = 0;
        try {
          minVal = ss.min(numVals);
          maxVal = ss.max(numVals);
          mean = ss.mean(numVals);
          std = ss.standardDeviation(numVals);
          
          let zeros = 0;
          let negatives = 0;
          numVals.forEach(v => {
            if (v === 0) zeros++;
            if (v < 0) negatives++;
          });
          
          if (zeros / numVals.length > 0.8) {
             detectedAnomalies.push({ type: 'warning', field: c.key, msg: '超过 80% 的值为 0，请确认是否为稀疏矩阵或记录缺失' });
          }
          if (c.key.toLowerCase().includes('price') || c.key.toLowerCase().includes('amount') || c.key.toLowerCase().includes('sales')) {
             if (negatives > 0) detectedAnomalies.push({ type: 'danger', field: c.key, msg: `金额/价格类字段存在 ${negatives} 个负数` });
          }
          
        } catch(e) {}
        
        stats[c.key] = {
          min: minVal,
          max: maxVal,
          mean: mean.toFixed(2),
          std: std.toFixed(2),
          uniqueApproximation: new Set(numVals.slice(0,100)).size
        };
      }
    });

    // Complete processData cleanly
    setParsedData(processedData);
    setColumns(cols);
    setColumnStats(stats);
    setFileName(file.name + (_truncated ? ' (已限制前5万行)' : ''));
    setAnomalies(detectedAnomalies);
    setShowRealData(true);
    setChatHistory([]);
    setMainDiagnosticReport('');

    // Trigger AI Diagnostic
    runFullDiagnostic(processedData, cols, stats, file.name, expressMode);

    registerJsonAsTable('dataset', processedData)
      .then(() => console.log('[DuckDB] dataset registered:', processedData.length, 'rows'))
      .catch(err => console.error('[DuckDB] register failed', err));

    // Add to memory
    const previewStr = JSON.stringify(processedData.slice(0, 3));
    addRecord({
      fileName: file.name,
      fileType: file.name.split('.').pop() || 'unknown',
      fileSize: file.size,
      dataPreview: previewStr,
      fieldCount: cols.length,
      rowCount: processedData.length,
      summary: `Automated Diagnostic Protocol Initiated for ${cols.length} features.`,
      stats: JSON.stringify(stats)
    });
  };

  const loadMemoryRecord = (record: any) => {
    selectRecord(record);
    setShowRealData(false); 
  };

  return (
    <div className="flex h-screen w-full bg-[#F5F1EA] overflow-hidden">

      {/* Privacy Consent Modal */}
      {privacy.needsConsent && (
        <PrivacyConsent trigger={privacy.needsConsent} onConsent={privacy.handleConsent} />
      )}
      
      {/* 🚀 STEP 1: WELCOME OVERLAY */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full flex flex-col mx-4"
            >
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-serif italic font-bold text-gray-900 mb-2">SYNTHESIS CORE V4.0</h2>
              <p className="text-gray-500 mb-6 line-clamp-2">欢迎来到认知级数据智能分析引擎。在这里，我们将冰冷的数据转化为战略资产。</p>
              
              <div className="flex flex-col gap-3 mb-8">
                {capabilities.map((text, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: idx < typingIndex ? 1 : 0, x: idx < typingIndex ? 0 : -10 }}
                    transition={{ duration: 0.4 }}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100"
                  >
                    <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                    <span className="text-sm font-medium text-gray-800">{text}</span>
                  </motion.div>
                ))}
              </div>

              <motion.button 
                initial={{ opacity: 0 }}
                animate={{ opacity: typingIndex >= capabilities.length ? 1 : 0 }}
                onClick={closeWelcome}
                className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg"
              >
                开始探索 (Start Exploring)
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LEFT AREA: Main Content */}
      <div className="flex-1 overflow-y-auto w-full p-4 md:p-8 flex flex-col gap-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-gray-200 pb-6 w-full max-w-[1400px] mx-auto">
          <div>
            <h1 className="text-3xl md:text-5xl font-serif italic text-gray-900 tracking-tight">
              {showRealData ? '数据探索与推断' : t('诊断与决策作战室', 'Diagnostic & Decision War Room')}
            </h1>
            <p className="font-mono text-xs text-gray-500 uppercase tracking-[0.2em] mt-3">
              {showRealData ? 'SYNTHESIS CORE V4.0 / Causal & Uncertainty Engine' : 'SYNTHESIS CORE V4.0 / Cognitive Data Intelligence'}
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-3">
             {!showRealData && (
                <div className="flex items-center gap-2 bg-white px-4 py-2 border border-blue-200 rounded-full shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                  <span className="text-xs font-mono font-medium text-blue-800">AI Engine Online: Ready</span>
                </div>
             )}
             {showRealData && (
               <button onClick={() => setShowRealData(false)} className="bg-black text-white text-xs px-4 py-2 rounded-lg font-bold shadow-md hover:bg-gray-800 transition-colors">
                 Exit Analysis
               </button>
             )}
          </div>
        </div>

        <div className="w-full max-w-[1400px] mx-auto relative">
          
          {/* STEP 3: TOAST TOOLTIP FOR UPLOAD SUCCESS / PRESET */}
          <AnimatePresence>
            {uploadTooltip && (
              <motion.div
                initial={{ opacity: 0, y: -20, x: '-50%' }}
                animate={{ opacity: 1, y: 0, x: '-50%' }}
                exit={{ opacity: 0, y: -20, x: '-50%' }}
                className="absolute top-0 left-1/2 z-50 transform -translate-x-1/2 -mt-14 px-6 py-3 bg-indigo-600 text-white text-sm font-medium rounded-full shadow-xl flex items-center gap-2 whitespace-nowrap"
              >
                <Zap className="w-4 h-4 text-yellow-300" />
                {uploadTooltip}
              </motion.div>
            )}
          </AnimatePresence>

          {/* UPLOAD ZONE AND EXAMPLE DATA SETS */}
          {!showRealData && (
            <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto mt-8">
              
              <div className="w-full flex items-center justify-center gap-3">
                 <button
                   onClick={() => setExpressMode(false)}
                   className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${!expressMode ? 'bg-[#0F0F0F] text-white shadow-lg' : 'bg-white text-gray-500 border border-gray-200'}`}
                 >
                   深度分析模式（含完整思维链）
                 </button>
                 <button
                   onClick={() => setExpressMode(true)}
                   className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${expressMode ? 'bg-[#FF3B00] text-white shadow-lg' : 'bg-white text-gray-500 border border-gray-200'}`}
                 >
                   ⚡ Express 极速模式（省略思考，直击要点）
                 </button>
              </div>

              {/* 🚀 STEP 3: UPLOAD GUIDE */}
              <div 
                className={`relative border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center transition-all bg-white cursor-pointer overflow-hidden group
                  ${isDragging ? 'border-indigo-500 bg-indigo-50/50 scale-[1.02]' : 'border-gray-200 hover:border-gray-400'}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); const file = e.dataTransfer.files[0]; handleFileUpload(file); }}
                onClick={() => fileInputRef.current?.click()}
              >
                <input type="file" ref={fileInputRef} className="hidden" accept=".csv,.xlsx,.txt" onChange={(e) => { if(e.target.files) handleFileUpload(e.target.files[0]); }} />
                
                {/* Background animated blob */}
                <div className={`absolute w-full h-full inset-0 pointer-events-none transition-opacity duration-500 flex items-center justify-center ${isDragging ? 'opacity-100' : 'opacity-0'}`}>
                  <div className="w-[120%] h-[120%] bg-gradient-to-tr from-indigo-100/40 to-blue-50/40 rounded-full blur-3xl animate-spin-slow"></div>
                </div>

                <div className="relative z-10 flex flex-col items-center">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-5 transition-all duration-300 ${isDragging ? 'bg-indigo-600 text-white scale-110 shadow-xl shadow-indigo-200' : 'bg-gray-50 text-gray-400 group-hover:bg-indigo-50 font-medium group-hover:text-indigo-600'}`}>
                    <Upload className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">拖拽文件或点击上传</h3>
                  <p className="text-gray-500 text-sm font-medium mb-1">Upload CSV, Excel, or TXT file here.</p>
                  
                  {/* Tooltip for format limits */}
                  <div className="flex items-center gap-1 text-[11px] font-mono text-gray-400 mt-4 px-3 py-1 bg-gray-50 rounded-full">
                    <Info className="w-3 h-3" />
                    <span>支持 .csv / .xlsx / .txt 格式，单文件限制 ≤50MB</span>
                  </div>
                  
                  <button className="mt-8 px-6 py-3 bg-gray-900 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-indigo-600 transition-colors shadow-lg">
                    Browse Local Files
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* REAL DATA VIEW */}
          {showRealData && (
                  <AnimatePresence>
               <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                 
                 <div className="lg:col-span-12 bg-white rounded-3xl p-4 border border-gray-100 shadow-sm">
                   <WorkflowStepper steps={[
                     {
                       id: 'upload',
                       label: '① 上传数据',
                       desc: `${fileName} · ${parsedData.length} 行`,
                       status: 'done'
                     },
                     {
                       id: 'profile',
                       label: '② 数据画像',
                       desc: anomalies.length > 0 ? `发现 ${anomalies.length} 项风险` : '字段诊断完成',
                       status: isDiagnosing ? 'active' : (mainDiagnosticReport ? 'done' : 'pending')
                     },
                     {
                       id: 'sql',
                       label: '③ SQL 探索',
                       desc: chatHistory.length > 0 ? `已发起 ${Math.ceil(chatHistory.length/2)} 轮查询` : '点这里开始问问题',
                       status: chatHistory.length > 0 ? 'done' : (mainDiagnosticReport ? 'active' : 'pending')
                     },
                     {
                       id: 'method',
                       label: '④ 方法论分析',
                       desc: activeMethodology ? activeMethodology.title : '尚未应用',
                       status: analysisResult ? 'done' : 'pending'
                     },
                     {
                       id: 'report',
                       label: '⑤ 导出 BI 报告',
                       desc: '一键生成完整报告',
                       status: 'pending',
                       onClick: () => {
                         if (parsedData.length === 0) return;
                         try {
                           const payload = {
                             fileName,
                             data: parsedData.slice(0, 500),
                             columns,
                             columnStats,
                             _truncated: parsedData.length > 500,
                             _originalRowCount: parsedData.length,
                             exportedAt: new Date().toISOString()
                           };
                           sessionStorage.setItem('dc_pending_dataset', JSON.stringify(payload));
                           window.location.href = '/report?from=data-analysis';
                         } catch (e) {
                           console.error('Failed to store dataset', e);
                           window.location.href = '/report';
                         }
                       }
                     }
                   ]} />
                 </div>

                 {/* Main AI Diagnostic Panel */}
                 <div className="lg:col-span-8 flex flex-col gap-6">

                    {expressMode && !isDiagnosing && (
                      <div className="bg-amber-100/50 border border-amber-200 text-amber-900 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                         <div className="flex items-center gap-2">
                           <Zap className="w-5 h-5 text-amber-500" />
                           <span className="font-medium text-sm">当前为 Express 极速模式，诊断已精简。</span>
                         </div>
                         <button 
                           onClick={() => { setExpressMode(false); runFullDiagnostic(parsedData, columns, columnStats, fileName, false); }} 
                           className="px-4 py-2 bg-white rounded-lg text-sm font-bold border border-amber-300 hover:bg-amber-50 transition-colors shadow-sm text-indigo-600"
                         >
                           切换完整诊断（带思维链）
                         </button>
                      </div>
                    )}

                    {anomalies.length > 0 && (
                      <div className="bg-red-50 border border-red-100 rounded-3xl p-6">
                        <h3 className="font-bold text-red-900 mb-4 flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-red-500" />
                          红灯预警：发现 {anomalies.length} 处数据异常
                        </h3>
                        <div className="space-y-3">
                          {anomalies.map((a, idx) => (
                            <div key={idx} className="flex items-start gap-3 bg-white p-3 rounded-xl border border-red-50">
                               <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${a.type === 'danger' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>{a.type}</div>
                               <div>
                                 <span className="text-sm font-bold text-gray-900 mr-2">[{a.field}]</span>
                                 <span className="text-sm text-gray-600">{a.msg}</span>
                               </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col">
                      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                          <BrainCircuit className="w-6 h-6" />
                        </div>
                        <div className="flex-1 flex items-center justify-between">
                           <div>
                             <h2 className="font-serif italic font-bold text-2xl text-gray-900">核心全息诊断报告</h2>
                             <div className="flex items-center gap-2 text-xs font-mono text-gray-500 mt-1">
                               <span>{fileName}</span> • <span>{parsedData.length} records</span> • 
                               <span className="text-emerald-500 flex items-center gap-1"><Zap className="w-3 h-3"/> Active</span>
                             </div>
                           </div>
                           {!isDiagnosing && (
                             <button
                               onClick={() => {
                                 try {
                                   sessionStorage.setItem('dc_pending_dataset', JSON.stringify({
                                     data: parsedData.slice(0, 500),
                                     columns,
                                     fileName,
                                     _truncated: parsedData.length > 500
                                   }));
                                 } catch (e) {
                                   console.error('Storage failed', e);
                                 }
                                 window.location.href = '/report?from=data-analysis';
                               }}
                               className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center gap-2"
                             >
                               <LayoutDashboard className="w-4 h-4" />
                               一键转入 SmartReport 生成看板
                             </button>
                           )}
                        </div>
                      </div>

                      <div className="flex-1">
                        {isDiagnosing ? (
                          <div className="flex flex-col items-center justify-center py-20 text-indigo-400">
                             <Loader2 className="w-10 h-10 animate-spin mb-4 text-indigo-500" />
                             <p className="font-mono text-sm tracking-widest uppercase">Executing Phase 0-2 Diagnostics...</p>
                          </div>
                        ) : (
                          <div className="w-full">
                            <ThinkingProcess rawText={mainDiagnosticReport} isStreaming={isDiagnosing} onDrilldown={(q) => handleNLQuery(q)} />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Basic Data Summary & Types */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6">
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Database className="w-4 h-4 text-gray-500"/>字段特征图谱扫描</h3>
                      <div className="flex flex-wrap gap-2">
                        {columns.map((c, i) => (
                          <div key={i} className="flex flex-col border border-gray-100 rounded-xl p-3 bg-gray-50 min-w-[120px]">
                            <span className="text-xs font-bold text-gray-800 truncate mb-1">{c.key}</span>
                            <span className="text-[10px] font-mono text-indigo-600 uppercase flex items-center gap-1">
                               {c.type}
                            </span>
                            <span className="text-[9px] text-gray-400 mt-1">Missing: {c.missingRate}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                 </div>
                 
                 {/* Sidebar & NL2Analysis */}
                 <div className="lg:col-span-4 flex flex-col gap-6">
                    
                    {/* NL2Analysis Chat */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col h-[500px]">
                      <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-3xl flex items-center justify-between">
                         <div className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                           <h3 className="font-bold text-sm text-gray-800">NL2Analysis 查询引擎</h3>
                         </div>
                         <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                           SQL Engine: DuckDB-WASM
                         </span>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {chatHistory.length === 0 && (
                          <div className="text-center text-xs text-gray-400 mt-10">
                            通过自然语言查询数据洞察... <br/>例如："哪个渠道的逾期率最高？"
                          </div>
                        )}
                        {chatHistory.map((msg, i) => (
                           <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm w-full'}`}>
                                {msg.role === 'user' ? msg.text : <ThinkingProcess rawText={msg.text} isStreaming={isChatting && i === chatHistory.length - 1} onDrilldown={(q) => handleNLQuery(q)} />}
                              </div>
                           </div>
                        ))}
                        {isChatting && (
                          <div className="flex justify-start">
                             <div className="bg-gray-100 text-gray-500 rounded-2xl rounded-bl-sm p-3 text-sm flex items-center gap-2">
                               <Loader2 className="w-4 h-4 animate-spin" /> 查询融合中...
                             </div>
                          </div>
                        )}
                      </div>

                      <div className="p-3 bg-white border-t border-gray-100">
                        <div className="relative">
                          <input 
                            type="text" 
                            className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                            placeholder="输入自然语言提问..."
                            value={chatQuery}
                            onChange={e => setChatQuery(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleNLQuery()}
                          />
                          <button onClick={() => handleNLQuery()} className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Methodologies */}
                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col">
                       <h3 className="flex items-center gap-2 font-bold text-sm text-gray-800 mb-4 border-b border-gray-100 pb-3"><Target className="w-4 h-4 text-emerald-500"/> 高级分析工具箱</h3>
                       <div className="flex flex-col gap-2">
                         {[
                           {title: '因果推断 (Pearl Hierarchy)', desc: 'DAG因果分析与干预效应'},
                           {title: '行业模板 (RFM / 归因 / 漏斗)', desc: '商业领域纵深专项解析'},
                           {title: '不确定性预测 (贝叶斯时序)', desc: '置信区间与反事实推演'},
                           {title: '可解释AI (SHAP / LIME)', desc: '多维特征重要性诊断'}
                         ].map((m, i) => (
                           <div key={i} onClick={() => handleMethodologyClick(m.title, m.desc)} className="p-3 border border-gray-200 rounded-xl hover:border-indigo-500 cursor-pointer transition-colors flex justify-between items-center group bg-gray-50 hover:bg-white">
                             <div>
                               <h4 className="font-bold text-gray-800 text-xs">{m.title}</h4>
                               <p className="text-[10px] text-gray-500 uppercase font-mono mt-1">{m.desc}</p>
                             </div>
                             <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-500" />
                           </div>
                         ))}
                       </div>
                    </div>
                 </div>

               </motion.div>
             </AnimatePresence>
          )}

        </div>
      </div>

      {/* RIGHT SIDEBAR: MEMORY PANEL */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col shrink-0">
        <div className="h-16 border-b border-gray-200 flex items-center justify-between px-5 bg-gray-50 shrink-0">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-gray-700" />
            <span className="font-bold text-gray-900">空间记忆体 (Memory)</span>
          </div>
          {records.length > 0 && (
            <button onClick={clearAllRecords} className="text-xs text-red-500 hover:text-red-700 font-bold transition-colors">Clear All</button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
          {records.length === 0 ? (
             <div className="text-center text-sm text-gray-400 mt-10">暂无分析历史<br/>No upload records found.</div>
          ) : (
            records.map(record => (
              <div 
                key={record.id} 
                className={`bg-white border p-4 rounded-xl shadow-sm transition-all relative group cursor-pointer ${selectedRecord?.id === record.id ? 'border-blue-500 ring-1 ring-blue-500/50' : 'border-gray-200 hover:border-blue-300'}`}
                onClick={() => loadMemoryRecord(record)}
              >
                <div className="flex justify-between items-start mb-2 pr-6">
                  <h4 className="font-bold text-gray-800 text-sm truncate" title={record.fileName}>{record.fileName}</h4>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteRecord(record.id); }}
                    className="absolute right-3 top-3 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-3 border-b border-gray-100 pb-2">
                  {formatFileSize(record.fileSize)} • {record.rowCount} R • {record.fieldCount} C
                </div>
                <div className="text-xs text-gray-600 font-medium line-clamp-2">
                  {record.summary || 'Uploaded dataset waiting for processing.'}
                </div>
                <div className="mt-3 text-right">
                  <span className="text-[10px] text-gray-400">{formatDate(record.uploadTime)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Analysis Modal */}
      <AnimatePresence>
        {activeMethodology && (
          <motion.div 
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          >
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => !isAnalyzing && setActiveMethodology(null)}></div>
            <motion.div 
              initial={{scale: 0.95, opacity: 0, y: 20}}
              animate={{scale: 1, opacity: 1, y: 0}}
              exit={{scale: 0.95, opacity: 0, y: 20}}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col relative z-10 overflow-hidden border border-gray-200"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                    <BrainCircuit className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                       {activeMethodology.title}
                       {isAnalyzing && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
                    </h2>
                    <p className="text-xs text-gray-500 font-mono uppercase tracking-wider">{activeMethodology.desc}</p>
                  </div>
                </div>
                {!isAnalyzing && (
                  <button onClick={() => setActiveMethodology(null)} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-white relative">
                {(!analysisResult && isAnalyzing) ? (
                  <div className="flex flex-col items-center justify-center h-48 text-gray-400 gap-4">
                    <BrainCircuit className="w-12 h-12 animate-pulse text-blue-200" />
                    <p className="font-mono text-sm uppercase tracking-widest animate-pulse">Running AI Inference...</p>
                  </div>
                ) : (
                  <div className="w-full">
                    <ThinkingProcess rawText={analysisResult} isStreaming={isAnalyzing} onDrilldown={(q) => handleNLQuery(q)} />
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
