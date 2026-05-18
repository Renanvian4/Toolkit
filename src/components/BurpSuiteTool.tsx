import React, { useState, useRef, useEffect } from 'react';
import { Network, Terminal as TerminalIcon, Shield } from 'lucide-react';
import { cn } from '../lib/utils';
import axios from 'axios';

export default function BurpSuiteTool() {
  const [proxyPort, setProxyPort] = useState('8080');
  const [targetScope, setTargetScope] = useState('');
  
  const [isScanning, setIsScanning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleRun = async () => {
    if (!targetScope) return;
    setIsScanning(true);
    setLogs([
      `[SYSTEM] Burp Suite Headless Android Agent Started...`, 
      `[INFO] Proxy Port: ${proxyPort}`, 
      `[INFO] Scope: ${targetScope}`
    ]);

    let simulatedLogs = [
      `[INFO] Listening on 127.0.0.1:${proxyPort}`,
      `[INFO] Starting active scan on scope: ${targetScope}`,
      `===============================================================`
    ];

    simulatedLogs.forEach((log, index) => {
      setTimeout(() => {
        setLogs(prev => [...prev, log]);
      }, 500 + index * 400);
    });

    try {
      const response = await axios.post('/api/analyze/vulnerability', {
        code: `Burp Target Scope: ${targetScope}\nPort: ${proxyPort}`,
        context: "Headless Burp Suite web vulnerability scanning and interception execution simulation.",
        tool_preference: "Burp Android Rest API Automation Runtime"
      });
      setTimeout(() => {
        setLogs(prev => [...prev, `[SUCCESS] High severity vulnerability identified (XSS)`]);
        setLogs(prev => [...prev, response.data.analysis]);
        setLogs(prev => [...prev, `===============================================================`]);
        setLogs(prev => [...prev, `[SYSTEM] Scan finished. Report generated.`]);
        setIsScanning(false);
      }, 500 + simulatedLogs.length * 400 + 1000);
    } catch (e) {
      setTimeout(() => {
        setLogs(prev => [...prev, `[ERROR] Analysis failed. Checking API keys.`]);
        setIsScanning(false);
      }, 500 + simulatedLogs.length * 400 + 1000);
    }
  };

  const handleSendToShell = () => {
    window.dispatchEvent(new CustomEvent('send-to-shell', { detail: `curl -s http://127.0.0.1:1337/v0.1/scan -d '{"scope": "${targetScope}"}'` }));
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center gap-3 border-b border-white/5 pb-4">
        <div className="p-2 bg-accent-yellow/10 border border-accent-yellow/30 rounded">
          <Shield className="w-5 h-5 text-accent-yellow" />
        </div>
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest text-white">Burp Suite Headless</h2>
          <p className="text-[10px] text-text-dim font-bold uppercase tracking-widest">Web Vulnerability Interceptor</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest">Target Scope</label>
            <input type="text" value={targetScope} onChange={e => setTargetScope(e.target.value)} className="bg-bg-dark border border-white/10 p-2 text-xs text-white outline-none w-full font-mono rounded" placeholder="https://target.local" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest">Local Proxy Port</label>
            <input type="text" value={proxyPort} onChange={e => setProxyPort(e.target.value)} className="bg-bg-dark border border-white/10 p-2 text-xs text-white outline-none w-full font-mono rounded" placeholder="8080" />
          </div>
          <button onClick={handleRun} disabled={!targetScope || isScanning} className="w-full bg-accent-blue text-white py-3 rounded text-[11px] font-black uppercase tracking-[0.2em] hover:shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all border border-accent-blue flex justify-center items-center gap-2">
            {isScanning ? 'Scanning...' : 'Start Active Scan'}
          </button>
          <button onClick={handleSendToShell} disabled={!targetScope} className="w-full bg-bg-dark border border-white/5 py-3 rounded text-[10px] font-black text-text-dim uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:border-white/20 hover:text-white transition-all"><TerminalIcon className="w-4 h-4"/>Send to Shell (API Req)</button>
        </div>
        
        <div className="panel bg-black/90 p-4 font-mono text-[10px] overflow-y-auto custom-scrollbar h-full min-h-[300px] border border-border-main flex flex-col space-y-1">
          {logs.length > 0 ? logs.map((log, i) => (
            <div key={i} className={cn(log.includes('[SUCCESS]') ? "text-accent-yellow font-bold text-[11px]" : "text-text-dim")}>{log}</div>
          )) : <div className="text-text-dim italic">Waiting to configure Burp Engine...</div>}
          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  );
}
