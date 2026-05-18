import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, MapPin, RefreshCw, Globe, ArrowRight, Lock, Loader2, AlertCircle, Cpu, Sparkles } from 'lucide-react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown'; import AiAnalysisRenderer from './AiAnalysisRenderer';
import { cn } from '../lib/utils';

interface GhostNode {
  id: string;
  location: string;
  ip: string;
  latency: string;
  status: string;
}

export default function GhostRouteTool() {
  const [realIp, setRealIp] = useState('FETCHING...');
  const [activeNode, setActiveNode] = useState<GhostNode | null>(null);
  const [nodes, setNodes] = useState<GhostNode[]>([]);
  const [isRouting, setIsRouting] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    fetchData();
    const savedIp = localStorage.getItem('ghost_spoofed_ip');
    if (savedIp) {
      setIsRouting(true);
      setLogs(prev => [`[SYSTEM] Ghost session restored from local cache.`, ...prev]);
    }
  }, []);

  const handleAiAudit = async () => {
    if (logs.length === 0) return;
    setIsAnalyzing(true);
    try {
      const response = await axios.post('/api/analyze/vulnerability', {
        code: JSON.stringify({ logs, activeNode }),
        context: `Ghost_Route Network Privacy Analysis. Current Identity Mask: ${activeNode?.location || 'Direct'}`,
        tool_preference: 'Strategic Anonymity Intelligence'
      });
      setAiAnalysis(response.data.analysis);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const fetchData = async () => {
    try {
      const [ipRes, nodesRes] = await Promise.all([
        axios.get('/api/tools/ghost-route/ip'),
        axios.get('/api/tools/ghost-route/nodes')
      ]);
      setRealIp(ipRes.data.real_ip);
      setNodes(nodesRes.data);
      
      const savedIp = localStorage.getItem('ghost_spoofed_ip');
      if (savedIp) {
        const node = nodesRes.data.find((n: any) => n.ip === savedIp);
        if (node) setActiveNode(node);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleRoute = () => {
    if (isRouting) {
      setIsRouting(false);
      setActiveNode(null);
      localStorage.removeItem('ghost_spoofed_ip');
      localStorage.removeItem('ghost_route_active');
      setLogs(prev => [`[LOG] Disconnecting from Ghost Network...`, ...prev]);
    } else {
      setIsRouting(true);
      const randomNode = nodes[Math.floor(Math.random() * nodes.length)];
      setActiveNode(randomNode);
      localStorage.setItem('ghost_spoofed_ip', randomNode.ip);
      localStorage.setItem('ghost_route_active', 'true');
      setLogs(prev => [`[LOG] Tunnel established: ${randomNode.location} (${randomNode.ip})`, `[LOG] Encrypting gateway traffic...`, ...prev]);
    }
  };

  const handleRotate = () => {
    if (!isRouting) return;
    setIsRotating(true);
    setTimeout(() => {
      const availableNodes = nodes.filter(n => n.id !== activeNode?.id);
      const newNode = availableNodes[Math.floor(Math.random() * availableNodes.length)];
      setActiveNode(newNode);
      localStorage.setItem('ghost_spoofed_ip', newNode.ip);
      setIsRotating(false);
      setLogs(prev => [`[ROTATION] New Identity: ${newNode.location} (${newNode.ip})`, ...prev]);
    }, 1500);
  };

  const handleRefreshNodes = async () => {
    try {
      const resp = await axios.post('/api/tools/ghost-route/refresh');
      setNodes(resp.data);
      setLogs(prev => [`[SYSTEM] Satellite nodes updated from master cluster.`, ...prev]);
    } catch (e) {
      setLogs(prev => [`[ERROR] Failed to contact satellite master.`, ...prev]);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2 text-accent-blue">
            <Shield className="w-4 h-4" />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Identity Obfuscation</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-accent-blue/10 border border-accent-blue/20">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-pulse" />
            <span className="text-[8px] font-bold text-accent-blue uppercase tracking-widest">Ghost_Secured</span>
          </div>
        </div>
        <h2 className="text-2xl font-black text-text-main uppercase tracking-tighter">Ghost_Route Interface</h2>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Connection Status Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="panel bg-[#0a0a0a] border-accent-blue/30 relative overflow-hidden">
            {isRouting && (
              <div className="absolute top-0 right-0 p-4">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
                   <span className="text-[9px] font-bold text-accent-green uppercase tracking-widest">Tunnel Active</span>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-4">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-text-dim tracking-widest">System_Gateway (Real)</label>
                  <div className="text-2xl font-mono font-black text-white bg-white/5 p-3 rounded border border-white/10">
                    {realIp}
                  </div>
                </div>

                <div className="flex justify-center">
                  <motion.div 
                    animate={isRouting ? { rotate: 360 } : {}}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  >
                    <ArrowRight className={cn(
                      "w-6 h-6 transition-colors rotate-90 md:rotate-0",
                      isRouting ? "text-accent-blue" : "text-text-dim"
                    )} />
                  </motion.div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-text-dim tracking-widest">Ghost_Interface (Masked)</label>
                  <div className={cn(
                    "text-2xl font-mono font-black p-3 rounded border transition-all duration-500",
                    isRouting ? "text-accent-blue bg-accent-blue/10 border-accent-blue/30" : "text-text-dim bg-white/5 border-white/10 opacity-30"
                  )}>
                    {isRouting ? (isRotating ? "ROTATING..." : activeNode?.ip) : "SECURE_MODE_OFF"}
                  </div>
                </div>
              </div>

              <div className="space-y-6 bg-surface p-6 rounded-lg border border-border-main">
                 <div className="flex items-center gap-3">
                   <div className={cn(
                     "w-12 h-12 rounded-full flex items-center justify-center border",
                     isRouting ? "bg-accent-blue/20 border-accent-blue text-accent-blue" : "bg-white/5 border-white/10 text-text-dim"
                   )}>
                     <Lock className="w-5 h-5" />
                   </div>
                   <div>
                     <h3 className="text-sm font-black text-white uppercase italic">Advanced Anonymity</h3>
                     <p className="text-[11px] text-text-dim leading-snug">Multiple-hop encryption layering with AES-256 obfuscation protocol.</p>
                   </div>
                 </div>

                 <div className="space-y-3 pt-4 border-t border-border-main">
                    <button 
                      onClick={handleToggleRoute}
                      className={cn(
                        "w-full py-3 rounded font-black text-xs uppercase tracking-widest transition-all",
                        isRouting 
                          ? "bg-accent-red text-white hover:bg-accent-red/90" 
                          : "bg-accent-blue text-white hover:bg-accent-blue/90"
                      )}
                    >
                      {isRouting ? "DISCONNECT GHOST_ROUTE" : "INITIALIZE TUNNEL"}
                    </button>
                    {isRouting && (
                      <button 
                        onClick={handleRotate}
                        disabled={isRotating}
                        className="w-full py-2 bg-white/10 text-white rounded font-bold text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                      >
                        {isRotating ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                        Cycle Identity Node
                      </button>
                    )}
                 </div>
              </div>
            </div>
          </div>

          {/* AI Neural Audit for Routing */}
          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-accent-blue">
                   <Cpu className="w-4 h-4" />
                   <span className="text-[10px] font-black uppercase tracking-[0.2em]">Privacy Intelligence Audit</span>
                </div>
                <button 
                  onClick={handleAiAudit}
                  disabled={isAnalyzing || logs.length === 0}
                  className="bg-accent-blue/10 border border-accent-blue/40 text-accent-blue px-3 py-1.5 rounded text-[10px] font-bold uppercase hover:bg-accent-blue hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-accent-blue/10"
                >
                  {isAnalyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  Synthesize Privacy Data
                </button>
             </div>

             <AnimatePresence>
                {aiAnalysis && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-accent-blue/5 border border-accent-blue/20 rounded font-mono text-[11px] leading-relaxed"
                  >
                     <div className="prose prose-invert prose-xs max-w-none">
                        <AiAnalysisRenderer content={aiAnalysis} />
                     </div>
                  </motion.div>
                )}
             </AnimatePresence>
          </div>

          {/* Node Selection Grid */}
          <div className="panel space-y-4">
             <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-text-dim">
                  <Globe className="w-3 h-3" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Available Satellite Nodes</span>
                </div>
                <button 
                  onClick={handleRefreshNodes}
                  className="text-[9px] font-bold text-accent-blue hover:underline uppercase"
                >
                  Refresh Nodes
                </button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
               {nodes.map((node) => (
                 <div 
                  key={node.id} 
                  className={cn(
                    "p-3 rounded border transition-all cursor-pointer group",
                    activeNode?.id === node.id 
                      ? "bg-accent-blue/10 border-accent-blue shadow-[0_0_15px_rgba(59,130,246,0.1)]" 
                      : "bg-surface border-border-main hover:border-white/20"
                  )}
                 >
                   <div className="flex justify-between items-start mb-2">
                     <MapPin className={cn(
                       "w-3.5 h-3.5",
                       activeNode?.id === node.id ? "text-accent-blue" : "text-text-dim"
                     )} />
                     <span className={cn(
                       "text-[8px] font-bold px-1.5 py-0.5 rounded uppercase",
                       node.status === 'optimal' ? "bg-accent-green/20 text-accent-green" : 
                       node.status === 'high-4rio' ? "bg-accent-blue/20 text-accent-blue" : "bg-text-dim/20 text-text-dim"
                     )}>{node.status}</span>
                   </div>
                   <div className="text-[11px] font-black text-white truncate">{node.location}</div>
                   <div className="text-[10px] font-mono text-text-dim">{node.ip}</div>
                   <div className="mt-2 flex items-center gap-2 opacity-60">
                      <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-accent-blue w-2/3" />
                      </div>
                      <span className="text-[9px] font-mono">{node.latency}</span>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        </div>

        {/* Live Terminal Log */}
        <div className="panel flex flex-col h-full min-h-[300px] !p-0">
          <div className="panel-header !mb-0 p-4 bg-surface border-b border-border-main">
            <span>Routing Stream</span>
            <div className="w-2 h-2 rounded-full bg-accent-blue animate-pulse" />
          </div>
          <div className="flex-1 p-4 overflow-y-auto custom-scrollbar font-mono text-[10px] space-y-1 bg-black/50">
             <AnimatePresence>
                {logs.map((log, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={`${i}-${log}`}
                    className={cn(
                      "leading-relaxed",
                      log.startsWith('[ROTATION]') ? "text-accent-blue font-bold" : 
                      log.startsWith('[LOG]') ? "text-text-main" : "text-text-dim"
                    )}
                  >
                    <span className="opacity-40 mr-2">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                    {log}
                  </motion.div>
                ))}
             </AnimatePresence>
             {logs.length === 0 && (
               <div className="h-full flex flex-col items-center justify-center text-text-dim italic space-y-3 opacity-50">
                 <AlertCircle className="w-8 h-8" />
                 <p className="text-center px-6">Tunnel offline. Initialize route to begin stream encryption.</p>
               </div>
             )}
          </div>
          <div className="p-3 bg-surface border-t border-border-main">
             <div className="flex items-center justify-between text-[9px] font-bold uppercase text-text-dim">
                <span>Buffer Stack: 1024KB</span>
                <span>ENC: AES-KW-X</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
