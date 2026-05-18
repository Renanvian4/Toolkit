import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Fingerprint, Search, Shield, Zap, AlertTriangle, Loader2, Cpu, Database, User, Mail, Key } from 'lucide-react';
import axios from 'axios';
import { cn } from '../lib/utils';

interface BreachRecord {
  source: string;
  date: string;
  fields: string[];
  severity: 'high' | 'critical' | 'medium';
}

export default function BreachTool() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<BreachRecord[]>([]);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const performSearch = () => {
    if (!query) return;
    setIsSearching(true);
    setResults([]);
    setAiReport(null);

    // Simulated Deep Web Breach Intelligence
    setTimeout(() => {
      const mock: BreachRecord[] = [
        {
          source: "Canva Data Leak",
          date: "May 2019",
          fields: ["Email", "Password Hash (bcrypt)", "Full Name"],
          severity: "high"
        },
        {
          source: "Vault-7 Extraction Patterns",
          date: "Internal Repository",
          fields: ["Behavioral Bio", "System Fingerprint"],
          severity: "critical"
        },
        {
          source: "Adobe Compromise",
          date: "Oct 2013",
          fields: ["Email", "Password Hint"],
          severity: "medium"
        }
      ];
      setResults(mock);
      setIsSearching(false);
    }, 2500);
  };

  const runAiAnalysis = async () => {
    if (results.length === 0) return;
    setIsAnalyzing(true);

    try {
      const res = await axios.post('/api/analyze/vulnerability', {
        code: JSON.stringify(results),
        context: `Deep search results for target ${query}. Account compromise intelligence.`,
        tool_preference: "OSINT Threat Analyst"
      });
      setAiReport(res.data.analysis);
      
      await axios.post('/api/intelligence/save', {
        tool: "DEEP_BREACH_SEARCH",
        strategy: "Historical Data Correlator",
        findings: `Identified ${results.length} historical leaks associated with ${query}.`,
        next_steps: res.data.analysis
      });
    } catch (err) {
      setAiReport("Neural audit link failed.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h2 className="text-2xl font-black italic tracking-tighter text-white flex items-center gap-3">
            <Fingerprint className="w-6 h-6 text-accent-green" />
            DEEP_BREACH_INTELLIGENCE
          </h2>
          <p className="text-[10px] text-text-dim uppercase tracking-widest font-bold mt-1">
            OSINT Leak Search & Compromised Credential Awareness // Neural Link
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden">
        <div className="lg:col-span-4 space-y-4">
          <div className="panel bg-surface/50 border-accent-green/20">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-4 bg-accent-green"></div>
              <h3 className="text-[11px] font-black text-white uppercase tracking-widest italic">Query Parameters</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[9px] font-bold text-text-dim uppercase mb-1.5 block italic">Identifier (Email/User/Domain)</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="E.g. admin@target.com"
                    className="w-full bg-bg-dark border border-border-main rounded px-10 py-3 text-xs text-white focus:border-accent-green transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                 <div className="flex items-center gap-2">
                    <input type="checkbox" id="darkweb" className="accent-accent-green" defaultChecked />
                    <label htmlFor="darkweb" className="text-[10px] text-text-dim font-bold uppercase tracking-wider">Deep Ops Search Enabled</label>
                 </div>
                 <div className="flex items-center gap-2">
                    <input type="checkbox" id="leaks" className="accent-accent-green" defaultChecked />
                    <label htmlFor="leaks" className="text-[10px] text-text-dim font-bold uppercase tracking-wider">Correlate Historical Leaks</label>
                 </div>
              </div>

              <button
                onClick={performSearch}
                disabled={isSearching || !query}
                className="w-full py-3 bg-accent-green text-bg-dark rounded font-black text-[11px] uppercase tracking-widest hover:bg-white transition-all flex items-center justify-center gap-2"
              >
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                EXECUTE_OSINT_QUERY
              </button>
            </div>
          </div>

          <div className="panel bg-bg-dark/40 flex-1 overflow-hidden border-white/5">
             <div className="flex items-center gap-2 mb-4 text-[10px] font-bold text-accent-green uppercase opacity-50">
               <Shield className="w-3.5 h-3.5" /> Threat Level Monitor
             </div>
             <div className="flex flex-col items-center justify-center py-10">
                <ShieldAlert className={cn(
                   "w-16 h-16 transition-all duration-1000",
                   results.length > 0 ? "text-accent-red animate-pulse scale-110" : "text-accent-green opacity-20"
                )} />
                <span className={cn(
                   "mt-4 text-[12px] font-black italic uppercase tracking-[0.2em]",
                   results.length > 0 ? "text-accent-red" : "text-text-dim"
                )}>
                   {results.length > 0 ? "CRITICAL_COMPROMISE" : "SYSTEM_CLEAN"}
                </span>
             </div>
          </div>
        </div>

        <div className="lg:col-span-8 flex flex-col gap-6 overflow-hidden h-full">
          <div className="panel flex-1 overflow-hidden flex flex-col bg-bg-dark/20">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-accent-green" />
                <h3 className="text-[11px] font-black text-white uppercase tracking-widest italic font-mono">Found Records</h3>
              </div>
              <button 
                onClick={runAiAnalysis}
                disabled={isAnalyzing || results.length === 0}
                className="text-[9px] font-bold text-accent-green border border-accent-green/30 px-3 py-1 rounded-full hover:bg-accent-green/10 transition-all flex items-center gap-2 disabled:opacity-20"
              >
                {isAnalyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Cpu className="w-3 h-3" />}
                NEURAL_SYNTHESIS
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
              {results.length > 0 ? (
                results.map((r, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={i} 
                    className="p-4 bg-white/[0.03] border border-white/5 rounded-lg hover:border-accent-green/30 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-3 leading-tight">
                       <div className="flex items-center gap-3">
                          <div className={cn(
                             "w-2 h-2 rounded-full",
                             r.severity === 'critical' ? 'bg-accent-red animate-ping' : 'bg-accent-yellow'
                          )}></div>
                          <span className="text-sm font-black text-white italic">{r.source}</span>
                       </div>
                       <span className="text-[10px] font-mono text-text-dim uppercase tracking-widest">{r.date}</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                       {r.fields.map((f, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 bg-black/40 border border-white/5 px-2 py-1 rounded text-[10px] font-mono text-text-main group-hover:text-accent-green transition-colors leading-none">
                             {f.includes('Email') ? <Mail className="w-3 h-3" /> : f.includes('Pass') ? <Key className="w-3 h-3" /> : <User className="w-3 h-3" />}
                             {f}
                          </div>
                       ))}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-20">
                  <Fingerprint className="w-16 h-16 text-accent-green mb-4 animate-pulse" />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em]">Awaiting Target Identity Probe</p>
                </div>
              )}
            </div>
          </div>

          <AnimatePresence>
            {aiReport && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="panel bg-accent-green/5 border-accent-green/20"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Cpu className="w-4 h-4 text-accent-green" />
                  <h3 className="text-[11px] font-black text-white tracking-widest uppercase italic">Neural Analysis Strategy</h3>
                </div>
                <div className="text-[13px] text-text-main/90 leading-relaxed font-light prose prose-invert prose-green prose-sm max-w-none">
                   {aiReport}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
