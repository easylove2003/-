import React, { useState } from 'react';
import { ReportTemplate, saveUserTemplate, listAllTemplates } from '../data/reportTemplates';
import { Trash2, ArrowUp, ArrowDown, Plus, Save, X } from 'lucide-react';

interface Props {
  onClose: () => void;
  onSaved: () => void;
}

export const TemplateEditor: React.FC<Props> = ({ onClose, onSaved }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sections, setSections] = useState<{id: number; title: string; hint: string}[]>([
    { id: 1, title: '第一节', hint: '分析...' }
  ]);

  const handleSave = () => {
    if (!name.trim()) return alert('请输入模板名称');
    saveUserTemplate({
      id: `custom_${Date.now()}`,
      name,
      description,
      sections: sections.map((s, i) => ({ ...s, id: i + 1 }))
    });
    onSaved();
    onClose();
  };

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const newSec = [...sections];
    [newSec[idx - 1], newSec[idx]] = [newSec[idx], newSec[idx - 1]];
    setSections(newSec);
  };

  const moveDown = (idx: number) => {
    if (idx === sections.length - 1) return;
    const newSec = [...sections];
    [newSec[idx + 1], newSec[idx]] = [newSec[idx], newSec[idx + 1]];
    setSections(newSec);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 max-w-2xl w-full max-h-[85vh] flex flex-col relative z-10 border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">创建专属报告模板</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full"><X className="w-5 h-5"/></button>
        </div>
        
        <div className="flex-1 overflow-y-auto pr-2 space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">模板名称</label>
            <input value={name} onChange={e=>setName(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500" placeholder="例如：财务月报模板" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">描述</label>
            <input value={description} onChange={e=>setDescription(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500" placeholder="一句话说明它的用途" />
          </div>

          <div>
             <div className="flex items-center justify-between mb-2">
               <label className="block text-xs font-bold text-gray-700">章节结构</label>
               <button onClick={() => setSections([...sections, {id: Date.now(), title: '新章节', hint: ''}])} className="text-xs text-indigo-600 font-bold flex items-center gap-1 hover:text-indigo-800"><Plus className="w-3 h-3"/> 添加章节</button>
             </div>
             
             <div className="space-y-3">
               {sections.map((sec, idx) => (
                 <div key={idx} className="flex gap-3 bg-white border border-gray-200 p-4 rounded-xl shadow-sm items-start">
                    <div className="flex flex-col gap-1 mt-1">
                      <button onClick={() => moveUp(idx)} disabled={idx === 0} className="text-gray-400 hover:text-indigo-600 disabled:opacity-30"><ArrowUp className="w-4 h-4"/></button>
                      <button onClick={() => moveDown(idx)} disabled={idx === sections.length - 1} className="text-gray-400 hover:text-indigo-600 disabled:opacity-30"><ArrowDown className="w-4 h-4"/></button>
                    </div>
                    <div className="flex-1 flex flex-col gap-2">
                      <input value={sec.title} onChange={e => { const newS=[...sections]; newS[idx].title=e.target.value; setSections(newS); }} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-sm font-bold focus:outline-none focus:border-indigo-500" placeholder="章节标题" />
                      <input value={sec.hint} onChange={e => { const newS=[...sections]; newS[idx].hint=e.target.value; setSections(newS); }} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-600 focus:outline-none focus:border-indigo-500" placeholder="AI 撰写要求提示词（Hint）" />
                    </div>
                    <button onClick={() => setSections(sections.filter((_, i) => i !== idx))} className="text-gray-300 hover:text-red-500 mt-2"><Trash2 className="w-4 h-4"/></button>
                 </div>
               ))}
             </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-3">
           <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">取消</button>
           <button onClick={handleSave} className="px-5 py-2.5 text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl transition-colors flex items-center gap-2">
             <Save className="w-4 h-4" /> 保存并使用模板
           </button>
        </div>
      </div>
    </div>
  );
};
