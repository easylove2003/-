import React, { useState } from 'react';
import { CanvasBlock } from '../../lib/canvas-engine/types';
import { motion } from 'motion/react';
import { runSQL } from '../../lib/duckdb-engine';
import { Play, Loader2 } from 'lucide-react';

interface BlockProps {
  block: CanvasBlock;
}

export const CodeTerminalBlock: React.FC<BlockProps> = ({ block }) => {
  const { data = {}, title, subtitle } = block;
  const code = data.code || '';
  const language = data.language || 'sql';
  const result = data.result || '';

  const [running, setRunning] = useState(false);
  const [liveResult, setLiveResult] = useState<string>('');

  const canRun = data.runnable && language === 'sql';

  const handleRun = async () => {
    setRunning(true);
    setLiveResult('');
    const r = await runSQL(code);
    if (r.error) setLiveResult(`❌ ${r.error}`);
    else setLiveResult(`✅ ${r.rowCount} 行 / ${r.elapsedMs}ms\n\n${JSON.stringify(r.rows.slice(0, 20), null, 2)}`);
    setRunning(false);
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#1E1E1E]">
       <div className="bg-[#2D2D2D] px-4 py-3 flex items-center justify-between border-b border-[#0F0F0F]">
         <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
         </div>
         <div className="text-gray-400 text-xs font-mono flex items-center">
            <span className="lowercase">{title} - {language}</span>
            {canRun && (
              <button onClick={handleRun} disabled={running}
                className="ml-2 px-2 py-1 bg-emerald-600 text-white text-[10px] rounded hover:bg-emerald-500 flex items-center gap-1 disabled:opacity-50">
                {running ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                {running ? 'Running' : 'Run'}
              </button>
            )}
         </div>
       </div>
       
       <div className="p-4 flex-1 overflow-auto bg-[#1E1E1E]">
         {subtitle && <p className="text-gray-400 text-sm mb-4 font-mono">// {subtitle}</p>}
         <pre className="text-blue-300 font-mono text-sm leading-relaxed whitespace-pre-wrap break-all">
           <code className={`language-${language}`}>{code}</code>
         </pre>
       </div>
       
       {liveResult && (
         <div className="border-t border-[#333] bg-black p-4">
           <div className="text-gray-500 text-xs mb-2 font-mono uppercase tracking-widest">Live Result</div>
           <pre className="text-green-400 font-mono text-xs whitespace-pre-wrap max-h-[200px] overflow-auto">{liveResult}</pre>
         </div>
       )}
       {result && !liveResult && (
         <div className="border-t border-[#333] bg-black p-4">
           <div className="text-gray-500 text-xs mb-2 font-mono uppercase tracking-widest">Execution Result</div>
           <pre className="text-green-400 font-mono text-xs whitespace-pre-wrap">{result}</pre>
         </div>
       )}
    </div>
  );
};

export default CodeTerminalBlock;
