import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Settings, RefreshCw, AlertCircle, Maximize2, X, BrainCircuit, Activity, LayoutTemplate, FileText, ChevronRight, Zap, Database, Terminal, LineChart, PieChart, MessageSquare, Blocks, Paperclip, ChevronDown, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../lib/LanguageContext';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { fetchChatStream, ChatMessage } from '../lib/api';
import { buildSystemPrompt } from '../prompts';
import { useCanvasStore } from '../lib/canvas-engine/orchestrator';
import { parseCanvasDirective } from '../lib/canvas-engine/parser';
import { DynamicCanvas } from '../components/canvas/DynamicCanvas';
import { interactionBus } from '../lib/canvas-engine/interaction-bus';
import { PROVIDERS, getLLMConfig, saveLLMConfig, getProviderMeta, type LLMConfig } from '../lib/llm-config';

export function AIAssistant() {
  const { t, lang } = useLanguage();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<any[]>([]);
  
  const store = useCanvasStore();

  const [showSettings, setShowSettings] = useState(false);
  const [llmCfg, setLlmCfg] = useState<LLMConfig>(getLLMConfig());
  const currentMeta = getProviderMeta(llmCfg.provider);


  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedData, setUploadedData] = useState<any[] | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');

  useEffect(() => {
    // Initial proactive alert
    setMessages([
      { role: 'model', type: 'text', content: t('Proactive Copilot initialized. I am ready for NL-based querying and strategy generation.', '全局主动式伴随智能体 (Proactive Copilot) 已上线。支持基于自然语言的智能问答与自动策略生成。') }
    ]);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, store.blocks]);

  useEffect(() => {
    const handleInteraction = (e: any) => {
      let promptText = '';
      if (e.type === 'chart_point_click') {
        promptText = `I noticed something interesting at ${JSON.stringify(e.dataPoint)}. Can you analyze this specific point?`;
      } else if (e.type === 'metric_drilldown') {
        promptText = `Please drill down into the metric ${e.metric} by dimension ${e.dimension}.`;
      } else if (e.type === 'block_question') {
        promptText = e.question;
      } else if (e.type === 'parameter_change') {
        promptText = `Please update the parameter ${e.param} to ${e.value} and recalculate.`;
      } else {
        return; // default interactions like pin or close don't trigger messages
      }
      
      if (promptText) {
         sendMessage(promptText);
      }
    };

    interactionBus.on('interaction', handleInteraction);
    return () => interactionBus.off('interaction', handleInteraction);
  }, [messages, isTyping]);

  const handleSaveLLMConfig = () => {
    saveLLMConfig(llmCfg);
    setShowSettings(false);
  };

  const handleProviderChange = (id: any) => {
    const meta = getProviderMeta(id);
    setLlmCfg({
      provider: id,
      apiKey: '',
      baseUrl: meta.defaultBaseUrl,
      model: meta.defaultModel,
    });
  };

  const handleAction = (action: string) => {
    // No-op for now
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadedFileName(file.name);
    const isXlsx = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

    try {
      if (isXlsx) {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const resultData = XLSX.utils.sheet_to_json(worksheet);
        setUploadedData(resultData);
        setMessages(p => [...p, { role: 'model', type: 'text', content: t(`Successfully loaded **${file.name}** (${resultData.length} rows). You can now ask questions about this data.`, `我已经成功读取您的文件：**${file.name}** (共 ${resultData.length} 行数据)。您可以随时就这份数据向我提问。`) }]);
      } else {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            setUploadedData(results.data);
            setMessages(p => [...p, { role: 'model', type: 'text', content: t(`Successfully loaded **${file.name}** (${results.data.length} rows). You can now ask questions about this data.`, `我已经成功读取您的文件：**${file.name}** (共 ${results.data.length} 行数据)。您可以随时就这份数据向我提问。`) }]);
          }
        });
      }
    } catch (err) {
      console.error(err);
      setMessages(p => [...p, { role: 'model', type: 'text', content: t(`Error reading file ${file.name}.`, `读取文件 ${file.name} 时出现错误。`) }]);
    }
    
    // Clear input so same file can be re-selected if needed
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input.trim());
      setInput('');
    }
  };

  const sendMessage = async (val: string) => {
    if (!val.trim()) return;
    setMessages(p => [...p, { role: 'user', type: 'text', content: val }]);
    setIsTyping(true);

    try {
      const requestHeaders: Record<string, string> = { 'Content-Type': 'application/json' };

      let systemPromptText = buildSystemPrompt('assistant');
      if (uploadedData && uploadedData.length > 0) {
        const rowCount = uploadedData.length;
        const cols = Object.keys(uploadedData[0]);
        let schemaStr = "Inferred schema:\\n";
        cols.forEach(c => {
          let uniqueCount = new Set(uploadedData.slice(0, 1000).map(r => r[c])).size;
          schemaStr += `- ${c} | sample unique values (up to 1000): ${uniqueCount}\\n`;
        });
        
        const first5 = uploadedData.slice(0, 5);
        const midIdx = Math.max(0, Math.floor(uploadedData.length / 2) - 2);
        const random5 = uploadedData.slice(midIdx, midIdx + 5);
        const last5 = uploadedData.slice(-5);
        
        systemPromptText += `\n\n═══ USER DATA CONTEXT ═══\nFile: ${uploadedFileName}\nTotal rows: ${rowCount}\nTotal columns: ${cols.length}\n\n${schemaStr}\n\nSample (first 5 rows):\n${JSON.stringify(first5)}\n\nSample (random 5 rows from middle):\n${JSON.stringify(random5)}\n\nSample (last 5 rows):\n${JSON.stringify(last5)}\n═══════════════════════\n`;
      }

      setMessages(p => [...p, { role: 'model', type: 'text', content: '' }]);
      setIsTyping(false); // Remove "typing" indicator immediately since it's streaming now
      let fullText = '';

      // Filter and format history
      // Remove ui_action, keep only text
      const historyTexts = messages.filter(m => m.type !== 'ui_action' && m.content.trim() !== '');
      
      // Context compression: if more than 10 turns (20 messages), summarize/compress older ones.
      // Easiest client-side simulation without a separate API call: 
      // just pass a "system note" indicating older context is truncated but keeping the most recent 10 messages (5 turns).
      let formattedHistory: ChatMessage[] = historyTexts.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

      // 按字符数估算 token（粗略 1 字符 ≈ 0.5-1 token），保留累计 ≤ 80k 字符的最近消息
      // 同时硬限制最多 20 条避免极端情况
      const MAX_HISTORY_CHARS = 80000;
      const MAX_HISTORY_MESSAGES = 20;
      let cumChars = 0;
      const truncatedHistory: ChatMessage[] = [];
      for (let i = formattedHistory.length - 1; i >= 0; i--) {
        const msgChars = formattedHistory[i].parts.reduce((sum, p) => sum + (p.text?.length || 0), 0);
        if (truncatedHistory.length >= MAX_HISTORY_MESSAGES || cumChars + msgChars > MAX_HISTORY_CHARS) {
          break;
        }
        cumChars += msgChars;
        truncatedHistory.unshift(formattedHistory[i]);
      }

      if (truncatedHistory.length < formattedHistory.length) {
        const omitted = formattedHistory.length - truncatedHistory.length;
        systemPromptText += `\n\n[SYSTEM NOTE: Conversation history is too long. The earliest ${omitted} message(s) have been omitted to fit context window. Only the recent ${truncatedHistory.length} messages are included.]`;
      }
      formattedHistory = truncatedHistory;

      // Add the current user query
      formattedHistory.push({ role: 'user', parts: [{ text: val }] });

      await fetchChatStream(
        formattedHistory,
        systemPromptText,
        (chunk) => {
          fullText += chunk;
          setMessages(p => {
             const newM = [...p];
             newM[newM.length - 1].content += chunk;
             return newM;
          });
          
          try {
             const directive = parseCanvasDirective(fullText);
             if (directive && (Array.isArray(directive.blocks) || directive.mode === 'clear')) {
               store.applyDirective({
                 ...directive,
                 blocks: directive.blocks || []
               }, true);
             }
          } catch (e) {
             // ignore partial parse errors
          }
        },
        (errMsg) => {
          setMessages(p => {
             const newM = [...p];
             newM[newM.length - 1].content += `\n\n**Error:** ${errMsg}`;
             return newM;
          });
        },
        { includeCanvasProtocol: true }
      );
      
      // Strip JSON blocks to avoid printing JSON to user
      const cleanContent = fullText.replace(/```(?:.*canvas-directive|json)\s*([\s\S]*?)\s*(?:```|$)/ig, '').trim();
      
      setMessages(p => {
        const newM = [...p];
        newM[newM.length - 1].content = cleanContent || '✨ 分析完成。';
        return newM;
      });

      const directive = parseCanvasDirective(fullText);
      if (directive && (Array.isArray(directive.blocks) || directive.mode === 'clear')) {
        store.applyDirective({
          ...directive,
          blocks: directive.blocks || []
        });
        setMessages(p => [...p, { 
          role: 'model', 
          type: 'ui_action', 
          content: directive.narration || '智能匹配完成：我已将分析视图投射在右侧画布上，您可进一步交互。' 
        }]);
      } else if (directive) {
        console.warn('Found directive but no valid blocks', directive);
      }

    } catch (e: any) {
      setIsTyping(false);
      console.error(e);
      setMessages(p => [...p, { role: 'model', type: 'text', content: e.message || '抱歉，连接到智能网络分析引擎时出现问题，请检查网络或重试。' }]);
    }
  };

  return (
    <div className="flex w-full h-screen bg-[#E5E5E5] overflow-hidden pt-14">
      
      {/* 侧边栏：伴随智能体 (Copilot Chat) */}
      <div className="w-full md:w-[450px] bg-[#F5F4F0] border-r border-[#0F0F0F] flex flex-col shrink-0 relative z-20 shadow-[4px_0_0_#0F0F0F] h-full">
        <div className="h-16 border-b border-[#0F0F0F] flex items-center justify-between px-5 bg-white shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#1A1A1A] rounded-full flex items-center justify-center">
              <BrainCircuit className="w-4 h-4 text-white" />
            </div>
            <span className="font-serif italic font-bold text-lg text-[#1A1A1A]">Data Copilot</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(true)}
              className="text-[10px] font-mono bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full flex items-center gap-1.5"
              title="点击切换 Provider"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {currentMeta.name} · {llmCfg.model || currentMeta.defaultModel}
            </button>
            <span className="flex items-center gap-1.5 px-2 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold uppercase tracking-widest border border-emerald-300">
               <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> LLM Online
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5" ref={scrollRef}>
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div key={i} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                 <div className={`max-w-[85%] text-sm leading-relaxed p-4 border border-[#0F0F0F] font-medium ${msg.role === 'user' ? 'bg-[#0F0F0F] text-white shadow-[-4px_4px_0_#A3A3A3]' : 'bg-white shadow-[4px_4px_0_#0F0F0F]'}`}>
                   {msg.role === 'model' && msg.type !== 'text' && (
                     <div className="mb-2 pb-2 border-b border-[#0F0F0F]/10 flex items-center gap-2">
                       <Zap className="w-4 h-4 text-[#FF3B00]" />
                       <span className="text-[10px] font-mono font-bold text-[#FF3B00] uppercase tracking-widest">System Alert</span>
                     </div>
                   )}
                   {msg.role === 'model' && msg.type === 'text' ? (
                     <div className="prose prose-sm prose-gray max-w-none">
                       <ReactMarkdown>{msg.content}</ReactMarkdown>
                     </div>
                   ) : (
                     msg.content
                   )}
                 </div>
                 
                 {msg.type === 'ui_action' && (
                    <div className="mt-2 text-[10px] text-gray-500 font-mono uppercase font-bold flex items-center gap-1">
                      <LayoutTemplate className="w-3 h-3"/> Canvas Up-To-Date
                    </div>
                 )}
              </motion.div>
            ))}
            
            {isTyping && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} className="bg-white border border-[#0F0F0F] px-4 py-3 shadow-[4px_4px_0_#0F0F0F] flex items-center gap-2 w-fit">
                <div className="w-1.5 h-1.5 bg-[#0F0F0F] rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-[#0F0F0F] rounded-full animate-bounce delay-100"></div>
                <div className="w-1.5 h-1.5 bg-[#0F0F0F] rounded-full animate-bounce delay-200"></div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-4 bg-white border-t border-[#0F0F0F] flex flex-col gap-3">
          <div className="relative border border-[#0F0F0F] shadow-[4px_4px_0_#0F0F0F] bg-white group focus-within:shadow-[2px_2px_0_#0F0F0F] transition-all flex items-center">
             <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".csv,.xlsx,.xls,.txt" />
             <button onClick={() => fileInputRef.current?.click()} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-[#0F0F0F] transition-colors border-r border-[#0F0F0F]/10 shrink-0">
               <Paperclip className="w-4 h-4" />
             </button>
             <textarea 
               value={input}
               onChange={e => setInput(e.target.value)}
               onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
               placeholder="使用自然语言查询或上传数据(CSV/Excel)..."
               className="w-full bg-transparent p-3 pr-12 text-sm focus:outline-none resize-none placeholder:text-gray-400 font-medium border-none focus:ring-0"
               rows={2}
             />
             <button onClick={handleSend} className="absolute right-2 bottom-2 w-8 h-8 bg-[#0F0F0F] flex items-center justify-center hover:bg-gray-800 transition-colors cursor-pointer shrink-0">
               <Send className="w-4 h-4 text-white ml-0.5" />
             </button>
          </div>
          <div className="flex justify-between items-center px-1">
             <button 
               onClick={() => setShowSettings(true)}
               className="text-gray-500 hover:text-[#0F0F0F] transition-colors flex items-center gap-1.5 text-xs font-mono font-bold"
             >
               <Settings className="w-3.5 h-3.5" /> API Key Settings
             </button>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">大模型 Provider 配置</h2>
                  <p className="text-xs text-gray-500 mt-1">支持任意厂商：Gemini / OpenAI / Claude / DeepSeek / Kimi / GLM / Qwen / Ollama 等</p>
                </div>
                <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Provider 网格选择 */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">① 选择 Provider</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {PROVIDERS.map(p => (
                      <button
                        key={p.id}
                        onClick={() => handleProviderChange(p.id)}
                        className={`relative px-3 py-3 rounded-xl border text-left transition-all ${
                          llmCfg.provider === p.id
                            ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-800">{p.name}</span>
                          {p.free && (
                            <span className="text-[9px] bg-emerald-500 text-white px-1.5 py-0.5 rounded-full font-bold">FREE</span>
                          )}
                        </div>
                        {p.hint && <p className="text-[10px] text-gray-500 mt-1 line-clamp-1">{p.hint}</p>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* API Key */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-bold text-gray-700">② API Key</label>
                    {currentMeta.apiKeyHelpUrl && (
                      <a href={currentMeta.apiKeyHelpUrl} target="_blank" rel="noreferrer"
                         className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
                        获取 Key <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <input
                    type="password"
                    value={llmCfg.apiKey}
                    onChange={e => setLlmCfg({ ...llmCfg, apiKey: e.target.value })}
                    placeholder={llmCfg.provider === 'ollama' ? '本地 Ollama 任意填写 (如 ollama)' : '粘贴你的 API Key'}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    Key 仅保存在浏览器本地（localStorage），不会上传到任何服务器。
                  </p>
                </div>

                {/* 模型 */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">③ 模型</label>
                  {currentMeta.modelOptions.length > 0 ? (
                    <div className="flex gap-2 flex-wrap">
                      {currentMeta.modelOptions.map(m => (
                        <button
                          key={m}
                          onClick={() => setLlmCfg({ ...llmCfg, model: m })}
                          className={`px-3 py-2 rounded-lg text-xs font-mono border transition-all ${
                            (llmCfg.model || currentMeta.defaultModel) === m
                              ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                      <input
                        type="text"
                        value={llmCfg.model || ''}
                        onChange={e => setLlmCfg({ ...llmCfg, model: e.target.value })}
                        placeholder="或自定义模型名"
                        className="flex-1 min-w-[180px] px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono"
                      />
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={llmCfg.model || ''}
                      onChange={e => setLlmCfg({ ...llmCfg, model: e.target.value })}
                      placeholder="填写模型名（如 gpt-4o-mini）"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm font-mono"
                    />
                  )}
                </div>

                {/* 高级：BaseURL + 温度 */}
                <details className="group">
                  <summary className="text-sm font-bold text-gray-700 cursor-pointer flex items-center gap-2">
                    <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" />
                    高级设置（BaseURL / 温度）
                  </summary>
                  <div className="mt-3 space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">BaseURL（留空使用默认）</label>
                      <input
                        type="text"
                        value={llmCfg.baseUrl || ''}
                        onChange={e => setLlmCfg({ ...llmCfg, baseUrl: e.target.value })}
                        placeholder={currentMeta.defaultBaseUrl || '自定义 OpenAI 兼容接口地址'}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Temperature: {llmCfg.temperature ?? 0.2}
                      </label>
                      <input
                        type="range"
                        min="0" max="1" step="0.1"
                        value={llmCfg.temperature ?? 0.2}
                        onChange={e => setLlmCfg({ ...llmCfg, temperature: Number(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                  </div>
                </details>
              </div>

              <div className="p-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50">
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveLLMConfig}
                  className="px-6 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700"
                >
                  保存配置
                </button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* 主工作区：动态画布 (Dynamic Canvas) */}
      <div className="hidden md:flex flex-1 bg-[#E5E5E5] relative overflow-hidden flex-col h-full">
         <div className="h-16 flex items-center justify-between px-6 bg-[#E5E5E5] border-b border-[#0F0F0F]/10">
           <div className="font-mono text-xs uppercase tracking-widest text-[#0F0F0F]/50">
             Interactive UI Canvas
           </div>
           {store.blocks.length > 0 && (
             <button onClick={() => store.applyDirective({ mode: 'clear', layout: 'single', blocks: [] })} className="text-[#0F0F0F] hover:text-[#FF3B00] transition-colors"><X className="w-5 h-5"/></button>
           )}
         </div>

         <div className="flex-1 min-h-0 relative">
            <DynamicCanvas uploadedFileName={uploadedFileName || undefined} uploadedData={uploadedData} />
         </div>
      </div>
    </div>
  );
}
