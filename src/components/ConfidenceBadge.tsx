import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { ShieldCheck, AlertCircle, AlertTriangle, X } from 'lucide-react';

export const ConfidenceBadge = ({ level, basis, risk }: { level: string; basis: string; risk: string }) => {
  const [showModal, setShowModal] = useState(false);

  if (level === 'HIGH') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-100 mt-2 w-fit not-prose">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span>高置信度·可用于决策 (依据: {basis})</span>
      </span>
    );
  }

  if (level === 'MEDIUM') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-amber-50 text-amber-700 text-xs font-medium border border-amber-100 mt-2 w-fit not-prose">
        <AlertCircle className="w-4 h-4 text-amber-600" />
        <span>中等置信度·建议交叉验证 (依据: {basis} | 风险: {risk})</span>
      </span>
    );
  }

  return (
    <>
      <span 
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-rose-50 text-rose-700 text-xs font-medium border border-rose-200 mt-2 cursor-pointer w-fit hover:bg-rose-100 transition-colors not-prose shadow-sm"
        onClick={() => setShowModal(true)}
      >
        <AlertTriangle className="w-4 h-4 text-rose-600" />
        <span>低置信度·点击查看风险详情</span>
      </span>

      {showModal && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-rose-100 shadow-2xl p-6 max-w-md w-full mx-4 flex flex-col gap-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">低置信度警告</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="bg-rose-50 rounded-xl p-4 border border-rose-100 text-sm text-rose-800">
              <p className="font-semibold mb-1">风险: {risk || '可能导致误导性决策'}</p>
              <p className="text-rose-600">该结论数据基础薄弱，用于重要决策前请补充数据或咨询专业分析师。</p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 border border-gray-100">
              <span className="font-semibold text-gray-700 border-b border-gray-200 pb-1 mb-2 block">诊断依据</span>
              <p>{basis || '样本量不足或存在明显数据质量问题'}</p>
            </div>
            
            <button 
              className="mt-2 w-full py-2.5 bg-rose-600 text-white rounded-xl font-medium hover:bg-rose-700 transition-colors shadow-sm"
              onClick={() => setShowModal(false)}
            >
              我知道了
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export const processConfidenceTags = (text: string) => {
  if (!text) return '';
  return text.replace(
    /\[置信度:\s*(HIGH|MEDIUM|LOW)\s*\|\s*依据:\s*([^|\]]+?)\s*\|\s*风险:\s*([^\]]+?)\]/g,
    '<confidence level="$1" basis="$2" risk="$3"></confidence>'
  );
}

export const countLowConfidence = (text: string) => {
  if (!text) return 0;
  const matches = text.match(/\[置信度:\s*LOW\s*\|/g);
  return matches ? matches.length : 0;
}
