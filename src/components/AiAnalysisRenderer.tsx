import ReactMarkdown from 'react-markdown'; import AiAnalysisRenderer from './AiAnalysisRenderer';
import { Terminal } from 'lucide-react';

export default function AiAnalysisRenderer({ content }: { content: string }) {
  if (!content) return null;

  // Extract command pattern: COMMAND: <command>
  // It could be inline or block. We'll find it globally.
  const commandMatches = [...content.matchAll(/(?:COMMAND|Command):\s*(?:`([^`]+)`|([^\\n]+))/gi)];
  let extractedCommands: string[] = [];
  
  if (commandMatches.length > 0) {
    commandMatches.forEach(match => {
      const matchText = (match[1] || match[2]).trim();
      if (matchText) extractedCommands.push(matchText);
    });
  }

  // Remove the literal "COMMAND:" strings from the render so they don't look weird
  const displayContent = content.replace(/(?:COMMAND|Command):\s*(?:`[^`]+`|[^\n]+)/gi, '');

  const sendToShell = (cmd: string) => {
    window.dispatchEvent(new CustomEvent('send-to-shell', { detail: cmd }));
  };

  return (
    <div className="space-y-4">
      <div className="prose prose-invert prose-xs max-w-none font-mono text-[11px] leading-relaxed">
        <ReactMarkdown>{displayContent}</ReactMarkdown>
      </div>
      
      {extractedCommands.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
          <p className="text-[10px] font-black uppercase text-accent-blue tracking-widest flex items-center gap-2">
            <Terminal className="w-3 h-3" /> Próximas Ações Recomendadas
          </p>
          <div className="flex flex-col gap-2">
            {extractedCommands.map((cmd, idx) => (
              <button 
                key={idx}
                onClick={() => sendToShell(cmd)}
                className="bg-bg-dark border border-accent-blue/30 text-accent-blue hover:bg-accent-blue hover:text-white px-4 py-2 rounded text-[10px] font-mono tracking-wide transition-all flex items-center gap-3 text-left w-full group"
              >
                <Terminal className="w-4 h-4 shrink-0 text-text-dim group-hover:text-white" />
                <span className="flex-1 overflow-hidden text-ellipsis">{cmd}</span>
                <span className="shrink-0 text-[8px] bg-accent-blue/10 px-2 py-0.5 rounded font-black uppercase tracking-widest hidden lg:block group-hover:bg-white/20">Enviar ao Shell &gt;</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
