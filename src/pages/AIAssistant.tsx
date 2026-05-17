import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Settings, RefreshCw, AlertCircle, Maximize2, X, BrainCircuit, Activity, LayoutTemplate, FileText, ChevronRight, Zap, Database, Terminal, LineChart, PieChart, MessageSquare, Blocks, Paperclip } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../lib/LanguageContext';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { fetchChatStream } from '../lib/api';
import { buildSystemPrompt } from '../prompts';
import { useCanvasStore } from '../lib/canvas-engine/orchestrator';
import { parseCanvasDirective } from '../lib/canvas-engine/parser';
import { DynamicCanvas } from '../components/canvas/DynamicCanvas';
import { interactionBus } from '../lib/canvas-engine/interaction-bus';

export function AIAssistant() {
  const { t, lang } = useLanguage();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<any[]>([]);
  
  const store = useCanvasStore();

  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');


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

  const handleSaveApiKey = () => {
    localStorage.setItem('gemini_api_key', apiKey);
    setShowSettings(false);
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
      if (apiKey) {
        requestHeaders['Authorization'] = `Bearer ${apiKey}`;
      }

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
      let formattedHistory = historyTexts.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

      if (formattedHistory.length > 10) {
         // keep last 10, add a "System Note: Previous conversation context is omitted for brevity." at the beginning
         formattedHistory = formattedHistory.slice(-10);
         systemPromptText += `\n\n[SYSTEM NOTE: The user has had a long conversation. Only the most recent 5 turns are included below. Older context is compressed/omitted.]`;
      }

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
        }
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
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F0F0F]/20 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{scale: 0.95, opacity: 0}}
              animate={{scale: 1, opacity: 1}}
              exit={{scale: 0.95, opacity: 0}}
              className="bg-white border-2 border-[#0F0F0F] shadow-[8px_8px_0_#0F0F0F] p-6 w-full max-w-md relative"
            >
              <button 
                onClick={() => setShowSettings(false)}
                className="absolute right-4 top-4 text-gray-500 hover:text-gray-900 transition-colors"
               >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-serif italic font-bold mb-2 flex items-center gap-2 text-[#0F0F0F]">
                <Settings className="w-5 h-5"/>
                API Key Configuration
              </h2>
              <p className="text-sm text-gray-600 mb-6 font-medium">配置您的个人 Gemini API Key，您的 Key 将安全地存储在本地浏览器中。</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-gray-900 mb-2 uppercase tracking-widest">Gemini API Key</label>
                  <input 
                    type="password" 
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full border-2 border-[#0F0F0F] p-3 focus:outline-none focus:ring-0 font-mono text-sm bg-[#F5F4F0]"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button 
                    onClick={() => setShowSettings(false)}
                    className="px-5 py-2 border-2 border-[#0F0F0F] hover:bg-[#F5F4F0] text-sm font-bold transition-colors font-mono uppercase tracking-widest text-[#0F0F0F]"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveApiKey}
                    className="px-5 py-2 bg-[#0F0F0F] text-white hover:bg-gray-800 text-sm font-bold shadow-[4px_4px_0_#0F0F0F] active:translate-y-px active:shadow-none transition-all font-mono uppercase tracking-widest"
                  >
                    Save Key
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

         <div className="flex-1 relative flex justify-center items-start">
            <DynamicCanvas uploadedFileName={uploadedFileName || undefined} uploadedData={uploadedData} />
         </div>
      </div>
    </div>
  );
}
