import React, { useState, useEffect } from 'react';
import { Search, Plus, X, ArrowLeft } from 'lucide-react';
import { caseStudies, CaseStudy } from '../data/mock';
import { mockChartsMapping, getChartsForId } from '../data/mockCharts';
import { ChartRenderer } from '../components/ChartRenderer';
import { AddCaseModal } from '../components/AddCaseModal';
import { useLanguage } from '../lib/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';

export function Cases() {
  const { t, lang } = useLanguage();
  const [allCases, setAllCases] = useState<CaseStudy[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('全部');
  const [difficulty, setDifficulty] = useState('全部');
  const [selectedCase, setSelectedCase] = useState<CaseStudy | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (selectedCase) {
      window.scrollTo(0, 0);
    }
  }, [selectedCase]);

  useEffect(() => {
    const customCasesStr = localStorage.getItem('customCases');
    let customCases: CaseStudy[] = [];
    if (customCasesStr) {
      try {
        customCases = JSON.parse(customCasesStr);
      } catch (e) {}
    }
    setAllCases([...caseStudies, ...customCases]);
  }, []);

  const handleSaveCustomCase = (newCase: CaseStudy) => {
    const customCasesStr = localStorage.getItem('customCases');
    let customCases: CaseStudy[] = [];
    if (customCasesStr) {
      try {
        customCases = JSON.parse(customCasesStr);
      } catch (e) {}
    }
    customCases.unshift(newCase);
    localStorage.setItem('customCases', JSON.stringify(customCases));
    setAllCases([...caseStudies, ...customCases]);
    setShowAddModal(false);
  };

  const filteredCases = allCases.filter(c => {
    const matchCategory = category === '全部' || c.category === category;
    const matchDifficulty = difficulty === '全部' || c.difficulty === difficulty;
    const matchSearch = search === '' || c.title.toLowerCase().includes(search.toLowerCase()) || c.summary.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchDifficulty && matchSearch;
  });

  const getDifficultyColor = (diff: string) => {
    if (diff === '入门') return 'text-green-700 bg-green-50 border-green-200';
    if (diff === '进阶') return 'text-blue-700 bg-blue-50 border-blue-200';
    return 'text-red-700 bg-red-50 border-red-200';
  };

  if (selectedCase) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full bg-[#F5F4F0]/30 backdrop-blur-sm min-h-screen pb-24 relative z-20"
      >
        <header className="sticky top-14 left-0 right-0 z-30 bg-[#F5F4F0]/80 backdrop-blur-md border-b border-[#0F0F0F] px-6 lg:px-12 py-4 flex justify-between items-center shadow-sm">
          <button onClick={() => setSelectedCase(null)} className="flex items-center gap-2 text-[#0F0F0F] hover:text-[#FF3B00] transition-colors font-mono uppercase text-[10px] sm:text-xs tracking-widest font-bold group">
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" /> {t('Back to Index', '返回案例库')}
          </button>
          <div className="font-mono text-[10px] uppercase opacity-50 tracking-widest hidden sm:block">System_Node / 01</div>
        </header>
        
        <div className="max-w-4xl mx-auto mt-12 px-6 lg:px-0 flex flex-col space-y-12">
          <div>
            <div className="flex gap-2 items-center mb-6">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] border border-[#0F0F0F] text-[#0F0F0F] px-3 py-1">{selectedCase.category}</span>
              <span className={`text-[10px] font-mono uppercase tracking-[0.2em] px-3 py-1 border border-[#0F0F0F]`}>{selectedCase.difficulty}</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif italic text-[#0F0F0F] leading-[1.1] mb-8">{selectedCase.title}</h2>
            <div className="text-lg md:text-xl text-[#0F0F0F]/80 font-medium leading-relaxed font-serif pl-6 border-l-2 border-[#0F0F0F]">{selectedCase.summary}</div>
          </div>
          
          <section className="space-y-4">
            <h3 className="text-xl font-serif italic text-[#0F0F0F] pb-4 border-b border-[#0F0F0F]/20">{t('Background', '背景')}</h3>
            <p className="text-base text-[#0F0F0F]/75 leading-relaxed">{selectedCase.background}</p>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-serif italic text-[#0F0F0F] pb-4 border-b border-[#0F0F0F]/20">{t('Entity Structure', '字段定义')}</h3>
            <div className="overflow-x-auto border border-[#0F0F0F]">
              <table className="w-full text-left text-sm border-collapse font-mono">
                <thead>
                  <tr className="bg-[#0F0F0F] text-[#F5F4F0] uppercase tracking-wider text-[10px]">
                    <th className="py-4 px-6 font-medium">{t('Field', '字段名')}</th>
                    <th className="py-4 px-6 font-medium">{t('Type', '类型')}</th>
                    <th className="py-4 px-6 font-medium">{t('Description', '说明')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0F0F0F]/10 text-[#0F0F0F]">
                  {selectedCase.fields?.map((f, i) => (
                    <tr key={i} className="hover:bg-[#EBEAE5] transition-colors">
                      <td className="py-3 px-6 text-[12px] font-bold">{f.name}</td>
                      <td className="py-3 px-6"><span className="border border-[#0F0F0F]/20 px-2 py-0.5 text-[10px] uppercase tracking-wider">{f.type}</span></td>
                      <td className="py-3 px-6 font-sans text-sm">{f.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-serif italic text-[#0F0F0F] pb-4 border-b border-[#0F0F0F]/20">{t('Analysis Process', '发现问题的步骤 (分析过程)')}</h3>
            <div className="space-y-4">
              {selectedCase.analysisProcess?.split('\n').map((paragraph, index) => {
                if (!paragraph.trim()) return null;
                const parts = paragraph.split(/：|:/);
                if (parts.length > 1) {
                  return (
                    <div key={index} className="bg-white/80 backdrop-blur-md border border-[#0F0F0F]/5 p-6 md:p-8 rounded-2xl shadow-sm mb-4">
                      <h4 className="font-bold text-[#0F0F0F] text-lg mb-4">{parts[0]}</h4>
                      <p className="text-[15px] text-[#0F0F0F]/80 leading-relaxed">{parts.slice(1).join('：')}</p>
                    </div>
                  );
                }
                return <div key={index} className="bg-white/80 backdrop-blur-md border border-[#0F0F0F]/5 p-6 md:p-8 rounded-2xl shadow-sm mb-4"><p className="text-[15px] text-[#0F0F0F]/80 leading-relaxed">{paragraph}</p></div>;
              })}
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-serif italic text-[#0F0F0F] pb-4 border-b border-[#0F0F0F]/20">{t('Core Findings', '找到了什么线索 (主要发现)')}</h3>
            <div className="grid gap-6">
              {Array.isArray(selectedCase.coreFindings) ? selectedCase.coreFindings.map((cf, idx) => (
                <div key={idx} className="bg-white/40 backdrop-blur-sm p-6 border-l-4 border-[#FF3B00] rounded-r-xl border-y border-r border-[#0F0F0F]/10">
                  <h4 className="font-bold text-[#0F0F0F] mb-3 text-lg">{cf.finding}</h4>
                  <p className="text-[13px] text-[#0F0F0F]/70 mb-2 font-sans"><span className="font-bold text-[#0F0F0F]">事实支撑 (Evidence):</span> {cf.evidence}</p>
                  <p className="text-[13px] text-[#0F0F0F]/70 font-sans"><span className="font-bold text-[#0F0F0F]">这意味着什么 (Implication):</span> {cf.implication}</p>
                </div>
              )) : (
                <p className="text-base text-[#0F0F0F]/75 leading-relaxed whitespace-pre-wrap">{String(selectedCase.coreFindings)}</p>
              )}
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-xl font-serif italic text-[#0F0F0F] pb-4 border-b border-[#0F0F0F]/20">{t('Visualizations', '数据图表解析')}</h3>
            <div className="space-y-8 bg-white/60 backdrop-blur-sm border border-[#0F0F0F]/20 p-4 lg:p-8 rounded-2xl shadow-sm">
              {(() => {
                const charts = getChartsForId(selectedCase.id, selectedCase.title, selectedCase.category);
                if (charts && charts.length > 0) {
                  return charts.map(chart => (
                    <ChartRenderer key={chart.chartId} chart={chart} />
                  ));
                }
                if (selectedCase.charts && selectedCase.charts.length > 0) {
                  return selectedCase.charts.map((chart: any) => (
                    <ChartRenderer key={chart.chartId} chart={chart} />
                  ));
                }
                return <p className="text-sm font-mono opacity-50 italic">Processing charts... No visual output mapped.</p>;
              })()}
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-xl font-serif italic text-[#0F0F0F] pb-4 border-b border-[#0F0F0F]/20">{t('Improvement Strategies', '如何解决问题 (优化策略)')}</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {Array.isArray(selectedCase.improvementStrategies) ? selectedCase.improvementStrategies.map((is, idx) => (
                <div key={idx} className="bg-white/40 backdrop-blur-sm border border-[#0F0F0F]/10 p-6 flex flex-col justify-between hover:bg-white/80 transition-colors rounded-xl">
                  <div>
                    <h4 className="font-bold text-[#0F0F0F] text-[15px] leading-tight mb-4">{is.strategy}</h4>
                    {is.action && (
                      <div className="mb-3">
                        <span className="text-[10px] font-mono text-[#0F0F0F] uppercase tracking-widest opacity-60 block mb-1">Action / 具体手段</span>
                        <p className="text-[13px] text-[#0F0F0F]/75 leading-relaxed">{is.action}</p>
                      </div>
                    )}
                    {is.owner && (
                      <div className="mb-3">
                        <span className="text-[10px] font-mono text-[#0F0F0F] uppercase tracking-widest opacity-60 block mb-1">Owner / 责任方</span>
                        <p className="text-[13px] text-[#0F0F0F]/75 leading-relaxed">{is.owner}</p>
                      </div>
                    )}
                    {is.expectedOutcome && (
                      <div className="mt-4 pt-3 border-t border-[#0F0F0F]/10">
                        <span className="text-[10px] font-mono text-[#0F0F0F] uppercase tracking-widest opacity-60 block mb-1">Expected Outcome / 预期结果</span>
                        <p className="text-[13px] text-[#0F0F0F]/75 leading-relaxed">{is.expectedOutcome}</p>
                      </div>
                    )}
                  </div>
                </div>
              )) : (
                <p className="text-base text-[#0F0F0F]/75 leading-relaxed whitespace-pre-wrap">{String(selectedCase.improvementStrategies)}</p>
              )}
            </div>
          </section>

          {(selectedCase.businessOutcome || selectedCase.reflection) && (
            <div className="bg-[#F5F4F0]/60 backdrop-blur-md text-[#0F0F0F] p-8 md:p-12 border border-[#0F0F0F]/20 rounded-2xl mt-12 shadow-sm">
              <strong className="block text-[10px] font-mono uppercase tracking-widest text-[#FF3B00] mb-6">{t('Conclusion & Reflection', '最终评价 (总结与反思)')}</strong>
              {selectedCase.businessOutcome && (
                <div className="mb-6">
                  <span className="text-xs font-bold opacity-50 block mb-2">业务取得了什么效果 (Business Outcome)</span>
                  <p className="text-[15px] leading-relaxed whitespace-pre-wrap font-medium">{selectedCase.businessOutcome}</p>
                </div>
              )}
              {selectedCase.reflection && (
                <div>
                  <span className="text-xs font-bold opacity-50 block mb-2">学到了什么经验 (Reflection)</span>
                  <p className="text-[15px] font-serif italic leading-relaxed whitespace-pre-wrap">{selectedCase.reflection}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex-1 w-full bg-transparent py-12 px-6 xl:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-6xl md:text-7xl font-serif italic text-[#0F0F0F] mb-4">{t('案例库', 'Case Studies')}<span className="text-xl inline-block ml-4 not-italic font-sans uppercase font-bold tracking-widest opacity-30">{t('Case Studies', '案例库')}</span></h1>
            <p className="text-[#0F0F0F]/60 text-sm font-mono uppercase tracking-widest">{t('Learn from empirical architecture', '用通俗的话，带你看懂电商生意背后的逻辑')}</p>
          </div>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-[#FF3B00] text-white px-4 py-3 text-[11px] font-bold uppercase tracking-widest hover:bg-[#0F0F0F] transition-colors rounded-none border border-[#0F0F0F]">
            <Plus className="w-4 h-4" /> {t('Add Case', '添加案例')}
          </button>
        </div>

        {/* Filters */}
        <div className="bg-[#F5F4F0]/70 backdrop-blur-md p-6 border border-[#0F0F0F] mb-8 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
          <div className="flex flex-col gap-4 w-full md:w-auto">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono text-[#0F0F0F] uppercase tracking-widest opacity-60">Category:</span>
              <div className="flex flex-wrap gap-2">
                {['全部', '基础模型', '进阶方法', '行业专题'].map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`text-[10px] font-mono uppercase tracking-wider px-3 py-1 border transition-colors ${category === cat ? 'bg-[#0F0F0F] text-[#F5F4F0] border-[#0F0F0F]' : 'bg-transparent text-[#0F0F0F] border-[#0F0F0F]/20 hover:border-[#0F0F0F]'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono text-[#0F0F0F] uppercase tracking-widest opacity-60">Difficulty:</span>
              <div className="flex flex-wrap gap-2">
                {['全部', '入门', '进阶', '高级'].map(diff => (
                  <button 
                    key={diff}
                    onClick={() => setDifficulty(diff)}
                    className={`text-[10px] font-mono uppercase tracking-wider px-3 py-1 border transition-colors ${difficulty === diff ? 'bg-[#0F0F0F] text-[#F5F4F0] border-[#0F0F0F]' : 'bg-transparent text-[#0F0F0F] border-[#0F0F0F]/20 hover:border-[#0F0F0F]'}`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#0F0F0F]" />
            <input 
              type="text" 
              placeholder="SEARCH CASES..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full text-xs font-mono uppercase pl-9 pr-4 py-3 border border-[#0F0F0F] bg-[#F5F4F0] focus:outline-none focus:border-[#FF3B00] transition-colors placeholder:text-[#0F0F0F]/30"
            />
          </div>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCases.map(c => (
            <div 
              key={c.id} 
              onClick={() => setSelectedCase(c)}
              className="bg-[#F5F4F0]/60 backdrop-blur-md border border-[#0F0F0F] p-8 flex flex-col justify-between hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:bg-[#F5F4F0]/90 transition-all cursor-pointer rounded-2xl min-h-[260px]"
            >
              <div>
                <div className="flex justify-between items-start mb-6 gap-2">
                   <div className="flex gap-2 flex-wrap">
                     {c.isCustom && <span className="text-[9px] bg-[#FF3B00] text-[#F5F4F0] px-2 py-0.5 font-mono uppercase tracking-[0.2em] border border-[#FF3B00]">CUSTOM</span>}
                     <span className="text-[9px] font-mono uppercase tracking-[0.2em] border border-[#0F0F0F] text-[#0F0F0F] px-2 py-0.5">{c.category}</span>
                   </div>
                   <span className={`text-[9px] font-mono uppercase tracking-[0.2em] px-2 py-0.5 border border-[#0F0F0F]`}>{c.difficulty}</span>
                </div>
                <h3 className="text-2xl font-serif italic text-[#0F0F0F] mb-3 line-clamp-2 leading-tight">{c.title}</h3>
                <p className="text-[13px] text-[#0F0F0F]/70 line-clamp-3 leading-relaxed font-medium">{c.summary}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#0F0F0F]/20 flex gap-4 text-[10px] font-mono uppercase text-[#0F0F0F] tracking-[0.2em]">
                 <span>Fields {c.fields?.length || 0}</span>
              </div>
            </div>
          ))}
        </div>

        {filteredCases.length === 0 && (
          <div className="py-20 text-center text-[#4A4A4A]">没有找到符合条件的案例</div>
        )}
      </div>

      {/* Add Case Modal */}
      {showAddModal && (
        <AddCaseModal 
          onClose={() => setShowAddModal(false)}
          onSave={handleSaveCustomCase}
        />
      )}
    </div>
  );
}
