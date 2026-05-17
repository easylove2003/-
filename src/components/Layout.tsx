import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { BarChart3, Database, MessageSquare, Zap, Layers, Sparkles, ArrowRight, Globe } from 'lucide-react';
import { UserGuide } from './UserGuide';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../lib/LanguageContext';

export function Layout() {
  const location = useLocation();
  const [time, setTime] = useState('');
  const { lang, toggleLang, t } = useLanguage();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navLinks = [
    { name: t('Cases', '案例库'), path: '/cases' },
    { name: t('Strategy', '策略专项'), path: '/strategies' },
    { name: t('Methods', '方法论'), path: '/methodologies' },
    { name: t('Analysis', '分析模拟'), path: '/data' },
    { name: t('Compare', '横向对比'), path: '/compare' },
    { name: t('AI.Assist', '智能助手'), path: '/assistant' },
    { name: t('Report', '智能报表'), path: '/report' }
  ];

  return (
    <div className="min-h-screen bg-transparent text-[#0F0F0F] font-sans flex flex-col relative w-full selection:bg-[#FF3B00] selection:text-white">
      {/* Structural Minimalist Accents (Dynamic) */}
      <div className="fixed top-1/4 left-1/4 w-[50vw] h-[50vw] bg-[#FF3B00]/5 blur-[120px] rounded-full pointer-events-none mix-blend-multiply z-0"></div>
      <div className="fixed bottom-0 right-1/4 w-[30vw] h-[30vw] bg-[#00A3FF]/5 blur-[100px] rounded-full pointer-events-none mix-blend-multiply z-0"></div>
      <div className="fixed inset-0 pointer-events-none bg-grid-pattern z-0 opacity-40"></div>

      {/* Extreme Minimalist Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#F5F4F0]/80 backdrop-blur-md border-b border-[#0F0F0F]">
        <div className="w-full h-14 flex items-stretch px-0">
          
          {/* Logo Section */}
          <Link to="/" className="flex items-center px-6 border-r border-[#0F0F0F] hover:bg-[#0F0F0F] hover:text-[#F5F4F0] transition-colors group">
            <span className="font-serif italic text-2xl tracking-tight leading-none pt-1">Synthesis</span>
          </Link>
          
          {/* Main Nav */}
          <nav className="hidden lg:flex items-stretch border-r border-[#0F0F0F] flex-1">
            {navLinks.map((link) => {
              const isActive = location.pathname.startsWith(link.path);
              return (
                <Link 
                  key={link.path}
                  to={link.path} 
                  className={`flex items-center px-6 text-[11px] font-mono uppercase tracking-[0.1em] border-r border-[#0F0F0F] last:border-r-0 transition-colors ${
                    isActive 
                      ? 'bg-[#0F0F0F] text-[#F5F4F0]' 
                      : 'hover:bg-[#EBEAE5] text-[#0F0F0F]'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <div className="hidden lg:flex items-center px-6 text-[10px] font-mono text-[#0F0F0F]/60 border-l border-[#0F0F0F] uppercase">
            {time}
          </div>

          <button onClick={toggleLang} className="flex items-center justify-center px-6 border-l border-[#0F0F0F] hover:bg-[#EBEAE5] transition-colors group cursor-pointer">
            <Globe className="w-4 h-4 text-[#0F0F0F] group-hover:text-[#FF3B00] transition-colors" />
            <span className="ml-2 font-mono text-[10px] font-bold uppercase">{lang === 'en' ? 'EN' : '中'}</span>
          </button>

          <Link to="/data" className="flex items-center px-6 text-[11px] font-mono tracking-widest bg-[#FF3B00] text-white hover:bg-[#0F0F0F] transition-colors uppercase gap-2 border-l border-[#0F0F0F]">
            START EXPLORE
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pt-14 flex flex-col relative z-10 w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(4px)" }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="flex-1 flex flex-col w-full h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Site Frame borders */}
      <div className="fixed top-0 bottom-0 left-0 w-6 border-r border-[#0F0F0F] bg-[#F5F4F0]/80 backdrop-blur-md z-40 hidden xl:flex items-center justify-center pointer-events-none">
         <span className="transform -rotate-90 text-[9px] font-mono tracking-[0.2em] uppercase whitespace-nowrap opacity-40">System Env :: 01</span>
      </div>
      <div className="fixed top-0 bottom-0 right-0 w-6 border-l border-[#0F0F0F] bg-[#F5F4F0]/80 backdrop-blur-md z-40 hidden xl:block pointer-events-none"></div>
      
      <UserGuide />
    </div>
  );
}
