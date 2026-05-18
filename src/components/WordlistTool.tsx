import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Database, Search, Loader2, Sparkles, Send, Copy, CheckCircle2, Terminal as TerminalIcon, Cpu, Zap, Hash, BrainCircuit, History, Save, Trash2 } from 'lucide-react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown'; import AiAnalysisRenderer from './AiAnalysisRenderer';
import { cn } from '../lib/utils';

interface WordlistToolProps {
  onApply: (items: string[]) => void;
  currentWordlist: string[];
}

export default function WordlistTool({ onApply, currentWordlist }: WordlistToolProps) {
  const [target, setTarget] = useState('');
  const [baseInput, setBaseInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedList, setGeneratedList] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [mergeInput, setMergeInput] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [isEngineGenerating, setIsEngineGenerating] = useState(false);
  const [language, setLanguage] = useState<'en' | 'pt'>('pt');
  const [savedLists, setSavedLists] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // ... (existing code)

  const handleHybridGenerate = async () => {
    setIsEngineGenerating(true);
    try {
      const response = await axios.post('/api/wordlist/hybrid', { 
        lang: language,
        target: target 
      });
      const words = response.data.words;
      setGeneratedList(words);
      onApply(words);
    } catch (err) {
      console.error(err);
    } finally {
      setIsEngineGenerating(false);
    }
  };
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchSavedLists();
  }, []);

  const fetchSavedLists = async () => {
    try {
      const response = await axios.get('/api/wordlists');
      setSavedLists(response.data);
    } catch (err) {
      console.error("Failed to fetch saved lists", err);
    }
  };

  const handleSaveWordlist = async () => {
    if (generatedList.length === 0) return;
    setIsSaving(true);
    try {
      await axios.post('/api/wordlists/save', {
        name: `Catalyst_${target.replace(/\s+/g, '_')}_${new Date().toLocaleDateString()}`,
        items: generatedList,
        target,
        type: 'Engine Pattern'
      });
      await fetchSavedLists();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSaved = async (id: string) => {
    try {
      await axios.delete(`/api/wordlists/${id}`);
      await fetchSavedLists();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeduplicate = () => {
    const unique = Array.from(new Set(generatedList));
    setGeneratedList(unique);
  };

  const handleAiAudit = async () => {
    if (generatedList.length === 0) return;
    setIsAnalyzing(true);
    try {
      const response = await axios.post('/api/analyze/vulnerability', {
        code: generatedList.slice(0, 50).join('\n'),
        context: `Contextual Wordlist analysis for target: ${target}`,
        tool_preference: 'Payload Intelligent Strategy'
      });
      setAiAnalysis(response.data.analysis);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerate = async () => {
    if (!target) return;
    setIsGenerating(true);
    try {
      const response = await axios.post('/api/tools/generate-wordlist', {
        target,
        base_wordlist: baseInput,
        type: 'Hybrid (Context-Aware Patterns)',
        language
      });
      setGeneratedList(response.data.items);
      onApply(response.data.items);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNanoEngineV2Generate = async () => {
    setIsEngineGenerating(true);
    try {
      const response = await axios.post('/api/wordlist/nano-v2', { 
        lang: language,
        target: target 
      });
      const words = response.data.words;
      setGeneratedList(words);
      onApply(words);
      if (!target) setTarget('Nano Engine V2 Pattern');
    } catch (err) {
      console.error(err);
    } finally {
      setIsEngineGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedList.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMerge = () => {
    const items = mergeInput.split('\n').map(i => i.trim()).filter(i => i !== '');
    if (items.length === 0) return;
    const newList = Array.from(new Set([...generatedList, ...items]));
    setGeneratedList(newList);
    setMergeInput('');
  };

  const handleSyncAction = async () => {
    if (generatedList.length === 0 && target) {
      await handleGenerate();
    } else if (generatedList.length > 0) {
      onApply(generatedList);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <div className="flex items-center gap-2 text-accent-blue mb-1">
          <Sparkles className="w-4 h-4" />
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase">AI Contextual Discovery</span>
        </div>
        <h2 className="text-2xl font-black text-text-main tracking-tighter uppercase">Wordlist_Gen_V1_Engine</h2>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="panel space-y-4">
          <div className="panel-header justify-between">
            <div className="flex items-center gap-2">
              <span>Scan Parameters</span>
              <Search className="w-3 h-3" />
            </div>
            <div className="flex bg-surface border border-border-main rounded p-0.5">
               <button 
                 onClick={() => setLanguage('pt')} 
                 className={cn("px-2 py-1 text-[9px] font-black rounded transition-all", language === 'pt' ? "bg-accent-blue text-white" : "text-text-dim hover:text-white")}
               >PT</button>
               <button 
                 onClick={() => setLanguage('en')} 
                 className={cn("px-2 py-1 text-[9px] font-black rounded transition-all", language === 'en' ? "bg-accent-blue text-white" : "text-text-dim hover:text-white")}
               >EN</button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-text-dim uppercase mb-1">Target Analysis Context</label>
              <input 
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="e.g. Banking API, E-commerce, Wordpress Portfolio"
                className="w-full bg-surface border border-border-main rounded p-2 text-[12px] focus:border-accent-blue outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-text-dim uppercase mb-1">Manual Base (Optional / One per line)</label>
              <textarea 
                value={baseInput}
                onChange={(e) => setBaseInput(e.target.value)}
                className="w-full h-24 bg-surface border border-border-main rounded p-3 text-[12px] font-mono focus:border-accent-blue outline-none resize-none custom-scrollbar"
                placeholder="admin&#10;api&#10;v1"
              />
            </div>

            <div className="pt-4 border-t border-border-main">
              <label className="block text-[10px] font-bold text-accent-blue uppercase mb-1">Merge Personal Wordlist</label>
              <div className="flex gap-2">
                <textarea 
                  value={mergeInput}
                  onChange={(e) => setMergeInput(e.target.value)}
                  className="flex-1 h-20 bg-surface border border-border-main rounded p-2 text-[11px] font-mono focus:border-accent-blue outline-none resize-none custom-scrollbar"
                  placeholder="Paste your personal list here..."
                />
                <button 
                  onClick={handleMerge}
                  className="bg-accent-blue/10 border border-accent-blue text-accent-blue px-4 rounded text-[10px] font-bold uppercase transition-all hover:bg-accent-blue hover:text-white"
                >
                  Merge
                </button>
              </div>
            </div>

              <div className="grid grid-cols-1 gap-3">
              <div className="flex gap-2">
                <button 
                  onClick={handleHybridGenerate}
                  disabled={isEngineGenerating || !target}
                  className="flex-1 bg-accent-blue text-white py-2.5 rounded font-black text-[10px] uppercase tracking-[0.2em] hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 group"
                >
                  {isEngineGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4 group-hover:rotate-12 transition-transform" />}
                  NEURAL SEEDS
                </button>
                <button 
                  onClick={async () => {
                    if (!target) return;
                    setIsEngineGenerating(true);
                    try {
                      const response = await axios.post('/api/wordlist/cewl', { target });
                      setGeneratedList(response.data.words);
                      onApply(response.data.words);
                    } catch (e) {
                      console.error(e);
                    } finally {
                      setIsEngineGenerating(false);
                    }
                  }}
                  disabled={isEngineGenerating || !target}
                  className="flex-1 bg-surface border border-accent-blue text-accent-blue py-2.5 rounded font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 hover:bg-accent-blue hover:text-white"
                >
                  <Search className="w-3.5 h-3.5" /> CeWL SPIDER
                </button>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={handleNanoEngineV2Generate}
                  disabled={isEngineGenerating}
                  className="flex-1 bg-surface border border-border-main text-text-dim py-2.5 rounded font-bold text-[10px] uppercase tracking-widest hover:border-accent-red hover:text-accent-red transition-all flex items-center justify-center gap-2"
                >
                  {isEngineGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                  NANO ENGINE V2
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="panel flex flex-col h-full min-h-[300px] !p-0 overflow-auto">
          <div className="panel-header !mb-0 px-4 py-3 bg-surface flex justify-between items-center transition-colors">
            <span className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-accent-blue" />
              Generated Payload Set ({generatedList.length})
            </span>
            <div className="flex gap-2">
              <button 
                onClick={handleDeduplicate}
                disabled={generatedList.length === 0}
                className="text-[9px] font-bold text-accent-blue hover:underline uppercase disabled:opacity-30"
              >
                Clean Dups
              </button>
              <button 
                onClick={handleSaveWordlist}
                disabled={generatedList.length === 0 || isSaving}
                className="text-[9px] font-bold text-accent-green hover:underline uppercase disabled:opacity-30 flex items-center gap-1"
              >
                {isSaving ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Save className="w-2.5 h-2.5" />}
                Save DB
              </button>
              <button 
                onClick={handleCopy} 
                disabled={generatedList.length === 0} 
                className="transition-all hover:scale-110 disabled:opacity-30"
                title="Copy to Clipboard"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-accent-green" /> : <Copy className="w-4 h-4 text-text-dim hover:text-white" />}
              </button>
            </div>
          </div>
          
          <div className="flex-1 bg-[#050505] p-4 font-mono text-[11px] overflow-y-auto custom-scrollbar">
            {generatedList.length > 0 ? (
              <div className="space-y-4">
                <div className="space-y-1">
                  {generatedList.map((item, i) => (
                    <div key={i} className="text-accent-blue/80 flex items-center gap-2 group">
                      <span className="text-text-dim/20 select-none w-6 italic">{(i+1).toString().padStart(2, '0')}</span>
                      <span className="group-hover:text-white transition-colors">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-white/5 space-y-3">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-accent-blue">
                         <BrainCircuit className="w-3 h-3" />
                         <span className="text-[9px] font-black uppercase tracking-widest">Neural Strategy Output</span>
                      </div>
                      <button 
                        onClick={handleAiAudit}
                        disabled={isAnalyzing}
                        className="text-[8px] font-bold text-accent-blue hover:underline uppercase flex items-center gap-1.5"
                      >
                         {isAnalyzing ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Sparkles className="w-2.5 h-2.5" />}
                         Audit Set
                      </button>
                   </div>
                   <AnimatePresence>
                      {aiAnalysis && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="text-[10px] text-text-dim leading-relaxed bg-accent-blue/5 p-3 rounded border border-accent-blue/10 font-sans"
                        >
                           <AiAnalysisRenderer content={aiAnalysis} />
                        </motion.div>
                      )}
                   </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-text-dim italic text-center p-8 opacity-40">
                Wordlist buffer empty. Map context to populate.
              </div>
            )}
          </div>

          <div className="p-3 bg-surface border-t border-border-main">
            <button 
              onClick={handleSyncAction}
              disabled={isGenerating || (!target && generatedList.length === 0)}
              className="w-full bg-white text-black py-2.5 rounded font-black text-[10px] uppercase tracking-widest hover:bg-white/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)] group"
            >
              {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : (copied ? <CheckCircle2 className="w-3.5 h-3.5 text-accent-green" /> : <Send className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />)}
              {generatedList.length === 0 ? "Generate AI Wordlist" : "Sync Context to Vector Engines"}
            </button>
          </div>
        </div>
      </div>

      {/* Repository section removed for total anonymity */}
    </div>
  );
}
