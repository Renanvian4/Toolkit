import { useState, useRef, useEffect } from 'react';
import { Layers, Play, Terminal, Target, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import axios from 'axios';

export default function CombinedAttacksTool() {
  const [target, setTarget] = useState('');
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [isAttacking, setIsAttacking] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  const availableTools = [
    { id: 'nmap', label: 'Nmap (Port Scan)', color: 'text-accent-blue', border: 'border-accent-blue' },
    { id: 'gobuster', label: 'Gobuster (Dir Brute)', color: 'text-accent-yellow', border: 'border-accent-yellow' },
    { id: 'nikto', label: 'Nikto (Web Vuln)', color: 'text-accent-green', border: 'border-accent-green' },
    { id: 'ffuf', label: 'FFUF (Fuzzing)', color: 'text-accent-blue', border: 'border-accent-blue' },
    { id: 'sqlmap', label: 'SQLMap (DB Injection)', color: 'text-accent-red', border: 'border-accent-red' }
  ];

  const toggleTool = (id: string) => {
    setSelectedTools(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  };

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleLaunch = async () => {
    if (!target || selectedTools.length === 0) return;
    setIsAttacking(true);
    setLogs([
      '[SYSTEM] Initiating Combined Attack Sequence...',
      `[INFO] Target: ${target}`,
      `[INFO] Tools: ${selectedTools.join(', ')}`,
      '----------------------------------------'
    ]);

    for (const tool of selectedTools) {
      setLogs(p => [...p, `[EXEC] Launching ${tool} against ${target}...`]);
      try {
        const cmd = tool === 'nmap' ? `nmap -F ${target}` :
                    tool === 'gobuster' ? `gobuster dir -u ${target} -w common.txt` :
                    tool === 'nikto' ? `nikto -h ${target}` :
                    tool === 'ffuf' ? `ffuf -u http://${target}/FUZZ -w common.txt` :
                    tool === 'sqlmap' ? `sqlmap -u "http://${target}" --batch` : `echo Simulated ${tool}`;
                    
        const res = await axios.post('/api/shell/exec', { command: cmd });
        setLogs(p => [...p, `[${tool.toUpperCase()} OUTPUT]:`, res.data.stdout || res.data.stderr || 'No output']);
      } catch (e: any) {
        setLogs(p => [...p, `[ERROR] ${tool} failed: ${e.message}`]);
      }
    }
    
    setLogs(p => [...p, '----------------------------------------', '[SYSTEM] Combined Sequence Complete.']);
    setIsAttacking(false);
  };

  return (
    <div className="h-full flex flex-col space-y-6 text-text-main">
      <header className="flex items-center gap-3 pb-4 border-b border-border-main">
        <Layers className="w-5 h-5 text-accent-red drop-shadow-[0_0_8px_rgba(255,51,102,0.6)]" />
        <div>
          <h2 className="text-[12px] font-black tracking-[0.2em] uppercase text-white">Chain Attack Sequences</h2>
          <p className="text-[9px] text-text-dim uppercase">Combine functional operational sweeps</p>
        </div>
      </header>
      
      <div className="space-y-4">
        <div className="space-y-2">
           <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest block">Global Target Domain/IP</label>
           <div className="relative">
             <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
             <input type="text" value={target} onChange={e => setTarget(e.target.value)} className="w-full bg-bg-dark border border-white/10 pl-10 pr-4 py-2 text-xs text-white outline-none font-mono rounded focus:border-accent-red transition-colors" placeholder="e.g. target.local" />
           </div>
        </div>

        <div className="space-y-2">
           <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest block">Select Chain Operations</label>
           <div className="grid grid-cols-1 gap-2">
             {availableTools.map(t => (
               <button 
                 key={t.id} 
                 onClick={() => toggleTool(t.id)}
                 className={cn(
                   "text-[10px] uppercase font-bold tracking-widest py-2 px-3 border rounded flex items-center justify-between transition-all",
                   selectedTools.includes(t.id) ? `bg-${t.color}/10 ${t.border} ${t.color}` : "bg-bg-dark border-white/5 text-text-dim hover:border-white/20"
                 )}
               >
                 {t.label}
                 {selectedTools.includes(t.id) && <span className="text-[8px] bg-white text-black px-1.5 py-0.5 rounded">QUEUED</span>}
               </button>
             ))}
           </div>
        </div>
        
        <button 
          onClick={handleLaunch} 
          disabled={!target || selectedTools.length === 0 || isAttacking}
          className="w-full bg-accent-red text-white py-3 flex justify-center items-center gap-2 rounded text-[11px] font-black uppercase tracking-[0.2em] hover:shadow-[0_0_20px_rgba(255,51,102,0.4)] disabled:opacity-50 transition-all border border-accent-red"
        >
          {isAttacking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
          {isAttacking ? "EXECUTING SEQUENCE..." : "LAUNCH COMBINED ATTACK"}
        </button>
      </div>

      <div className="flex-1 flex flex-col space-y-2 overflow-hidden">
        <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest flex items-center gap-1"><Terminal className="w-3 h-3" /> Sequence Logs</label>
        <div className="flex-1 bg-black/90 p-4 font-mono text-[10px] overflow-y-auto custom-scrollbar border border-border-main rounded text-text-dim whitespace-pre-wrap leading-relaxed">
           {logs.map((L, i) => (
             <div key={i} className={cn(
               L.includes('[SYSTEM]') ? 'text-accent-red font-bold' :
               L.includes('[EXEC]') ? 'text-accent-blue' :
               L.includes('[OUTPUT]') ? 'text-accent-green' : 'text-text-main/80'
             )}>{L}</div>
           ))}
           <div ref={logEndRef} />
        </div>
      </div>
    </div>
  );
}
