import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, Search, Loader2, Link as LinkIcon, Terminal as TerminalIcon, Shield, Cpu, Sparkles, BrainCircuit } from 'lucide-react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown'; import AiAnalysisRenderer from './AiAnalysisRenderer';
import { cn } from '../lib/utils';

export default function OsintTool({ sharedWordlist, sharedTarget }: { sharedWordlist?: string[], sharedTarget?: string }) {
  const [domain, setDomain] = useState(sharedTarget || '');
  
  useEffect(() => {
    if (sharedTarget !== undefined && sharedTarget !== domain) {
      setDomain(sharedTarget);
    }
  }, [sharedTarget]);
  const [isSearching, setIsSearching] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [results, setResults] = useState<string[]>([]);
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
        context: `Amass OSINT Discovery results for ${domain}`,
        tool_preference: 'Strategic OSINT Intelligence'
      });
      setAiAnalysis(response.data.analysis);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain) return;

    setIsSearching(true);
    setLogs(['[SYSTEM] OSINT-Amass module initializing...']);
    setAiAnalysis(null);
    if (sharedWordlist && sharedWordlist.length > 0) {
      setLogs(prev => [...prev, `[INFO] Injecting contextual wordlist (${sharedWordlist.length} payloads)...`]);
    }
    setResults([]);

    try {
      const response = await axios.post('/api/tools/osint-scan', { 
        domain,
        custom_wordlist: sharedWordlist
      });
      setLogs(response.data.logs);
      setResults(response.data.results);
    } catch (err: any) {
      setLogs(prev => [...prev, '[ERROR] OSINT request failed. DNS timeout potentially reached.']);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2 text-accent-blue">
            <Globe className="w-4 h-4" />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase">External Reconnaissance</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-accent-blue/10 border border-accent-blue/20">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-pulse" />
            <span className="text-[8px] font-bold text-accent-blue uppercase tracking-widest">Ghost_Secured</span>
          </div>
        </div>
        <h2 className="text-2xl font-black text-text-main uppercase tracking-tighter">AMASS_OSINT</h2>
      </header>

      <div className="panel space-y-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-dim" />
            <input 
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="targetdomain.com"
              className="w-full bg-surface border border-border-main rounded py-2 pl-10 pr-4 text-[13px] focus:outline-none focus:border-accent-blue transition-all font-mono"
            />
          </div>
          <button 
            type="submit"
            disabled={isSearching}
            className="bg-accent-blue text-white font-bold px-6 rounded text-[11px] hover:bg-accent-blue/90 disabled:opacity-50 flex items-center gap-2 uppercase tracking-widest transition-all"
          >
            {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Shield className="w-3.5 h-3.5" />}
            {isSearching ? "SCRAPING..." : "MAP ATTACK SURFACE"}
          </button>
          {domain && (
            <button 
              type="button"
              onClick={() => {
                const cmd = `amass enum -d ${domain} -active -brute -src`;
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
                   <span className="text-[10px] font-black uppercase tracking-[0.2em]">Neural Intelligence Core</span>
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
                        log.startsWith('[SYSTEM]') || log.startsWith('[INFO]') ? "text-accent-blue" :
                        log.startsWith('[ERROR]') ? "text-accent-red" : "text-text-dim"
                      )}>
                        {log}
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex items-center justify-center text-text-dim/50 uppercase tracking-[0.3em] font-black italic">
                      No Active Map Task
                    </div>
                  )}
                  <div ref={logEndRef} />
               </div>
            </div>

            <div className="space-y-3">
               <div className="flex items-center gap-2">
                  <LinkIcon className="w-3 h-3 text-accent-blue" />
                  <h3 className="text-[10px] font-bold text-text-dim uppercase tracking-widest">Active Asset Inventory</h3>
               </div>
               <div className="bg-bg-dark border border-border-main rounded flex-1 h-auto min-h-[300px] overflow-y-auto custom-scrollbar p-0">
                  <div className="divide-y divide-border-main/50">
                    {results.map((sub, i) => (
                      <div key={i} className="flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors">
                        <span className="font-mono text-[11px] text-text-main font-bold lowercase">{sub}</span>
                        <span className="text-[9px] bg-accent-blue/10 text-accent-blue px-2 py-0.5 rounded font-bold uppercase tracking-tighter">Public DNS</span>
                      </div>
                    ))}
                    {results.length === 0 && !isSearching && (
                      <div className="px-4 py-20 text-center text-text-dim italic text-sm">Target surface mapping pending.</div>
                    )}
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
