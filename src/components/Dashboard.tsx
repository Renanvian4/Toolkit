import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import axios from 'axios';
import { 
  Zap, 
  ShieldCheck, 
  AlertTriangle, 
  TrendingUp, 
  Clock,
  Globe,
  Terminal as TerminalIcon,
  ChevronRight,
  Activity,
  ArrowDown,
  ArrowUp,
  BrainCircuit,
  Info,
  Trash2
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function Dashboard({ onNavigate, stats }: { onNavigate: (tool: any) => void, stats: { activeScans: number, threatLevel: string, sessionTime: number } }) {
  const [network, setNetwork] = useState({ down: 0, up: 0 });
  const [neuralStatus, setNeuralStatus] = useState<{status: string, mode?: string, message?: string}>({ status: 'PROBING...' });
  const [intelligence, setIntelligence] = useState<any[]>([]);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const resp = await axios.get('/api/system/neural-status');
        setNeuralStatus(resp.data);
      } catch (e) {
        setNeuralStatus({ status: 'OFFLINE' });
      }
    };

    const fetchIntelligence = async () => {
      try {
        const resp = await axios.get('/api/intelligence/library');
        setIntelligence(resp.data.reverse()); // Show newest first
      } catch (e) {}
    };

    fetchStatus();
    fetchIntelligence();
    
    const statusInterval = setInterval(fetchStatus, 15000); // 15s health check
    const intelInterval = setInterval(fetchIntelligence, 10000); // 10s feed sync

    const interval = setInterval(() => {
      setNetwork({
        down: parseFloat((Math.random() * 25 + 5).toFixed(1)),
        up: parseFloat((Math.random() * 8 + 1).toFixed(1))
      });
    }, 2000);
    return () => {
      clearInterval(interval);
      clearInterval(statusInterval);
      clearInterval(intelInterval);
    };
  }, []);

  const deleteIntelligence = async (id: string) => {
    try {
      await axios.delete(`/api/intelligence/delete/${id}`);
      setIntelligence(prev => prev.filter(item => item.id !== id));
    } catch (e) {
      console.error("Failed to delete intelligence entry", e);
    }
  };

  const dashboardStats = [
    { label: 'ACTIVE_SCANS', value: stats.activeScans.toString().padStart(2, '0'), icon: Activity, color: 'text-blue-500' },
    { label: 'THREAT_LEVEL', value: stats.threatLevel, icon: ShieldCheck, color: stats.threatLevel === 'NORMAL' ? 'text-emerald-500' : 'text-accent-red' },
    { label: 'DOWN_METRIC', value: `${network.down} MB/s`, icon: ArrowDown, color: 'text-accent-green' },
    { label: 'UP_METRIC', value: `${network.up} MB/s`, icon: ArrowUp, color: 'text-accent-blue' },
    { label: 'GHOST_NODES', value: '18', icon: Globe, color: 'text-accent-blue' },
    { label: 'SESSION_PTR', value: stats.sessionTime.toString().padStart(4, '0'), icon: Clock, color: 'text-purple-500' },
  ];

  return (
    <div className="space-y-6">
      <header className="mb-4">
        <div className="flex items-center gap-2 text-accent-blue mb-0.5">
          <TerminalIcon className="w-4 h-4" />
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Status Report</span>
        </div>
        <h1 className="text-2xl font-black tracking-tighter text-text-main uppercase">ROOT@CATALYST: SESSION_STABLE</h1>
        
        {/* Neural Link Status Bar */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded border text-[10px] font-black uppercase tracking-widest transition-all",
            neuralStatus.status === 'ACTIVE' ? "bg-accent-green/5 border-accent-green/30 text-accent-green shadow-[0_0_10px_rgba(34,197,94,0.1)]" : 
            neuralStatus.status === 'THROTTLED' ? "bg-accent-yellow/5 border-accent-yellow/30 text-accent-yellow" :
            "bg-accent-red/5 border-accent-red/30 text-accent-red"
          )}>
            <BrainCircuit className={cn("w-3.5 h-3.5", neuralStatus.status === 'ACTIVE' ? "animate-pulse" : "")} />
            NEURAL_LINK: {neuralStatus.status || "UNKNOWN"}
            {neuralStatus.mode && <span className="ml-1 opacity-50">[{neuralStatus.mode} MODE]</span>}
          </div>
          
          {neuralStatus.status === 'THROTTLED' && (
            <div className="flex items-center gap-2 text-[9px] font-bold text-text-dim italic">
              <Info className="w-3 h-3" />
              <span>Catalyst Heuristic Engine (Offline Logic) is active. Dynamic neural seeding is offline.</span>
            </div>
          )}
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-border-main border border-border-main rounded overflow-hidden">
        {dashboardStats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-bg-dark p-4 group cursor-default"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-[9px] font-bold text-text-dim tracking-widest uppercase">{stat.label}</span>
              <stat.icon className={cn("w-3.5 h-3.5", stat.color)} />
            </div>
            <div className="text-xl font-mono font-bold text-text-main group-hover:text-accent-blue transition-colors uppercase tabular-nums">{stat.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Real-time Traffic Monitor */}
      <div className="panel bg-bg-dark border-border-main p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-accent-blue" />
            <span className="text-[10px] font-black uppercase tracking-widest text-text-dim">Network_Traffic_Realtime</span>
          </div>
          <div className="flex gap-4 text-[10px] font-bold">
            <div className="flex items-center gap-1.5 text-accent-green">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse"></div>
              <span>DOWN: {network.down} MB/s</span>
            </div>
            <div className="flex items-center gap-1.5 text-accent-blue">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-pulse"></div>
              <span>UP: {network.up} MB/s</span>
            </div>
          </div>
        </div>
        <div className="h-16 flex items-end gap-1 overflow-hidden">
          {Array.from({ length: 120 }).map((_, i) => {
             const height = Math.random() * 80 + 20;
             return (
               <motion.div 
                 key={i}
                 initial={{ height: '20%' }}
                 animate={{ height: `${height}%` }}
                 transition={{ 
                   duration: 1.5, 
                   repeat: Infinity, 
                   repeatType: "reverse",
                   delay: i * 0.02
                 }}
                 className={cn(
                   "flex-1 rounded-t-[1px]",
                   i % 3 === 0 ? "bg-accent-blue/30" : "bg-accent-green/30"
                 )}
               />
             );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Intelligence Library Feed */}
        <div className="lg:col-span-2 space-y-3">
          <div className="panel h-[400px] flex flex-col">
            <div className="panel-header border-b border-border-main/50 pb-2">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-3.5 h-3.5 text-accent-blue" />
                <span>INTELLIGENCE_LIBRARY (TACTICAL_FEED)</span>
              </div>
              <div className="text-[10px] text-accent-blue font-bold tracking-widest">{intelligence.length} ENTRIES</div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
               {intelligence.length > 0 ? (
                 <div className="divide-y divide-border-main">
                    {intelligence.slice(0, 8).map((entry) => (
                      <div key={entry.id} className="p-4 hover:bg-white/5 transition-colors group relative">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black text-accent-blue tracking-tighter uppercase">{entry.tool}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-[9px] text-text-dim">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                            <button 
                              onClick={() => deleteIntelligence(entry.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-accent-red/20 text-accent-red rounded transition-all"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <p className="text-[11px] text-text-main font-bold mb-1">{entry.findings}</p>
                        <div className="bg-bg-dark/50 border border-border-main/50 p-2 rounded text-[10px] text-text-dim font-mono italic line-clamp-2 group-hover:line-clamp-none transition-all">
                          {entry.next_steps}
                        </div>
                      </div>
                    ))}
                 </div>
               ) : (
                 <div className="p-12 text-center flex flex-col items-center gap-2 opacity-30">
                    <Clock className="w-8 h-8 text-text-dim" />
                    <p className="text-[11px] font-bold uppercase tracking-widest">Library Empty</p>
                    <p className="text-[10px] italic">Complete an autonomous audit to populate this tactical feed.</p>
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* Quick Actions (modified column span) */}
        <div className="space-y-3">
          <div className="panel h-[400px]">
            <div className="panel-header">
              <span>DEPLOY_VECTORS</span>
              <Zap className="w-3 h-3 text-accent-blue" />
            </div>
            <div className="space-y-2">
               {[
                 { id: 'recon', label: 'Network Surface Scan', detail: 'Simulate high-speed discovery' },
                 { id: 'ai', label: 'AI Logical Audit', detail: 'Deep semantic analysis' },
                 { id: 'ghost', label: 'Ghost Route Active', detail: 'IP Masking & Rotation' },
                 { id: 'hydra', label: 'Hydra Catalyst Alpha', detail: 'Advanced parallel brute force' }
               ].map((action, idx) => (
                 <button 
                  key={`${action.id}-${idx}`} 
                  onClick={() => onNavigate(action.id)}
                  className="w-full text-left bg-surface border border-border-main p-3 rounded hover:border-accent-blue group transition-all"
                >
                    <div className="flex items-center justify-between font-bold text-[12px] text-text-main group-hover:text-accent-blue uppercase tracking-tight">
                      {action.label}
                      <ChevronRight className="w-3 h-3" />
                    </div>
                    <div className="text-[9px] text-text-dim mt-0.5 leading-tight">{action.detail}</div>
                 </button>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
