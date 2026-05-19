import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, X, BarChart3, Sparkles, FileBarChart, GitCompare, Database, BookOpen, Lightbulb } from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';

export function UserGuide() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    const visited = localStorage.getItem('hasVisitedSynthesis_v2');
    if (!visited) {
      setIsOpen(true);
      localStorage.setItem('hasVisitedSynthesis_v2', 'true');
    }
    setHasChecked(true);
  }, []);

  if (!hasChecked) return null;

  const guides = [
    {
      icon: BarChart3,
      color: 'text-[#FF5722]',
      bg: 'bg-[#FF5722]/10',
      title: t('Data Analysis', '数据分析'),
      path: '/data',
      desc: t(
        'Upload CSV/Excel → AI auto-diagnoses data quality, detects anomalies, generates field profiles. Supports NL2SQL: ask questions in natural language, AI writes SQL and returns results with charts.',
        '上传 CSV/Excel → AI 自动诊断数据质量、检测异常、生成字段画像。支持自然语言 SQL：用中文提问，AI 自动写 SQL 查询并返回图表结果。'
      ),
    },
    {
      icon: Sparkles,
      color: 'text-[#7E57C2]',
      bg: 'bg-[#7E57C2]/10',
      title: t('AI Copilot', 'AI 助手'),
      path: '/assistant',
      desc: t(
        'Chat with AI like a senior analyst. It auto-generates interactive canvases (strategy boards, funnels, heatmaps) based on your questions. Supports file upload for context.',
        '像和资深分析师对话一样提问。AI 根据问题自动生成交互式画布（策略看板、漏斗图、热力图等）。支持上传文件作为分析上下文。'
      ),
    },
    {
      icon: FileBarChart,
      color: 'text-[#00C853]',
      bg: 'bg-[#00C853]/10',
      title: t('Smart Report', '智能报告'),
      path: '/report',
      desc: t(
        'Upload data → auto-generate Pyramid Principle structured business reports. Conclusion first, then supporting evidence, then data. Export to PDF/PPT. Supports section-level rewriting.',
        '上传数据 → 自动生成金字塔原理结构的业务决策报告。结论先行、论据支撑、数据佐证。支持导出 PDF/PPT，支持逐节重写。'
      ),
    },
    {
      icon: GitCompare,
      color: 'text-[#2962FF]',
      bg: 'bg-[#2962FF]/10',
      title: t('Compare & Attribution', '对比归因'),
      path: '/compare',
      desc: t(
        'Multi-dimensional drill-down attribution. Waterfall charts show who contributed to growth/decline. Includes Simpson\'s Paradox detection.',
        '多维度下钻归因分析。瀑布图展示"谁贡献了增长/谁拖了后腿"。内置辛普森悖论检测，确保结论稳健。'
      ),
    },
    {
      icon: Database,
      color: 'text-[#FFC107]',
      bg: 'bg-[#FFC107]/10',
      title: t('Case Library', '案例库'),
      path: '/cases',
      desc: t(
        '20+ real e-commerce analysis cases covering AARRR, RFM, repurchase analysis, channel attribution and more. Each case includes complete methodology and actionable conclusions.',
        '20+ 真实电商分析案例，覆盖 AARRR、RFM、复购分析、渠道归因等核心场景。每个案例包含完整分析思路和可执行结论。'
      ),
    },
    {
      icon: Lightbulb,
      color: 'text-[#EC407A]',
      bg: 'bg-[#EC407A]/10',
      title: t('Methodology', '方法论'),
      path: '/methodologies',
      desc: t(
        'Professional frameworks: 5Why root cause, RFM segmentation, AARRR funnel, Tmall 8 Strategic Segments, DID causal inference, Uplift modeling. One-click apply to your data.',
        '专业分析框架：5Why 根因分析、RFM 用户分层、AARRR 增长漏斗、天猫八大策略人群、DID 因果推断、Uplift 增量建模。支持一键应用到你的数据。'
      ),
    },
  ];

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-11 h-11 bg-[#1A1A1A] text-[#F5F1EA] rounded-full flex items-center justify-center hover:bg-[#FF5722] transition-all z-50 cursor-pointer shadow-lg hover:scale-105 active:scale-95"
        title="使用指南"
      >
        <HelpCircle className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed bottom-20 right-6 w-[360px] md:w-[420px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-[#1A1A1A]/10"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-[#1A1A1A]/10 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-[#1A1A1A] text-base">使用指南</h3>
                <p className="text-[11px] text-[#1A1A1A]/50 mt-0.5">Synthesis · AI 数据分析平台</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-[#1A1A1A]/5 rounded-lg transition-colors">
                <X className="w-4 h-4 text-[#1A1A1A]/60" />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-4 max-h-[65vh] overflow-y-auto space-y-3">
              {guides.map((g) => {
                const Icon = g.icon;
                return (
                  <div key={g.path} className="flex gap-3 p-3 rounded-xl hover:bg-[#F5F1EA]/60 transition-colors group">
                    <div className={`w-9 h-9 rounded-lg ${g.bg} ${g.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-[#1A1A1A]">{g.title}</h4>
                        <span className="text-[10px] text-[#1A1A1A]/30 font-mono">{g.path}</span>
                      </div>
                      <p className="text-xs text-[#1A1A1A]/60 leading-relaxed mt-1">{g.desc}</p>
                    </div>
                  </div>
                );
              })}

              {/* Tips section */}
              <div className="mt-4 pt-4 border-t border-[#1A1A1A]/10">
                <h4 className="text-xs font-semibold text-[#1A1A1A]/70 uppercase tracking-wider mb-2">💡 Tips</h4>
                <ul className="space-y-1.5 text-xs text-[#1A1A1A]/50 leading-relaxed">
                  <li>• 支持 CSV、Excel (.xlsx)、TXT 格式上传</li>
                  <li>• AI 报告遵循金字塔原理：结论先行 → 论据支撑 → 数据佐证</li>
                  <li>• 在 AI 助手中可用自然语言提问，如"哪个品类利润最高"</li>
                  <li>• 报告支持逐节重写：hover 章节标题可看到"重写"按钮</li>
                  <li>• 左下角 Provider Settings 可切换 AI 模型（DeepSeek/GPT/Claude 等）</li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-[#1A1A1A]/10 bg-[#F5F1EA]/50">
              <p className="text-[10px] text-[#1A1A1A]/40 text-center">
                内置天猫八大策略人群 · 倒金字塔写作法 · AIPL/FAST 框架
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
