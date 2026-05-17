import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { CaseStudy } from '../data/mock';

interface AddCaseModalProps {
  onClose: () => void;
  onSave: (newCase: CaseStudy) => void;
}

export function AddCaseModal({ onClose, onSave }: AddCaseModalProps) {
  const [formData, setFormData] = useState<any>({
    title: '',
    category: '基础模型',
    difficulty: '入门',
    summary: '',
    background: '',
    analysisProcess: '',
    coreFindings: '',
    improvementStrategies: '',
    businessOutcome: '',
    reflection: ''
  });

  const [fields, setFields] = useState<{name: string, type: string, description: string}[]>([
    { name: '', type: '文本', description: '' }
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.summary) {
      alert('标题和摘要为必填项');
      return;
    }
    
    const newCase: CaseStudy = {
      ...formData as CaseStudy,
      id: `custom_${Date.now()}`,
      fields: fields.filter(f => f.name.trim() !== ''),
      isCustom: true
    };
    
    onSave(newCase);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] flex flex-col shadow-[8px_8px_0px_#1A1A1A] border border-[#1A1A1A]">
        <div className="flex justify-between items-center p-4 border-b border-[#1A1A1A] bg-[#F5F2F0]">
          <h2 className="text-xl font-bold font-serif text-[#1A1A1A]">添加自定义案例</h2>
          <button type="button" onClick={onClose}><X className="w-6 h-6" /></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          <form id="add-case-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2">标题 <span className="text-red-500">*</span></label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border border-[#E5E5E1] p-2 text-sm focus:border-[#1A1A1A] focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2">分类 <span className="text-red-500">*</span></label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full border border-[#E5E5E1] p-2 text-sm focus:border-[#1A1A1A] focus:outline-none bg-white">
                    <option>基础模型</option>
                    <option>进阶方法</option>
                    <option>行业专题</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2">难度 <span className="text-red-500">*</span></label>
                  <select value={formData.difficulty} onChange={e => setFormData({...formData, difficulty: e.target.value})} className="w-full border border-[#E5E5E1] p-2 text-sm focus:border-[#1A1A1A] focus:outline-none bg-white">
                    <option>入门</option>
                    <option>进阶</option>
                    <option>高级</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2">摘要 (最多200字) <span className="text-red-500">*</span></label>
              <textarea required maxLength={200} rows={2} value={formData.summary} onChange={e => setFormData({...formData, summary: e.target.value})} className="w-full border border-[#E5E5E1] p-2 text-sm focus:border-[#1A1A1A] focus:outline-none" />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2">业务背景</label>
              <textarea rows={3} value={formData.background} onChange={e => setFormData({...formData, background: e.target.value})} className="w-full border border-[#E5E5E1] p-2 text-sm focus:border-[#1A1A1A] focus:outline-none" />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2">字段定义</label>
              <div className="border border-[#E5E5E1] divide-y divide-[#E5E5E1]">
                {fields.map((f, i) => (
                  <div key={i} className="flex gap-2 p-2 items-center bg-[#F5F2F0]">
                    <input placeholder="字段名" value={f.name} onChange={e => { const newF = [...fields]; newF[i].name = e.target.value; setFields(newF); }} className="flex-1 p-1.5 text-sm border border-transparent focus:border-[#1A1A1A] focus:outline-none focus:bg-white" />
                    <select value={f.type} onChange={e => { const newF = [...fields]; newF[i].type = e.target.value; setFields(newF); }} className="w-24 p-1.5 text-sm border border-transparent focus:border-[#1A1A1A] focus:outline-none focus:bg-white">
                      <option>文本</option>
                      <option>数值</option>
                      <option>日期</option>
                    </select>
                    <input placeholder="说明" value={f.description} onChange={e => { const newF = [...fields]; newF[i].description = e.target.value; setFields(newF); }} className="flex-1 p-1.5 text-sm border border-transparent focus:border-[#1A1A1A] focus:outline-none focus:bg-white" />
                    <button type="button" onClick={() => setFields(fields.filter((_, idx) => idx !== i))} className="p-1 text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => setFields([...fields, {name: '', type: '文本', description: ''}])} className="mt-2 text-[11px] font-bold uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1 hover:underline">
                <Plus className="w-3 h-3" /> 添加字段
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2">分析过程</label>
              <textarea rows={4} value={formData.analysisProcess} onChange={e => setFormData({...formData, analysisProcess: e.target.value})} className="w-full border border-[#E5E5E1] p-2 text-sm focus:border-[#1A1A1A] focus:outline-none" />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2">核心发现</label>
              <textarea rows={3} value={formData.coreFindings} onChange={e => setFormData({...formData, coreFindings: e.target.value})} className="w-full border border-[#E5E5E1] p-2 text-sm focus:border-[#1A1A1A] focus:outline-none" />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2">改进策略</label>
              <textarea rows={3} value={formData.improvementStrategies} onChange={e => setFormData({...formData, improvementStrategies: e.target.value})} className="w-full border border-[#E5E5E1] p-2 text-sm focus:border-[#1A1A1A] focus:outline-none" />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2">业务成果</label>
              <textarea rows={2} value={formData.businessOutcome} onChange={e => setFormData({...formData, businessOutcome: e.target.value})} className="w-full border border-[#E5E5E1] p-2 text-sm focus:border-[#1A1A1A] focus:outline-none" />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2">反思与演进</label>
              <textarea rows={2} value={formData.reflection} onChange={e => setFormData({...formData, reflection: e.target.value})} className="w-full border border-[#E5E5E1] p-2 text-sm focus:border-[#1A1A1A] focus:outline-none" />
            </div>
          </form>
        </div>
        
        <div className="p-4 border-t border-[#1A1A1A] bg-[#F5F2F0] flex justify-end gap-4">
          <button type="button" onClick={onClose} className="px-6 py-2 text-sm font-bold uppercase border border-[#1A1A1A] hover:bg-[#E5E5E1]">取消</button>
          <button type="submit" form="add-case-form" className="px-6 py-2 text-sm font-bold uppercase bg-[#1A1A1A] text-white hover:bg-black">保存案例</button>
        </div>
      </div>
    </div>
  );
}
