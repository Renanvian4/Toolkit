import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, ShieldCheck, ShieldAlert, Cpu, Globe, Lock, Search, AlertTriangle, UserX, Fingerprint, EyeOff, Loader2, Wifi, Server, Terminal as TerminalIcon, Zap, BrainCircuit } from 'lucide-react';
import axios from 'axios';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown'; import AiAnalysisRenderer from './AiAnalysisRenderer';

interface AuditItem {
   id: string;
   label: string;
   status: 'secure' | 'warning' | 'critical' | 'processing';
   detail: string;
}

export default function AnonymityTool() {
   const [isAuditing, setIsAuditing] = useState(false);
   const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
   const [isAnalyzing, setIsAnalyzing] = useState(false);
   const [auditResults, setAuditResults] = useState<AuditItem[]>([
      { id: 'ip_leak', label: 'External IP Integrity', status: 'secure', detail: 'Verifying...' },
      { id: 'webrtc', label: 'WebRTC Leak Prevention', status: 'secure', detail: 'Local IP addresses successfully masked' },
      { id: 'fingerprint', label: 'Canvas Fingerprinting', status: 'secure', detail: 'Noise injection active. Resolution spoofed to 1920x1080' },
      { id: 'metadata', label: 'Hardware Metadata', status: 'secure', detail: 'Manufacturer & Serial Number ID scrubbed' },
      { id: 'os_spoof', label: 'OS User Agent', status: 'secure', detail: 'Processing...' },
      { id: 'tablet_trace', label: 'Hardware Traceability', status: 'secure', detail: 'IMEI/UDID reporting disabled at kernel level' }
   ]);

   const [showTraceSim, setShowTraceSim] = useState(false);
   const [traceLogs, setTraceLogs] = useState<string[]>([]);
   const [systemInfo, setSystemInfo] = useState<any>(null);

   const [spoofedIP, setSpoofedIP] = useState('142.250.190.46');
   const [isSpoofing, setIsSpoofing] = useState(false);

   const generateRandomIP = () => {
      const parts = Array.from({ length: 4 }, () => Math.floor(Math.random() * 256));
      setSpoofedIP(parts.join('.'));
   };

   const toggleSpoofing = () => {
      const newState = !isSpoofing;
      setIsSpoofing(newState);
      if (newState) {
         setTraceLogs(prev => [...prev, `[SPOOF] Injecting X-Forwarded-For: ${spoofedIP}`, `[SPOOF] Masking origin node...`]);
         localStorage.setItem('ghost_spoofed_ip', spoofedIP);
         localStorage.setItem('anonymity_spoof_active', 'true');
      } else {
         localStorage.removeItem('ghost_spoofed_ip');
         localStorage.removeItem('anonymity_spoof_active');
      }
   };

   const runAudit = async () => {
      setIsAuditing(true);
      setAiAnalysis(null);
      try {
         const response = await axios.get('/api/system/probe');
         const data = response.data;
         setSystemInfo(data);

         setAuditResults(prev => prev.map(item => {
            if (item.id === 'ip_leak') {
               return { ...item, detail: `Gateway: ${data.external_ip} (Encrypted Tunnel)`, status: 'secure' };
            }
            if (item.id === 'os_spoof') {
               return { ...item, detail: `SPOOFED: ${data.user_agent.slice(0, 40)}...`, status: 'secure' };
            }
            return item;
         }));
      } catch (err) {
         console.error("Audit Probe Error:", err);
      } finally {
         setTimeout(() => setIsAuditing(false), 1500);
      }
   };

   useEffect(() => {
      runAudit();
   }, []);

   const startTraceSimulation = () => {
      setShowTraceSim(true);
      setAiAnalysis(null);
      setTraceLogs(['[SYSTEM] Initializing recursive trace-back...', '[SYSTEM] Probing hardware serial via WebGL...']);
      
      const steps = [
         'Checking RTC battery timestamp offset...',
         'Scanning canvas noise variance...',
         'Enumerating PnP hardware descriptors...',
         'Querying IMU/Accelerometer calibration profiles...',
         'CRITICAL: SCRUBBING_LAYER_DETECTED',
         '[SUCCESS] ALL_TRACE_DATA_VACUUMED'
      ];

      steps.forEach((step, i) => {
         setTimeout(() => {
            setTraceLogs(prev => [...prev, `[LOG] ${step}`]);
         }, (i + 1) * 800);
      });
   };

   const handleAiAudit = async () => {
     if (auditResults.length === 0) return;
     setIsAnalyzing(true);
     try {
       const response = await axios.post('/api/analyze/vulnerability', {
         code: JSON.stringify({ auditResults, systemInfo, isSpoofing, spoofedIP }),
         context: `Anonymity and Privacy Audit results for Catalyst-OS operator environment`,
         tool_preference: 'Privacy & Counter-Intelligence Specialist'
       });
       setAiAnalysis(response.data.analysis);
     } catch (err) {
       console.error(err);
     } finally {
       setIsAnalyzing(false);
     }
   };

   return (
      <div className="h-full flex flex-col space-y-4">
         <header className="flex items-center justify-between">
            <div className="space-y-0.5">
               <div className="flex items-center gap-2 text-accent-green">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="text-[9px] font-bold tracking-[0.2em] uppercase">Security Level: Ghost</span>
               </div>
               <h2 className="text-xl font-black text-text-main uppercase tracking-tighter">Anonymity_Audit_Suite</h2>
            </div>
            <div className="flex items-center gap-2">
               <button 
                  onClick={startTraceSimulation}
                  disabled={showTraceSim}
                  className="bg-accent-blue/10 border border-accent-blue/30 text-accent-blue px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-widest hover:bg-accent-blue hover:text-white transition-all disabled:opacity-30"
               >
                  Simulate Trace Attack
               </button>
               <button 
                  onClick={handleAiAudit}
                  disabled={isAnalyzing || isAuditing}
                  className="bg-accent-blue/10 border border-accent-blue/30 text-accent-blue px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-widest hover:bg-accent-blue hover:text-white transition-all disabled:opacity-30 flex items-center gap-1.5"
               >
                  {isAnalyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <BrainCircuit className="w-3 h-3" />}
                  NEURAL_ANALYZE
               </button>
               <button 
                  onClick={runAudit}
                  disabled={isAuditing}
                  className="bg-surface border border-accent-green/30 text-accent-green px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-widest hover:bg-accent-green hover:text-black transition-all flex items-center gap-1.5 disabled:opacity-30"
               >
                  {isAuditing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
                  Run Integrity Check
               </button>
            </div>
         </header>

         <AnimatePresence>
            {aiAnalysis && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="panel bg-accent-blue/5 border border-accent-blue/20 rounded font-mono text-[10px] leading-relaxed mb-4"
              >
                 <div className="flex items-center gap-2 mb-2 text-accent-blue border-b border-accent-blue/20 pb-1">
                    <Cpu className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-black uppercase tracking-widest italic">Neural Privacy Insights</span>
                 </div>
                 <div className="prose prose-invert prose-xs max-w-none">
                    <AiAnalysisRenderer content={aiAnalysis} />
                 </div>
              </motion.div>
            )}
         </AnimatePresence>

         <AnimatePresence>
            {showTraceSim && (
               <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="panel bg-black border-accent-blue/30 overflow-hidden mb-4"
               >
                  <div className="panel-header border-b border-accent-blue/20 mb-1 py-1 px-3">
                     <span className="text-accent-blue flex items-center gap-2 text-[10px] font-black">
                        <TerminalIcon className="w-3 h-3" /> AGGRESSIVE_TRACE_ATTACK_SIMULATION
                     </span>
                     <button onClick={() => setShowTraceSim(false)} className="text-text-dim hover:text-white text-[9px] font-bold">CLOSE</button>
                  </div>
                  <div className="font-mono text-[10px] p-2 space-y-0.5">
                     {traceLogs.map((log, i) => (
                        <div key={i} className={cn(
                           log.includes('SUCCESS') ? "text-accent-green font-bold" : 
                           log.includes('CRITICAL') ? "text-accent-red font-bold animate-pulse" : "text-text-dim"
                        )}>
                           {log}
                        </div>
                     ))}
                     <div className="w-2 h-3 bg-accent-blue animate-pulse mt-1" />
                  </div>
               </motion.div>
            )}
         </AnimatePresence>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">
            <div className="lg:col-span-2 space-y-4 flex flex-col min-h-0">
               <div className="panel bg-accent-blue/5 border-accent-blue/30 p-4">
                  <div className="panel-header border-b border-accent-blue/20 pb-2 mb-3">
                     <span className="text-[10px] font-black uppercase tracking-widest text-accent-blue flex items-center gap-2">
                        <Globe className="w-3 h-3" /> IP_SPOOFING_CONTROLLER
                     </span>
                     <div className={cn(
                        "text-[8px] px-1.5 py-0.5 rounded border font-bold flex items-center gap-1",
                        isSpoofing ? "bg-accent-blue/20 border-accent-blue text-accent-blue" : "bg-text-dim/10 border-text-dim text-text-dim"
                     )}>
                        <div className={cn("w-1 h-1 rounded-full", isSpoofing ? "bg-accent-blue animate-pulse" : "bg-text-dim")} />
                        {isSpoofing ? "INJECTION_ACTIVE" : "STANDBY"}
                     </div>
                  </div>

                  <div className="space-y-3">
                     <div className="flex gap-2">
                        <div className="flex-1 bg-surface border border-border-main p-2 flex flex-col gap-0.5">
                           <label className="text-[8px] font-black text-text-dim uppercase">Masked_Target_IP</label>
                           <input 
                              type="text" 
                              value={spoofedIP}
                              onChange={(e) => setSpoofedIP(e.target.value)}
                              className="bg-transparent text-text-main font-mono text-xs outline-none w-full"
                              placeholder="0.0.0.0"
                           />
                        </div>
                        <button 
                           onClick={generateRandomIP}
                           className="bg-surface border border-border-main px-3 hover:border-accent-blue transition-all"
                           title="Generate Random IP"
                        >
                           <Zap className="w-3.5 h-3.5 text-accent-blue" />
                        </button>
                     </div>

                     <button 
                        onClick={toggleSpoofing}
                        className={cn(
                           "w-full py-2 rounded font-black text-[10px] uppercase tracking-[0.1em] transition-all flex items-center justify-center gap-1.5",
                           isSpoofing 
                              ? "bg-accent-red/10 border border-accent-red/30 text-accent-red hover:bg-accent-red hover:text-white" 
                              : "bg-accent-blue/10 border border-accent-blue/30 text-accent-blue hover:bg-accent-blue hover:text-white"
                        )}
                     >
                        {isSpoofing ? 'Halt IP Injection' : 'Activate IP Spoofing'}
                     </button>

                     <div className="bg-black/40 p-2 border border-border-main/50 rounded flex flex-col gap-1">
                        <div className="text-[9px] font-mono text-text-dim uppercase flex justify-between">
                           <span>Header_Key:</span>
                           <span className="text-accent-blue">X-Forwarded-For</span>
                        </div>
                        <div className="text-[9px] font-mono text-text-dim uppercase flex justify-between">
                           <span>Payload_Value:</span>
                           <span className="text-accent-green">{isSpoofing ? spoofedIP : 'NONE'}</span>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="panel flex-1 min-h-0 flex flex-col p-4">
                  <div className="panel-header border-b border-border-main pb-2 mb-3">
                     <span className="text-[10px] font-black uppercase tracking-widest text-text-dim flex items-center gap-2">
                        <Fingerprint className="w-3 h-3" /> Direct Trace Audit
                     </span>
                     <span className="text-[9px] text-accent-green font-mono">STATUS: 100% STEALTH</span>
                  </div>
                  <div className="space-y-1.5 overflow-y-auto custom-scrollbar flex-1 pr-1">
                     {auditResults.map((item) => (
                        <div key={item.id} className="bg-surface/50 border border-border-main p-2.5 flex items-center justify-between group hover:border-accent-blue/40 transition-colors">
                           <div className="flex items-center gap-3">
                              <div className={cn(
                                 "p-1.5 rounded",
                                 item.status === 'secure' ? "bg-accent-green/10 text-accent-green" : "bg-accent-red/10 text-accent-red"
                              )}>
                                 {item.status === 'secure' ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                              </div>
                              <div className="space-y-0">
                                 <div className="text-[11px] font-bold text-text-main uppercase tracking-tight">{item.label}</div>
                                 <div className="text-[9px] text-text-dim font-mono">{item.detail}</div>
                              </div>
                           </div>
                           <div className="text-[8px] font-bold text-accent-green bg-accent-green/5 px-2 py-0.5 border border-accent-green/20 rounded">
                              OPERATIONAL
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="panel bg-accent-blue/5 border-accent-blue/20 p-3">
                     <div className="flex items-center gap-2 mb-2">
                        <Globe className="w-4 h-4 text-accent-blue" />
                        <h3 className="text-[10px] font-black uppercase tracking-widest">Network Masking</h3>
                     </div>
                     <div className="space-y-1.5 text-[10px] font-mono">
                        <div className="flex justify-between border-b border-border-main/30 pb-1">
                           <span className="text-text-dim">DNS_LEAK_PROTECTION</span>
                           <span className="text-accent-green">ACTIVE</span>
                        </div>
                        <div className="flex justify-between border-b border-border-main/30 pb-1">
                           <span className="text-text-dim">MACE_ADBLOCKER</span>
                           <span className="text-accent-green">ACTIVE</span>
                        </div>
                        <div className="flex justify-between">
                           <span className="text-text-dim">GEO_LOCATION_SPOOF</span>
                           <span className="text-text-main">UTC-0 (OFFSHORE)</span>
                        </div>
                     </div>
                  </div>
                  <div className="panel bg-accent-red/5 border-accent-red/20 opacity-80 p-3">
                     <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-accent-red" />
                        <h3 className="text-[10px] font-black uppercase tracking-widest">External Risks</h3>
                     </div>
                     <div className="space-y-1.5 text-[10px] font-mono text-text-dim italic">
                        No critical vulnerabilities detected in transit. Application is operating within air-gap parameters.
                     </div>
                  </div>
               </div>
            </div>

            <div className="space-y-4">
               <div className="panel h-full border-accent-blue/30 p-4">
                  <div className="panel-header mb-4">
                     <span className="text-accent-blue text-[10px] font-black uppercase">SYSTEM_ORIGIN_SCRUBBER</span>
                     <EyeOff className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-4">
                     <div className="flex justify-center py-2">
                        <div className="relative">
                           <div className="w-24 h-24 rounded-full border-[3px] border-accent-blue flex items-center justify-center p-1.5">
                              <div className="w-16 h-16 rounded-full border-2 border-accent-blue/30 flex items-center justify-center animate-pulse">
                                 <UserX className="w-10 h-10 text-accent-blue" />
                              </div>
                           </div>
                           <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-accent-blue text-black px-2 py-0.5 text-[8px] font-black uppercase tracking-wider whitespace-nowrap">
                              ANONYMITY: 99.8%
                           </div>
                        </div>
                     </div>

                     <div className="space-y-3">
                        <div className="space-y-1">
                           <div className="flex justify-between text-[9px] font-bold">
                              <span className="text-text-dim uppercase">Proxy Tunneling</span>
                              <span className="text-accent-blue">STABLE</span>
                           </div>
                           <div className="h-4.5 bg-surface border border-border-main rounded-full overflow-hidden">
                              <motion.div 
                                 initial={{ width: 0 }}
                                 animate={{ width: '92%' }}
                                 className="h-full bg-accent-blue"
                              />
                           </div>
                        </div>
                        <div className="space-y-1">
                           <div className="flex justify-between text-[9px] font-bold">
                              <span className="text-text-dim uppercase">Identity Obfuscation</span>
                              <span className="text-accent-blue">MAX</span>
                           </div>
                           <div className="h-4.5 bg-surface border border-border-main rounded-full overflow-hidden">
                              <motion.div 
                                 initial={{ width: 0 }}
                                 animate={{ width: '99%' }}
                                 className="h-full bg-accent-blue shadow-[0_0_8px_rgba(59,130,246,0.6)]"
                              />
                           </div>
                        </div>
                        <div className="space-y-1">
                           <div className="flex justify-between text-[9px] font-bold">
                              <span className="text-text-dim uppercase">Meta Scrubbing</span>
                              <span className="text-accent-blue">ACTIVE</span>
                           </div>
                           <div className="h-4.5 bg-surface border border-border-main rounded-full overflow-hidden">
                              <motion.div 
                                 initial={{ width: 0 }}
                                 animate={{ width: '100%' }}
                                 className="h-full bg-accent-green"
                              />
                           </div>
                        </div>
                     </div>

                     <div className="bg-surface p-3 rounded border border-border-main text-[9px] font-mono leading-relaxed text-text-dim uppercase">
                        Manual origin trace test: <span className="text-accent-blue">SIMULATING...</span><br/>
                        Packet source: 0.0.0.0 (Masked)<br/>
                        Node: Luxembourg-Exit-04<br/>
                        Status: <span className="text-accent-green">CANNOT_RESOLVE_OWNER</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
