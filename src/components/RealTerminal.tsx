import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal as TerminalIcon, Shield, ChevronRight, Loader2, Cpu, Globe, Activity, BrainCircuit, Sparkles, Zap } from 'lucide-react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown'; import AiAnalysisRenderer from './AiAnalysisRenderer';
import { cn } from '../lib/utils';

interface TerminalLine {
  type: 'input' | 'stdout' | 'stderr' | 'system';
  content: string;
}

export default function RealTerminal() {
  const [history, setHistory] = useState<TerminalLine[]>([
    { type: 'system', content: 'Catalyst Real-Shell Interface v4.0.0-PRO' },
    { type: 'system', content: 'Connection established to local node: catalyst-primary' },
    { type: 'system', content: 'WARNING: Commands are executed directly on the host instance.' },
    { type: 'system', content: '---------------------------------------------------------' }
  ]);
  const [input, setInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState('/home/catalyst');
  const [stagedAnalysis, setStagedAnalysis] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleRemoteCommand = async (e: any) => {
      const cmd = e.detail;
      if (cmd) {
        setIsAiThinking(true);
        setHistory(prev => [...prev, { type: 'system', content: `[NEURAL_ENGINE] Intercepted export request. Initiating tactical audit...` }]);
        
        try {
          const response = await axios.post('/api/ai/analyze-command', { 
            command: cmd,
            context: 'Tool sequence export to Catalyst Shell.'
          });
          setStagedAnalysis(response.data);
          setInput(response.data.optimized);
          setHistory(prev => [...prev, { type: 'system', content: `[SUCCESS] Context analysis complete. Optimized string staged for review.` }]);
        } catch (err) {
          setInput(cmd);
          setHistory(prev => [...prev, { type: 'system', content: `[SYSTEM] Audit engine timeout. Exported raw string as fallback.` }]);
        } finally {
          setIsAiThinking(false);
          inputRef.current?.focus();
        }
      }
    };
    window.addEventListener('send-to-shell', handleRemoteCommand);
    return () => window.removeEventListener('send-to-shell', handleRemoteCommand);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const askAiAssistant = async () => {
    if (history.length < 5) return;
    setIsAiThinking(true);
    try {
      const logText = history.map(h => `${h.type === 'input' ? '$ ' : ''}${h.content}`).join('\n');
      const response = await axios.post('/api/analyze/vulnerability', {
        code: logText,
        context: 'Real Shell Session context. The user is executing OS commands in a privileged node.',
        tool_preference: 'Tactical Kernel Intelligence'
      });
      setAiSuggestion(response.data.analysis);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiThinking(false);
    }
  };

  const executeCommand = async (cmd: string) => {
    if (!cmd.trim()) return;

    setHistory(prev => [...prev, { type: 'input', content: cmd }]);
    setInput('');
    setStagedAnalysis(null);
    setIsExecuting(true);

    try {
      const response = await axios.post('/api/shell/exec', { command: cmd });
      const { stdout, stderr, exitCode } = response.data;

      if (stdout) {
        setHistory(prev => [...prev, { type: 'stdout', content: stdout }]);
      }
      if (stderr) {
        setHistory(prev => [...prev, { type: 'stderr', content: stderr }]);
      }

      // Special handling for pwd to update view
      if (cmd.startsWith('pwd')) {
         const cleanPath = stdout.trim();
         if (cleanPath) setCurrentPath(cleanPath);
      }
      
    } catch (err: any) {
      setHistory(prev => [...prev, { type: 'stderr', content: `Fatal Error: ${err.message}` }]);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(input);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-accent-red">
            <Shield className="w-4 h-4" />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Privileged Access</span>
          </div>
          <h2 className="text-2xl font-black text-text-main uppercase tracking-tighter">Catalyst_Real_Shell</h2>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={askAiAssistant}
            disabled={isAiThinking}
            className="flex items-center gap-2 bg-accent-blue/10 border border-accent-blue/30 text-accent-blue px-3 py-1 rounded text-[10px] font-black uppercase hover:bg-accent-blue hover:text-white transition-all disabled:opacity-30"
          >
            {isAiThinking ? <Loader2 className="w-3 h-3 animate-spin" /> : <BrainCircuit className="w-3 h-3" />}
            Neural Guide
          </button>
          <div className="px-3 py-1 bg-surface border border-border-main rounded flex items-center gap-2 text-[10px] font-bold">
            <Activity className="w-3 h-3 text-accent-green" />
            <span className="text-text-dim">LATENCY:</span>
            <span>2ms</span>
          </div>
          <div className="px-3 py-1 bg-accent-red/10 border border-accent-red/20 rounded flex items-center gap-2 text-[10px] font-bold text-accent-red">
            <Cpu className="w-3 h-3" />
            <span>ROOT_BYPASS: ON</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 h-0">
        <div 
          className="flex-1 bg-black border border-border-main rounded-lg flex flex-col overflow-hidden relative group cursor-text"
          onClick={() => inputRef.current?.focus()}
        >
          <div className="absolute top-0 right-0 p-3 flex gap-2 opacity-30 group-hover:opacity-100 transition-opacity">
             <Globe className="w-4 h-4 text-accent-blue" />
             <TerminalIcon className="w-4 h-4 text-accent-green" />
          </div>

          <div className="flex-1 p-6 font-mono text-[13px] overflow-y-auto custom-scrollbar">
            {history.map((line, i) => (
              <div key={i} className={cn(
                "whitespace-pre-wrap mb-1 leading-relaxed",
                line.type === 'input' ? "text-accent-blue font-bold" :
                line.type === 'stderr' ? "text-accent-red" :
                line.type === 'system' ? "text-text-dim italic" : "text-text-main"
              )}>
                {line.type === 'input' && (
                  <span className="text-text-dim/50 mr-2">[{currentPath}]$</span>
                )}
                {line.content}
              </div>
            ))}

            <AnimatePresence>
              {stagedAnalysis && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 bg-accent-blue/10 border border-accent-blue/30 rounded p-3 space-y-2"
                >
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2 text-accent-blue text-[10px] font-black uppercase">
                       <Cpu className="w-3 h-3" />
                       Neural Audit Report
                     </div>
                     <button onClick={() => setStagedAnalysis(null)} className="text-text-dim hover:text-white uppercase text-[8px] font-bold">Discard Analysis</button>
                   </div>
                   <p className="text-[11px] text-text-main/80 italic">"{stagedAnalysis.suggestions}"</p>
                   {stagedAnalysis.variables?.length > 0 && (
                     <div className="flex flex-wrap gap-2 pt-1">
                       {stagedAnalysis.variables.map((v: string) => (
                         <span key={v} className="bg-accent-red/20 border border-accent-red/30 text-accent-red px-1.5 py-0.5 rounded text-[8px] font-mono">MISSING: {v}</span>
                       ))}
                     </div>
                   )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-2 mt-2">
              <span className="text-text-dim/50 italic">[{currentPath}]$</span>
              <input 
                ref={inputRef}
                autoFocus
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isExecuting}
                className="flex-1 bg-transparent border-none outline-none text-text-main caret-accent-blue"
                spellCheck={false}
              />
              {input.trim() && (
                <button 
                  onClick={() => executeCommand(input)}
                  disabled={isExecuting}
                  className="px-2 py-1 bg-accent-blue/10 border border-accent-blue/30 text-accent-blue rounded text-[9px] font-black uppercase hover:bg-accent-blue hover:text-white transition-all flex items-center gap-1"
                >
                  <Zap className="w-3 h-3" />
                  Execute
                </button>
              )}
              {isExecuting && <Loader2 className="w-4 h-4 animate-spin text-accent-blue" />}
            </div>
            <div ref={scrollRef} className="h-4" />
          </div>

          <div className="bg-surface/50 backdrop-blur p-2 border-t border-border-main flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-text-dim">
             <div className="flex items-center gap-4">
                <span>Host: Catalyst-Cloud-Node-Alpha</span>
                <span>Shell: zsh</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
                <span>Real-Time Sync: Active</span>
             </div>
          </div>
        </div>

        <AnimatePresence>
          {aiSuggestion && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-full lg:w-96 panel bg-accent-blue/5 border-accent-blue/30 flex flex-col h-full overflow-hidden shrink-0 shadow-2xl shadow-accent-blue/5"
            >
               <div className="panel-header border-b border-accent-blue/20 p-4 bg-accent-blue/10">
                  <div className="flex items-center gap-2 text-accent-blue">
                     <Sparkles className="w-4 h-4" />
                     <span className="text-[11px] font-black uppercase tracking-widest">Neural Operational Intelligence</span>
                  </div>
                  <button onClick={() => setAiSuggestion(null)} className="text-text-dim hover:text-white transition-colors">
                     <Shield className="w-4 h-4" />
                  </button>
               </div>
               <div className="flex-1 p-5 overflow-y-auto custom-scrollbar prose prose-invert prose-xs max-w-none font-mono text-[11px] leading-relaxed">
                  <AiAnalysisRenderer content={aiSuggestion} />
               </div>
               <div className="p-4 bg-surface border-t border-border-main text-[9px] text-text-dim italic text-center uppercase tracking-tighter">
                  Real-time tacticial feedback based on shell execution history.
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
