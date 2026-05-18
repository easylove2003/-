import React, { useState, useEffect } from 'react';
import { methodologies, Methodology } from '../data/mock';
import { ChevronRight, X, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';

export function Methodologies() {
  const { t } = useLanguage();
  const [selectedMethod, setSelectedMethod] = useState<Methodology | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('全部');

  useEffect(() => {
    if (selectedMethod) {
      window.scrollTo(0, 0);
    }
  }, [selectedMethod]);

  const getCategories = () => {
    const cats = Array.from(new Set(methodologies.map(m => m.category)));
    return cats;
  };

  const allCats = ['全部', ...Array.from(new Set(methodologies.map(m => m.category)))];
  const visibleMethodologies = activeCategory === '全部'
    ? methodologies
    : methodologies.filter(m => m.category === activeCategory);

  if (selectedMethod) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full bg-[#F5F4F0]/30 backdrop-blur-sm min-h-screen pb-24 relative z-20"
      >
        <header className="sticky top-14 left-0 right-0 z-30 bg-[#F5F4F0]/80 backdrop-blur-md border-b border-[#0F0F0F] px-6 lg:px-12 py-4 flex justify-between items-center shadow-sm">
          <button 
            onClick={() => {
              setSelectedMethod(null);
            }} 
            className="flex items-center gap-2 text-[#0F0F0F] hover:text-[#FF3B00] transition-colors font-mono uppercase text-[10px] sm:text-xs tracking-widest font-bold group"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" /> {t('Back to Frameworks', '返回方法论')}
          </button>
          <div className="font-mono text-[10px] uppercase opacity-50 tracking-widest hidden sm:block">System_Node / 03</div>
        </header>
        
        <div className="max-w-4xl mx-auto mt-12 px-6 lg:px-0 flex flex-col space-y-12">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] border border-[#0F0F0F] text-[#0F0F0F] px-3 py-1 mb-6 inline-block">
              {selectedMethod.category}
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-serif italic text-[#0F0F0F] leading-[1.1] mb-6 flex flex-col">
              {selectedMethod.name || selectedMethod.title}
              {selectedMethod.englishName && (
                <span className="text-xl md:text-2xl font-mono uppercase tracking-widest text-[#0F0F0F]/30 not-italic mt-2">{selectedMethod.englishName}</span>
              )}
            </h2>
          </div>
          
          {selectedMethod.oneLineDefinition && (
            <div className="text-xl sm:text-2xl md:text-3xl text-[#0F0F0F] font-serif italic border-l-4 border-[#FF3B00] pl-6 py-2 bg-[#EBEAE5] leading-relaxed">
               {selectedMethod.oneLineDefinition}
            </div>
          )}
          
          <section className="space-y-4">
            <h3 className="text-xl font-serif italic text-[#0F0F0F] pb-4 border-b border-[#0F0F0F]/20">{t('Core Concept', '这是什么概念 (核心概念)')}</h3>
            <div className="space-y-4">
              {(selectedMethod.coreConcept || selectedMethod.summary)?.split(/\n\n+/).map((paragraph, index) => {
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
          
          {selectedMethod.applicableScenarios && (
            <section className="space-y-4">
              <h3 className="text-xl font-serif italic text-[#0F0F0F] pb-4 border-b border-[#0F0F0F]/20">{t('Applicable Scenarios', '什么时候用它 (适用场景)')}</h3>
              <div className="space-y-4">
                {selectedMethod.applicableScenarios.split(/\n\n+/).map((paragraph, index) => {
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
          )}

          {selectedMethod.steps && selectedMethod.steps.length > 0 && (
            <section className="space-y-6">
              <h3 className="text-xl font-serif italic text-[#0F0F0F] pb-4 border-b border-[#0F0F0F]/20">{t('Methodology Phases', '实施步骤')}</h3>
              <div className="grid gap-6">
                {selectedMethod.steps.map((step, idx) => (
                  <div key={idx} className="bg-white/40 backdrop-blur-sm border border-[#0F0F0F]/10 p-6 flex flex-col md:flex-row gap-6 hover:bg-white/80 transition-colors rounded-xl">
                    {typeof step === 'string' ? (
                      <span className="leading-relaxed text-[#0F0F0F]/75">{step}</span>
                    ) : (
                      <>
                        <span className="font-serif italic text-4xl text-[#FF3B00]/40 leading-none">{(idx + 1).toString().padStart(2, '0')}</span>
                        <div className="flex-1 space-y-4">
                          <span className="text-xl font-bold text-[#0F0F0F] block">{step.stepName || step.title}</span>
                          {step.whatToDo && <div className="text-[13px] text-[#0F0F0F]/75"><strong className="text-[#0F0F0F] font-mono tracking-widest text-[10px] uppercase block mb-1">Intent / 意图:</strong>{step.whatToDo}</div>}
                          {step.howToDo && <div className="text-[13px] text-[#0F0F0F]/75"><strong className="text-[#0F0F0F] font-mono tracking-widest text-[10px] uppercase block mb-1">Execution / 执行:</strong>{step.howToDo}</div>}
                          {step.pitfalls && <div className="text-[13px] text-[#0F0F0F]/75 bg-white/60 p-4 border border-[#FF3B00]/30 border-l-4 mt-4 rounded-r-xl"><strong className="text-[#FF3B00] font-mono tracking-widest text-[10px] uppercase block mb-1">Pitfall / 避坑:</strong>{step.pitfalls}</div>}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
          
          <div className="bg-[#F5F4F0]/60 backdrop-blur-md text-[#0F0F0F] p-8 md:p-12 border border-[#0F0F0F]/20 rounded-2xl mt-12 shadow-sm">
            <strong className="block text-[10px] font-mono uppercase tracking-widest text-[#FF3B00] mb-4">{t('Target / Output', '应用示例 / 目标')}</strong>
            <p className="text-lg sm:text-xl font-serif italic leading-relaxed whitespace-pre-wrap font-medium">{selectedMethod.realExample || selectedMethod.goal}</p>
          </div>

          {selectedMethod.commonMistakes && selectedMethod.commonMistakes.length > 0 && (
            <section className="space-y-6 pt-8">
              <h3 className="text-xl font-serif italic text-[#0F0F0F] pb-4 border-b border-[#0F0F0F]/20">{t('Common Anti-Patterns', '常见误区')}</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {selectedMethod.commonMistakes.map((mistake, idx) => (
                  <div key={idx} className="bg-white/40 backdrop-blur-sm border border-[#0F0F0F]/10 rounded-xl p-6 text-sm">
                    {typeof mistake === 'string' ? (
                      <span className="text-[#0F0F0F]/75">{mistake}</span>
                    ) : (
                      <div className="space-y-4">
                        <span className="font-bold text-[#0F0F0F] block text-base sm:text-lg pb-4 border-b border-[#0F0F0F]/10">{mistake.mistake || mistake.mistakeName || '常见误区'}</span>
                        {mistake.whyWrong && <div className="text-[#0F0F0F]/70 leading-relaxed"><strong className="text-[#0F0F0F] block mb-1 font-mono uppercase text-[9px] tracking-widest opacity-60">Why it fails</strong>{mistake.whyWrong}</div>}
                        {mistake.correctWay && <div className="text-[#0F0F0F] bg-white/60 p-4 border-l-2 border-[#10B981] leading-relaxed rounded-r-xl"><strong className="text-[#10B981] block mb-1 font-mono uppercase text-[9px] tracking-widest">Correction</strong>{mistake.correctWay}</div>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {selectedMethod.advancedTips && (
            <section className="space-y-6 pt-8">
              <h3 className="text-xl font-serif italic text-[#0F0F0F] pb-4 border-b border-[#0F0F0F]/20">{t('Advanced Tactics', '进阶技巧')}</h3>
              <p className="text-base text-[#0F0F0F]/75 leading-relaxed whitespace-pre-wrap p-6 border border-[#0F0F0F]/20 bg-white">
                {typeof selectedMethod.advancedTips === 'string' ? selectedMethod.advancedTips : JSON.stringify(selectedMethod.advancedTips)}
              </p>
            </section>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex-1 w-full bg-transparent py-12 px-6 xl:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 border-b border-[#0F0F0F] pb-8">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest opacity-50 block mb-4">{t('Frameworks', '架构')}</span>
          <h1 className="text-6xl md:text-7xl font-serif italic text-[#0F0F0F] mb-4">{t('方法论', 'Methodologies')}<span className="text-xl inline-block ml-4 not-italic font-sans uppercase font-bold tracking-widest opacity-30">{t('Methodologies', '方法论')}</span></h1>
          <p className="text-[#0F0F0F]/60 text-sm font-mono uppercase tracking-widest">{t('Mastering core analytical paradigms', '从思想到框架，全面掌握数据分析的核心概念。')}</p>
        </div>

        <div className="bg-[#F5F4F0]/70 backdrop-blur-md p-6 border border-[#0F0F0F] mb-12 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            <span className="text-[11px] font-mono text-[#0F0F0F] uppercase tracking-widest opacity-60 whitespace-nowrap">{t('Category:', '分类:')}</span>
            <div className="flex gap-2 flex-nowrap">
              {allCats.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`whitespace-nowrap text-[10px] font-mono uppercase tracking-wider px-3 py-1 border transition-colors ${activeCategory === cat ? 'bg-[#0F0F0F] text-[#F5F4F0] border-[#0F0F0F]' : 'bg-transparent text-[#0F0F0F] border-[#0F0F0F]/20 hover:border-[#0F0F0F]'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-24">
          {Array.from(new Set(visibleMethodologies.map(m => m.category))).map(cat => (
            <div key={cat}>
              <h2 className="text-2xl font-mono uppercase tracking-widest text-[#0F0F0F] mb-8 pb-4 border-b border-[#0F0F0F]/20 flex items-center justify-between">
                <span>{cat}</span>
                <span className="text-[10px] bg-[#0F0F0F] text-[#F5F4F0] px-3 py-1">Module // {visibleMethodologies.filter(m => m.category === cat).length}</span>
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleMethodologies.filter(m => m.category === cat).map(m => {
                  return (
                    <div 
                      key={m.id} 
                      className="bg-[#F5F4F0]/60 backdrop-blur-md border border-[#0F0F0F]/30 p-8 flex flex-col h-full hover:-translate-y-1 hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)] hover:bg-[#F5F4F0]/90 transition-all group cursor-pointer rounded-3xl min-h-[280px]"
                      onClick={() => setSelectedMethod(m)}
                    >
                      <div className="flex justify-between items-start mb-6">
                        <h3 className="text-2xl font-bold text-[#0F0F0F] font-serif italic leading-tight">{m.name || m.title}</h3>
                        <ChevronRight className="w-5 h-5 text-[#FF3B00] opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all shrink-0" />
                      </div>
                      
                      <p className="text-[13px] font-medium text-[#0F0F0F]/70 leading-relaxed line-clamp-3 mb-8 flex-1">
                        {m.oneLineDefinition || m.coreConcept || m.summary}
                      </p>
                      
                      <div className="mt-auto border-t border-[#0F0F0F]/20 pt-4">
                        <span className="text-[10px] uppercase tracking-widest font-mono font-bold text-[#0F0F0F]">{t('View Details', '阅读详情')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
