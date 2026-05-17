import React from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Target,
  BarChart3,
  Sparkles,
  Lightbulb,
  Wand2,
  ArrowUpRight,
} from "lucide-react";
import { useLanguage } from "../lib/LanguageContext";

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: delay * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function Home() {
  const { t, lang } = useLanguage();

  const cards = [
    {
      index: "01",
      title: "Case Studies",
      subtitle: "案例库",
      icon: BookOpen,
      desc: t(
        "20 in-depth e-commerce case analyses, covering basic to advanced business models.",
        "20个深度电商真实案例分析，涵盖从基础到特定的店铺赚钱模式（运营模型）。"
      ),
      tags: ["AARRR", "RFM", "Analytics"],
      path: "/cases",
    },
    {
      index: "02",
      title: "Strategies",
      subtitle: "策略专项",
      icon: Target,
      desc: t(
        "6 systematic growth strategies covering user segmentation and competitive intelligence.",
        "6个让店铺业绩系统性增长的策略，教你如何把用户分群（用户分层）以及分析对手（竞品情报）。"
      ),
      tags: ["User Ops", "Optimization"],
      path: "/strategies",
    },
    {
      index: "03",
      title: "Data Core",
      subtitle: "数据分析",
      icon: BarChart3,
      desc: t(
        "Algorithm-agnostic data upload, automatic field mapping, and structural insights.",
        "支持各类常见表格数据上传，自动帮您整理数据并发现背后的规律（生成结构化洞察）。"
      ),
      tags: ["Ingestion", "Statistics"],
      path: "/data",
    },
    {
      index: "04",
      title: "AI Assist",
      subtitle: "智能助手",
      icon: Sparkles,
      desc: t(
        "LLM-powered analytical consultation matching bespoke methodologies.",
        "基于强大AI的聊天助手，像资深顾问一样解答疑惑，并匹配合适的分析方法（方法论）。"
      ),
      tags: ["NLP", "Heuristics"],
      path: "/assistant",
    },
    {
      index: "05",
      title: "Frameworks",
      subtitle: "方法论",
      icon: Lightbulb,
      desc: t(
        "Core analytical schematics from root-cause analysis to growth hacking.",
        "提供各种分析工具，从寻找问题根本原因（根因推断）到实现业务爆发式增长（增长黑客框架）。"
      ),
      tags: ["5Why", "OSM"],
      path: "/methodologies",
    },
    {
      index: "06",
      title: "Smart Report",
      subtitle: "智能报表",
      icon: Wand2,
      desc: t(
        "Auto-generate enterprise-grade BI reports and actionable strategies.",
        "上传数据，自动识别业务场景，一键生成智能报表及可交互的业务执行策略。"
      ),
      tags: ["BI Dashboard", "Strategy"],
      path: "/report",
    }
  ];

  return (
    <div className="flex-1 w-full flex flex-col xl:px-6">
      {/* Editorial Hero Section */}
      <section className="relative px-6 xl:px-8 pt-24 pb-20 flex flex-col justify-end min-h-[75vh] border-b border-[#0F0F0F]">
        {/* Background typographic noise */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[30vw] font-serif italic text-[#0F0F0F] opacity-[0.02] pointer-events-none leading-none whitespace-nowrap overflow-hidden">
          Synthesis
        </div>

        <div className="grid grid-cols-12 gap-6 relative z-10 w-full mb-12">
          <div className="col-span-12 lg:col-span-9">
            <motion.h1 
              initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="text-[4rem] md:text-[7.5vw] font-serif italic text-[#0F0F0F] leading-[0.8] tracking-[-0.04em] uppercase mb-4"
            >
              Intelligence <br />
              <span className="font-sans not-italic font-medium tracking-tight text-[#0F0F0F]">Architecture.</span>
            </motion.h1>
          </div>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="col-span-12 lg:col-span-3 flex flex-col justify-end lg:text-right"
          >
            <div className="font-mono text-[9px] uppercase tracking-[0.2em] border-t border-[#0F0F0F] pt-3 mb-2 text-[#0F0F0F]/60">
              {t("Platform Status", "运行状态")}
            </div>
            <div className="font-mono text-sm tracking-tight text-[#0F0F0F]">{t("System Online — v2.4", "系统在线 — v2.4")}</div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="grid grid-cols-12 gap-6"
        >
          <div className="col-span-12 md:col-span-6 lg:col-span-4">
             <p className="text-[#0F0F0F] text-sm md:text-base font-medium leading-relaxed mb-6">
                {t(
                  "A rigorous, full-chain analytics workspace designed for enterprise-grade data strategists and growth engineers.",
                  "一个严谨的全链路全链路分析工作空间，专为企业级数据战略家和增长工程师设计。"
                )}
             </p>
          </div>
          <div className="col-span-12 md:col-span-6 lg:col-span-5 lg:col-start-8 flex gap-4">
            <Link to="/data" className="group flex-1 flex flex-col justify-between border border-[#0F0F0F] bg-[#0F0F0F] text-[#F5F4F0] p-6 hover:bg-[#FF3B00] hover:border-[#FF3B00] transition-colors duration-300">
               <span className="font-mono text-[10px] tracking-widest uppercase opacity-70 mb-8 block">{t("Initialize", "初始化")}</span>
               <div className="flex items-end justify-between">
                 <span className="font-serif italic text-3xl">{t("Explore Data", "数据探索")}</span>
                 <ArrowUpRight className="w-6 h-6 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
               </div>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Marquee Divider */}
      <div className="overflow-hidden border-b border-[#0F0F0F] bg-[#0F0F0F] text-[#F5F4F0] py-3 flex items-center">
        <motion.div 
          animate={{ x: ["0%", "-50%"] }}
          transition={{ ease: "linear", duration: 20, repeat: Infinity }}
          className="flex whitespace-nowrap gap-8 font-mono text-[10px] uppercase tracking-[0.3em] items-center"
        >
          <span>++ 20+ Case Architectures</span>
          <span className="w-1.5 h-1.5 bg-[#FF3B00] rounded-full"></span>
          <span>++ 6 Strategy Frameworks</span>
          <span className="w-1.5 h-1.5 bg-[#FF3B00] rounded-full"></span>
          <span>++ 22 Core Datasets</span>
          <span className="w-1.5 h-1.5 bg-[#FF3B00] rounded-full"></span>
          <span>++ Realtime Inference Engine</span>
          <span className="w-1.5 h-1.5 bg-[#FF3B00] rounded-full"></span>
          <span>++ 20+ Case Architectures</span>
          <span className="w-1.5 h-1.5 bg-[#FF3B00] rounded-full"></span>
          <span>++ 6 Strategy Frameworks</span>
          <span className="w-1.5 h-1.5 bg-[#FF3B00] rounded-full"></span>
          <span>++ 22 Core Datasets</span>
          <span className="w-1.5 h-1.5 bg-[#FF3B00] rounded-full"></span>
          <span>++ Realtime Inference Engine</span>
          <span className="w-1.5 h-1.5 bg-[#FF3B00] rounded-full"></span>
        </motion.div>
      </div>

      {/* Grid Modules */}
      <section className="relative z-10 p-6 lg:p-12 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 w-full">
          {cards.map((card, idx) => (
            <Link 
              to={card.path} 
              key={card.title} 
              className="group flex flex-col p-8 md:p-10 relative overflow-hidden rounded-[2.5rem] bg-white/30 backdrop-blur-md border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_60px_rgb(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-500"
            >
              {/* Dynamic hover glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              
              <FadeIn delay={idx} className="h-full flex flex-col relative z-10">
                <div className="flex justify-between items-start mb-24">
                  <span className="font-mono text-sm opacity-60 transition-opacity duration-500">{card.index}</span>
                  <div className="w-12 h-12 border border-[#0F0F0F]/10 rounded-full flex items-center justify-center bg-transparent group-hover:bg-[#FF3B00] group-hover:border-[#FF3B00] group-hover:text-[#F5F4F0] group-hover:-rotate-12 group-hover:scale-110 transition-all duration-500 shadow-sm relative overflow-hidden">
                    <div className="absolute inset-0 bg-[#FF3B00]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <card.icon className="w-5 h-5 relative z-10" />
                  </div>
                </div>
                
                <div className="mt-auto relative">
                  <div className="flex items-center gap-4 mb-4 transform transition-transform duration-500 group-hover:translate-x-2">
                    <h3 className="text-3xl md:text-4xl font-serif text-[#0F0F0F] tracking-tight">{lang === 'en' ? card.title : card.subtitle}</h3>
                    <span className="text-[10px] font-mono border border-[#0F0F0F]/20 px-2 py-1 rounded opacity-60 uppercase bg-transparent transition-colors duration-500 tracking-wider shadow-sm">{lang === 'en' ? card.subtitle : card.title}</span>
                  </div>
                  <p className="text-[14px] text-[#0F0F0F]/60 leading-relaxed mb-10 font-medium transform transition-all duration-500 group-hover:translate-x-2">{card.desc}</p>
                  
                  <div className="flex flex-wrap gap-3 transform transition-all duration-500 group-hover:translate-x-2">
                    {card.tags.map((tag, tagIdx) => (
                      <span 
                        key={tag} 
                        className="text-[10px] font-mono border border-[#0F0F0F]/10 text-[#0F0F0F]/70 px-3 py-1.5 uppercase tracking-widest bg-white/40 backdrop-blur-sm rounded-full group-hover:bg-white/60 group-hover:border-[#0F0F0F]/20 transition-all duration-500 shadow-sm"
                        style={{ transitionDelay: `${tagIdx * 50}ms` }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </FadeIn>
            </Link>
          ))}
        </div>
      </section>
      
      {/* Footer minimal */}
      <footer className="py-8 px-6 lg:px-8 border-b border-[#0F0F0F] flex flex-col md:flex-row items-center justify-between font-mono text-[9px] uppercase tracking-widest text-[#0F0F0F]/50">
         <span>© {new Date().getFullYear()} Synthesis Intelligence. All rights reserved.</span>
         <span className="mt-4 md:mt-0">Design Protocol :: A-W-W-W-A-R-D</span>
      </footer>
    </div>
  );
}
