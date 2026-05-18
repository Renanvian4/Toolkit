import React, { useState, useRef, useEffect } from 'react';
import { Network, Terminal as TerminalIcon, Play, AlertTriangle, ShieldAlert, Cpu, Layers } from 'lucide-react';
import { cn } from '../lib/utils';
import axios from 'axios';

export default function GobusterTool() {
  const [target, setTarget] = useState('');
  const [wordlist, setWordlist] = useState('common.txt');
  const [mode, setMode] = useState<'dir' | 'dns' | 'vhost'>('dir');
  
  const [isScanning, setIsScanning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleScan = async () => {
    if (!target) return;
    setIsScanning(true);
    setLogs([`[SYSTEM] Initializing Gobuster in ${mode} mode...`, `[INFO] Target: ${target}`, `[INFO] Wordlist: ${wordlist}`]);

    let simulatedLogs = [
      `[INFO] Starting gobuster ${mode} -u ${target} -w ${wordlist}`,
      `[INFO] Threads: 10`,
      `===============================================================`
    ];

    simulatedLogs.forEach((log, index) => {
      setTimeout(() => {
        setLogs(prev => [...prev, log]);
      }, 500 + index * 400);
    });

    try {
      const response = await axios.post('/api/analyze/vulnerability', {
        code: `Gobuster Mode: ${mode}\nTarget: ${target}\nWordlist: ${wordlist}`,
        context: "Directory/DNS Bruteforcing Scan execution simulation and analysis.",
        tool_preference: "Gobuster Android Runtime"
      });
      setTimeout(() => {
        setLogs(prev => [...prev, `[INFO] Scan results processing...`]);
        setLogs(prev => [...prev, response.data.analysis]);
        setLogs(prev => [...prev, `===============================================================`]);
        setLogs(prev => [...prev, `[SYSTEM] Scan complete.`]);
        setIsScanning(false);
      }, 500 + simulatedLogs.length * 400 + 1000);
    } catch (e) {
      setTimeout(() => {
        setLogs(prev => [...prev, `[ERROR] Extraction failed. Checking API keys.`]);
        setIsScanning(false);
      }, 500 + simulatedLogs.length * 400 + 1000);
    }
  };

  const handleSendToShell = () => {
    window.dispatchEvent(new CustomEvent('send-to-shell', { detail: `gobuster ${mode} -u "${target}" -w ${wordlist}` }));
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center gap-3 border-b border-white/5 pb-4">
        <div className="p-2 bg-accent-blue/10 border border-accent-blue/30 rounded">
          <Network className="w-5 h-5 text-accent-blue" />
        </div>
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest text-white">Gobuster Directory Engine</h2>
          <p className="text-[10px] text-text-dim font-bold uppercase tracking-widest">Fast HTTP/DNS Bruteforcer</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest">Target URL/Domain</label>
            <input type="text" value={target} onChange={e => setTarget(e.target.value)} className="bg-bg-dark border border-white/10 p-2 text-xs text-white outline-none w-full font-mono rounded" placeholder="http://target.com" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest">Scan Mode</label>
            <div className="grid grid-cols-3 gap-2">
              {['dir', 'dns', 'vhost'].map(m => (
                <button key={m} onClick={() => setMode(m as any)} className={cn("py-2 px-2 text-[10px] font-bold uppercase tracking-widest rounded transition-all", mode === m ? "bg-accent-blue/20 border border-accent-blue text-accent-blue" : "bg-bg-dark border border-white/5 text-text-dim hover:border-white/20")}>{m}</button>
              ))}
            </div>
          </div>
          <button onClick={handleScan} disabled={!target || isScanning} className="w-full bg-accent-blue text-white py-3 rounded text-[10px] font-black uppercase tracking-[0.2em]">{isScanning ? 'Scanning...' : 'Start Gobuster'}</button>
          <button onClick={handleSendToShell} disabled={!target} className="w-full bg-bg-dark border border-white/5 py-3 rounded text-[10px] font-black text-text-dim uppercase tracking-[0.2em] flex items-center justify-center gap-2"><TerminalIcon className="w-4 h-4"/>Send to Shell</button>
        </div>
        
        <div className="panel bg-black/90 p-4 font-mono text-[10px] overflow-y-auto custom-scrollbar h-full min-h-[300px] border border-border-main flex flex-col space-y-1">
          {logs.length > 0 ? logs.map((log, i) => (
            <div key={i} className={cn(log.includes('[SUCCESS]') || log.includes('Status: 200') ? "text-accent-green font-bold" : "text-text-dim")}>{log}</div>
          )) : <div className="text-text-dim italic">Waiting for target...</div>}
          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  );
}
