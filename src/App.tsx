import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Home } from './pages/Home';
import { Cases } from './pages/Cases';
import { Strategies } from './pages/Strategies';
import { Methodologies } from './pages/Methodologies';
import { DataAnalysis } from './pages/DataAnalysis';
import { AIAssistant } from './pages/AIAssistant';
import { SmartReport } from './pages/SmartReport';
import { DataCompare } from './pages/DataCompare';
import { LanguageProvider } from './lib/LanguageContext';

import { SharedReportView } from './pages/SharedReportView';

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        {/* Noise Overlay (Global) */}
        <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03]">
          <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <filter id="noise">
               <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
            </filter>
            <rect width="100%" height="100%" filter="url(#noise)" />
          </svg>
        </div>
        {/* Ink Wash Background (Global) */}
        <div className="fixed inset-0 pointer-events-none z-[-2] bg-[#F5F4F0]" />
        <div 
          className="fixed inset-0 pointer-events-none z-[-1]"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2670')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.12,
            filter: 'grayscale(100%) contrast(150%) brightness(120%) sepia(20%)',
            mixBlendMode: 'multiply'
          }}
        />
        {/* Subtle Grid Background (Global) */}
        <div className="fixed inset-0 pointer-events-none bg-grid-pattern z-0 opacity-50"></div>

        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="cases" element={<Cases />} />
            <Route path="strategies" element={<Strategies />} />
            <Route path="methodologies" element={<Methodologies />} />
            <Route path="data" element={<DataAnalysis />} />
            <Route path="assistant" element={<AIAssistant />} />
            <Route path="report" element={<ErrorBoundary><SmartReport /></ErrorBoundary>} />
            <Route path="compare" element={<DataCompare />} />
          </Route>
          {/* Shared report view without layout */}
          <Route path="/shared/:id" element={<SharedReportView />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}
