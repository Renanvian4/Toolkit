import React, { useState, useRef, useEffect } from 'react';
import { Key, Terminal as TerminalIcon, Skull } from 'lucide-react';
import { cn } from '../lib/utils';
import axios from 'axios';

export default function MimikatzTool() {
  const [pid, setPid] = useState('lsass.exe');
  const [module, setModule] = useState('sekurlsa::logonpasswords');
  
  const [isScanning, setIsScanning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleRun = async () => {
    setIsScanning(true);
    setLogs([
      `[SYSTEM] Mimikatz Android Relay initialized...`, 
      `[INFO] Target Process: ${pid}`, 
      `[INFO] Target Module: ${module}`
    ]);

    let simulatedLogs = [
      `[INFO] Privilege::debug... OK`,
      `[INFO] Injecting into LSA core...`,
      `===============================================================`
    ];

    simulatedLogs.forEach((log, index) => {
      setTimeout(() => {
        setLogs(prev => [...prev, log]);
      }, 500 + index * 400);
    });

    try {
      const response = await axios.post('/api/analyze/vulnerability', {
        code: `Mimikatz Module: ${module}\nTarget PID: ${pid}`,
        context: "Mimikatz memory extraction and credential dumping execution simulation.",
        tool_preference: "Mimikatz Android Remote Runtime"
      });
      setTimeout(() => {
        setLogs(prev => [...prev, `[SUCCESS] Authentication credentials successfully extracted.`]);
        setLogs(prev => [...prev, response.data.analysis]);
        setLogs(prev => [...prev, `===============================================================`]);
        setLogs(prev => [...prev, `[SYSTEM] Extraction complete.`]);
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
    window.dispatchEvent(new CustomEvent('send-to-shell', { detail: `mimikatz "${module} exit"` }));
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center gap-3 border-b border-white/5 pb-4">
        <div className="p-2 bg-accent-red/10 border border-accent-red/30 rounded">
          <Key className="w-5 h-5 text-accent-red" />
        </div>
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest text-white">Mimikatz Android Opt</h2>
          <p className="text-[10px] text-text-dim font-bold uppercase tracking-widest">Post-Exploitation Credential Dumper</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest">Process/Dump</label>
            <input type="text" value={pid} onChange={e => setPid(e.target.value)} className="bg-bg-dark border border-white/10 p-2 text-xs text-white outline-none w-full font-mono rounded" placeholder="lsass.exe" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest">Module Payload</label>
            <input type="text" value={module} onChange={e => setModule(e.target.value)} className="bg-bg-dark border border-white/10 p-2 text-xs text-white outline-none w-full font-mono rounded" placeholder="sekurlsa::logonpasswords" />
          </div>
          <button onClick={handleRun} disabled={isScanning} className="w-full bg-accent-red text-white py-3 rounded text-[10px] font-black uppercase tracking-[0.2em]">{isScanning ? 'Extracting...' : 'Dump Credentials'}</button>
          <button onClick={handleSendToShell} className="w-full bg-bg-dark border border-white/5 py-3 rounded text-[10px] font-black text-text-dim uppercase tracking-[0.2em] flex items-center justify-center gap-2"><TerminalIcon className="w-4 h-4"/>Send to Shell (mimikatz)</button>
        </div>
        
        <div className="panel bg-black/90 p-4 font-mono text-[10px] overflow-y-auto custom-scrollbar h-full min-h-[300px] border border-border-main flex flex-col space-y-1">
          {logs.length > 0 ? logs.map((log, i) => (
            <div key={i} className={cn(log.includes('[SUCCESS]') || log.includes('NTLM') ? "text-accent-red font-bold text-[11px]" : "text-text-dim")}>{log}</div>
          )) : <div className="text-text-dim italic">Awaiting target parameters...</div>}
          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  );
}
