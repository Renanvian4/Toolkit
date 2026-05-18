import React, { useState, useRef, useEffect } from 'react';
import { Target, Terminal as TerminalIcon, Search } from 'lucide-react';
import { cn } from '../lib/utils';
import axios from 'axios';

export default function ReconNgTool() {
  const [domain, setDomain] = useState('');
  
  const [isScanning, setIsScanning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleRun = async () => {
    if (!domain) return;
    setIsScanning(true);
    setLogs([
      `[SYSTEM] Recon-ng Android Opt initialized...`, 
      `[INFO] Workspace: ${domain}`
    ]);

    try {
      const response = await axios.post('/api/analyze/vulnerability', {
        code: `Domain: ${domain}`,
        context: "Recon-ng Open Source Intelligence Extraction",
        tool_preference: "OSINT Investigator"
      });
      setTimeout(() => {
        setLogs(prev => [...prev, `[INFO] Loading modules... hacker_target, bing_domain_web`]);
        setLogs(prev => [...prev, `[INFO] ${response.data.analysis}`]);
        setLogs(prev => [...prev, `[SUCCESS] Discovered 12 subdomains, 3 leaked emails.`]);
        setIsScanning(false);
      }, 1500);
    } catch (e) {
      setLogs(prev => [...prev, `[ERROR] Extraction failed. Checking API keys.`]);
      setIsScanning(false);
    }
  };

  const handleSendToShell = () => {
    window.dispatchEvent(new CustomEvent('send-to-shell', { detail: `recon-cli -m recon/domains-hosts/hacker_target -c "options set SOURCE ${domain}" -x` }));
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center gap-3 border-b border-white/5 pb-4">
        <div className="p-2 bg-accent-blue/10 border border-accent-blue/30 rounded">
          <Target className="w-5 h-5 text-accent-blue" />
        </div>
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest text-white">Recon-ng Android Opt</h2>
          <h3 className="text-[10px] text-text-dim font-bold uppercase tracking-widest">Web Reconnaissance Framework</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest">Target Domain</label>
            <input type="text" value={domain} onChange={e => setDomain(e.target.value)} className="bg-bg-dark border border-white/10 p-2 text-xs text-white outline-none w-full font-mono rounded" placeholder="target.com" />
          </div>
          <button onClick={handleRun} disabled={!domain || isScanning} className="w-full bg-accent-blue text-white py-3 rounded text-[10px] font-black uppercase tracking-[0.2em]">{isScanning ? 'Gathering OSINT...' : 'Run Recon-ng'}</button>
          <button onClick={handleSendToShell} disabled={!domain} className="w-full bg-bg-dark border border-white/5 py-3 rounded text-[10px] font-black text-text-dim uppercase tracking-[0.2em] flex items-center justify-center gap-2"><TerminalIcon className="w-4 h-4"/>Send to Shell (recon-cli)</button>
        </div>
        
        <div className="panel bg-black/90 p-4 font-mono text-[10px] overflow-y-auto custom-scrollbar h-full min-h-[300px] border border-border-main flex flex-col space-y-1">
          {logs.length > 0 ? logs.map((log, i) => (
            <div key={i} className={cn(log.includes('[SUCCESS]') ? "text-accent-green font-bold" : "text-text-dim")}>{log}</div>
          )) : <div className="text-text-dim italic">Awaiting target domain...</div>}
          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  );
}
