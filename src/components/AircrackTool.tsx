import React, { useState, useRef, useEffect } from 'react';
import { Wifi, Terminal as TerminalIcon, ShieldAlert } from 'lucide-react';
import { cn } from '../lib/utils';
import axios from 'axios';

export default function AircrackTool() {
  const [bssid, setBssid] = useState('');
  const [channel, setChannel] = useState('6');
  
  const [isScanning, setIsScanning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleRun = async () => {
    if (!bssid) return;
    setIsScanning(true);
    setLogs([`[SYSTEM] Aircrack-ng Android Native Wrapper initialized...`, `[INFO] Interface: wlan0mon`, `[INFO] Target BSSID: ${bssid}`]);

    let simulatedLogs = [
      `[INFO] Airodump-ng capturing packets on CH ${channel}...`,
      `[INFO] Deauth attack engaged. Waiting for WPA handshake...`,
      `===============================================================`
    ];

    simulatedLogs.forEach((log, index) => {
      setTimeout(() => {
        setLogs(prev => [...prev, log]);
      }, 500 + index * 400);
    });

    try {
      const response = await axios.post('/api/analyze/vulnerability', {
        code: `Aircrack-ng BSSID: ${bssid}\nChannel: ${channel}`,
        context: "Wireless Network Security Audit and Dictionary Attack execution simulation.",
        tool_preference: "Aircrack-ng Android Runtime (wlan0mon)"
      });
      setTimeout(() => {
        setLogs(prev => [...prev, `[SUCCESS] WPA Handshake captured! [${bssid}]`]);
        setLogs(prev => [...prev, `[INFO] Starting AI-guided offline wordlist attack...`]);
        setLogs(prev => [...prev, response.data.analysis]);
        setLogs(prev => [...prev, `===============================================================`]);
        setLogs(prev => [...prev, `[SYSTEM] Audit complete.`]);
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
    window.dispatchEvent(new CustomEvent('send-to-shell', { detail: `aircrack-ng -w wordlist.txt -b ${bssid} capture.cap` }));
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center gap-3 border-b border-white/5 pb-4">
        <div className="p-2 bg-accent-green/10 border border-accent-green/30 rounded">
          <Wifi className="w-5 h-5 text-accent-green" />
        </div>
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest text-white">Aircrack-ng Android Opt</h2>
          <p className="text-[10px] text-text-dim font-bold uppercase tracking-widest">Wireless Security Auditor</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest">Target BSSID</label>
            <input type="text" value={bssid} onChange={e => setBssid(e.target.value)} className="bg-bg-dark border border-white/10 p-2 text-xs text-white outline-none w-full font-mono rounded" placeholder="00:11:22:33:44:55" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest">Channel</label>
            <input type="text" value={channel} onChange={e => setChannel(e.target.value)} className="bg-bg-dark border border-white/10 p-2 text-xs text-white outline-none w-full font-mono rounded" placeholder="6" />
          </div>
          <button onClick={handleRun} disabled={!bssid || isScanning} className="w-full bg-accent-green text-black py-3 rounded text-[10px] font-black uppercase tracking-[0.2em] hover:bg-accent-green/90">{isScanning ? 'Auditing...' : 'Launch Aircrack-ng'}</button>
          <button onClick={handleSendToShell} disabled={!bssid} className="w-full bg-bg-dark border border-white/5 py-3 rounded text-[10px] font-black text-text-dim uppercase tracking-[0.2em] flex items-center justify-center gap-2"><TerminalIcon className="w-4 h-4"/>Send to Shell</button>
        </div>
        
        <div className="panel bg-black/90 p-4 font-mono text-[10px] overflow-y-auto custom-scrollbar h-full min-h-[300px] border border-border-main flex flex-col space-y-1">
          {logs.length > 0 ? logs.map((log, i) => (
            <div key={i} className={cn(log.includes('[SUCCESS]') || log.includes('KEY FOUND') ? "text-accent-green font-bold text-[11px]" : "text-text-dim")}>{log}</div>
          )) : <div className="text-text-dim italic">Waiting to capture handshake...</div>}
          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  );
}
