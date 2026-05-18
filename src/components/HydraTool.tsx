import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal as TerminalIcon, ShieldAlert, Loader2, Play, CheckCircle2, Cpu, Sparkles, Server, Globe, Key, AlertTriangle, BrainCircuit, Activity } from 'lucide-react';
import axios from 'axios';
import Markdown from 'react-markdown';
import { cn } from '../lib/utils';

export default function HydraTool({ sharedWordlist, sharedTarget }: { sharedWordlist?: string[], sharedTarget?: string }) {
  const [username, setUsername] = useState('admin');
  const [target, setTarget] = useState(sharedTarget || '192.168.1.42');

  useEffect(() => {
    if (sharedTarget !== undefined && sharedTarget !== target) {
      setTarget(sharedTarget);
    }
  }, [sharedTarget]);
  const [protocol, setProtocol] = useState('http');
  const [passwords, setPasswords] = useState('password\n123456\nadmin\nqwerty\ndragon\nroot');
  const [isAttacking, setIsAttacking] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<any>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [aiTacticalPlan, setAiTacticalPlan] = useState<string | null>(null);
  const [isModeling, setIsModeling] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleNeuralModeling = async () => {
    setIsModeling(true);
    setAiTacticalPlan(null);
    try {
      const response = await axios.post('/api/analyze/vulnerability', {
        code: JSON.stringify({ target, protocol, username }),
        context: `Neural Core: Analyzing target ${target} over ${protocol}. Target user: ${username}.`,
        tool_preference: 'Tactical Attack Modeling & Vector Synthesis'
      });
      setAiTacticalPlan(response.data.analysis);
    } catch (err) {
      console.error(err);
    } finally {
      setIsModeling(false);
    }
  };

  const handleAiAudit = async () => {
    if (logs.length === 0) return;
    setIsAnalyzing(true);
    try {
      const response = await axios.post('/api/analyze/vulnerability', {
        code: JSON.stringify({ logs, result }),
        context: `Hydra Alpha Brute-Force logs against ${target} (${protocol})`,
        tool_preference: 'Tactical Authentication Analysis'
      });
      setAiAnalysis(response.data.analysis);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAttack = async () => {
    setIsAttacking(true);
    setLogs(['[SYSTEM] Initializing Catalyst_Hydra_Alpha cluster...']);
    setResult(null);
    setAiAnalysis(null);

    const wordlist = passwords.split('\n').filter(p => p.trim() !== '');

    try {
      const response = await axios.post('/api/tools/hydra-execute', {
        target,
        username,
        wordlist,
        protocol
      });

      // Simulate real-time log streaming for feeling
      for (let i = 0; i < response.data.logs.length; i++) {
        await new Promise(r => setTimeout(r, 60));
        setLogs(prev => [...prev, response.data.logs[i]]);
      }

      setResult(response.data.result);
    } catch (err: any) {
      setLogs(prev => [...prev, `[ERROR] Engine core parity failure: ${err.message}`]);
    } finally {
      setIsAttacking(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2 text-accent-red">
            <ShieldAlert className="w-4 h-4" />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Auth Intrusion Engine</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-accent-red/10 border border-accent-red/20">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-red animate-pulse" />
            <span className="text-[8px] font-bold text-accent-red uppercase tracking-widest">Alpha_v6.2</span>
          </div>
        </div>
        <h2 className="text-2xl font-black text-text-main uppercase tracking-tighter">Catalyst_Hydra_Alpha</h2>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-1 space-y-4">
          <div className="panel space-y-4">
            <div className="panel-header justify-between">
              <div className="flex items-center gap-2 text-accent-blue">
                <BrainCircuit className="w-3 h-3" />
                <span>Neural Modeling</span>
              </div>
              <button 
                onClick={handleNeuralModeling}
                disabled={isModeling}
                className="bg-accent-blue/10 border border-accent-blue/30 text-accent-blue px-2 py-0.5 rounded text-[8px] font-black uppercase hover:bg-accent-blue hover:text-white transition-all disabled:opacity-50"
              >
                {isModeling ? <Loader2 className="w-3 h-3 animate-spin" /> : "Analyze Target"}
              </button>
            </div>

            <AnimatePresence>
              {aiTacticalPlan ? (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="space-y-3 overflow-hidden"
                >
                  <div className="bg-bg-dark border border-accent-blue/30 p-3 rounded text-[10px] font-mono leading-relaxed custom-scrollbar max-h-[200px] overflow-y-auto">
                    <Markdown>{aiTacticalPlan}</Markdown>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        const words = aiTacticalPlan.match(/"([^"]+)"|'([^']+)'|(?<=\s|^)([a-zA-Z0-9!@#$]{4,20})(?=\s|$)/g);
                        if (words) {
                          setPasswords(words.map(w => w.replace(/['"]/g, '')).join('\n'));
                        }
                      }}
                      className="flex-1 bg-accent-blue/20 text-accent-blue border border-accent-blue/40 py-1 rounded text-[9px] font-black uppercase hover:bg-accent-blue hover:text-white transition-all"
                    >
                      Inject AI Vectors
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="py-8 text-center border border-dashed border-border-main rounded opacity-40">
                   <p className="text-[9px] uppercase font-bold text-text-dim">Neural Core Offline</p>
                </div>
              )}
            </AnimatePresence>
          </div>

          <div className="panel space-y-4">
            <div className="panel-header">
              <span>Attack Config</span>
              <Play className="w-3 h-3" />
            </div>
            
            <div className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-[9px] font-bold text-text-dim uppercase mb-1">Protocol Selection</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['http', 'ssh', 'ftp', 'smb'].map((p) => (
                      <button
                        key={p}
                        onClick={() => setProtocol(p)}
                        className={cn(
                          "py-1.5 rounded text-[10px] font-bold uppercase transition-all border",
                          protocol === p ? "bg-accent-red/20 border-accent-red text-accent-red" : "bg-surface border-border-main text-text-dim hover:border-white/20"
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-text-dim uppercase mb-1">Target Identity</label>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="relative">
                      <Globe className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-text-dim" />
                      <input 
                        type="text" 
                        placeholder="IP / Domain"
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                        className="w-full bg-bg-dark border border-border-main rounded pl-9 pr-3 py-2 text-[12px] font-mono focus:border-accent-red outline-none"
                      />
                    </div>
                    <div className="relative">
                      <Key className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-text-dim" />
                      <input 
                        type="text" 
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-bg-dark border border-border-main rounded pl-9 pr-3 py-2 text-[12px] font-mono focus:border-accent-red outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[9px] font-bold text-text-dim uppercase">Credential Vectors</label>
                    <button 
                      onClick={() => setPasswords((prev) => prev ? prev + '\n' + sharedWordlist.join('\n') : sharedWordlist.join('\n'))}
                      className="text-[8px] font-bold px-1.5 py-0.5 rounded border border-accent-blue/30 text-accent-blue hover:bg-accent-blue hover:text-white transition-all uppercase tracking-widest"
                      title="Load Active Wordlist Context"
                    >
                      CONTEXT_ACTIVE
                    </button>
                  </div>
                  <textarea 
                    value={passwords}
                    onChange={(e) => setPasswords(e.target.value)}
                    className="w-full h-32 bg-bg-dark border border-border-main rounded p-3 text-[11px] font-mono outline-none resize-none custom-scrollbar focus:border-accent-red"
                  />
                </div>
              </div>

              <button 
                onClick={handleAttack}
                disabled={isAttacking}
                className="w-full bg-accent-red text-white py-3 rounded font-black text-xs uppercase tracking-widest hover:bg-accent-red/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent-red/20 mb-2"
              >
                {isAttacking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                {isAttacking ? "EXECUTING..." : "INITIALIZE ATTACK"}
              </button>

              {target && (
                <button 
                  type="button"
                  onClick={() => {
                    const cmd = `hydra -l ${username} -P /usr/share/wordlists/rockyou.txt ${protocol}://${target}`;
                    window.dispatchEvent(new CustomEvent('send-to-shell', { detail: cmd }));
                    window.dispatchEvent(new CustomEvent('catalyst-nav', { detail: 'real_terminal' }));
                  }}
                  className="w-full py-3 bg-accent-blue/10 border border-accent-blue/30 text-accent-blue rounded text-[11px] font-black uppercase tracking-[0.2em] hover:bg-accent-blue hover:text-white transition-all"
                >
                  <TerminalIcon className="w-3.5 h-3.5" />
                  PIPELINE TO REAL SHELL
                </button>
              )}
            </div>
          </div>

          {result && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="panel bg-accent-green/10 border-accent-green/30 space-y-3"
            >
              <div className="flex items-center gap-2 text-accent-green">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Target Compromised</span>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] text-text-dim uppercase">Identified Credentials:</div>
                <div className="text-sm font-black text-white font-mono bg-bg-dark p-2 rounded border border-accent-green/20">
                  {result.username} <span className="text-text-dim px-1 font-normal">:</span> {result.password}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-accent-blue">
                   <Cpu className="w-4 h-4" />
                   <span className="text-[10px] font-black uppercase tracking-[0.2em]">Strategic Neural Analysis</span>
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
                {aiAnalysis ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="panel bg-accent-blue/5 border-accent-blue/20"
                  >
                     <div className="prose prose-invert prose-xs max-w-none font-mono text-[11px] leading-relaxed">
                        <Markdown>{aiAnalysis}</Markdown>
                     </div>
                  </motion.div>
                ) : (
                  <div className="panel bg-surface/30 border-dashed flex flex-col items-center justify-center py-12 text-center space-y-4">
                     <AlertTriangle className="w-8 h-8 text-text-dim opacity-20" />
                     <p className="text-[10px] text-text-dim uppercase tracking-widest font-bold max-w-[200px]">Strategic audit unavailable. Run attack sequence first to populate intelligence stream.</p>
                  </div>
                )}
             </AnimatePresence>
          </div>
          
          <div className="space-y-4">
             <div className="flex items-center gap-2 text-text-dim">
                <TerminalIcon className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Live Execution Logs</span>
             </div>
             <div className="bg-black/90 p-4 font-mono text-[10px] overflow-y-auto custom-scrollbar h-full min-h-[300px] border border-border-main rounded flex flex-col space-y-1">
                {logs.length > 0 ? (
                  logs.slice(-500).map((log, i) => (
                    <div key={i} className={cn(
                      "leading-relaxed break-all",
                      log.startsWith('[SYSTEM]') || log.startsWith('[INFO]') ? "text-accent-blue" :
                      log.startsWith('[ERROR]') || log.startsWith('[FAILURE]') ? "text-accent-red" : 
                      log.includes('SUCCESS') ? "text-accent-green font-bold" : "text-text-dim"
                    )}>
                      {log}
                    </div>
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center text-text-dim/50 uppercase tracking-[0.3em] font-black italic">
                    Engine Idle
                  </div>
                )}
                <div ref={logEndRef} />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
