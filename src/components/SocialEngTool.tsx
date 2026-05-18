import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserCheck, MessageSquare, Search, Shield, Zap, AlertTriangle, Loader2, Cpu, Database, Mail, Terminal, Send, Eye, RefreshCw, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { cn } from '../lib/utils';

interface PhishingTemplate {
  name: string;
  category: string;
  urgency: 'low' | 'medium' | 'high';
  content: string;
}

// Social Engineering Core Module
export default function SocialEngTool() {
  const [targetContext, setTargetContext] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPayload, setGeneratedPayload] = useState<string | null>(null);
  const [tacticalAdvise, setTacticalAdvise] = useState<string | null>(null);
  const [vectorMode, setVectorMode] = useState<'bec' | 'smishing'>('bec');

  const generateSocialVector = async () => {
    if (!targetContext) return;
    setIsGenerating(true);
    setGeneratedPayload(null);
    setTacticalAdvise(null);

    try {
      const res = await axios.post('/api/analyze/vulnerability', {
        code: targetContext,
        context: "Social Engineering Payload Crafting",
        tool_preference: "Psychological Operations Specialist"
      });
      
      const parts = res.data.analysis.split('---');
      setGeneratedPayload(parts[0] || "Neural synthesis failed to craft payload.");
      setTacticalAdvise(parts[1] || "No tactical advice generated.");

      await axios.post('/api/intelligence/save', {
        tool: "SOCIAL_ENG_CORE",
        strategy: "Behavioral Vector Synthesis",
        findings: `Crafted payload for context: ${targetContext.slice(0, 50)}...`,
        next_steps: res.data.analysis
      });
    } catch (err) {
      setGeneratedPayload("Neural link interrupted.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h2 className="text-2xl font-black italic tracking-tighter text-white flex items-center gap-3">
            <UserCheck className="w-6 h-6 text-accent-yellow" />
            SOCIAL_ENGINEERING_CORE
          </h2>
          <p className="text-[10px] text-text-dim uppercase tracking-widest font-bold mt-1">
            Psychological Vectors & Human-Centric Payload Synthesis // AI Lab
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded bg-accent-yellow/10 border border-accent-yellow/20">
            <Eye className="w-4 h-4 text-accent-yellow animate-pulse" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden">
        <div className="lg:col-span-12 xl:col-span-4 space-y-4 flex flex-col">
          <div className="panel bg-surface/50 border-accent-yellow/20">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-4 bg-accent-yellow"></div>
              <h3 className="text-[11px] font-black text-white uppercase tracking-widest">Vector Configuration</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[9px] font-bold text-text-dim uppercase mb-1.5 block italic">Target Context / Intelligence Seed</label>
                <textarea
                  value={targetContext}
                  onChange={(e) => setTargetContext(e.target.value)}
                  placeholder="E.g. Target is a middle manager at a logistics firm. Uses LinkedIn heavily. Company recently had a merger announcement."
                  className="w-full bg-bg-dark border border-border-main rounded p-3 text-xs text-white focus:border-accent-yellow transition-colors min-h-[120px] resize-none custom-scrollbar"
                />
              </div>

                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setVectorMode('bec')}
                    className={cn(
                      "py-2 rounded text-[10px] font-bold uppercase tracking-widest transition-all border",
                      vectorMode === 'bec' 
                        ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.4)]" 
                        : "bg-black border-white/20 text-white hover:bg-white/10"
                    )}
                  >
                    BEC_ADVANCED
                  </button>
                  <button 
                    onClick={() => setVectorMode('smishing')}
                    className={cn(
                      "py-2 rounded text-[10px] font-bold uppercase tracking-widest transition-all border",
                      vectorMode === 'smishing' 
                        ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.4)]" 
                        : "bg-black border-white/20 text-white hover:bg-white/10"
                    )}
                  >
                    SMISHING_OPT
                  </button>
                </div>

                <button
                  onClick={generateSocialVector}
                  disabled={isGenerating || !targetContext}
                  className={cn(
                    "w-full py-3 rounded font-black text-[12px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 border",
                    isGenerating || !targetContext
                      ? "bg-surface border-white/5 text-text-dim opacity-50 cursor-not-allowed"
                      : "bg-accent-yellow text-bg-dark border-accent-yellow hover:bg-white hover:text-bg-dark shadow-[0_0_20px_rgba(255,200,0,0.3)] font-black"
                  )}
                >
                  {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  SYNCHRONIZE_VECTOR
                </button>
            </div>
          </div>

          <div className="panel bg-bg-dark/40 border-white/5 flex-1">
             <div className="text-[10px] font-black text-text-dim uppercase mb-4 flex items-center gap-2">
               <Terminal className="w-3.5 h-3.5 italic" /> Tactical Phishing Presets
             </div>
             <div className="space-y-2">
                {[
                  { name: "IT_SERVICE_ALERT", cat: "Infrastructure", urgency: "high", seed: "Company Infrastructure Maintenance: Alert users about scheduled downtime and required password confirmation for the new secure gateway." },
                  { name: "PAYROLL_REVISION", cat: "Finance", urgency: "critical", seed: "Finance Department - Payroll Update: Urgent notice regarding a discrepancy in the latest salary deposit. Action required to confirm details." },
                  { name: "MERGER_DOC_INTERNAL", cat: "Corporate", urgency: "medium", seed: "Internal Communication: Private memo regarding the upcoming merger details. Review the attached strategic document restricted to internal stakeholders." }
                ].map((item, i) => (
                  <div 
                    key={i} 
                    onClick={() => setTargetContext(item.seed)}
                    className="p-3 bg-white/[0.03] border border-white/5 rounded flex items-center justify-between group cursor-pointer hover:border-accent-yellow/30 transition-all"
                  >
                     <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-white group-hover:text-accent-yellow transition-colors">{item.name}</span>
                        <span className="text-[9px] text-text-dim uppercase tracking-widest">{item.cat}</span>
                     </div>
                     <ChevronRight className="w-3.5 h-3.5 text-text-dim group-hover:text-white" />
                  </div>
                ))}
             </div>
          </div>
        </div>

        <div className="lg:col-span-12 xl:col-span-8 flex flex-col gap-6 overflow-hidden">
          <div className="panel flex-1 bg-bg-dark/20 flex flex-col overflow-hidden relative">
             <div className="absolute top-0 right-0 p-4">
                <div className="px-3 py-1 bg-accent-yellow/10 border border-accent-yellow/20 rounded-full text-[9px] font-black text-accent-yellow uppercase tracking-widest italic animate-pulse">
                   Payload_Output_Live
                </div>
             </div>
             <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-4 h-4 text-accent-yellow" />
                <h3 className="text-[11px] font-black text-white uppercase tracking-[0.2em] italic">Synthesized Payload</h3>
             </div>
             
             <div className="flex-1 bg-black/40 border border-white/5 rounded p-6 font-mono text-sm text-white/90 overflow-y-auto custom-scrollbar whitespace-pre-wrap leading-relaxed shadow-inner min-h-full min-h-[300px]">
                {generatedPayload || (
                  <div className="h-full flex flex-col items-center justify-center text-text-dim opacity-20 italic">
                    <UserCheck className="w-16 h-16 mb-4 animate-pulse" />
                    <p className="text-[10px] uppercase font-black tracking-[0.4em]">Ready for Psychological Seeding</p>
                  </div>
                )}
             </div>
          </div>

          <AnimatePresence>
            {tacticalAdvise && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="panel bg-accent-yellow/5 border-accent-yellow/20"
              >
                <div className="flex items-center gap-2 mb-3 leading-none">
                  <Cpu className="w-4 h-4 text-accent-yellow" />
                  <h3 className="text-[11px] font-black text-white uppercase tracking-widest italic font-mono">Neural Tactical Guidance</h3>
                </div>
                <div className="text-[13px] text-text-main/90 font-light leading-relaxed prose prose-invert prose-yellow prose-sm max-w-none">
                   {tacticalAdvise}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-3">
             <button className="flex-1 py-3 bg-surface border border-border-main text-white rounded font-black text-[11px] uppercase flex items-center justify-center gap-2 hover:bg-white/5">
                <Send className="w-3.5 h-3.5" /> STAGE_TEST_DELIVERY
             </button>
             <button 
               onClick={() => {
                 const text = generatedPayload;
                 if (text) navigator.clipboard.writeText(text);
               }}
               className="px-6 py-3 bg-accent-yellow text-bg-dark rounded font-black text-[11px] uppercase hover:bg-white transition-all shadow-[0_0_15px_rgba(255,200,0,0.3)]">
                COPY_TO_BUFFER
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
