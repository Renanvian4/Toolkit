import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Globe, Shield, Terminal as TerminalIcon, Loader2, AlertCircle, BrainCircuit, Zap, Radar } from 'lucide-react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown'; import AiAnalysisRenderer from './AiAnalysisRenderer';
import { cn } from '../lib/utils';

export default function ReconTool({ sharedTarget, onTargetChange }: { sharedTarget?: string, onTargetChange?: (t: string) => void }) {
  const [target, setTarget] = useState(sharedTarget || '');
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (sharedTarget !== undefined && sharedTarget !== target) {
      setTarget(sharedTarget);
    }
  }, [sharedTarget]);

  const updateTarget = (val: string) => {
    setTarget(val);
    onTargetChange?.(val);
  };
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');
  const [useRealDns, setUseRealDns] = useState(false);
  const [scanType, setScanType] = useState<'quick' | 'complete' | 'stealth' | 'nse'>('quick');
  const [suggestedScripts, setSuggestedScripts] = useState<string[]>([]);
  const [selectedScripts, setSelectedScripts] = useState<string[]>([]);
  const [nmapOutput, setNmapOutput] = useState('');
  const [isNseScanning, setIsNseScanning] = useState(false);
  const [isAutonomousScanning, setIsAutonomousScanning] = useState(false);
  const [autonomousStrategy, setAutonomousStrategy] = useState<string | null>(null);

  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [criticalVulnerabilities, setCriticalVulnerabilities] = useState<string[]>([]);
  const [nextSteps, setNextSteps] = useState<string[]>([]);

  const handleAiAnalysis = async () => {
    if (!results) return;
    setIsAnalyzing(true);
    try {
      const response = await axios.post('/api/analyze/vulnerability', {
        code: JSON.stringify(results),
        context: `Network Reconnaissance results for ${target}`,
        tool_preference: 'Tactical Recon Intelligence'
      });
      setAiAnalysis(response.data.analysis);
      
      // Parse structured data if possible, otherwise just use the text
      // For now, let's assume the prompt returns a good markdown we can show
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!target) return;

    setIsScanning(true);
    setError('');
    setResults(null);
    setAiAnalysis(null);

    try {
      const respSim = await axios.post('/api/recon/simulate', { 
        url: target, 
        type: scanType,
        use_real_dns: useRealDns
      });
      
      const respScan = await axios.post('/api/recon/scan', {
        target: target,
        type: scanType
      });

      setResults({
        ...respSim.data,
        nmap: respScan.data.stdout,
        suggestions: respScan.data.suggestions
      });
      setNmapOutput(respScan.data.stdout);
      setSuggestedScripts(respScan.data.suggestions);
    } catch (err: any) {
      const msg = err.response?.data?.error || "Host unreachable or investigation timed out.";
      setError(msg);
    } finally {
      setIsScanning(false);
    }
  };

  const handleNseScan = async () => {
    if (selectedScripts.length === 0) return;
    setIsNseScanning(true);
    try {
      const response = await axios.post('/api/recon/scan', {
        target: target,
        type: 'nse',
        scripts: selectedScripts
      });
      setNmapOutput(prev => prev + "\n\n--- NSE AUDIT RESULTS ---\n\n" + response.data.stdout);
    } catch (err) {
      console.error(err);
    } finally {
      setIsNseScanning(false);
    }
  };

  const toggleScript = (s: string) => {
    setSelectedScripts(prev => 
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  };

  const handleAutonomousAudit = async () => {
    if (!target) return;
    setIsAutonomousScanning(true);
    setError('');
    setAutonomousStrategy(null);
    setResults(null);
    setAiAnalysis(null);
    
    try {
      const response = await axios.post('/api/recon/auto-audit', { target });
      const { stdout, suggestions, strategy } = response.data;
      
      setNmapOutput(stdout);
      setSuggestedScripts(suggestions);
      setAutonomousStrategy(strategy);
      setAiAnalysis(strategy); // Sync for consistent UI
      
      setResults({
        nmap: stdout,
        suggestions,
        strategy,
        status: 200,
        real_headers: {}
      });
    } catch (err: any) {
      const msg = err.response?.data?.error || "Autonomous neural audit failed. Unstable link.";
      setError(msg);
    } finally {
      setIsAutonomousScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2 text-accent-blue">
            <Globe className="w-4 h-4" />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Network Intelligence</span>
          </div>
          <div className="flex items-center gap-3">
             <button 
                onClick={handleAiAnalysis}
                disabled={isAnalyzing || !results}
                className="flex items-center gap-2 bg-accent-blue/10 border border-accent-blue/40 text-accent-blue px-3 py-1.5 rounded text-[10px] font-bold uppercase hover:bg-accent-blue hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-accent-blue/10"
              >
                {isAnalyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BrainCircuit className="w-3.5 h-3.5" />}
                Neural Audit
              </button>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-accent-blue/10 border border-accent-blue/20">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-pulse" />
            <span className="text-[8px] font-bold text-accent-blue uppercase tracking-widest">Ghost_Secured</span>
          </div>
        </div>
        <h2 className="text-2xl font-black text-text-main">RECON_AND_DISCOVERY</h2>
      </header>

      <div className="panel space-y-6">
        <form onSubmit={handleScan} className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-dim" />
              <input 
                type="text"
                value={target}
                onChange={(e) => updateTarget(e.target.value)}
                placeholder="target.domain or IP address"
                className="w-full bg-surface border border-border-main rounded py-2 pl-10 pr-4 text-[13px] focus:outline-none focus:border-accent-blue transition-all font-mono"
              />
            </div>
            <button 
              type="submit"
              disabled={isScanning || isAutonomousScanning}
              className="bg-surface border border-border-main text-text-main font-bold px-6 rounded text-[11px] hover:border-accent-blue hover:text-accent-blue disabled:opacity-50 flex items-center gap-2 uppercase tracking-widest transition-all"
            >
              {isScanning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Radar className="w-3.5 h-3.5" />}
              {isScanning ? "SURVEYING..." : `${scanType} SCAN`}
            </button>
            {target && (
              <button 
                type="button"
                onClick={() => {
                  const cmd = `nmap -v -A ${target}`;
                  window.dispatchEvent(new CustomEvent('send-to-shell', { detail: cmd }));
                  window.dispatchEvent(new CustomEvent('catalyst-nav', { detail: 'real_terminal' }));
                }}
                className="bg-accent-blue/10 border border-accent-blue/40 text-accent-blue font-bold px-6 rounded text-[11px] hover:bg-accent-blue hover:text-white transition-all flex items-center gap-2 uppercase tracking-widest"
              >
                <TerminalIcon className="w-3.5 h-3.5" />
                PIPELINE TO REAL SHELL
              </button>
            )}
            <button 
              type="button"
              onClick={handleAutonomousAudit}
              disabled={isScanning || isAutonomousScanning || !target}
              className="bg-accent-blue text-white font-black px-6 rounded text-[11px] hover:shadow-[0_0_20px_rgba(37,99,235,0.3)] disabled:opacity-50 flex items-center gap-2 uppercase tracking-widest transition-all border border-accent-blue group"
            >
              {isAutonomousScanning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BrainCircuit className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />}
              {isAutonomousScanning ? "AUTONOMOUS PROCESSING..." : "NEURAL AUTO-AUDIT (AUTO-PILOT)"}
            </button>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="real-dns"
                checked={useRealDns}
                onChange={(e) => setUseRealDns(e.target.checked)}
                className="w-3 h-3 accent-accent-blue"
              />
              <label htmlFor="real-dns" className="text-[10px] text-text-dim uppercase font-bold cursor-pointer hover:text-text-main transition-colors">
                DNS Resolver
              </label>
            </div>

            <div className="flex items-center gap-2 border-l border-border-main pl-4">
              <span className="text-[9px] font-black text-text-dim uppercase tracking-tighter">Profile:</span>
              {(['quick', 'complete', 'stealth'] as const).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setScanType(type)}
                  className={cn(
                    "text-[9px] font-bold uppercase transition-all px-2 py-0.5 rounded",
                    scanType === type ? "bg-accent-blue text-white" : "text-text-dim hover:text-text-main"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </form>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-accent-red/10 border border-accent-red/20 p-3 rounded flex items-center gap-3 text-accent-red text-[11px]"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              {error}
            </motion.div>
          )}

          {results && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              {/* AI TACTICAL OVERVIEW */}
              <div className="bg-accent-blue/5 border border-accent-blue/20 rounded-lg overflow-hidden">
                <div className="bg-accent-blue/10 px-4 py-3 flex items-center justify-between border-b border-accent-blue/20">
                  <div className="flex items-center gap-2 text-accent-blue">
                    <BrainCircuit className="w-4 h-4" />
                    <span className="text-[11px] font-black uppercase tracking-widest">Neural Recon Intelligence</span>
                  </div>
                  <button 
                    onClick={handleAiAnalysis}
                    disabled={isAnalyzing}
                    className="bg-accent-blue text-white px-4 py-1.5 rounded text-[10px] font-black uppercase hover:bg-accent-blue/90 transition-all disabled:opacity-50 flex items-center gap-2 shadow-sm"
                  >
                    {isAnalyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                    {aiAnalysis ? "Refresh Neural Map" : "Synthesize Scan Results"}
                  </button>
                </div>
                
                <AnimatePresence mode="wait">
                  {isAnalyzing ? (
                    <motion.div 
                      key="analyzing"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="p-12 flex flex-col items-center justify-center gap-4 text-center"
                    >
                      <Loader2 className="w-8 h-8 text-accent-blue animate-spin" />
                      <div>
                        <p className="text-text-main font-bold text-sm tracking-tight uppercase">Processing Scan Artifacts</p>
                        <p className="text-text-dim text-[10px] font-mono">Running tactical vulnerability assessment through Gemini Core...</p>
                      </div>
                    </motion.div>
                  ) : aiAnalysis ? (
                    <motion.div 
                      key="report"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-6 space-y-6"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Shield className="w-3.5 h-3.5 text-accent-red" />
                          <h4 className="text-[10px] font-black text-text-dim uppercase tracking-widest">AI Strategic Breakdown & Tactics</h4>
                        </div>
                        <div className="bg-bg-dark/50 border border-border-main/50 rounded p-6 font-mono text-[11px] text-text-main custom-scrollbar max-h-full min-h-[300px] overflow-y-auto markdown-body">
                          <AiAnalysisRenderer content={aiAnalysis} />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="panel bg-accent-green/5 border-accent-green/20">
                          <div className="flex items-center gap-2 mb-2">
                            <TerminalIcon className="w-3 h-3 text-accent-green" />
                            <span className="text-[9px] font-black text-accent-green uppercase tracking-widest">Neural Directives</span>
                          </div>
                          <p className="text-[10px] text-text-dim italic mb-4">
                            Tactical suggestions extracted from Neural Core. Refer to the markdown report for exact command syntax and logical modeling.
                          </p>
                          <div className="flex flex-wrap gap-2">
                             {['hydra', 'nikto', 'fuzz', 'osint'].map(tool => (
                               (autonomousStrategy?.toLowerCase().includes(tool) || results?.strategy?.toLowerCase().includes(tool)) && (
                                 <button 
                                   key={tool}
                                   onClick={() => {
                                      onTargetChange?.(target);
                                      // We need a way to navigate from here. I'll use a hack or just assume onNavigate is passed.
                                      // Actually, it's better if we just update the target and let the user click the sidebar,
                                      // OR I can use window dispatch event to tell App to switch.
                                      window.dispatchEvent(new CustomEvent('catalyst-nav', { detail: tool }));
                                   }}
                                   className="bg-accent-green/20 text-accent-green border border-accent-green/40 px-3 py-1 rounded text-[9px] font-black uppercase hover:bg-accent-green hover:text-black transition-all flex items-center gap-1.5"
                                 >
                                   <Zap className="w-3 h-3" />
                                   Auto-Launch {tool}
                                 </button>
                               )
                             ))}
                          </div>
                        </div>
                        <div className="panel bg-accent-red/5 border-accent-red/20">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="w-3 h-3 text-accent-red" />
                            <span className="text-[9px] font-black text-accent-red uppercase tracking-widest">System Warning</span>
                          </div>
                          <p className="text-[10px] text-text-dim italic">
                            Analysis based on current scan artifacts. Incomplete data may lead to degraded heuristic accuracy.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-8 text-center"
                    >
                      <div className="flex flex-col items-center gap-3 opacity-40">
                        <BrainCircuit className="w-8 h-8 text-text-dim" />
                        <p className="text-[11px] font-bold uppercase tracking-widest text-text-dim">Recon Intelligence Standby</p>
                        <p className="text-[10px] italic text-text-dim max-w-sm mx-auto">
                          Waiting for manual scan completion to synthesize tactical intelligence and suggest next engagement steps.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Technical Report (Nmap/NSE) */}
              <div className="space-y-4">
                {/* Advanced Scripting */}
                {suggestedScripts.length > 0 && (
                  <div className="panel bg-accent-blue/5 border-accent-blue/20 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-accent-blue" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-accent-blue">NSE Vuln Audit Suggestions</span>
                      </div>
                      <button
                        onClick={handleNseScan}
                        disabled={isNseScanning || selectedScripts.length === 0}
                        className="bg-accent-blue text-white px-3 py-1 rounded text-[9px] font-black uppercase hover:bg-accent-blue/90 disabled:opacity-50 flex items-center gap-2 transition-all"
                      >
                        {isNseScanning ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                        Execute Scripts
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {suggestedScripts.map(script => (
                        <button
                          key={script}
                          onClick={() => toggleScript(script)}
                          className={cn(
                            "px-2 py-1 rounded text-[9px] font-bold border transition-all",
                            selectedScripts.includes(script) 
                              ? "bg-accent-blue text-white border-accent-blue" 
                              : "bg-surface border-border-main text-text-dim hover:border-accent-blue hover:text-text-main"
                          )}
                        >
                          {script}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {results.dns_records && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-accent-blue">
                      <Globe className="w-3 h-3" />
                      <h3 className="text-[10px] font-bold uppercase tracking-widest">Raw DNS Resolution</h3>
                    </div>
                    <div className="bg-surface border border-border-main rounded p-3 font-mono text-[10px] text-text-main whitespace-pre h-[200px] overflow-y-auto custom-scrollbar">
                      {JSON.stringify(results.dns_records, null, 2)}
                    </div>
                  </div>
                )}
              </div>

              {/* Real Headers & Metrics */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border-main border border-border-main rounded overflow-hidden shrink-0">
                  <div className="bg-bg-dark p-3">
                    <div className="text-[9px] text-text-dim font-bold mb-1 uppercase tracking-widest">HTTP_CODE</div>
                    <div className={cn("text-lg font-mono font-bold", results.status >= 200 && results.status < 300 ? "text-accent-green" : "text-accent-red")}>
                      {results.status || "FAIL"}
                    </div>
                  </div>
                  <div className="bg-bg-dark p-3">
                    <div className="text-[9px] text-text-dim font-bold mb-1 uppercase tracking-widest">TLS_VERSION</div>
                    <div className="text-lg font-mono font-bold text-accent-blue">TLSv1.3</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Shield className="w-3 h-3 text-text-dim" />
                    <h3 className="text-[10px] font-bold text-text-dim uppercase tracking-widest">Header Analytics</h3>
                  </div>
                  <div className="bg-bg-dark border border-border-main rounded overflow-hidden">
                    <div className="max-h-[500px] overflow-y-auto font-mono text-[11px] p-0 custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-surface border-b border-border-main">
                              <th className="px-4 py-2 text-[9px] font-black text-text-dim uppercase tracking-tighter w-40">Property</th>
                              <th className="px-4 py-2 text-[9px] font-black text-text-dim uppercase tracking-tighter">Value</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(results.real_headers || {}).length > 0 ? Object.entries(results.real_headers).map(([key, val]: [string, any]) => (
                              <tr key={key} className="border-b border-border-main/50 last:border-0 hover:bg-white/5 transition-colors">
                                <td className="px-4 py-1.5 text-accent-blue font-bold truncate">{key}</td>
                                <td className="px-4 py-1.5 text-text-main break-all">{val}</td>
                              </tr>
                            )) : (
                              <tr>
                                <td colSpan={2} className="px-4 py-8 text-center text-text-dim italic text-xs">Direct header inspection failed.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
