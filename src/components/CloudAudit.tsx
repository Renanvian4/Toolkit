import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cloud, Search, Shield, Zap, AlertTriangle, Loader2, Cpu, Database, Eye, Globe, Terminal as TerminalIcon } from 'lucide-react';
import axios from 'axios';
import { cn } from '../lib/utils';

interface Finding {
  bucket: string;
  provider: 'aws' | 'gcp' | 'azure';
  status: 'public' | 'protected' | 'private';
  files: string[];
  findings: string[];
}

 export default function CloudAudit() {
  const [target, setTarget] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [provider, setProvider] = useState<'aws' | 'gcp'>('aws');

  const scanBuckets = async () => {
    if (!target) return;
    setIsScanning(true);
    setFindings([]);
    setAiAnalysis(null);

    try {
      // Logic simulated in component but could be in server
      setTimeout(() => {
        const mock: Finding[] = provider === 'aws' ? [
          {
            bucket: `${target}-prod-backups`,
            provider: 'aws',
            status: 'protected',
            files: ['db_dump.sql.gz', 'config.json', 'access_logs.csv'],
            findings: ['Directory listing enabled', 'Bucket name leakage']
          },
          {
            bucket: `static-assets-${target}.s3.amazonaws.com`,
            provider: 'aws',
            status: 'public',
            files: ['logo.png', 'main.js', 'styles.css', 'env.production.backup'],
            findings: ['PII leak in backup file', 'World-readable permissions']
          }
        ] : [
          {
             bucket: `gs://${target}-data-warehouse`,
             provider: 'gcp',
             status: 'protected',
             files: ['customer_list_2024.parquet', 'internal_memo.pdf'],
             findings: ['IAM policy misconfiguration', 'Object-level permissions too broad']
          },
          {
             bucket: `gs://staging-${target}-assets`,
             provider: 'gcp',
             status: 'public',
             files: ['index.html', 'assets/main.v2.js'],
             findings: ['Unauthenticated access allowed', 'Cross-project disclosure']
          }
        ];
        setFindings(mock);
        setIsScanning(false);
      }, 3000);
    } catch (err) {
      setIsScanning(false);
    }
  };

  const runAiAnalysis = async () => {
    if (findings.length === 0) return;
    setIsAnalyzing(true);

    try {
      const res = await axios.post('/api/analyze/vulnerability', {
        code: JSON.stringify(findings),
        context: `Cloud Storage Audit for ${target}`,
        tool_preference: "Cloud Infrastructure Architect"
      });
      setAiAnalysis(res.data.analysis);
      
      // Save to library
      await axios.post('/api/intelligence/save', {
        tool: "CLOUD_AUDIT_IA",
        strategy: "Neural Storage Audit",
        findings: `Identified ${findings.length} buckets for ${target}.`,
        next_steps: res.data.analysis
      });

    } catch (err) {
      setAiAnalysis("Neural link unstable. Manual evaluation recommended.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h2 className="text-2xl font-black italic tracking-tighter text-white flex items-center gap-3">
            <Cloud className="w-6 h-6 text-accent-blue" />
            CLOUD_INTELLIGENCE_AUDIT
          </h2>
          <p className="text-[10px] text-text-dim uppercase tracking-widest font-bold mt-1">
            Autonomous Cloud Storage & Bucket Sieve // AI-Powered
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-accent-blue/10 border border-accent-blue/30 rounded-full text-[9px] font-black text-accent-blue uppercase animate-pulse">
            Neural_Sensing_Active
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden">
        <div className="lg:col-span-4 space-y-4 flex flex-col">
          <div className="panel bg-surface/50 border-accent-blue/20">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-4 bg-accent-blue"></div>
              <h3 className="text-[11px] font-black text-white uppercase tracking-widest">Configuration</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[9px] font-bold text-text-dim uppercase mb-1.5 block italic">Cloud Target (Domain/Org)</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-dim" />
                  <input
                    type="text"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder="e.g. targetcompany"
                    className="w-full bg-bg-dark border border-border-main rounded px-10 py-2.5 text-xs text-white focus:border-accent-blue transition-colors placeholder:text-text-dim/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setProvider('aws')}
                  className={cn(
                    "py-2 rounded text-[9px] font-bold uppercase transition-all border",
                    provider === 'aws' ? "bg-accent-blue text-bg-dark border-accent-blue" : "bg-bg-dark border-border-main text-text-dim hover:text-white"
                  )}
                >
                  S3 STACKS
                </button>
                <button 
                  onClick={() => setProvider('gcp')}
                  className={cn(
                    "py-2 rounded text-[9px] font-bold uppercase transition-all border",
                    provider === 'gcp' ? "bg-accent-blue text-bg-dark border-accent-blue" : "bg-bg-dark border-border-main text-text-dim hover:text-white"
                  )}
                >
                  GCP BUCKETS
                </button>
              </div>

              <button
                onClick={scanBuckets}
                disabled={isScanning || !target}
                className="w-full py-3 bg-accent-blue text-bg-dark rounded font-black text-[11px] uppercase tracking-wider hover:bg-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 mb-2"
              >
                {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                INITIALIZE_CLOUD_PROBE
              </button>
              {target && (
                <button 
                  type="button"
                  onClick={() => {
                    const cmd = provider === 'aws' 
                      ? `aws s3 ls s3://${target} --no-sign-request`
                      : `gcloud storage ls gs://${target}`;
                    window.dispatchEvent(new CustomEvent('send-to-shell', { detail: cmd }));
                    window.dispatchEvent(new CustomEvent('catalyst-nav', { detail: 'real_terminal' }));
                  }}
                  className="w-full py-3 bg-accent-blue/10 border border-accent-blue/40 text-accent-blue rounded font-black text-[11px] uppercase tracking-widest hover:bg-accent-blue hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <TerminalIcon className="w-3.5 h-3.5" />
                  PIPELINE TO REAL SHELL
                </button>
              )}
            </div>
          </div>

          {findings.length > 0 && (
            <div className="panel bg-accent-blue/5 border-accent-blue/20 flex-1 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[11px] font-black text-accent-blue uppercase tracking-widest">Findings Summary</h3>
              </div>
              <div className="space-y-3 overflow-y-auto custom-scrollbar pr-2">
                {findings.map((f, i) => (
                  <div key={i} className="p-3 bg-bg-dark/40 border border-white/5 rounded space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-white truncate max-w-[150px]">{f.bucket}</span>
                      <span className={cn(
                        "text-[8px] font-bold px-1.5 py-0.5 rounded uppercase",
                        f.status === 'public' ? 'bg-accent-red/20 text-accent-red' : 'bg-accent-blue/20 text-accent-blue'
                      )}>
                        {f.status}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {f.findings.map((item, idx) => (
                        <span key={idx} className="text-[7px] bg-white/5 px-1 py-0.5 text-text-dim">{item}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <button 
                onClick={runAiAnalysis}
                disabled={isAnalyzing}
                className="mt-4 w-full py-2 bg-transparent border border-accent-blue text-accent-blue rounded font-black text-[10px] uppercase hover:bg-accent-blue/10 transition-all flex items-center justify-center gap-2"
              >
                {isAnalyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Cpu className="w-3 h-3" />}
                CATALYST_NEURAL_SENSE
              </button>
            </div>
          )}
        </div>

        <div className="lg:col-span-8 flex flex-col gap-6 h-full overflow-hidden">
          <div className="panel flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4 group">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-accent-blue" />
                <h3 className="text-[11px] font-black text-white uppercase tracking-widest italic">Live Data Stream</h3>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
              {findings.length > 0 ? (
                findings.map((f, i) => (
                  <div key={i} className="border border-white/5 p-4 rounded-lg bg-white/[0.02]">
                    <div className="flex items-center gap-3 mb-3 pb-3 border-b border-white/5">
                      <div className="p-2 bg-accent-blue/10 rounded-lg">
                        <Cloud className="w-4 h-4 text-accent-blue" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white uppercase">{f.bucket}</div>
                        <div className="text-[10px] text-text-dim font-mono">{f.provider.toUpperCase()} // REGION: us-east-1</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-[10px] font-bold text-text-dim uppercase mb-2">Exposed Artifacts</div>
                        <div className="space-y-1">
                          {f.files.map((file, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-[11px] text-white/70 font-mono">
                              <span className="text-accent-blue">›</span> {file}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="bg-bg-dark/60 p-3 rounded border border-white/5">
                        <div className="text-[10px] font-bold text-accent-red uppercase mb-2 flex items-center gap-2">
                          <AlertTriangle className="w-3 h-3" /> Vulnerability Vector
                        </div>
                        <div className="space-y-1">
                          {f.findings.map((item, idx) => (
                            <div key={idx} className="text-[11px] text-accent-red font-bold">
                              • {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-text-dim opacity-30 italic">
                  <Cpu className="w-12 h-12 mb-4 animate-pulse" />
                  <p className="text-[10px] uppercase font-black tracking-[0.2em]">Awaiting Target Probe Deployment</p>
                </div>
              )}
            </div>
          </div>

          <AnimatePresence>
            {aiAnalysis && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="panel bg-accent-blue/5 border-accent-blue/20"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 bg-accent-blue rounded-full animate-ping"></div>
                  <h3 className="text-[11px] font-black text-white uppercase tracking-widest italic">Neural Audit Report</h3>
                </div>
                <div className="text-[13px] text-text-main/90 leading-relaxed font-light prose prose-invert max-w-none prose-sm">
                  {aiAnalysis}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
