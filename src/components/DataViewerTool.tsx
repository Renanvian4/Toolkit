import { useState, useEffect } from 'react';
import { Database, Search, Folder, File, RefreshCw } from 'lucide-react';
import axios from 'axios';

export default function DataViewerTool() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/wordlists');
      setData(res.data);
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = data.filter(d => JSON.stringify(d).toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="h-full flex flex-col space-y-4 text-text-main font-mono">
      <header className="flex items-center justify-between pb-4 border-b border-border-main">
        <div className="flex items-center gap-3">
          <Database className="w-5 h-5 text-accent-blue" />
          <div>
            <h2 className="text-[12px] font-black tracking-[0.2em] uppercase text-white">Central Intelligence DB</h2>
            <p className="text-[9px] text-text-dim uppercase">Captured Assets & Generated Wordlists</p>
          </div>
        </div>
        <button onClick={fetchData} className="p-2 hover:bg-white/5 rounded transition-colors text-text-dim hover:text-white">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </header>

      <div className="flex items-center gap-2 bg-bg-dark border border-border-main rounded px-3 py-2">
        <Search className="w-4 h-4 text-text-dim" />
        <input 
          type="text" 
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="SEARCH DATABASE..." 
          className="bg-transparent border-none outline-none text-[11px] w-full text-white uppercase"
        />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
        {filtered.map((item, i) => (
          <div key={i} className="bg-surface border border-border-main p-3 rounded group hover:border-accent-blue transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <Folder className="w-4 h-4 text-accent-blue" />
              <span className="text-[11px] font-bold text-white tracking-widest uppercase">{item.name || 'Unnamed Asset'}</span>
            </div>
            <div className="text-[9px] text-text-dim uppercase grid grid-cols-2 gap-1 mb-2 pl-6">
              <div>Type: <span className="text-white">{item.type}</span></div>
              <div>Target: <span className="text-white">{item.target}</span></div>
              <div>Items: <span className="text-accent-blue font-bold">{item.count || item.items?.length || 0}</span></div>
              <div>Date: {new Date(item.createdAt).toLocaleDateString()}</div>
            </div>
            <div className="pl-6 pt-2 border-t border-border-main/50 text-[10px] space-y-1">
              {(item.items || []).slice(0, 5).map((word: string, j: number) => (
                <div key={j} className="flex items-center gap-2 break-all text-text-main/80">
                  <File className="w-3 h-3 text-text-dim shrink-0" />
                  {word}
                </div>
              ))}
              {(item.items?.length || 0) > 5 && (
                <div className="text-text-dim text-[9px] italic mt-1">...and {(item.items?.length || 0) - 5} more entries.</div>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && !loading && (
          <div className="text-center text-text-dim text-[10px] italic py-8 uppercase tracking-widest">
            No intelligence assets found.
          </div>
        )}
      </div>
    </div>
  );
}
