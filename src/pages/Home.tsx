import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../lib/LanguageContext';

interface Module {
  idx: number;
  title: string;
  titleSerif: string;
  desc: string;
  number: string;
  bgColor: string;
  shape1Color: string;
  shape2Color: string;
  path: string;
  thumb: string;
}

const MODULES: Module[] = [
  {
    idx: 0,
    title: 'Data',
    titleSerif: 'Diagnosis',
    desc: '上传 CSV/Excel，AI 自动识别字段、检测异常、生成质量评分。所有数据问题一目了然。',
    number: '01',
    bgColor: '#FFE4B5',
    shape1Color: '#FF5722',
    shape2Color: '#FFC107',
    path: '/data',
    thumb: 'Diagnosis',
  },
  {
    idx: 1,
    title: 'AI',
    titleSerif: 'Copilot',
    desc: '用自然语言提问，AI 自动写 SQL、跑查询、生成图表，并给出业务建议。像和资深分析师对话。',
    number: '02',
    bgColor: '#E3F2FD',
    shape1Color: '#2962FF',
    shape2Color: '#EC407A',
    path: '/assistant',
    thumb: 'Copilot',
  },
  {
    idx: 2,
    title: 'Pyramid',
    titleSerif: 'Reports',
    desc: '基于金字塔原理：结论先行 → 论据支撑 → 数据佐证。一键导出 PDF/PPT 给老板。',
    number: '03',
    bgColor: '#C8E6C9',
    shape1Color: '#00C853',
    shape2Color: '#FFC107',
    path: '/report',
    thumb: 'Reports',
  },
  {
    idx: 3,
    title: 'A/B',
    titleSerif: 'Compare',
    desc: '上传两份数据（不同时间段/渠道/人群），AI 自动找出差异根因，生成归因瀑布图。回答"为什么 B 比 A 好/差"。',
    number: '04',
    bgColor: '#FCE4EC',
    shape1Color: '#EC407A',
    shape2Color: '#2962FF',
    path: '/compare',
    thumb: 'A/B Compare',
  },
  {
    idx: 4,
    title: 'Live',
    titleSerif: 'Case Library',
    desc: '20+ 真实电商案例，覆盖 AARRR、RFM、复购、归因等核心场景。可直接套用到你的业务。',
    number: '05',
    bgColor: '#FFF9C4',
    shape1Color: '#FFC107',
    shape2Color: '#FF5722',
    path: '/cases',
    thumb: 'Cases',
  },
  {
    idx: 5,
    title: 'Method',
    titleSerif: 'ology',
    desc: 'RFM 用户分层、AARRR 增长模型、5Why 根因、DID 因果推断，一键应用到你的数据。',
    number: '06',
    bgColor: '#D1C4E9',
    shape1Color: '#7E57C2',
    shape2Color: '#00C853',
    path: '/methodologies',
    thumb: 'Methodology',
  },
];

function LetterReveal({ text, color, delay = 0 }: { text: string; color?: string; delay?: number }) {
  const [letters, setLetters] = useState<{ char: string; visible: boolean }[]>(
    [...text].map(c => ({ char: c, visible: false }))
  );

  useEffect(() => {
    [...text].forEach((_, i) => {
      setTimeout(() => {
        setLetters(prev => prev.map((l, idx) => idx === i ? { ...l, visible: true } : l));
      }, delay + i * 50);
    });
  }, [text, delay]);

  return (
    <>
      {letters.map((l, i) => (
        <span
          key={i}
          className={`letter ${l.visible ? 'in' : ''}`}
          style={{ color: color }}
        >
          {l.char === ' ' ? '\u00A0' : l.char}
        </span>
      ))}
    </>
  );
}

function SeqReveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return <div className={`seq ${visible ? 'in' : ''} ${className}`}>{children}</div>;
}

function ScrollReveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        obs.disconnect();
      }
    }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={`seq ${visible ? 'in' : ''} ${className}`}>{children}</div>
  );
}

