import React from 'react';
import { Check, Circle, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export interface WorkflowStep {
  id: string;
  label: string;
  desc?: string;
  status: 'done' | 'active' | 'pending' | 'skipped';
  onClick?: () => void;
}

interface Props {
  steps: WorkflowStep[];
  className?: string;
}

export const WorkflowStepper: React.FC<Props> = ({ steps, className = '' }) => {
  return (
    <div className={`flex items-stretch gap-2 overflow-x-auto py-2 ${className}`}>
      {steps.map((s, i) => (
        <React.Fragment key={s.id}>
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={s.onClick}
            className={`relative shrink-0 px-4 py-3 rounded-xl border min-w-[160px] transition-all ${
              s.onClick ? 'cursor-pointer hover:shadow-md' : 'cursor-default'
            } ${
              s.status === 'done' ? 'bg-emerald-50 border-emerald-300' :
              s.status === 'active' ? 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-200' :
              s.status === 'skipped' ? 'bg-gray-50 border-gray-200 opacity-50' :
              'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                s.status === 'done' ? 'bg-emerald-500 text-white' :
                s.status === 'active' ? 'bg-indigo-500 text-white' :
                'bg-gray-200 text-gray-500'
              }`}>
                {s.status === 'done' && <Check className="w-3 h-3" />}
                {s.status === 'active' && <Loader2 className="w-3 h-3 animate-spin" />}
                {(s.status === 'pending' || s.status === 'skipped') && <span>{i + 1}</span>}
              </div>
              <span className="text-xs font-bold text-gray-800">{s.label}</span>
            </div>
            {s.desc && <p className="text-[10px] text-gray-500 line-clamp-2 ml-7">{s.desc}</p>}
          </motion.div>
          {i < steps.length - 1 && (
            <div className="self-center text-gray-300">
              <ArrowRight className="w-4 h-4" />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
