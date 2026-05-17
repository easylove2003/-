import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, CheckCircle2, BrainCircuit, ChevronDown, ChevronRight } from 'lucide-react';
import { MarkdownWithChart } from './MarkdownWithChart';

export function parseThinkingStream(raw: string) {
  let isThinking = raw.includes('<thinking>') && !raw.includes('</thinking>');
  let rawThinking = '';
  let finalText = '';

  const thinkingStart = raw.indexOf('<thinking>');
  const thinkingEnd = raw.indexOf('</thinking>');

  if (thinkingStart !== -1) {
    if (thinkingEnd !== -1) {
       rawThinking = raw.substring(thinkingStart + 10, thinkingEnd);
       finalText = raw.substring(thinkingEnd + 11).trimStart();
    } else {
       rawThinking = raw.substring(thinkingStart + 10);
    }
  } else {
    finalText = raw;
  }

  const steps: { id: string, text: string, status: 'pending' | 'done' }[] = [];
  if (rawThinking) {
     // Match lines starting with STEPX: or just STEP X: 
     const stepMatches = [...rawThinking.matchAll(/STEP\s*(\d+)\s*:\s*(.*)/gi)];
     stepMatches.forEach((match, index) => {
         steps.push({
            id: match[1],
            text: match[2].trim(),
            // it's 'done' if there is a next step, or if thinking block is closed
            status: (index < stepMatches.length - 1 || thinkingEnd !== -1) ? 'done' : 'pending'
         });
     });
  }

  return {
    isThinking,
    isThinkingComplete: thinkingEnd !== -1,
    steps,
    finalText, // The final text is everything after </thinking>
  };
}

interface ThinkingProcessProps {
  rawText: string;
  isStreaming: boolean;
  onDrilldown?: (q: string) => void;
}

export function ThinkingProcess({ rawText, isStreaming, onDrilldown }: ThinkingProcessProps) {
  const { isThinkingComplete, steps, finalText } = parseThinkingStream(rawText);
  const [isExpanded, setIsExpanded] = useState(true);

  // Auto-collapse when thinking completes
  useEffect(() => {
    if (isThinkingComplete && !isStreaming) {
      setIsExpanded(false);
    }
  }, [isThinkingComplete, isStreaming]);

  // Typewriter effect state for finalText
  const [displayedText, setDisplayedText] = useState('');
  const textIndexRef = useRef(0);
  const requestRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const animate = () => {
      if (textIndexRef.current < finalText.length) {
        textIndexRef.current += Math.max(1, Math.floor((finalText.length - textIndexRef.current) / 10)); // speed up if falls behind
        if (textIndexRef.current > finalText.length) textIndexRef.current = finalText.length;
        setDisplayedText(finalText.substring(0, textIndexRef.current));
        requestRef.current = requestAnimationFrame(animate);
      } else if (!isStreaming && textIndexRef.current === finalText.length) {
         setDisplayedText(finalText);
      }
    };
    
    if (finalText.length > textIndexRef.current) {
      requestRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [finalText, isStreaming]);

  // If streaming but no steps yet and no finalText, show a loading placeholder
  if (steps.length === 0 && !finalText && isStreaming) {
    return (
      <div className="flex items-center gap-3 text-indigo-500 bg-indigo-50/50 p-4 rounded-2xl w-fit">
         <BrainCircuit className="w-5 h-5 animate-pulse" />
         <span className="text-sm font-medium animate-pulse">SYNTHESIS CORE is analyzing...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Thinking Steps Card */}
      {steps.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden w-full max-w-2xl">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between p-3 bg-gray-100 hover:bg-gray-200 transition-colors text-sm font-bold text-gray-700"
          >
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-indigo-500" />
              <span>思维过程 (Thinking Process)</span>
              {!isThinkingComplete && <Loader2 className="w-3 h-3 text-indigo-500 animate-spin ml-2" />}
            </div>
            {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
          </button>
          
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 flex flex-col gap-3">
                  {steps.map((step, idx) => (
                    <motion.div 
                      key={step.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-3"
                    >
                      <div className="mt-0.5 shrink-0">
                        {step.status === 'done' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                        )}
                      </div>
                      <div className="flex gap-2">
                        <span className={`text-sm font-mono font-bold shrink-0 ${step.status === 'done' ? 'text-emerald-600' : 'text-indigo-400'}`}>
                          STEP {step.id}:
                        </span>
                        <span className={`text-sm ${step.status === 'done' ? 'text-gray-700' : 'text-gray-400 animate-pulse'}`}>
                          {step.text}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Final Analysis Output */}
      {finalText && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full"
        >
          <MarkdownWithChart text={isStreaming ? displayedText : finalText} onDrilldown={onDrilldown} />
        </motion.div>
      )}
    </div>
  );
}
