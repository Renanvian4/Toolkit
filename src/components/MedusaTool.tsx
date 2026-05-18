import React, { useState, useRef, useEffect } from 'react';
import { Database, Terminal as TerminalIcon, Search } from 'lucide-react';
import { cn } from '../lib/utils';
import axios from 'axios';

export default function MedusaTool({ sharedWordlist }: { sharedWordlist?: string[] }) {
  const [host, setHost] = useState('');
  const [service, setService] = useState('ssh');
  const [usersFile, setUsersFile] = useState('users.txt');
  const [passFile, setPassFile] = useState('pass.txt');
  
  const [isScanning, setIsScanning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleRun = async () => {
    if (!host) return;
    setIsScanning(true);
    setLogs([
      `[SYSTEM] Medusa Brute-Forcer initialized...`, 
      `[INFO] Target: ${host}`, 
      `[INFO] Service: ${service}`
    ]);

    let simulatedLogs = [
      `[INFO] ACCOUNTING: Found 100 users, 50 passwords`,
      `[INFO] Starting attack...`,
      `===============================================================`
    ];

    simulatedLogs.forEach((log, index) => {
      setTimeout(() => {
        setLogs(prev => [...prev, log]);
      }, 500 + index * 400);
    });

    try {
      const response = await axios.post('/api/analyze/vulnerability', {
        code: `Medusa Target: ${host}\nService: ${service}\nUsers File: ${usersFile}\nPass File: ${passFile}`,
        context: "Medusa parallel login brute-forcing execution simulation.",
        tool_preference: "Medusa Brute-Forcer Runtime"
      });
      setTimeout(() => {
        setLogs(prev => [...prev, response.data.analysis]);
        setLogs(prev => [...prev, `===============================================================`]);
        setLogs(prev => [...prev, `[SYSTEM] Execution finished.`]);
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
    window.dispatchEvent(new CustomEvent('send-to-shell', { detail: `medusa -h ${host} -U ${usersFile} -P ${passFile} -M ${service}` }));
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center gap-3 border-b border-white/5 pb-4">
        <div className="p-2 bg-accent-red/10 border border-accent-red/30 rounded">
          <Database className="w-5 h-5 text-accent-red" />
        </div>
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest text-white">Medusa Tool</h2>
          <h3 className="text-[10px] text-text-dim font-bold uppercase tracking-widest">Network Brute-Forcer</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest">Target IP</label>
            <input type="text" value={host} onChange={e => setHost(e.target.value)} className="bg-bg-dark border border-white/10 p-2 text-xs text-white outline-none w-full font-mono rounded" placeholder="192.168.1.1" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest">Service</label>
            <input type="text" value={service} onChange={e => setService(e.target.value)} className="bg-bg-dark border border-white/10 p-2 text-xs text-white outline-none w-full font-mono rounded" placeholder="ssh, ftp, smb..." />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest">Users File</label>
              <input type="text" value={usersFile} onChange={e => setUsersFile(e.target.value)} className="bg-bg-dark border border-white/10 p-2 text-xs text-white outline-none w-full font-mono rounded" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest flex items-center justify-between">
                Passwords File
                <button 
                  onClick={() => setPassFile(sharedWordlist?.join('\n') || '')}
                  className="text-[8px] bg-accent-blue/10 border border-accent-blue/30 text-accent-blue px-2 py-0.5 rounded uppercase hover:bg-accent-blue hover:text-white transition-all"
                >
                  Load Wordlist
                </button>
              </label>
              <textarea value={passFile} onChange={e => setPassFile(e.target.value)} className="bg-bg-dark border border-white/10 p-2 text-xs text-white outline-none w-full font-mono rounded h-24" placeholder="pass.txt or list..." />
            </div>
          </div>
          <button onClick={handleRun} disabled={!host || isScanning} className="w-full bg-accent-red text-white py-3 rounded text-[10px] font-black uppercase tracking-[0.2em] hover:bg-accent-red/90">{isScanning ? 'Attacking...' : 'Run Medusa'}</button>
          <button onClick={handleSendToShell} disabled={!host} className="w-full bg-bg-dark border border-white/5 py-3 rounded text-[10px] font-black text-text-dim uppercase tracking-[0.2em] flex items-center justify-center gap-2"><TerminalIcon className="w-4 h-4"/>Send to Shell (medusa)</button>
        </div>
        
        <div className="panel bg-black/90 p-4 font-mono text-[10px] overflow-y-auto custom-scrollbar h-full min-h-[300px] border border-border-main flex flex-col space-y-1">
          {logs.length > 0 ? logs.map((log, i) => (
            <div key={i} className={cn(log.includes('[SUCCESS]') ? "text-accent-green font-bold text-[11px]" : "text-text-dim")}>{log}</div>
          )) : <div className="text-text-dim italic">Awaiting target...</div>}
          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  );
}
