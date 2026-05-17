import React, { useState, useEffect } from 'react';
import { Plus, X, ArrowLeft } from 'lucide-react';
import { strategies, Strategy } from '../data/mock';
import { mockChartsMapping, getChartsForId } from '../data/mockCharts';
import { ChartRenderer } from '../components/ChartRenderer';
import { useLanguage } from '../lib/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';

export function Strategies() {
  const { t } = useLanguage();
  const [allStrategies, setAllStrategies] = useState<Strategy[]>([]);
  const [category, setCategory] = useState('全部');
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);

  useEffect(() => {
    if (selectedStrategy) {
      window.scrollTo(0, 0);
    }
  }, [selectedStrategy]);

  useEffect(() => {
    const customStr = localStorage.getItem('customStrategies');
    let customData: Strategy[] = [];
    if (customStr) {
      try { customData = JSON.parse(customStr); } catch (e) {}
    }
    setAllStrategies([...strategies, ...customData]);
  }, []);

  const categories = ['全部', '用户策略', '转化策略', '增长策略', '运营策略', '商业策略'];

  const filteredStrategies = allStrategies.filter(s => category === '全部' || s.category === category);

  if (selectedStrategy) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full bg-[#F5F4F0]/30 backdrop-blur-sm min-h-screen pb-24 relative z-20"
      >
        <header className="sticky top-14 left-0 right-0 z-30 bg-[#F5F4F0]/80 backdrop-blur-md border-b border-[#0F0F0F] px-6 lg:px-12 py-4 flex justify-between items-center shadow-sm">
          <button onClick={() => setSelectedStrategy(null)} className="flex items-center gap-2 text-[#0F0F0F] hover:text-[#FF3B00] transition-colors font-mono uppercase text-[10px] sm:text-xs tracking-widest font-bold group">
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" /> {t('Back to Strategies', '返回策略集')}
          </button>
          <div className="font-mono text-[10px] uppercase opacity-50 tracking-widest hidden sm:block">System_Node / 02</div>
        </header>
        
        <div className="max-w-4xl mx-auto mt-12 px-6 lg:px-0 flex flex-col space-y-12">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] border border-[#0F0F0F] text-[#0F0F0F] px-3 py-1 mb-6 inline-block">{selectedStrategy.category}</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif italic text-[#0F0F0F] leading-[1.1] mb-8">{selectedStrategy.title}</h2>
          </div>
          
          <section className="space-y-4">
            <h3 className="text-xl font-serif italic text-[#0F0F0F] pb-4 border-b border-[#0F0F0F]/20">{t('Overview', '概述')}</h3>
            <div className="space-y-4">
              {selectedStrategy.overview?.split(/\n\n+/).map((paragraph, index) => {
                if (!paragraph.trim()) return null;
                const match = paragraph.match(/【(.*?)】([\s\S]*)/);
                if (match) {
                  return (
                    <div key={index} className="bg-white/80 backdrop-blur-md border border-[#0F0F0F]/5 p-6 md:p-8 rounded-2xl shadow-sm mb-4">
                      <h4 className="font-bold text-[#0F0F0F] text-lg mb-4">{match[1]}</h4>
                      <p className="text-[15px] text-[#0F0F0F]/80 leading-relaxed whitespace-pre-wrap">{match[2].trim()}</p>
                    </div>
                  );
                }
                const parts = paragraph.split(/：|:/);
                if (parts.length > 1 && parts[0].length < 20) {
                  return (
                    <div key={index} className="bg-white/80 backdrop-blur-md border border-[#0F0F0F]/5 p-6 md:p-8 rounded-2xl shadow-sm mb-4">
                      <h4 className="font-bold text-[#0F0F0F] text-lg mb-4">{parts[0]}</h4>
                      <p className="text-[15px] text-[#0F0F0F]/80 leading-relaxed whitespace-pre-wrap">{parts.slice(1).join('：').trim()}</p>
                    </div>
                  );
                }
                return <div key={index} className="bg-white/80 backdrop-blur-md border border-[#0F0F0F]/5 p-6 md:p-8 rounded-2xl shadow-sm mb-4"><p className="text-[15px] text-[#0F0F0F]/80 leading-relaxed whitespace-pre-wrap">{paragraph.trim()}</p></div>;
              })}
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-serif italic text-[#0F0F0F] pb-4 border-b border-[#0F0F0F]/20">{t('Core Framework', '解题思路 (核心框架)')}</h3>
            <ul className="text-base text-[#0F0F0F]/75 leading-relaxed space-y-4 list-none pl-0 font-sans">
              {selectedStrategy.framework?.map((item, idx) => {
                const match = item.match(/【(.*?)】([\s\S]*)/);
                if (match) {
                  return (
                    <li key={idx} className="bg-white/80 backdrop-blur-md border border-[#0F0F0F]/5 p-6 md:p-8 rounded-2xl shadow-sm mb-4">
                      <h4 className="font-bold text-[#0F0F0F] text-lg mb-4">{match[1]}</h4>
                      <p className="text-[15px] text-[#0F0F0F]/80 leading-relaxed whitespace-pre-wrap">{match[2].trim()}</p>
                    </li>
                  );
                }
                return (
                  <li key={idx} className="bg-white/80 backdrop-blur-md border border-[#0F0F0F]/5 p-6 md:p-8 rounded-2xl shadow-sm mb-4">
                    <p className="text-[15px] text-[#0F0F0F]/80 leading-relaxed whitespace-pre-wrap">{item.trim()}</p>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="space-y-6">
            <h3 className="text-xl font-serif italic text-[#0F0F0F] pb-4 border-b border-[#0F0F0F]/20">{t('Visualizations', '图表辅助理解')}</h3>
            <div className="space-y-8 bg-white border border-[#0F0F0F] p-4 p-md-8 shadow-[8px_8px_0px_#0F0F0F]">
              {(() => {
                const charts = getChartsForId(selectedStrategy.id, selectedStrategy.title, selectedStrategy.category);
                if (charts && charts.length > 0) {
                  return charts.map(chart => (
                    <ChartRenderer key={chart.chartId} chart={chart} />
                  ));
                }
                if (selectedStrategy.charts && selectedStrategy.charts.length > 0) {
                  return selectedStrategy.charts.map((chart: any) => (
                    <ChartRenderer key={chart.chartId} chart={chart} />
                  ));
                }
                return <p className="text-sm font-mono opacity-50 italic">Processing charts... No visual output mapped.</p>;
              })()}
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-serif italic text-[#0F0F0F] pb-4 border-b border-[#0F0F0F]/20">{t('Application Scenarios', '什么时候用 (应用场景)')}</h3>
            <p className="text-base text-[#0F0F0F]/75 leading-relaxed p-6 border border-[#0F0F0F]/20">{selectedStrategy.scenarios}</p>
          </section>

          <section className="space-y-6">
            <h3 className="text-xl font-serif italic text-[#0F0F0F] pb-4 border-b border-[#0F0F0F]/20">{t('Implementation Steps', '具体怎么做 (实施步骤)')}</h3>
            <div className="grid gap-6">
              {selectedStrategy.steps?.map((step, idx) => (
                 <div key={idx} className="flex flex-col sm:flex-row gap-6 bg-white/40 backdrop-blur-sm border border-[#0F0F0F]/10 p-6 hover:bg-white/80 transition-colors rounded-xl">
                   <span className="font-serif italic text-4xl text-[#FF3B00]/40 sm:w-16">{(idx + 1).toString().padStart(2, '0')}</span>
                   <div className="flex-1 space-y-4">
                     <div>
                       <h4 className="font-bold text-[#0F0F0F] text-lg mb-2">{step.step}</h4>
                       {step.goal && <p className="text-[#0F0F0F]/70 text-sm font-medium">{step.goal}</p>}
                     </div>
                     <div className="grid sm:grid-cols-2 gap-4 border-t border-[#0F0F0F]/10 pt-4">
                       {step.actions && (
                         <div>
                           <span className="text-[10px] font-mono text-[#0F0F0F] uppercase tracking-widest opacity-60 block mb-1">Actions / 关键动作</span>
                           <p className="text-[13px] text-[#0F0F0F]/75 leading-relaxed">{step.actions}</p>
                         </div>
                       )}
                       {step.team && (
                         <div>
                           <span className="text-[10px] font-mono text-[#0F0F0F] uppercase tracking-widest opacity-60 block mb-1">Team / 责任团队</span>
                           <p className="text-[13px] text-[#0F0F0F]/75 leading-relaxed">{step.team}</p>
                         </div>
                       )}
                       {step.output && (
                         <div>
                           <span className="text-[10px] font-mono text-[#0F0F0F] uppercase tracking-widest opacity-60 block mb-1">Output / 产出物</span>
                           <p className="text-[13px] text-[#0F0F0F]/75 leading-relaxed">{step.output}</p>
                         </div>
                       )}
                       {step.duration && (
                         <div>
                           <span className="text-[10px] font-mono text-[#0F0F0F] uppercase tracking-widest opacity-60 block mb-1">Duration / 周期</span>
                           <p className="text-[13px] text-[#0F0F0F]/75 leading-relaxed">{step.duration}</p>
                         </div>
                       )}
                     </div>
                   </div>
                 </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-serif italic text-[#0F0F0F] pb-4 border-b border-[#0F0F0F]/20">{t('Case Study', '真实案例 (用这个方法获得了什么效果)')}</h3>
            <div className="space-y-4">
              {selectedStrategy.caseStudy?.split(/\n\n+/).map((paragraph, index) => {
                if (!paragraph.trim()) return null;
                const match = paragraph.match(/【(.*?)】([\s\S]*)/);
                if (match) {
                  return (
                    <div key={index} className="bg-white/80 backdrop-blur-md border border-[#0F0F0F]/5 p-6 md:p-8 rounded-2xl shadow-sm mb-4">
                      <h4 className="font-bold text-[#0F0F0F] text-lg mb-4">{match[1]}</h4>
                      <p className="text-[15px] text-[#0F0F0F]/80 leading-relaxed whitespace-pre-wrap">{match[2].trim()}</p>
                    </div>
                  );
                }
                const parts = paragraph.split(/：|:/);
                if (parts.length > 1 && parts[0].length < 20) {
                  return (
                    <div key={index} className="bg-white/80 backdrop-blur-md border border-[#0F0F0F]/5 p-6 md:p-8 rounded-2xl shadow-sm mb-4">
                      <h4 className="font-bold text-[#0F0F0F] text-lg mb-4">{parts[0]}</h4>
                      <p className="text-[15px] text-[#0F0F0F]/80 leading-relaxed whitespace-pre-wrap">{parts.slice(1).join('：').trim()}</p>
                    </div>
                  );
                }
                return <div key={index} className="bg-white/80 backdrop-blur-md border border-[#0F0F0F]/5 p-6 md:p-8 rounded-2xl shadow-sm mb-4"><p className="text-[15px] text-[#0F0F0F]/80 leading-relaxed whitespace-pre-wrap">{paragraph.trim()}</p></div>;
              })}
            </div>
          </section>

          <section className="space-y-6 pt-12">
            <h3 className="text-xl font-serif italic text-[#0F0F0F] pb-4 border-b border-[#0F0F0F]/20 tracking-tight">{t('Tools & Templates', '必备工具/模板')}</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {selectedStrategy.tools?.map((tool, idx) => typeof tool === 'string' ? (
                <p key={idx} className="text-sm font-mono text-[#0F0F0F] bg-white/40 backdrop-blur-sm p-5 border border-[#0F0F0F]/10 rounded-xl shadow-sm">{tool}</p>
              ) : (
                <div key={idx} className="text-sm text-[#0F0F0F] bg-white/40 backdrop-blur-sm p-5 border border-[#0F0F0F]/10 rounded-xl shadow-sm flex flex-col gap-2">
                   <span className="font-bold uppercase tracking-wider text-[11px]">{tool.name}</span>
                   <span className="font-mono text-[#0F0F0F]/70">{tool.usage}</span>
                </div>
              ))}
            </div>
          </section>

          {(selectedStrategy.summary || selectedStrategy.iteration) && (
            <div className="bg-[#F5F4F0]/60 backdrop-blur-md text-[#0F0F0F] p-8 md:p-12 border border-[#0F0F0F]/20 rounded-2xl mt-12 shadow-sm">
              <strong className="block text-[10px] font-mono uppercase tracking-widest text-[#FF3B00] mb-6">{t('Summary & Iteration', '总结与迭代')}</strong>
              {selectedStrategy.summary && (
                <div className="mb-6">
                  <span className="text-xs font-bold opacity-50 block mb-2">Strategy Summary</span>
                  <p className="text-[15px] leading-relaxed whitespace-pre-wrap font-medium">{selectedStrategy.summary}</p>
                </div>
              )}
              {selectedStrategy.iteration && (
                <div>
                  <span className="text-xs font-bold opacity-50 block mb-2">Iteration & Evolution</span>
                  <p className="text-[15px] font-serif italic leading-relaxed whitespace-pre-wrap">{selectedStrategy.iteration}</p>
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
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-6xl md:text-7xl font-serif italic text-[#0F0F0F] mb-4">{t('策略专项', 'Strategies')}<span className="text-xl inline-block ml-4 not-italic font-sans uppercase font-bold tracking-widest opacity-30">{t('Strategies', '策略专项')}</span></h1>
            <p className="text-[#0F0F0F]/60 text-sm font-mono uppercase tracking-widest">{t('Systematic E-commerce Operation Strategies', '系统化电商运营策略，高复用高转化')}</p>
          </div>
          {/* <button className="flex items-center gap-2 bg-[#1A1A1A] text-white px-4 py-2 text-[11px] font-bold uppercase tracking-widest hover:bg-black transition-colors rounded-none">
            <Plus className="w-4 h-4" /> 添加策略
          </button> */}
        </div>

        <div className="bg-[#F5F4F0]/70 backdrop-blur-md p-6 border border-[#0F0F0F] mb-8 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            <span className="text-[11px] font-mono text-[#0F0F0F] uppercase tracking-widest opacity-60 whitespace-nowrap">{t('Category:', '分类:')}</span>
            <div className="flex gap-2 flex-nowrap">
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`whitespace-nowrap text-[10px] font-mono uppercase tracking-wider px-3 py-1 border transition-colors ${category === cat ? 'bg-[#0F0F0F] text-[#F5F4F0] border-[#0F0F0F]' : 'bg-transparent text-[#0F0F0F] border-[#0F0F0F]/20 hover:border-[#0F0F0F]'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStrategies.map(s => (
            <div 
              key={s.id} 
              onClick={() => setSelectedStrategy(s)}
              className="bg-[#F5F4F0]/60 backdrop-blur-md border border-[#0F0F0F]/30 p-8 flex flex-col justify-between hover:-translate-y-1 hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)] hover:bg-[#F5F4F0]/90 transition-all cursor-pointer rounded-3xl min-h-[300px]"
            >
              <div>
                <span className="text-[9px] font-mono uppercase tracking-[0.2em] border border-[#0F0F0F] text-[#0F0F0F] px-2 py-0.5 mb-6 inline-block">{s.category}</span>
                <h3 className="text-2xl font-serif italic text-[#0F0F0F] mb-3 line-clamp-2 leading-tight">{s.title}</h3>
                <p className="text-[13px] text-[#0F0F0F]/70 line-clamp-3 leading-relaxed mb-6 font-medium">{s.overview?.replace(/【.*?】/g, '')}</p>
                <div className="space-y-2">
                  {s.framework?.slice(0,3).map((f, i) => {
                    const cleanF = f.replace(/【(.*?)】/, '$1: ');
                    return (
                      <div key={i} className="text-[12px] font-sans leading-tight text-[#0F0F0F]/80 flex gap-2">
                        <span className="line-clamp-1 opacity-75">{cleanF}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="mt-8 pt-4 border-t border-[#0F0F0F]/20">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#0F0F0F] font-bold">{t('View Details', '查看详情')} &rarr;</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
