import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Activity, Shield, Cpu, Loader2, Search, Terminal, AlertCircle, Globe, BarChart3, Radio } from 'lucide-react';
import axios from 'axios';
import { cn } from '../lib/utils';

interface PacketDiscovery {
  id: string;
  protocol: string;
  port: number;
  banner: string;
  latency: string;
  entropy: number;
  flags: string[];
}

export default function SwiftTool() {
  const [target, setTarget] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<PacketDiscovery[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);

  const [activeMode, setActiveMode] = useState<'syn' | 'udp' | null>('syn');

  const startSwiftScan = async () => {
    if (!target) return;
    setIsScanning(true);
    setResults([]);
    setAiInsight(null);

    // Simulated high-speed protocol discovery
    setTimeout(() => {
      const mock: PacketDiscovery[] = [
        { id: '1', protocol: activeMode === 'udp' ? 'UDP/QUIC' : 'TCP/QUIC', port: 443, banner: 'h3/Google-Backend', latency: '12ms', entropy: 0.82, flags: ['SYN+ACK', 'ALPN-NEG'] },
        { id: '2', protocol: 'UDP/DNS', port: 53, banner: 'CoreDNS v1.11.0', latency: '8ms', entropy: 0.45, flags: ['RD', 'RA'] },
        { id: '3', protocol: activeMode === 'udp' ? 'UDP/SSH' : 'TCP/SSH', port: 22, banner: 'SSH-2.0-OpenSSH_9.2p1', latency: '45ms', entropy: 0.98, flags: ['VER-EXCH'] },
        { id: '4', protocol: activeMode === 'udp' ? 'UDP/HTTP' : 'TCP/HTTP', port: 80, banner: 'nginx/1.24.0', latency: '15ms', entropy: 0.32, flags: ['REDIRECTION'] }
      ];
      setResults(mock);
      setIsScanning(false);
    }, 2000);
  };

  const runNeuralAudit = async () => {
    if (results.length === 0) return;
    setIsAnalyzing(true);
    try {
      const res = await axios.post('/api/analyze/vulnerability', {
        code: JSON.stringify(results),
        context: `SWIFT Low-level protocol analysis for ${target}`,
        tool_preference: "Network Protocol Engineer"
      });
      setAiInsight(res.data.analysis);
      
      await axios.post('/api/intelligence/save', {
        tool: "SWIFT_PROTO_SCAN",
        strategy: "Low-Level Fingerprinting",
        findings: `Identified ${results.length} protocols via Swift sieve. High entropy detected on SSH port.`,
        next_steps: res.data.analysis
      });
    } catch (err) {
      setAiInsight("Neural handshake failed. Protocol ambiguity detected.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h2 className="text-2xl font-black italic tracking-tighter text-white flex items-center gap-3">
            <Zap className="w-6 h-6 text-accent-blue" />
            SWIFT_PROTO_SCANNER
          </h2>
          <p className="text-[10px] text-text-dim uppercase tracking-widest font-bold mt-1">
            High-Speed Low-Level Network Sieve // AI-Optimized
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden">
        <div className="lg:col-span-4 space-y-4">
          <div className="panel bg-surface/50 border-accent-blue/20">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-4 bg-accent-blue"></div>
              <h3 className="text-[11px] font-black text-white uppercase tracking-widest">Global Probe Config</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[9px] font-bold text-text-dim uppercase mb-1.5 block italic">Scan Destination</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
                  <input
                    type="text"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder="e.g. 192.168.1.0/24 or target.tld"
                    className="w-full bg-bg-dark border border-border-main rounded px-10 py-2.5 text-xs text-white focus:border-accent-blue transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setActiveMode('syn')}
                  className={cn(
                    "py-2 rounded text-[10px] font-bold uppercase transition-all",
                    activeMode === 'syn' ? "bg-accent-blue text-bg-dark" : "bg-bg-dark border border-border-main text-text-dim hover:text-white"
                  )}
                >
                  SYN_SIEVE
                </button>
                <button 
                  onClick={() => setActiveMode('udp')}
                  className={cn(
                    "py-2 rounded text-[10px] font-bold uppercase transition-all",
                    activeMode === 'udp' ? "bg-accent-blue text-bg-dark" : "bg-bg-dark border border-border-main text-text-dim hover:text-white"
                  )}
                >
                  UDP_PROBE
                </button>
              </div>

              <button
                onClick={startSwiftScan}
                disabled={isScanning || !target}
                className="w-full py-4 bg-accent-blue text-bg-dark rounded font-black text-[12px] uppercase tracking-widest hover:bg-white transition-all flex items-center justify-center gap-2"
              >
                {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                INITIALIZE_SWIFT_SCAN
              </button>
            </div>
          </div>

          <div className="panel flex-1 bg-bg-dark/40 border-white/5 overflow-hidden flex flex-col">
            <div className="text-[10px] font-black text-text-dim uppercase mb-4 flex items-center gap-2 border-b border-white/5 pb-2">
               <Radio className="w-3 h-3 text-accent-blue" /> Adaptive Engine Tuning
            </div>
            <div className="flex-1 space-y-4">
               <div>
                  <div className="flex justify-between text-[10px] font-bold mb-2">
                    <span className="text-text-dim">Packet Timing</span>
                    <span className="text-accent-blue">Aggressive (T4)</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full w-4/5 bg-accent-blue"></div>
                  </div>
               </div>
               <div className="p-3 bg-white/[0.02] border border-white/5 rounded italic text-[10px] text-text-dim leading-relaxed">
                  "Swift mode bypasses OS socket overhead for direct L2/L3 interaction, enabling sub-millisecond port discovery."
               </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 flex flex-col gap-6 overflow-hidden">
          <div className="panel flex-1 overflow-hidden flex flex-col relative">
            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4 group">
               <div className="flex items-center gap-2 text-white">
                  <BarChart3 className="w-4 h-4 text-accent-blue" />
                  <h3 className="text-[11px] font-black uppercase tracking-widest italic">Protocol Discovery Matrix</h3>
               </div>
               <div className="flex items-center gap-2">
                 {target && (
                   <button 
                    onClick={() => {
                      const cmd = `nmap -sS -Pn -T4 --top-ports 1000 ${target}`;
                      window.dispatchEvent(new CustomEvent('send-to-shell', { detail: cmd }));
                    }}
                    className="opacity-0 group-hover:opacity-100 px-3 py-1 bg-white/5 border border-white/10 text-white rounded-full text-[9px] font-black uppercase hover:bg-white hover:text-bg-dark transition-all"
                   >
                     Pipeline to Shell
                   </button>
                 )}
                 {results.length > 0 && (
                   <button 
                    onClick={runNeuralAudit}
                    disabled={isAnalyzing}
                    className="px-3 py-1 bg-accent-blue/10 border border-accent-blue/30 text-accent-blue rounded-full text-[9px] font-black uppercase flex items-center gap-2 hover:bg-accent-blue hover:text-white transition-all"
                   >
                     {isAnalyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Cpu className="w-3.5 h-3.5" />}
                     NEURAL_AUDIT
                   </button>
                 )}
               </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
              {results.length > 0 ? (
                results.map((r) => (
                  <div key={r.id} className="bg-white/[0.02] border border-white/5 p-4 rounded group hover:border-accent-blue/30 transition-all flex items-center gap-6">
                    <div className="w-16 text-center">
                      <div className="text-[9px] font-black text-text-dim uppercase mb-1">Port</div>
                      <div className="text-lg font-black text-white italic">{r.port}</div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-accent-blue uppercase">{r.protocol}</span>
                        <div className="flex gap-1">
                          {r.flags.map(f => (
                            <span key={f} className="text-[7px] border border-white/10 px-1 py-0.5 rounded text-text-dim font-bold">{f}</span>
                          ))}
                        </div>
                      </div>
                      <div className="text-[11px] font-mono text-white/70 leading-tight truncate">{r.banner}</div>
                    </div>
                    <div className="w-24 text-right">
                      <div className="text-[9px] font-black text-text-dim uppercase mb-1">Entropy</div>
                      <div className={cn(
                        "text-[11px] font-bold tabular-nums",
                        r.entropy > 0.8 ? "text-accent-red" : "text-accent-green"
                      )}>
                        {(r.entropy * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-20">
                  <Terminal className="w-16 h-16 animate-pulse mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em]">Ready for Protocol Injection</p>
                </div>
              )}
            </div>
          </div>

          <AnimatePresence>
            {aiInsight && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="panel bg-accent-blue/5 border-accent-blue/20"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-pulse" />
                  <h3 className="text-[11px] font-black text-white uppercase italic tracking-widest font-mono">Neural Investigation Strategy</h3>
                </div>
                <div className="text-[13px] text-text-main/90 font-light leading-relaxed prose prose-invert prose-sm max-w-none prose-blue">
                   {aiInsight}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
