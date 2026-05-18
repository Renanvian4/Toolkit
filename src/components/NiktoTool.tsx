import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ShieldAlert, Loader2, Terminal as TerminalIcon, AlertCircle, Zap, CheckCircle2, Cpu, Sparkles } from 'lucide-react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown'; import AiAnalysisRenderer from './AiAnalysisRenderer';
import { cn } from '../lib/utils';

export default function NiktoTool({ sharedWordlist, sharedTarget }: { sharedWordlist?: string[], sharedTarget?: string }) {
  const [target, setTarget] = useState(sharedTarget || '');
  
  useEffect(() => {
    if (sharedTarget !== undefined && sharedTarget !== target) {
      setTarget(sharedTarget);
    }
  }, [sharedTarget]);
  const [isScanning, setIsScanning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [report, setReport] = useState<string | null>(null);
  const [error, setError] = useState('');
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
        code: JSON.stringify({ logs, report }),
        context: `Nikto Web Vulnerability Scan results for ${target}`,
        tool_preference: 'Tactical Web Security Audit'
      });
      setAiAnalysis(response.data.analysis);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!target) return;

    setIsScanning(true);
    setReport(null);
    setAiAnalysis(null);
    setLogs([
      '[SYSTEM] Initializing Nikto-vCatalyst...', 
      `[INFO] Preparing lookup table (${sharedWordlist?.length ? 14 + sharedWordlist.length : 14} signatures)`
    ]);
    setError('');

    try {
      const response = await axios.post('/api/tools/nikto-scan', { 
        url: target,
        custom_paths: sharedWordlist
      });
      setLogs(response.data.logs);
      setReport(response.data.analysis);
    } catch (err: any) {
      setError("Scan execution failed. Check target connectivity.");
      setLogs(prev => [...prev, '[FATAL] Scanner process terminated unexpectedly.']);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2 text-accent-green">
            <Zap className="w-4 h-4" />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Web Server Scanner</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-accent-green/10 border border-accent-green/20">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
            <span className="text-[8px] font-bold text-accent-green uppercase tracking-widest">Ghost_Secured</span>
          </div>
        </div>
        <h2 className="text-2xl font-black text-text-main uppercase tracking-tighter">Nikto_Audit</h2>
      </header>

      <div className="panel space-y-6">
        <form onSubmit={handleScan} className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-dim" />
            <input 
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="target.com (No http:// needed)"
              className="w-full bg-surface border border-border-main rounded py-2 pl-10 pr-4 text-[13px] focus:outline-none focus:border-accent-green transition-all font-mono"
            />
          </div>
          <button 
            type="submit"
            disabled={isScanning}
            className="bg-accent-green text-black font-bold px-6 rounded text-[11px] hover:bg-accent-green/90 disabled:opacity-50 flex items-center gap-2 uppercase tracking-widest transition-all"
          >
            {isScanning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldAlert className="w-3.5 h-3.5" />}
            {isScanning ? "SCANNING..." : "LAUNCH AUDIT"}
          </button>
          {target && (
            <button 
              type="button"
              onClick={() => {
                const cmd = `nikto -h ${target} -C all`;
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

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-accent-red/10 border border-accent-red/20 p-3 rounded flex items-center gap-3 text-accent-red text-[11px]"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col gap-6">
          {/* AI Neural Analysis Section */}
          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-accent-blue">
                   <Cpu className="w-4 h-4" />
                   <span className="text-[10px] font-black uppercase tracking-[0.2em]">IA Strategic Audit</span>
                </div>
                <button 
                  onClick={handleAiAudit}
                  disabled={isAnalyzing || logs.length === 0}
                  className="bg-accent-blue/10 border border-accent-blue/40 text-accent-blue px-3 py-1.5 rounded text-[10px] font-bold uppercase hover:bg-accent-blue hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-accent-blue/10"
                >
                  {isAnalyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  Generate Tactical Audit
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
                        log.startsWith('[FATAL]') || log.startsWith('!') ? "text-accent-red" : "text-text-dim"
                      )}>
                        {log}
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex items-center justify-center text-text-dim/50 uppercase tracking-[0.3em] font-black italic">
                      No Active Scan
                    </div>
                  )}
                  <div ref={logEndRef} />
               </div>
            </div>

            {/* Analysis Report */}
            <div className="space-y-3">
               <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-accent-blue" />
                  <h3 className="text-[10px] font-bold text-text-dim uppercase tracking-widest">Comprehensive Vulnerability Report</h3>
               </div>
               <div className={cn(
                 "panel flex-1 h-auto min-h-[300px] overflow-y-auto !p-6 custom-scrollbar font-sans border-border-main bg-bg-dark",
                 !report && !isScanning && "flex items-center justify-center italic text-text-dim text-[13px]"
               )}>
                  {isScanning ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3">
                      <Loader2 className="w-8 h-8 text-accent-green animate-spin" />
                      <p className="text-text-dim text-[10px] uppercase font-bold tracking-tighter">Compiling findings...</p>
                    </div>
                  ) : report ? (
                    <div className="markdown-body">
                      <AiAnalysisRenderer content={report} />
                    </div>
                  ) : (
                    "Report will populate after scan completion."
                  )}
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
