import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Search, Loader2, Play, Terminal, AlertTriangle, CheckCircle2, ChevronRight, BarChart3, Cpu, Sparkles, BrainCircuit } from 'lucide-react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown'; import AiAnalysisRenderer from './AiAnalysisRenderer';
import { cn } from '../lib/utils';

interface Vulnerability {
  id: string;
  name: string;
  severity: 'High' | 'Medium' | 'Low';
  score: number;
  description: string;
}

export default function OpenVASTool({ sharedWordlist }: { sharedWordlist?: string[] }) {
  const [target, setTarget] = useState('192.168.1.1');
  const [profile, setProfile] = useState('Full Discovery');
  const [isScanning, setIsScanning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleAiAudit = async () => {
    if (vulnerabilities.length === 0) return;
    setIsAnalyzing(true);
    try {
      const response = await axios.post('/api/analyze/vulnerability', {
        code: JSON.stringify(vulnerabilities),
        context: `OpenVAS Scan Results for ${target}`,
        tool_preference: 'Vulnerability Strategic Analysis'
      });
      setAiReport(response.data.analysis);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleScan = async () => {
    setIsScanning(true);
    setLogs(['[SYSTEM] Initializing OpenVAS-Lite Scan...']);
    setVulnerabilities([]);
    setAiReport(null);

    try {
      const response = await axios.post('/api/tools/openvas-scan', {
        target,
        profile,
        custom_paths: sharedWordlist
      });
      
      // Simulate progress
      const fullLogs = response.data.logs;
      for (let i = 0; i < fullLogs.length; i++) {
        await new Promise(r => setTimeout(r, 400));
        setLogs(prev => [...prev, fullLogs[i]]);
      }

      setVulnerabilities(response.data.vulnerabilities);
    } catch (err: any) {
      setLogs(prev => [...prev, `[ERROR] Scanner engine failed: ${err.message}`]);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <div className="flex items-center gap-2 text-accent-red mb-1">
          <ShieldAlert className="w-4 h-4" />
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Vulnerability Management</span>
        </div>
        <h2 className="text-2xl font-black text-text-main uppercase tracking-tighter">OpenVAS Catalyst Core</h2>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Config Panel */}
        <div className="panel space-y-4 h-fit border-accent-red/20">
          <div className="panel-header">
            <span>Scan Configuration</span>
            <Search className="w-3 h-3" />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-text-dim uppercase mb-1">Target IP / Domain</label>
              <input 
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="w-full bg-surface border border-border-main rounded p-2 text-[12px] font-mono focus:border-accent-red outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-text-dim uppercase mb-1">Scan Profile</label>
              <select 
                value={profile}
                onChange={(e) => setProfile(e.target.value)}
                className="w-full bg-surface border border-border-main rounded p-2 text-[12px] focus:border-accent-red outline-none"
              >
                <option>Full Discovery</option>
                <option>Web Application Audit</option>
                <option>Cloud Infrastructure Scan</option>
                <option>Compliance Checklist (PCI-DSS)</option>
              </select>
            </div>

            <div className="p-3 bg-surface border border-border-main rounded text-[10px] space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-text-dim uppercase">Contextual Integration:</span>
                <span className={cn(
                  "font-bold",
                  sharedWordlist?.length ? "text-accent-blue" : "text-text-dim"
                )}>
                  {sharedWordlist?.length ? "ACTIVE" : "INACTIVE"}
                </span>
              </div>
              <p className="text-[9px] text-text-dim italic leading-tight">
                {sharedWordlist?.length 
                  ? `Using ${sharedWordlist.length} payloads from Wordlist Engine to enhance discovery.` 
                  : "Link Wordlist Engine to inject custom payloads into vulnerability tests."}
              </p>
            </div>

            <button 
              onClick={handleScan}
              disabled={isScanning}
              className="w-full bg-accent-red text-white py-3 rounded font-black text-xs uppercase tracking-widest hover:bg-accent-red/90 disabled:opacity-30 transition-all flex items-center justify-center gap-2"
            >
              {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
              {isScanning ? "EXECUTING AUDIT..." : "INITIALIZE VSCAN"}
            </button>
          </div>
        </div>

        {/* Output & Report */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-3">
             <div className="flex items-center gap-2">
                <Terminal className="w-3 h-3 text-text-dim" />
                <h3 className="text-[10px] font-bold text-text-dim uppercase tracking-widest">Execution Logs</h3>
             </div>
             <div className="panel h-full min-h-[300px] overflow-y-auto !p-4 custom-scrollbar font-mono text-[10px] space-y-1 bg-black/90 flex flex-col border-border-main">
                {logs.length > 0 ? (
                  logs.slice(-500).map((log, i) => (
                    <div key={i} className={cn(
                      "leading-relaxed break-all",
                      log.startsWith('[SYSTEM]') || log.startsWith('[INFO]') ? "text-accent-blue" :
                      log.startsWith('[ERROR]') ? "text-accent-red" : "text-text-dim"
                    )}>
                      {log}
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center space-y-2 opacity-50 group">
                    <Terminal className="w-12 h-12 text-accent-red mb-2" />
                    <h3 className="text-[12px] font-black text-white italic tracking-widest uppercase">Scanner_Stdout_Redirected</h3>
                    <p className="text-[10px] text-text-dim max-w-xs mx-auto font-bold uppercase tracking-widest leading-relaxed text-center">
                      Real-time vulnerability feeds are optimized for command-line parsing.
                    </p>
                    {target && (
                       <button 
                        onClick={() => {
                          const cmd = `gvm-cli --gmp-host localhost --gmp-user admin --gmp-password admin -X "<create_task><name>CatalystScan</name><target_id>${target}</target_id></create_task>"`;
                          window.dispatchEvent(new CustomEvent('send-to-shell', { detail: cmd }));
                        }}
                        className="mt-6 opacity-0 group-hover:opacity-100 bg-accent-red/10 border border-accent-red/30 text-accent-red px-4 py-2 rounded text-[10px] font-black uppercase tracking-[0.2em] hover:bg-accent-red hover:text-white transition-all shadow-xl shadow-accent-red/5"
                       >
                         Launch Unified Scan
                       </button>
                    )}
                  </div>
                )}
                <div ref={logEndRef} />
             </div>
          </div>

          <AnimatePresence>
            {vulnerabilities.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="panel space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-accent-red">
                    <BarChart3 className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Identified Vulnerabilities ({vulnerabilities.length})</span>
                  </div>
                  <button 
                    onClick={handleAiAudit}
                    disabled={isAnalyzing || vulnerabilities.length === 0}
                    className="flex items-center gap-2 bg-accent-blue/10 border border-accent-blue/30 text-accent-blue px-3 py-1 rounded text-[9px] font-bold uppercase hover:bg-accent-blue hover:text-white transition-all disabled:opacity-50"
                  >
                    {isAnalyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <BrainCircuit className="w-3 h-3" />}
                    Neural Audit
                  </button>
                </div>

                <AnimatePresence>
                  {aiReport && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="p-4 bg-accent-blue/5 border border-accent-blue/20 rounded-lg overflow-hidden"
                    >
                      <div className="flex items-center gap-2 text-accent-blue mb-3">
                         <Sparkles className="w-3.5 h-3.5" />
                         <span className="text-[10px] font-black uppercase tracking-widest">Neural Intelligence Analysis</span>
                      </div>
                      <div className="prose prose-invert prose-xs max-w-none text-text-main font-mono text-[11px] leading-relaxed">
                        <AiAnalysisRenderer content={aiReport} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-3">
                  {vulnerabilities.map((vuln) => (
                    <div key={vuln.id} className="p-3 bg-surface border border-border-main rounded-lg group hover:border-accent-red/30 transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                           <div className={cn(
                             "px-2 py-0.5 rounded text-[9px] font-bold uppercase",
                             vuln.severity === 'High' ? "bg-accent-red/20 text-accent-red" :
                             vuln.severity === 'Medium' ? "bg-accent-blue/20 text-accent-blue" : "bg-text-dim/20 text-text-dim"
                           )}>
                             {vuln.severity} ({vuln.score})
                           </div>
                           <span className="text-xs font-black text-white">{vuln.id}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-text-dim group-hover:text-accent-red transition-all" />
                      </div>
                      <h4 className="text-sm font-bold text-white mb-1">{vuln.name}</h4>
                      <p className="text-[11px] text-text-dim leading-relaxed">{vuln.description}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!isScanning && vulnerabilities.length === 0 && logs.length > 0 && (
            <div className="panel bg-accent-green/10 border-accent-green/20 flex items-center justify-center py-12 gap-3">
               <CheckCircle2 className="w-8 h-8 text-accent-green" />
               <div>
                  <h3 className="text-lg font-black text-white">SYSTEM_HARDENED</h3>
                  <p className="text-xs text-text-dim">No high-risk vulnerabilities identified in current scan cycle.</p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
