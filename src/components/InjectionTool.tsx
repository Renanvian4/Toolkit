import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Database, Terminal as TerminalIcon, Play, AlertTriangle, ShieldAlert, Cpu, Layers } from 'lucide-react';
import { cn } from '../lib/utils';
import axios from 'axios';

interface InjectionToolProps {
  initialTarget?: string;
}

export default function InjectionTool({ initialTarget }: InjectionToolProps) {
  const [target, setTarget] = useState(initialTarget || '');
  const [engine, setEngine] = useState<'sqlmap' | 'jsql' | 'nosqlmap'>('sqlmap');
  const [level, setLevel] = useState('1');
  const [risk, setRisk] = useState('1');
  
  const [isInjecting, setIsInjecting] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [report, setReport] = useState<string | null>(null);
  const [suggestedCommand, setSuggestedCommand] = useState<string | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleInject = async () => {
    if (!target) return;
    setIsInjecting(true);
    setLogs([`[SYSTEM] Initializing Catalyst Injection Module: ${engine.toUpperCase()}`]);
    setReport(null);

    // Initial logs based on engine
    setTimeout(() => {
      setLogs(prev => [...prev, `[INFO] Target acquired: ${target}`]);
      if (engine === 'sqlmap') {
        setLogs(prev => [...prev, `[INFO] Parsing target URL and testing connection...`]);
        setLogs(prev => [...prev, `[INFO] Testing Level: ${level} | Risk: ${risk}`]);
      } else if (engine === 'nosqlmap') {
        setLogs(prev => [...prev, `[INFO] Probing NoSQL endpoints for unauthenticated access...`]);
      } else {
        setLogs(prev => [...prev, `[INFO] Launching jSQL UI Bridge... establishing payload streams.`]);
      }
    }, 1000);

    try {
      const response = await axios.post('/api/tools/injection-execute', {
        target,
        engine,
        level,
        risk
      });

      const data = response.data;
      if (data.logs) {
        data.logs.forEach((log: string, index: number) => {
          setTimeout(() => {
            setLogs(prev => [...prev, log]);
          }, 1500 + (index * 400));
        });
      }

      setTimeout(() => {
        setReport(data.analysis);
        setSuggestedCommand(data.suggested_command || null);
        setIsInjecting(false);
        setLogs(prev => [...prev, `[SYSTEM] Extraction sequence completed. AI Analysis ready.`]);
      }, 1500 + ((data.logs?.length || 5) * 400));

    } catch (error: any) {
      console.error(error);
      setLogs(prev => [...prev, `[ERROR] Injection sequence failed: ${error.message}`]);
      setIsInjecting(false);
    }
  };

  const handleSendToShell = () => {
    let cmd = '';
    if (engine === 'sqlmap') {
      cmd = `sqlmap -u "${target}" --level=${level} --risk=${risk} --batch --dbs`;
    } else if (engine === 'nosqlmap') {
      cmd = `python3 NoSQLMap.py -t "${target}"`;
    } else {
      cmd = `java -jar jsql-injection.jar -u "${target}"`;
    }
    window.dispatchEvent(new CustomEvent('send-to-shell', { detail: cmd }));
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent-red/10 border border-accent-red/30 rounded">
            <Database className="w-5 h-5 text-accent-red" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-white">Database Injection Engine</h2>
            <p className="text-[10px] text-text-dim font-bold uppercase tracking-widest">sqlmap • jSQL • NoSQLMap</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        <div className="lg:col-span-1 space-y-6 overflow-y-auto custom-scrollbar pr-2">
          {/* Config */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2">
               <Layers className="w-3 h-3 text-accent-red" />
               <h3 className="text-[10px] font-black text-white tracking-[0.2em]">ENGINE CONFIGURATION</h3>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest">Injection Engine</label>
              <div className="grid grid-cols-3 gap-2">
                {(['sqlmap', 'jsql', 'nosqlmap'] as const).map(e => (
                  <button
                    key={e}
                    onClick={() => setEngine(e)}
                    className={cn(
                      "py-2 px-2 text-[10px] font-bold uppercase tracking-widest rounded transition-all",
                      engine === e 
                        ? "bg-accent-red/20 border border-accent-red text-accent-red" 
                        : "bg-bg-dark border border-white/5 text-text-dim hover:border-white/20"
                    )}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest">Target URL (Includes Parameters)</label>
              <div className="flex items-center bg-bg-dark border border-white/10 p-2 rounded focus-within:border-accent-red transition-colors">
                <Database className="w-4 h-4 text-text-dim mr-3" />
                <input
                  type="text"
                  value={target}
                  onChange={e => setTarget(e.target.value)}
                  placeholder="http://target.com/page?id=1"
                  className="bg-transparent text-xs text-white outline-none w-full font-mono placeholder:text-white/20"
                />
              </div>
            </div>

            <AnimatePresence>
              {engine === 'sqlmap' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest">Level (1-5)</label>
                    <select 
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                      className="w-full bg-bg-dark border border-white/10 p-2 text-xs text-white uppercase tracking-widest rounded outline-none focus:border-accent-red"
                    >
                      {[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>Level {v}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest">Risk (1-3)</label>
                    <select 
                      value={risk}
                      onChange={(e) => setRisk(e.target.value)}
                      className="w-full bg-bg-dark border border-white/10 p-2 text-xs text-white uppercase tracking-widest rounded outline-none focus:border-accent-red"
                    >
                      {[1, 2, 3].map(v => <option key={v} value={v}>Risk {v}</option>)}
                    </select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <button
              onClick={handleInject}
              disabled={!target || isInjecting}
              className="w-full flex items-center justify-center gap-2 bg-accent-red hover:bg-accent-red/90 disabled:opacity-50 disabled:hover:bg-accent-red text-white py-3 rounded text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-[0_0_15px_rgba(255,51,102,0.3)] hover:shadow-[0_0_25px_rgba(255,51,102,0.5)]"
            >
              {isInjecting ? <Database className="w-4 h-4 animate-bounce" /> : <Play className="w-4 h-4" />}
              {isInjecting ? 'Extracting Data...' : 'Initialize Injection'}
            </button>
            
            <button
              onClick={handleSendToShell}
              disabled={!target}
              className="w-full flex items-center justify-center gap-2 bg-bg-dark hover:bg-surface border border-white/5 text-text-dim py-3 rounded text-[10px] font-black uppercase tracking-[0.2em] transition-all"
            >
              <TerminalIcon className="w-4 h-4" />
              Pipeline to Real Shell
            </button>
          </div>
        </div>

        {/* Logs and Report */}
        <div className="lg:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
          <div className="space-y-3 h-full flex flex-col">
            <div className="flex items-center gap-2">
              <TerminalIcon className="w-3 h-3 text-text-dim" />
              <h3 className="text-[10px] font-bold text-text-dim uppercase tracking-widest">Execution Logs</h3>
            </div>
            <div className="panel flex-1 overflow-y-auto !p-4 custom-scrollbar font-mono text-[10px] space-y-1 bg-black/90 flex flex-col border-border-main min-h-full min-h-[300px]">
              {logs.length > 0 ? (
                logs.slice(-500).map((log, i) => (
                  <div key={i} className={cn(
                    "leading-relaxed break-all",
                    log.startsWith('[SYSTEM]') || log.startsWith('[INFO]') ? "text-accent-blue" :
                    log.startsWith('[ERROR]') || log.startsWith('[FAILURE]') ? "text-accent-red" : 
                    log.includes('SUCCESS') || log.includes('vulnerable') ? "text-accent-green font-bold" : "text-text-dim"
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

          <div className="space-y-3 h-full flex flex-col">
            <div className="flex items-center gap-2">
              <Cpu className="w-3 h-3 text-accent-blue" />
              <h3 className="text-[10px] font-bold text-accent-blue uppercase tracking-widest">Neural Database Analysis</h3>
            </div>
            <div className={cn(
              "panel flex-1 overflow-y-auto !p-6 custom-scrollbar font-sans border-border-main bg-bg-dark min-h-full min-h-[300px]",
              !report && !isInjecting && "flex items-center justify-center italic text-text-dim text-[13px]"
            )}>
              {isInjecting ? (
                <div className="flex flex-col items-center justify-center h-full space-y-6">
                  <div className="relative">
                    <Database className="w-12 h-12 text-accent-blue animate-pulse opacity-50" />
                    <div className="absolute inset-0 border border-accent-blue rounded-full animate-ping opacity-20" />
                  </div>
                  <div className="space-y-2 text-center text-text-dim">
                     <p className="text-[10px] font-black uppercase tracking-[0.3em]">Synthesizing Data Structures...</p>
                  </div>
                </div>
              ) : report ? (
                <div className="prose prose-invert prose-p:text-xs prose-p:text-text-dim prose-headings:text-white prose-headings:font-black prose-headings:tracking-widest prose-headings:uppercase prose-a:text-accent-blue max-w-none">
                  {report.split('\n').map((para, i) => {
                    if (para.startsWith('###')) return <h3 key={i} className="text-sm mt-4 mb-2 text-accent-blue">{para.replace('###', '')}</h3>;
                    if (para.startsWith('##')) return <h2 key={i} className="text-base mt-6 mb-3 border-b border-white/10 pb-2">{para.replace('##', '')}</h2>;
                    if (para.startsWith('#')) return <h1 key={i} className="text-lg mt-6 mb-4 text-white">{para.replace('#', '')}</h1>;
                    if (para.startsWith('-')) return <li key={i} className="text-xs text-text-dim ml-4 mb-1">{para.substring(1)}</li>;
                    if (para.startsWith('**')) return <div key={i} className="text-xs text-white font-bold mt-3 mb-1">{para.replace(/\*\*/g, '')}</div>;
                    return <p key={i} className="mb-2 leading-relaxed">{para}</p>;
                  })}
                  {suggestedCommand && (
                    <div className="mt-6 p-4 border border-accent-blue/30 bg-accent-blue/10 rounded space-y-3">
                        <h4 className="text-[10px] font-black uppercase text-accent-blue flex items-center gap-2">
                           <TerminalIcon className="w-4 h-4" /> Recommended AI Next Step Command
                        </h4>
                        <code className="block p-3 bg-black text-white text-xs font-mono rounded overflow-x-auto">
                            {suggestedCommand}
                        </code>
                        <button 
                            onClick={() => window.dispatchEvent(new CustomEvent('send-to-shell', { detail: suggestedCommand }))}
                            className="bg-accent-blue hover:bg-accent-blue/80 text-white text-[10px] font-bold uppercase tracking-widest py-2 px-4 rounded w-full flex justify-center items-center gap-2"
                        >
                            <Play className="w-3.5 h-3.5" /> Execute in Shell
                        </button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="uppercase tracking-widest">Awaiting Injection Data</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
