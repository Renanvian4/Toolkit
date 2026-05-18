import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal as TerminalIcon, Search, Loader2, Database, ShieldAlert, AlertTriangle, Cpu, Sparkles, BrainCircuit } from 'lucide-react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown'; import AiAnalysisRenderer from './AiAnalysisRenderer';
import { cn } from '../lib/utils';

export default function FuzzingTool({ sharedWordlist, sharedTarget }: { sharedWordlist?: string[], sharedTarget?: string }) {
  const [target, setTarget] = useState(sharedTarget || '');
  
  useEffect(() => {
    if (sharedTarget !== undefined && sharedTarget !== target) {
      setTarget(sharedTarget);
    }
  }, [sharedTarget]);
  const [isFuzzing, setIsFuzzing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleAiAudit = async () => {
    if (logs.length === 0) return;
    setIsAnalyzing(true);
    try {
      const response = await axios.post('/api/analyze/vulnerability', {
        code: JSON.stringify({ logs, results }),
        context: `FFUF Fuzzing results for ${target}`,
        tool_preference: 'Tactical Fuzzing Intelligence'
      });
      setAiAnalysis(response.data.analysis);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFuzz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!target) return;

    setIsFuzzing(true);
    setLogs(['[SYSTEM] FFUZ initialization sequence started...']);
    setResults([]);
    setAiAnalysis(null);

    try {
      const response = await axios.post('/api/tools/fuzz-scan', { 
        url: target, 
        wordlist_type: sharedWordlist && sharedWordlist.length > 0 ? 'contextual_payload' : 'common_dirs',
        custom_payloads: sharedWordlist 
      });
      setLogs(response.data.logs);
      setResults(response.data.results);
    } catch (err: any) {
      setLogs(prev => [...prev, '[ERROR] Fuzzing thread aborted externally.']);
    } finally {
      setIsFuzzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2 text-accent-blue">
            <Database className="w-4 h-4" />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Directory Discovery</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-accent-blue/10 border border-accent-blue/20">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-pulse" />
            <span className="text-[8px] font-bold text-accent-blue uppercase tracking-widest">Ghost_Secured</span>
          </div>
        </div>
        <h2 className="text-2xl font-black text-text-main uppercase tracking-tighter">FFUF_FUZZER</h2>
      </header>

      <div className="panel space-y-6">
        <form onSubmit={handleFuzz} className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-dim" />
            <input 
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="target.site.com"
              className="w-full bg-surface border border-border-main rounded py-2 pl-10 pr-4 text-[13px] focus:outline-none focus:border-accent-blue transition-all font-mono"
            />
          </div>
          <button 
            type="submit"
            disabled={isFuzzing}
            className="bg-accent-blue text-white font-bold px-6 rounded text-[11px] hover:bg-accent-blue/90 disabled:opacity-50 flex items-center gap-2 uppercase tracking-widest transition-all"
          >
            {isFuzzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldAlert className="w-3.5 h-3.5" />}
            {isFuzzing ? "FUZZING..." : "START SCAN"}
          </button>
          {target && (
            <button 
              type="button"
              onClick={() => {
                const cmd = `ffuf -u http://${target}/FUZZ -w /usr/share/wordlists/dirb/common.txt -mc 200,301,302`;
                window.dispatchEvent(new CustomEvent('send-to-shell', { detail: cmd }));
                window.dispatchEvent(new CustomEvent('catalyst-nav', { detail: 'real_terminal' }));
              }}
              className="bg-accent-blue/10 border border-accent-blue/40 text-accent-blue font-bold px-6 rounded text-[11px] hover:bg-accent-blue hover:text-white transition-all flex items-center gap-2 uppercase tracking-widest"
            >
              <TerminalIcon className="w-3.5 h-3.5" />
              PIPELINE TO REAL SHELL
            </button>
          )}
        </form>

        <div className="flex flex-col gap-6">
          {/* AI Neural Analysis Section */}
          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-accent-blue">
                   <Cpu className="w-4 h-4" />
                   <span className="text-[10px] font-black uppercase tracking-[0.2em]">Neural Strategic Analysis</span>
                </div>
                <button 
                  onClick={handleAiAudit}
                  disabled={isAnalyzing || logs.length === 0}
                  className="bg-accent-blue/10 border border-accent-blue/40 text-accent-blue px-3 py-1.5 rounded text-[10px] font-bold uppercase hover:bg-accent-blue hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-accent-blue/10"
                >
                  {isAnalyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <BrainCircuit className="w-3 h-3" />}
                  Neural Audit
                </button>
             </div>

             <AnimatePresence>
                {aiAnalysis && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-accent-blue/5 border border-accent-blue/20 rounded font-mono text-[11px] leading-relaxed"
                  >
                     <div className="prose prose-invert prose-xs max-w-none">
                        <AiAnalysisRenderer content={aiAnalysis} />
                     </div>
                  </motion.div>
                )}
             </AnimatePresence>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
               <div className="flex items-center gap-2">
                  <TerminalIcon className="w-3 h-3 text-text-dim" />
                  <h3 className="text-[10px] font-bold text-text-dim uppercase tracking-widest">Execution Logs</h3>
               </div>
               <div className="panel flex-1 h-auto min-h-[300px] overflow-y-auto !p-4 custom-scrollbar font-mono text-[10px] space-y-1 bg-black/90 flex flex-col border-border-main">
                  {logs.length > 0 ? (
                    logs.slice(-500).map((log, i) => (
                      <div key={i} className={cn(
                        "leading-relaxed break-all",
                        log.startsWith('[SYSTEM]') || log.startsWith('[INFO]') || log.startsWith('+') ? "text-accent-blue" :
                        log.startsWith('[ERROR]') ? "text-accent-red" : "text-text-dim"
                      )}>
                        {log}
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex items-center justify-center text-text-dim/50 uppercase tracking-[0.3em] font-black italic">
                      No Active Fuzzing
                    </div>
                  )}
                  <div ref={logEndRef} />
               </div>
            </div>

            {/* Results Table */}
            <div className="space-y-3">
               <div className="flex items-center gap-2">
                  <AlertTriangle className="w-3 h-3 text-accent-blue" />
                  <h3 className="text-[10px] font-bold text-text-dim uppercase tracking-widest">Identified Paths</h3>
               </div>
               <div className="bg-bg-dark border border-border-main rounded flex-1 h-auto min-h-[300px] overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-surface z-10">
                      <tr className="border-b border-border-main">
                        <th className="px-4 py-2 text-[10px] font-bold text-text-dim uppercase">Status</th>
                        <th className="px-4 py-2 text-[10px] font-bold text-text-dim uppercase">Path</th>
                        <th className="px-4 py-2 text-[10px] font-bold text-text-dim uppercase">Size</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono text-[11px]">
                      {results.map((res, i) => (
                        <tr key={i} className="border-b border-border-main/50 hover:bg-white/5">
                          <td className={cn(
                            "px-4 py-2 font-bold",
                            res.status === 200 ? "text-accent-green" : "text-accent-red"
                          )}>{res.status}</td>
                          <td className="px-4 py-2 text-text-main">{res.path}</td>
                          <td className="px-4 py-2 text-text-dim">{res.length}B</td>
                        </tr>
                      ))}
                      {results.length === 0 && !isFuzzing && (
                        <tr>
                          <td colSpan={3} className="px-4 py-20 text-center text-text-dim italic">No valid paths identified.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
