import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, ShieldAlert, Code2, Loader2, Send, Terminal as TerminalIcon, FileCode } from 'lucide-react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown'; import AiAnalysisRenderer from './AiAnalysisRenderer';
import { cn } from '../lib/utils';

export default function AIAnalyzer() {
  const [code, setCode] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState('');
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!code) return;

    setIsAnalyzing(true);
    setError('');
    setReport('');

    try {
      const response = await axios.post('/api/analyze/vulnerability', { 
        code, 
        context: 'source code / technical logs',
        intent: 'Professional Security Audit and Hardening Recommendations'
      });
      setReport(response.data.analysis);
      if (response.data.is_heuristic) {
        setError("HEURISTIC_MODE_ACTIVE: Tactical analysis is utilizing structural rules. Neural link throttled.");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "AI Core failed to respond.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2 text-accent-blue">
            <Cpu className="w-4 h-4" />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Intelligence Core</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-accent-blue/10 border border-accent-blue/20">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-pulse" />
            <span className="text-[8px] font-bold text-accent-blue uppercase tracking-widest">Ghost_Secured</span>
          </div>
        </div>
        <h2 className="text-2xl font-black text-text-main">CATALYST_VULN_SCAN</h2>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-px bg-border-main border border-border-main rounded overflow-hidden">
        {/* Input Area */}
        <div className="bg-bg-dark p-6 space-y-3">
           <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-bold text-text-dim uppercase tracking-widest flex items-center gap-2">
                <FileCode className="w-3.5 h-3.5" /> STAGE_BUFFER
              </h3>
              <button 
                onClick={() => setCode('')}
                className="text-[10px] text-text-dim hover:text-accent-red font-bold uppercase transition-colors"
              >
                Flush
              </button>
           </div>
           <div className="relative">
              <textarea 
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="// Paste code/logs for AI security auditing..."
                className="w-full h-[460px] bg-surface border border-border-main rounded p-4 font-mono text-[11px] text-text-main focus:outline-none focus:border-accent-blue transition-all resize-none custom-scrollbar"
              ></textarea>
              <button 
                onClick={handleAnalyze}
                disabled={isAnalyzing || !code}
                className="absolute bottom-4 right-4 bg-accent-blue text-white p-2.5 rounded hover:bg-accent-blue/90 disabled:opacity-50 transition-all shadow-lg"
              >
                {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
           </div>
        </div>

        {/* Output Area */}
        <div className="bg-bg-dark p-6 space-y-3">
           <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-bold text-text-dim uppercase tracking-widest flex items-center gap-2">
                <ShieldAlert className="w-3.5 h-3.5 text-accent-red" /> EVAL_REPORT
              </h3>
              {report && (
                <span className="text-[9px] font-mono text-text-dim lowercase tracking-tighter">
                  processed via gemini-3-flash-preview
                </span>
              )}
           </div>
           <div className={cn(
             "panel w-full h-[460px] !p-4 overflow-y-auto custom-scrollbar transition-all font-sans",
             !report && !isAnalyzing && "flex items-center justify-center italic text-text-dim text-[13px]"
           )}>
              <AnimatePresence mode="wait">
                {isAnalyzing ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center gap-3 h-full"
                  >
                    <Loader2 className="w-8 h-8 text-accent-blue animate-spin" />
                    <div className="text-center">
                      <p className="text-text-main font-bold text-xs tracking-tight">ANALYZING_PAYLOAD</p>
                      <p className="text-text-dim text-[10px] font-mono">Running heuristic checks...</p>
                    </div>
                  </motion.div>
                ) : report ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="markdown-body"
                  >
                    <AiAnalysisRenderer content={report} />
                  </motion.div>
                ) : (
                  <p>Payload required for processing.</p>
                )}
              </AnimatePresence>
           </div>
        </div>
      </div>
    </div>
  );
}
