import React, { useState, useRef, useEffect } from 'react';
import { Wifi, Terminal as TerminalIcon, Radio } from 'lucide-react';
import { cn } from '../lib/utils';
import axios from 'axios';

export default function KismetTool() {
  const [interfaceName, setInterfaceName] = useState('wlan0mon');
  const [captureFile, setCaptureFile] = useState('/sdcard/kismet_capture');
  
  const [isScanning, setIsScanning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleRun = async () => {
    if (!interfaceName) return;
    setIsScanning(true);
    setLogs([
      `[SYSTEM] Kismet Android Native initialized...`, 
      `[INFO] Interface: ${interfaceName}`, 
      `[INFO] Target Capture File: ${captureFile}.pcapng`
    ]);

    let simulatedLogs = [
      `[INFO] Hardware: Supported Android Wireless interface detected.`,
      `[INFO] Channel hopping enabled: 1,6,11,36,40,44,48,149,153,157,161`,
      `===============================================================`
    ];

    simulatedLogs.forEach((log, index) => {
      setTimeout(() => {
        setLogs(prev => [...prev, log]);
      }, 500 + index * 400);
    });

    try {
      const response = await axios.post('/api/analyze/vulnerability', {
        code: `Kismet Interface: ${interfaceName}\nCapture File: ${captureFile}`,
        context: "Wireless wardriving network enumeration execution simulation.",
        tool_preference: "Kismet Android Runtime"
      });
      setTimeout(() => {
        setLogs(prev => [...prev, `[SUCCESS] 42 Networks Identified (18 WPA3, 20 WPA2, 4 WEP)`]);
        setLogs(prev => [...prev, `[INFO] Parsing collected telemetry...`]);
        setLogs(prev => [...prev, response.data.analysis]);
        setLogs(prev => [...prev, `===============================================================`]);
        setLogs(prev => [...prev, `[SYSTEM] Kismet session complete. Logs saved.`]);
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
    window.dispatchEvent(new CustomEvent('send-to-shell', { detail: `kismet -c ${interfaceName} -t ${captureFile}` }));
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center gap-3 border-b border-white/5 pb-4">
        <div className="p-2 bg-accent-blue/10 border border-accent-blue/30 rounded">
          <Radio className="w-5 h-5 text-accent-blue" />
        </div>
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest text-white">Kismet Android Opt</h2>
          <p className="text-[10px] text-text-dim font-bold uppercase tracking-widest">Wireless Wardriving Framework</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest">Wireless Interface</label>
            <input type="text" value={interfaceName} onChange={e => setInterfaceName(e.target.value)} className="bg-bg-dark border border-white/10 p-2 text-xs text-white outline-none w-full font-mono rounded" placeholder="wlan0" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest">Capture Prefix Path</label>
            <input type="text" value={captureFile} onChange={e => setCaptureFile(e.target.value)} className="bg-bg-dark border border-white/10 p-2 text-xs text-white outline-none w-full font-mono rounded" placeholder="/sdcard/kismet" />
          </div>
          <button onClick={handleRun} disabled={!interfaceName || isScanning} className="w-full bg-accent-blue text-white py-3 rounded text-[10px] font-black uppercase tracking-[0.2em]">{isScanning ? 'Starting...' : 'Launch Kismet Capture'}</button>
          <button onClick={handleSendToShell} disabled={!interfaceName} className="w-full bg-bg-dark border border-white/5 py-3 rounded text-[10px] font-black text-text-dim uppercase tracking-[0.2em] flex items-center justify-center gap-2"><TerminalIcon className="w-4 h-4"/>Send to Shell (kismet)</button>
        </div>
        
        <div className="panel bg-black/90 p-4 font-mono text-[10px] overflow-y-auto custom-scrollbar h-full min-h-[300px] border border-border-main flex flex-col space-y-1">
          {logs.length > 0 ? logs.map((log, i) => (
            <div key={i} className={cn(log.includes('[SUCCESS]') ? "text-accent-blue font-bold text-[11px]" : "text-text-dim")}>{log}</div>
          )) : <div className="text-text-dim italic">Waiting to start device monitor...</div>}
          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  );
}
