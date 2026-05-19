import React, { useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../lib/LanguageContext';
import { UserGuide } from './UserGuide';

export function Layout() {
  const location = useLocation();
  const { lang, toggleLang, t } = useLanguage();
  const isHome = location.pathname === '/';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const navLinks = [
    { name: t('Analysis', '数据分析'), path: '/data' },
    { name: t('Assistant', 'AI 助手'), path: '/assistant' },
    { name: t('Report', '智能报告'), path: '/report' },
    { name: t('A/B Compare', 'A/B 对比'), path: '/compare' },
    { name: t('Cases', '案例库'), path: '/cases' },
    { name: t('Strategy', '策略'), path: '/strategies' },
    { name: t('Methods', '方法论'), path: '/methodologies' },
  ];

  return (
    <div className="min-h-screen bg-[#F5F1EA] text-[#1A1A1A] font-sans flex flex-col relative w-full selection:bg-[#FF5722] selection:text-white">

      {/* Header — uses mix-blend-difference on home, solid on inner pages */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 ${
          isHome
            ? 'mix-blend-difference text-white px-6 lg:px-10 py-5 flex items-center justify-between'
            : 'bg-[#F5F1EA]/80 backdrop-blur-xl border-b border-[#1A1A1A]/10'
        }`}
      >
        {isHome ? (
          <>
            <Link to="/" className="flex items-baseline">
              <span className="serif-italic text-3xl">Synthesis</span>
              <span className="text-xl align-top">*</span>
            </Link>
            <nav className="hidden lg:flex gap-7 text-sm font-medium">
              {navLinks.map(link => (
                <Link key={link.path} to={link.path} className="ul-link">{link.name}</Link>
              ))}
            </nav>
            <div className="flex items-center gap-4 text-sm">
              <button onClick={toggleLang} className="ul-link font-medium">{lang === 'en' ? 'EN' : '中文'}</button>
              <span className="opacity-60 hidden sm:inline text-xs uppercase tracking-[0.15em]">v 2.4 · Live</span>
            </div>
          </>
        ) : (
          <div className="max-w-[1600px] mx-auto w-full h-16 flex items-center px-4 lg:px-6">
            {/* Logo */}
            <Link to="/" className="flex items-baseline mr-8 group">
              <span className="serif-italic text-2xl text-[#1A1A1A]">Synthesis</span>
              <span className="text-lg align-top text-[#FF5722]">*</span>
            </Link>

            {/* Nav */}
            <nav className="hidden lg:flex items-center gap-1 flex-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path ||
                  (link.path !== '/' && location.pathname.startsWith(link.path));
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-[#1A1A1A] text-[#F5F1EA]'
                        : 'text-[#1A1A1A]/70 hover:text-[#1A1A1A] hover:bg-[#1A1A1A]/5'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3 ml-auto">
              <button
                onClick={toggleLang}
                className="text-sm font-medium text-[#1A1A1A]/60 hover:text-[#1A1A1A] transition-colors"
              >
                {lang === 'en' ? 'EN' : '中文'}
              </button>
              <Link
                to="/data"
                className="px-4 py-2 bg-[#1A1A1A] text-[#F5F1EA] rounded-full text-sm font-semibold hover:bg-[#FF5722] transition-colors"
              >
                Launch →
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className={`flex-1 flex flex-col relative w-full ${isHome ? '' : 'pt-16'}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex-1 flex flex-col w-full h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <UserGuide />
    </div>
  );
}