export function Home() {
  const { t } = useLanguage();
  const [currentModule, setCurrentModule] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const moduleSectionRef = useRef<HTMLDivElement>(null);
  const [moduleVisible, setModuleVisible] = useState(false);

  // Auto-rotate modules when section is visible
  useEffect(() => {
    if (!moduleSectionRef.current) return;
    const obs = new IntersectionObserver(([entry]) => {
      setModuleVisible(entry.isIntersecting);
    }, { threshold: 0.3 });
    obs.observe(moduleSectionRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!moduleVisible || !autoRotate) return;
    const t = setInterval(() => {
      setCurrentModule(c => (c + 1) % MODULES.length);
    }, 5000);
    return () => clearInterval(t);
  }, [moduleVisible, autoRotate, currentModule]);

  // Custom cursor
  useEffect(() => {
    const halo = document.createElement('div');
    halo.className = 'cursor-halo';
    document.body.appendChild(halo);

    const handleMove = (e: MouseEvent) => {
      halo.classList.add('visible');
      halo.style.left = e.clientX + 'px';
      halo.style.top = e.clientY + 'px';
      const target = e.target as HTMLElement;
      if (target.closest('a, button, [data-cursor-grow]')) {
        halo.classList.add('big');
      } else {
        halo.classList.remove('big');
      }
    };
    const handleLeave = () => halo.classList.remove('visible');

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseleave', handleLeave);
    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseleave', handleLeave);
      halo.remove();
    };
  }, []);

  const handleThumbClick = (idx: number) => {
    setCurrentModule(idx);
    setAutoRotate(false);
    setTimeout(() => setAutoRotate(true), 8000);
  };

  return (
    <div className="bg-[#F5F1EA] text-[#1A1A1A] min-h-screen">
      {/* Floating decorative shapes */}
      <div className="floating-orb" style={{ width: 500, height: 500, background: '#FFC107', top: '5%', right: '-10%' }}></div>
      <div className="floating-orb" style={{ width: 400, height: 400, background: '#FF5722', bottom: '10%', left: '-10%', animationDelay: '5s' }}></div>
      <div className="floating-orb" style={{ width: 300, height: 300, background: '#2962FF', top: '50%', left: '50%', animationDelay: '10s', opacity: 0.3 }}></div>

      {/* ================ HERO ================ */}
      <section className="relative min-h-screen flex flex-col justify-end px-6 lg:px-10 pb-20 pt-32 overflow-hidden">
        {/* Top mini text */}
        <SeqReveal delay={500} className="absolute top-32 left-6 lg:left-10 text-xs uppercase tracking-[0.2em] flex items-center gap-3">
          <span className="w-8 h-px bg-current"></span>
          <span>↳ Data Intelligence Workspace</span>
        </SeqReveal>

        {/* Side rotating badge */}
        <SeqReveal delay={2500} className="absolute top-1/3 right-10 hidden xl:block">
          <div className="relative w-32 h-32">
            <svg className="rotate-badge w-full h-full" viewBox="0 0 100 100">
              <defs>
                <path id="circle" d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" />
              </defs>
              <text fontSize="9" fontFamily="Inter" letterSpacing="2" fill="currentColor">
                <textPath href="#circle">★ AI POWERED · DATA TO DECISION · 5 MIN ·</textPath>
              </text>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 bg-current rounded-full"></div>
            </div>
          </div>
        </SeqReveal>

        {/* Mega title with letter-by-letter animation */}
        <h1 className="text-[14vw] lg:text-[11vw] xl:text-[10vw] leading-[0.9] tracking-[-0.04em] font-bold mb-8">
          <span className="block">
            <LetterReveal text="Data." delay={800} />
          </span>
          <span className="block serif-italic">
            <LetterReveal text="Decoded." color="#FF5722" delay={1100} />
          </span>
          <span className="block text-[0.4em] tracking-tight font-normal opacity-50 mt-4">
            <LetterReveal text="In five minutes flat." delay={1700} />
          </span>
        </h1>

        {/* Bottom row */}
        <div className="grid grid-cols-12 gap-6 items-end">
          <SeqReveal delay={3500} className="col-span-12 md:col-span-5">
            <p className="text-lg leading-relaxed">
              上传任意数据，AI 自动诊断、归因、出报告。结论先行，让管理层一页拍板。<span className="opacity-50">不需要写代码。</span>
            </p>
          </SeqReveal>
          <SeqReveal delay={3700} className="col-span-12 md:col-span-3 md:col-start-7">
            <div className="text-xs uppercase tracking-[0.15em] opacity-50 mb-3">— What's inside</div>
            <div className="text-sm">
              <div className="flex items-center justify-between border-b border-current/20 py-2"><span>数据诊断</span><span className="opacity-50">01</span></div>
              <div className="flex items-center justify-between border-b border-current/20 py-2"><span>AI 对话分析</span><span className="opacity-50">02</span></div>
              <div className="flex items-center justify-between border-b border-current/20 py-2"><span>金字塔报告</span><span className="opacity-50">03</span></div>
              <div className="flex items-center justify-between border-b border-current/20 py-2"><span>归因瀑布</span><span className="opacity-50">04</span></div>
            </div>
          </SeqReveal>
          <SeqReveal delay={3900} className="col-span-12 md:col-span-3 md:col-start-10 flex flex-col items-end gap-4">
            <Link to="/data" className="group flex items-center gap-3 px-6 py-4 bg-[#1A1A1A] text-[#F5F1EA] rounded-full text-sm font-semibold hover:bg-[#FF5722] transition-colors">
              Start Free
              <span className="w-6 h-6 rounded-full bg-[#F5F1EA] text-[#1A1A1A] flex items-center justify-center group-hover:rotate-45 transition-transform">↗</span>
            </Link>
            <span className="text-xs opacity-50">No credit card required</span>
          </SeqReveal>
        </div>

        {/* Scroll hint */}
        <SeqReveal delay={4500} className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[10px] uppercase tracking-[0.3em]">
          <span>Scroll</span>
          <div className="w-px h-12 bg-current animate-pulse"></div>
        </SeqReveal>
      </section>

      {/* ================ MARQUEE STRIP ================ */}
      <section className="border-y border-current/10 py-4 overflow-hidden bg-[#1A1A1A] text-[#F5F1EA]">
        <div className="marquee-track text-3xl lg:text-5xl">
          <span className="px-8 serif-italic">★ Pyramid Reports</span>
          <span className="px-8 font-bold uppercase">// NL2SQL</span>
          <span className="px-8 serif-italic">★ Causal Attribution</span>
          <span className="px-8 font-bold uppercase">// AI Diagnostic</span>
          <span className="px-8 serif-italic">★ Real-time Insights</span>
          <span className="px-8 font-bold uppercase">// Pyramid Reports</span>
          <span className="px-8 serif-italic">★ NL2SQL</span>
          <span className="px-8 font-bold uppercase">// Causal Attribution</span>
          <span className="px-8 serif-italic">★ AI Diagnostic</span>
          <span className="px-8 font-bold uppercase">// Real-time Insights</span>
        </div>
      </section>

      {/* ================ MODULE SHOWCASE ================ */}
      <section className="relative py-24 lg:py-40 px-6 lg:px-10 overflow-hidden" ref={moduleSectionRef}>
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-12 gap-6 mb-16 items-end">
            <ScrollReveal className="col-span-12 md:col-span-7">
              <div className="text-xs uppercase tracking-[0.2em] opacity-50 mb-4">— Capabilities · 06 Modules</div>
              <h2 className="text-5xl lg:text-7xl tracking-tight font-bold leading-[0.95]">
                One platform.<br />
                <span className="serif-italic">Six superpowers.</span>
              </h2>
            </ScrollReveal>
            <ScrollReveal className="col-span-12 md:col-span-4 md:col-start-9 text-sm opacity-70">
              每个模块都为业务决策服务。点击下方缩略图切换，或等待自动轮播。
            </ScrollReveal>
          </div>

          {/* Stage */}
          <div className="relative h-[600px] rounded-3xl overflow-hidden">
            {MODULES.map((m) => (
              <Link
                key={m.idx}
                to={m.path}
                className="absolute inset-0 transition-opacity duration-700"
                style={{
                  background: m.bgColor,
                  opacity: currentModule === m.idx ? 1 : 0,
                  pointerEvents: currentModule === m.idx ? 'auto' : 'none',
                }}
              >
                <div
                  className="absolute rounded-full transition-all duration-1000"
                  style={{ width: 600, height: 600, background: m.shape1Color, top: -200, right: -200 }}
                ></div>
                <div
                  className="absolute rounded-full transition-all duration-1000"
                  style={{ width: 350, height: 350, background: m.shape2Color, bottom: -100, left: '20%' }}
                ></div>
                <div className="relative z-10 grid grid-cols-12 gap-6 h-full p-10 lg:p-16">
                  <div className="col-span-12 lg:col-span-7 flex flex-col justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-[0.2em] mb-6">Module {m.number} / 06</div>
                      <h3 className="text-6xl lg:text-8xl font-bold tracking-tight leading-[0.9] mb-6">
                        {m.title} <span className="serif-italic">{m.titleSerif}</span>
                      </h3>
                      <p className="text-lg max-w-md opacity-70">{m.desc}</p>
                    </div>
                    <div className="flex gap-4 items-center">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <span className="w-12 h-px bg-current"></span>
                        进入模块
                      </div>
                      <span className="serif-italic text-3xl">→</span>
                    </div>
                  </div>
                  <div className="col-span-12 lg:col-span-5 relative">
                    <div className="serif-italic absolute -bottom-8 right-0 leading-[0.85] tracking-[-0.05em] font-light" style={{ fontSize: 'clamp(8rem, 22vw, 18rem)' }}>{m.number}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Thumbnail nav */}
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
            {MODULES.map((m) => {
              const isActive = currentModule === m.idx;
              return (
                <button
                  key={m.idx}
                  onClick={() => handleThumbClick(m.idx)}
                  className={`relative rounded-2xl p-4 text-left overflow-hidden transition-colors ${
                    isActive ? 'bg-[#1A1A1A] text-[#F5F1EA]' : 'border border-current/20 hover:bg-[#1A1A1A] hover:text-[#F5F1EA]'
                  }`}
                >
                  <div className="text-[10px] uppercase tracking-widest opacity-60 mb-2">{m.number}</div>
                  <div className="text-sm font-semibold">{m.thumb}</div>
                  {isActive && autoRotate && (
                    <div
                      className="absolute bottom-0 left-0 h-[3px] bg-current"
                      style={{ animation: 'progress 5s linear forwards', width: 0 }}
                    ></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        <style>{`
          @keyframes progress {
            from { width: 0%; }
            to { width: 100%; }
          }
        `}</style>
      </section>

      {/* ================ STEPS ================ */}
      <section className="relative py-32 px-6 lg:px-10">
        <div className="max-w-[1400px] mx-auto">
          <ScrollReveal className="mb-20">
            <div className="text-xs uppercase tracking-[0.2em] opacity-50 mb-4">— Process</div>
            <h2 className="text-5xl lg:text-7xl tracking-tight font-bold leading-[0.95]">
              从数据到决策<br /><span className="serif-italic">三步搞定。</span>
            </h2>
          </ScrollReveal>

          <div className="space-y-2">
            <ScrollReveal>
              <div className="grid grid-cols-12 gap-6 items-center border-t border-current/10 py-10 group hover:bg-[#FF5722] hover:text-white transition-colors -mx-4 px-4 rounded-3xl">
                <div className="col-span-2 serif-italic text-7xl lg:text-9xl">01</div>
                <div className="col-span-12 md:col-span-6">
                  <h3 className="text-2xl lg:text-4xl font-bold mb-2">上传你的数据</h3>
                  <p className="opacity-70">拖拽 CSV、Excel 文件，AI 自动识别字段类型、推断业务场景。</p>
                </div>
                <div className="col-span-12 md:col-span-4 text-right">
                  <span className="text-sm uppercase tracking-widest opacity-60">~ 30 秒</span>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal>
              <div className="grid grid-cols-12 gap-6 items-center border-t border-current/10 py-10 group hover:bg-[#2962FF] hover:text-white transition-colors -mx-4 px-4 rounded-3xl">
                <div className="col-span-2 serif-italic text-7xl lg:text-9xl">02</div>
                <div className="col-span-12 md:col-span-6">
                  <h3 className="text-2xl lg:text-4xl font-bold mb-2">AI 智能诊断</h3>
                  <p className="opacity-70">大模型分析数据质量、识别异常、生成关键指标。</p>
                </div>
                <div className="col-span-12 md:col-span-4 text-right">
                  <span className="text-sm uppercase tracking-widest opacity-60">~ 1 分钟</span>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal>
              <div className="grid grid-cols-12 gap-6 items-center border-t border-current/10 py-10 group hover:bg-[#1A1A1A] hover:text-white transition-colors -mx-4 px-4 rounded-3xl">
                <div className="col-span-2 serif-italic text-7xl lg:text-9xl">03</div>
                <div className="col-span-12 md:col-span-6">
                  <h3 className="text-2xl lg:text-4xl font-bold mb-2">出报告 → 拍板</h3>
                  <p className="opacity-70">金字塔结构的决策报告，导出 PDF/PPT 给老板。</p>
                </div>
                <div className="col-span-12 md:col-span-4 text-right">
                  <span className="text-sm uppercase tracking-widest opacity-60">~ 3 分钟</span>
                </div>
              </div>
            </ScrollReveal>
            <div className="border-t border-current/10"></div>
          </div>
        </div>
      </section>

      {/* ================ CTA ================ */}
      <section className="relative py-32 px-6 lg:px-10 overflow-hidden">
        <ScrollReveal className="max-w-[1400px] mx-auto text-center relative">
          <div className="text-xs uppercase tracking-[0.2em] opacity-50 mb-4">— Ready?</div>
          <h2 className="text-7xl lg:text-[12vw] font-bold leading-[0.85] tracking-tight mb-10">
            Let's <br /><span className="serif-italic text-[#FF5722]">decode</span><br />your data.
          </h2>
          <Link to="/data" className="inline-flex items-center gap-3 px-8 py-5 bg-[#1A1A1A] text-[#F5F1EA] rounded-full text-base font-semibold hover:bg-[#FF5722] transition-colors">
            免费开始 →
          </Link>
        </ScrollReveal>
      </section>

      <footer className="border-t border-current/10 py-8 px-6 lg:px-10 flex flex-wrap items-center justify-between text-xs uppercase tracking-widest opacity-60">
        <span>© 2026 Synthesis</span>
        <span>Made with care · Powered by AI</span>
      </footer>
    </div>
  );
}
