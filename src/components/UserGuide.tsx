import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, Minus, Database, MessageSquare } from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';

export function UserGuide() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    const visited = localStorage.getItem('hasVisitedSynthesis');
    if (!visited) {
      setIsOpen(true);
      localStorage.setItem('hasVisitedSynthesis', 'true');
    }
    setHasChecked(true);
  }, []);

  if (!hasChecked) return null;

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-12 h-12 bg-black text-white rounded-full flex items-center justify-center hover:scale-110 hover:bg-gray-800 transition-all z-50 cursor-pointer shadow-lg active:scale-95"
        title="Open Guide"
      >
        <HelpCircle className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 right-6 w-80 md:w-96 border border-gray-200 bg-white rounded-2xl shadow-2xl z-50 flex flex-col font-sans overflow-hidden"
          >
            <div className="h-12 bg-black text-white flex items-center justify-between px-4">
              <span className="font-serif italic font-bold tracking-tight text-lg">System Guide</span>
              <button onClick={() => setIsOpen(false)} className="hover:text-red-400 hover:bg-white/10 p-1 rounded transition-colors">
                <Minus className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 max-h-[60vh] overflow-y-auto space-y-5">
              <div className="space-y-1">
                <h4 className="font-bold text-gray-900 flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-500" />
                  {t('Data Analysis', '数据分析 (/data)')}
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed font-medium">
                  {t('Upload CSV/Excel to generate auto-insights, stat methods, and recommended charts. Memory panel saves history.', '上传 CSV/Excel/TXT 获取自动化洞察、推荐图表与基础统计（描述、相关、回归等）。右侧侧边栏提供记忆记录功能。')}
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-gray-900 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-500" />
                  {t('AI Assistant', '智能助手 (/assistant)')}
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed font-medium">
                  {t('Interact with Copilot using natural language. It proactively triggers RCA canvases and dynamic UI suggestions.', '基于自然语言的智能问答，主动介入流转，为你动态生成交互式的 Rca 画布。')}
                </p>
              </div>


            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
