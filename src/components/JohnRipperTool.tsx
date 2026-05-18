import React, { useState, useRef, useEffect } from 'react';
import { Lock, Terminal as TerminalIcon, Hash } from 'lucide-react';
import { cn } from '../lib/utils';
import axios from 'axios';

export default function JohnRipperTool() {
  const [hashFile, setHashFile] = useState('hashes.txt');
  const [wordlist, setWordlist] = useState('rockyou.txt');
  const [format, setFormat] = useState('raw-md5');
  
  const [isScanning, setIsScanning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleRun = async () => {
    if (!hashFile) return;
    setIsScanning(true);
    setLogs([
      `[SYSTEM] John The Ripper Engine Starting...`, 
      `[INFO] Target Hash File: ${hashFile}`, 
      `[INFO] Format: ${format}`
    ]);

    let simulatedLogs = [
      `[INFO] Loaded 1 password hash (No salt)`,
      `[INFO] Will run 4 OpenMP threads`,
      `===============================================================`,
      `[SYSTEM] Press 'q' or Ctrl-C to abort, almost any other key for status...`
    ];

    simulatedLogs.forEach((log, index) => {
      setTimeout(() => {
        setLogs(prev => [...prev, log]);
      }, 500 + index * 400);
    });

    try {
      const response = await axios.post('/api/analyze/vulnerability', {
        code: `John The Ripper format: ${format}\nHash File: ${hashFile}\nWordlist: ${wordlist}`,
        context: "Password hash offline cracking execution simulation.",
        tool_preference: "John The Ripper Runtime"
      });
      setTimeout(() => {
        setLogs(prev => [...prev, response.data.analysis]);
        setLogs(prev => [...prev, `===============================================================`]);
        setLogs(prev => [...prev, `[INFO] 1g 0:00:00:02 DONE (2026-05-17 10:20) 0.5000g/s 4500p/s 4500c/s 4500C/s 123456..password`]);
        setLogs(prev => [...prev, `[SYSTEM] Use the "--show" option to display all of the cracked passwords reliably`]);
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
    window.dispatchEvent(new CustomEvent('send-to-shell', { detail: `john --format=${format} --wordlist=${wordlist} ${hashFile}` }));
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center gap-3 border-b border-white/5 pb-4">
        <div className="p-2 bg-accent-yellow/10 border border-accent-yellow/30 rounded">
          <Lock className="w-5 h-5 text-accent-yellow" />
        </div>
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest text-white">John The Ripper</h2>
          <p className="text-[10px] text-text-dim font-bold uppercase tracking-widest">Offline Hash Cracker</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest">Hash File</label>
            <input type="text" value={hashFile} onChange={e => setHashFile(e.target.value)} className="bg-bg-dark border border-white/10 p-2 text-xs text-white outline-none w-full font-mono rounded" placeholder="hashes.txt" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest">Wordlist</label>
            <input type="text" value={wordlist} onChange={e => setWordlist(e.target.value)} className="bg-bg-dark border border-white/10 p-2 text-xs text-white outline-none w-full font-mono rounded" placeholder="rockyou.txt" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest">Hash Format</label>
            <input type="text" value={format} onChange={e => setFormat(e.target.value)} className="bg-bg-dark border border-white/10 p-2 text-xs text-white outline-none w-full font-mono rounded" placeholder="raw-md5" />
          </div>
          <button onClick={handleRun} disabled={!hashFile || isScanning} className="w-full bg-accent-blue text-white py-3 rounded text-[11px] font-black uppercase tracking-[0.2em] hover:shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all border border-accent-blue flex justify-center items-center gap-2">
            {isScanning ? 'Cracking...' : 'Run JTR'}
          </button>
          <button onClick={handleSendToShell} disabled={!hashFile} className="w-full bg-bg-dark border border-white/5 py-3 rounded text-[10px] font-black text-text-dim uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:border-white/20 hover:text-white transition-all"><TerminalIcon className="w-4 h-4"/>Send to Shell (john)</button>
        </div>
        
        <div className="panel bg-black/90 p-4 font-mono text-[10px] overflow-y-auto custom-scrollbar h-full min-h-[300px] border border-border-main flex flex-col space-y-1">
          {logs.length > 0 ? logs.map((log, i) => (
            <div key={i} className={cn(log.includes('[SUCCESS]') ? "text-accent-yellow font-bold text-[11px]" : "text-text-dim")}>{log}</div>
          )) : <div className="text-text-dim italic">Waiting for hash file...</div>}
          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  );
}
