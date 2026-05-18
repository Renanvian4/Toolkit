import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal as TerminalIcon, Info, ChevronRight, Loader2, Cpu, Sparkles, BrainCircuit } from 'lucide-react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown'; import AiAnalysisRenderer from './AiAnalysisRenderer';
import { cn } from '../lib/utils';

export default function TerminalTool() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([
    'Kali NetHunter Catalyst v2.4.0-AISTUDIO',
    'Session established for user: root@tablet-os',
    'Type "help" for a list of available micro-tools.',
    'Neural_IA Assistant: Initialized and awaiting commands.',
    '------------------------------------------------',
    ''
  ]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const askAiAssistant = async () => {
    if (history.length < 5) return;
    setIsAiThinking(true);
    try {
      const response = await axios.post('/api/analyze/vulnerability', {
        code: history.join('\n'),
        context: 'Terminal Session context. The user is executing commands in a security testing environment.',
        tool_preference: 'Operational Strategy Intelligence'
      });
      setAiSuggestion(response.data.analysis);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiThinking(false);
    }
  };

  const processCommand = (cmd: string) => {
    const cleanCmd = cmd.trim().toLowerCase();
    setHistory(prev => [...prev, `root@tablet-os:~# ${cmd}`]);

    setTimeout(() => {
      let output = '';
      switch (cleanCmd) {
        case 'help':
          output = 'Available commands: help, clear, nmap, nikto, hydra, rustscan, uname, whoami, ifconfig, ai-think';
          break;
        case 'clear':
          setHistory([]);
          return;
        case 'ai-think':
          askAiAssistant();
          output = '[SYSTEM] AI Assistant is analyzing the session logs...';
          break;
        case 'uname -a':
          output = 'Linux tablet-os 6.1.0-kali-nethunter-arm64 #1 SMP PREEMPT_DYNAMIC';
          break;
        case 'whoami':
          output = 'root';
          break;
        case 'ifconfig':
          output = 'wlan0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500\n        inet 192.168.1.15  netmask 255.255.255.0  broadcast 192.168.1.255\n        inet6 fe80::a00:27ff:fe4e:66a1  prefixlen 64  scopeid 0x20<link>';
          break;
        case 'nmap':
          output = 'Usage: nmap [target] - Rapid port discovery module.';
          break;
        case 'nikto':
          output = 'Usage: nikto [url] - Vulnerability testing module.';
          break;
        default:
          output = `Command not found: ${cleanCmd}. Try 'help'.`;
      }
      setHistory(prev => [...prev, output]);
    }, 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      processCommand(input);
      setInput('');
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <header>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2 text-accent-green">
            <TerminalIcon className="w-4 h-4" />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Kernel Interface</span>
          </div>
          <button 
            onClick={askAiAssistant}
            disabled={isAiThinking}
            className="flex items-center gap-2 bg-accent-blue/10 border border-accent-blue/30 text-accent-blue px-2 py-0.5 rounded text-[8px] font-black uppercase hover:bg-accent-blue hover:text-white transition-all disabled:opacity-30"
          >
            {isAiThinking ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <BrainCircuit className="w-2.5 h-2.5" />}
            AI Strategic Thought
          </button>
        </div>
        <h2 className="text-2xl font-black text-text-main uppercase tracking-tighter">NetHunter_Console</h2>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 h-4">
        <div className="flex-1 bg-black border border-border-main rounded flex flex-col overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
             <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 border border-white/10 text-[8px] font-bold text-text-dim">
                <Cpu className="w-2.5 h-2.5" />
                NEURAL_LINK: ACTIVE
             </div>
          </div>
          
          <div className="flex-1 p-4 font-mono text-[13px] overflow-y-auto custom-scrollbar">
            {history.map((line, i) => (
              <div key={i} className={cn(
                "whitespace-pre-wrap mb-1",
                line.startsWith('root@tablet-os') ? "text-accent-blue" : 
                line.startsWith('Neural_IA') ? "text-accent-green font-bold italic" :
                line.startsWith('[SYSTEM]') ? "text-accent-blue/70 italic" : "text-text-main"
              )}>
                {line}
              </div>
            ))}
            <div className="flex items-center gap-2">
              <span className="text-accent-blue font-bold">root@tablet-os:~#</span>
              <input 
                autoFocus
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent border-none outline-none text-text-main caret-accent-green"
              />
            </div>
            <div ref={consoleEndRef} />
          </div>
          
          <div className="bg-surface/50 backdrop-blur p-2 border-t border-border-main flex items-center justify-between">
             <div className="flex items-center gap-4 text-[9px] font-bold uppercase tracking-widest text-text-dim">
                <span className="flex items-center gap-1"><Loader2 className="w-2 h-2 animate-pulse" /> TX: 0.4 KB/s</span>
                <span className="flex items-center gap-1"><Loader2 className="w-2 h-2 animate-pulse" /> RX: 1.2 MB/s</span>
             </div>
             <div className="text-[9px] text-text-dim font-mono uppercase tracking-tighter">Terminal_v4 | Node_Cluster: Catalyst_01</div>
          </div>
        </div>

        <AnimatePresence>
          {aiSuggestion && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-full lg:w-80 panel bg-accent-blue/5 border-accent-blue/30 flex flex-col h-full overflow-hidden shrink-0"
            >
               <div className="panel-header border-b border-accent-blue/20 p-3 bg-accent-blue/10">
                  <div className="flex items-center gap-2 text-accent-blue">
                     <Sparkles className="w-3.5 h-3.5" />
                     <span className="text-[10px] font-black uppercase tracking-widest">Neural AI Assistant</span>
                  </div>
                  <button onClick={() => setAiSuggestion(null)} className="text-text-dim hover:text-white">×</button>
               </div>
               <div className="flex-1 p-4 overflow-y-auto custom-scrollbar prose prose-invert prose-xs max-w-none font-mono text-[11px] leading-relaxed">
                  <AiAnalysisRenderer content={aiSuggestion} />
               </div>
               <div className="p-3 bg-surface border-t border-border-main text-[9px] text-text-dim italic text-center">
                  Thinking based on current terminal history.
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
