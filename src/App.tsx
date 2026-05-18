/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';
import { 
  Shield, 
  Terminal as TerminalIcon, 
  Search, 
  Cpu, 
  Settings, 
  Activity,
  Globe,
  Lock,
  ChevronRight,
  ChevronLeft,
  Zap,
  ShieldAlert,
  Database,
  Book,
  UserCheck,
  Cloud,
  Camera,
  Fingerprint,
  MessageSquare,
  Skull,
  Wifi,
  Network,
  Target,
  Radio,
  Key,
  Layers
} from 'lucide-react';
import { cn } from './lib/utils';
import Dashboard from './components/Dashboard';
import ReconTool from './components/ReconTool';
import AIAnalyzer from './components/AIAnalyzer';
import HydraTool from './components/HydraTool';
import NiktoTool from './components/NiktoTool';
import FuzzingTool from './components/FuzzingTool';
import OsintTool from './components/OsintTool';
import RealTerminal from './components/RealTerminal';
import AnonymityTool from './components/AnonymityTool';
import WordlistTool from './components/WordlistTool';
import GhostRouteTool from './components/GhostRouteTool';
import OpenVASTool from './components/OpenVASTool';
import SwiftTool from './components/SwiftTool';
import CloudAudit from './components/CloudAudit';
import MetaExif from './components/MetaExif';
import BreachTool from './components/BreachTool';
import SocialEngTool from './components/SocialEngTool';
import CommandLibrary from './components/CommandLibrary';
import InjectionTool from './components/InjectionTool';

import GobusterTool from './components/GobusterTool';
import AircrackTool from './components/AircrackTool';
import MetasploitTool from './components/MetasploitTool';
import JohnRipperTool from './components/JohnRipperTool';
import ReconNgTool from './components/ReconNgTool';
import MedusaTool from './components/MedusaTool';
import KismetTool from './components/KismetTool';
import BurpSuiteTool from './components/BurpSuiteTool';
import MimikatzTool from './components/MimikatzTool';
import CombinedAttacksTool from './components/CombinedAttacksTool';
import DataViewerTool from './components/DataViewerTool';

type Tool = 'dashboard' | 'recon' | 'ai' | 'hydra' | 'nikto' | 'fuzz' | 'osint' | 'wordlist' | 'ghost' | 'openvas' | 'library' | 'real_terminal' | 'anonymity' | 'cloud' | 'meta' | 'breach' | 'social' | 'swift' | 'injection' | 'gobuster' | 'aircrack' | 'metasploit' | 'john' | 'reconng' | 'medusa' | 'kismet' | 'burp' | 'mimikatz' | 'combined' | 'dataviewer';

export default function App() {
  const [activeTool, setActiveTool] = useState<Tool>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sharedWordlist, setSharedWordlist] = useState<string[]>([]);
  const [sharedTarget, setSharedTarget] = useState('');
  const [sessionTime, setSessionTime] = useState(0);
  const [activeScans, setActiveScans] = useState(3);
  const [threatLevel, setThreatLevel] = useState('NORMAL');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [activeTool]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const [systemInfo, setSystemInfo] = useState<any>(null);
  const [ghostRouteActive, setGhostRouteActive] = useState(false);
  const [anonymityActive, setAnonymityActive] = useState(false);

  useEffect(() => {
    const checkPrivacyStates = () => {
      setGhostRouteActive(localStorage.getItem('ghost_route_active') === 'true');
      setAnonymityActive(localStorage.getItem('anonymity_spoof_active') === 'true');
    };

    checkPrivacyStates();
    const interval = setInterval(checkPrivacyStates, 2000);
    window.addEventListener('storage', checkPrivacyStates);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', checkPrivacyStates);
    };
  }, []);

  useEffect(() => {
    const fetchSystemInfo = async () => {
      try {
        const res = await axios.get('/api/system/probe');
        setSystemInfo(res.data);
      } catch (e) {
        console.error("System info fetch failed", e);
      }
    };
    fetchSystemInfo();
    const interval = setInterval(fetchSystemInfo, 30000);
    
    const handleNav = (e: any) => {
      setActiveTool(e.detail as Tool);
    };
    window.addEventListener('catalyst-nav', handleNav);

    return () => {
      clearInterval(interval);
      window.removeEventListener('catalyst-nav', handleNav);
    };
  }, []);

  const leftNavItems = [
    { id: 'recon', icon: Search, label: 'Recon & Network' },
    { id: 'reconng', icon: Target, label: 'Recon-ng' },
    { id: 'osint', icon: Globe, label: 'Amass OSINT' },
    { id: 'openvas', icon: ShieldAlert, label: 'OpenVAS Audit' },
    { id: 'nikto', icon: ShieldAlert, label: 'Nikto Audit' },
    { id: 'burp', icon: Shield, label: 'Burp Suite Agent' },
    { id: 'cloud', icon: Cloud, label: 'Cloud Audit' },
    { id: 'swift', icon: Zap, label: 'Swift Scanner' },
    { id: 'gobuster', icon: Network, label: 'Gobuster' },
    { id: 'fuzz', icon: Database, label: 'FFUF Fuzzer' },
    { id: 'metasploit', icon: Skull, label: 'Metasploit' },
    { id: 'injection', icon: Database, label: 'DB Injection' },
    { id: 'john', icon: Lock, label: 'John The Ripper' },
    { id: 'medusa', icon: Database, label: 'Medusa Tool' },
    { id: 'hydra', icon: ShieldAlert, label: 'Hydra Catalyst Alpha' },
    { id: 'combined', icon: Layers, label: 'Combined Attacks' }
  ];

  const rightNavItems = [
    { id: 'dashboard', icon: Activity, label: 'Dashboard' },
    { id: 'ai', icon: Cpu, label: 'Catalyst AI' },
    { id: 'real_terminal', icon: TerminalIcon, label: 'Real Shell Access' },
    { id: 'library', icon: Book, label: 'Intelligence Library' },
    { id: 'meta', icon: Camera, label: 'Meta Intelligence' },
    { id: 'mimikatz', icon: Key, label: 'Mimikatz' },
    { id: 'wordlist', icon: Database, label: 'Wordlist Engine' },
    { id: 'social', icon: MessageSquare, label: 'Social Eng Lab' },
    { id: 'kismet', icon: Radio, label: 'Kismet' },
    { id: 'aircrack', icon: Wifi, label: 'Aircrack-ng' },
    { id: 'breach', icon: Fingerprint, label: 'Breach Search' },
    { id: 'dataviewer', icon: Database, label: 'Intelligence DB' },
    { id: 'anonymity', icon: UserCheck, label: 'Anonymity Audit' },
    { id: 'ghost', icon: Shield, label: 'Ghost Route' }
  ];

  return (
    <div className="flex flex-col h-screen bg-bg-dark text-text-main font-sans selection:bg-accent-blue/30 selection:text-white overflow-hidden relative">
      {/* Background Graphic Layer */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none overflow-hidden opacity-15"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1614064641938-3bbee52942c7?q=80&w=2070&auto=format&fit=crop')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Top Bar */}
      <header className="h-14 bg-surface/90 backdrop-blur-md border-b border-border-main flex items-center justify-between px-6 text-[12px] shrink-0 z-50">
        <div className="flex items-center gap-6 overflow-hidden">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-3 h-3 rounded-full bg-accent-green shadow-[0_0_8px_rgba(0,255,65,0.5)]"></div>
            <span className="font-bold tracking-tight text-lg">CATALYST-OS</span>
          </div>
          <span className="text-text-dim shrink-0">|</span>
          <div className="flex items-center gap-4 text-text-dim shrink-0">
            <span className="flex items-center gap-2">
              <Globe className="w-4 h-4" /> 
              {localStorage.getItem('ghost_spoofed_ip') || systemInfo?.external_ip || 'PROBING...'}
            </span>
            {localStorage.getItem('anonymity_spoof_active') === 'true' && (
              <span className="text-[10px] font-black text-accent-blue bg-accent-blue/10 px-2 py-0.5 rounded border border-accent-blue/30 flex items-center gap-1.5 animate-pulse">
                <Globe className="w-3 h-3" /> IP_MASKED: {localStorage.getItem('ghost_spoofed_ip')}
              </span>
            )}
            
            <span className="text-accent-green font-bold flex items-center gap-1.5 uppercase drop-shadow-[0_0_10px_rgba(0,255,65,0.8)] bg-accent-green/10 px-2.5 py-1 rounded border border-accent-green/40">
              <Skull className="w-4 h-4 text-accent-green drop-shadow-[0_0_5px_rgba(0,255,0,0.5)]" /> GHOST MODE
            </span>
            
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-white/10">
              <div title="Ghost Route Status">
                <Shield className={cn(
                  "w-3.5 h-3.5 transition-colors duration-500",
                  ghostRouteActive ? "text-accent-green drop-shadow-[0_0_5px_rgba(34,255,0,0.5)]" : "text-accent-red opacity-50"
                )} />
              </div>
              <div title="Anonymity Audit Status">
                <UserCheck className={cn(
                  "w-3.5 h-3.5 transition-colors duration-500",
                  anonymityActive ? "text-accent-green drop-shadow-[0_0_5px_rgba(34,255,0,0.5)]" : "text-accent-red opacity-50"
                )} />
              </div>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center gap-4 ml-2 pl-4 border-l border-white/10 overflow-hidden">
            <span className="text-text-dim uppercase font-black tracking-widest text-[9px]">Targets:</span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-white font-mono">10.0.4.15</span>
                <span className="text-[8px] bg-accent-red/20 text-accent-red px-1 rounded font-black">VULN</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white font-mono">api.internal</span>
                <span className="text-[8px] bg-accent-green/20 text-accent-green px-1 rounded font-black">LIVE</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-text-dim">
          <div className="hidden md:flex items-center gap-2 text-accent-blue font-mono uppercase text-[10px]">
            <Lock className="w-3 h-3" />
            <span>pts/0</span>
          </div>
          <span className="text-text-main tabular-nums font-mono border-l border-white/10 pl-4">{formatTime(sessionTime)}</span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside 
          className={cn(
            "bg-surface/90 backdrop-blur-md border-r border-border-main transition-all duration-300 ease-in-out flex flex-col shrink-0 overflow-hidden z-20",
            isSidebarOpen ? "w-[220px]" : "w-[60px]"
          )}
        >
          <div className="h-10 flex items-center px-4 border-b border-border-main overflow-hidden">
            {isSidebarOpen ? (
              <span className="text-[14px] font-black text-accent-blue uppercase tracking-[0.3em] whitespace-nowrap scale-x-110 origin-left inline-block">
                Toolkit_Core
              </span>
            ) : (
              <span className="text-[10px] font-black text-accent-blue uppercase tracking-[0.2em] whitespace-nowrap">
                TK
              </span>
            )}
          </div>
          <nav className="flex-1 py-2 space-y-0.5 overflow-y-auto custom-scrollbar">
            {leftNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTool(item.id as Tool)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-1.5 transition-all group text-left",
                  activeTool === item.id 
                    ? "bg-accent-blue/10 text-accent-blue border-l-2 border-accent-blue" 
                    : "text-text-dim hover:text-text-main hover:bg-white/5 border-l-2 border-transparent"
                )}
              >
                <item.icon className={cn("w-4 h-4 shrink-0", activeTool === item.id ? "text-accent-blue" : "text-text-dim group-hover:text-text-main")} />
                {isSidebarOpen && <span className="text-[13px] font-medium truncate">{item.label}</span>}
              </button>
            ))}
          </nav>

          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="h-8 border-t border-border-main flex items-center justify-center text-text-dim hover:text-text-main hover:bg-white/5 transition-colors shrink-0"
          >
            {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 bg-border-main grid overflow-hidden relative">
          <div 
            ref={scrollContainerRef}
            className="absolute inset-0 bg-bg-dark/40 backdrop-blur-[2px] overflow-y-auto custom-scrollbar"
          >
            <div className="h-full flex flex-col p-6">
              <div key="dashboard" className={cn("h-full", activeTool === 'dashboard' ? "block" : "hidden")}>
                <Dashboard onNavigate={setActiveTool} stats={{ activeScans, threatLevel, sessionTime }} />
              </div>
              <div key="ghost" className={cn("h-full", activeTool === 'ghost' ? "block" : "hidden")}>
                <GhostRouteTool />
              </div>
              <div key="wordlist" className={cn("h-full", activeTool === 'wordlist' ? "block" : "hidden")}>
                <WordlistTool onApply={setSharedWordlist} currentWordlist={sharedWordlist} />
              </div>
              <div key="openvas" className={cn("h-full", activeTool === 'openvas' ? "block" : "hidden")}>
                <OpenVASTool sharedWordlist={sharedWordlist} />
              </div>
              <div key="library" className={cn("h-full", activeTool === 'library' ? "block" : "hidden")}>
                <CommandLibrary />
              </div>
              <div key="recon" className={cn("h-full", activeTool === 'recon' ? "block" : "hidden")}>
                <ReconTool />
              </div>
              <div key="ai" className={cn("h-full", activeTool === 'ai' ? "block" : "hidden")}>
                <AIAnalyzer />
              </div>
              <div key="osint" className={cn("h-full", activeTool === 'osint' ? "block" : "hidden")}>
                <OsintTool sharedWordlist={sharedWordlist} />
              </div>
              <div key="fuzz" className={cn("h-full", activeTool === 'fuzz' ? "block" : "hidden")}>
                <FuzzingTool sharedWordlist={sharedWordlist} />
              </div>
              <div key="hydra" className={cn("h-full", activeTool === 'hydra' ? "block" : "hidden")}>
                <HydraTool sharedWordlist={sharedWordlist} />
              </div>
              <div key="Nikto" className={cn("h-full", activeTool === 'nikto' ? "block" : "hidden")}>
                <NiktoTool sharedWordlist={sharedWordlist} />
              </div>
              <div key="gobuster" className={cn("h-full", activeTool === 'gobuster' ? "block" : "hidden")}>
                <GobusterTool />
              </div>
              <div key="reconng" className={cn("h-full", activeTool === 'reconng' ? "block" : "hidden")}>
                <ReconNgTool />
              </div>
              <div key="metasploit" className={cn("h-full", activeTool === 'metasploit' ? "block" : "hidden")}>
                <MetasploitTool />
              </div>
              <div key="aircrack" className={cn("h-full", activeTool === 'aircrack' ? "block" : "hidden")}>
                <AircrackTool />
              </div>
              <div key="john" className={cn("h-full", activeTool === 'john' ? "block" : "hidden")}>
                <JohnRipperTool />
              </div>
              <div key="mimikatz" className={cn("h-full", activeTool === 'mimikatz' ? "block" : "hidden")}>
                <MimikatzTool />
              </div>
              <div key="medusa" className={cn("h-full", activeTool === 'medusa' ? "block" : "hidden")}>
                <MedusaTool sharedWordlist={sharedWordlist} />
              </div>
              <div key="kismet" className={cn("h-full", activeTool === 'kismet' ? "block" : "hidden")}>
                <KismetTool />
              </div>
              <div key="burp" className={cn("h-full", activeTool === 'burp' ? "block" : "hidden")}>
                <BurpSuiteTool />
              </div>
              <div key="injection" className={cn("h-full", activeTool === 'injection' ? "block" : "hidden")}>
                <InjectionTool />
              </div>
              <div key="real_terminal" className={cn("h-full", activeTool === 'real_terminal' ? "block" : "hidden")}>
                <RealTerminal />
              </div>
              <div key="anonymity" className={cn("h-full", activeTool === 'anonymity' ? "block" : "hidden")}>
                <AnonymityTool />
              </div>
              <div key="swift" className={cn("h-full", activeTool === 'swift' ? "block" : "hidden")}>
                <SwiftTool />
              </div>
              <div key="cloud" className={cn("h-full", activeTool === 'cloud' ? "block" : "hidden")}>
                <CloudAudit />
              </div>
              <div key="meta" className={cn("h-full", activeTool === 'meta' ? "block" : "hidden")}>
                <MetaExif />
              </div>
              <div key="breach" className={cn("h-full", activeTool === 'breach' ? "block" : "hidden")}>
                <BreachTool />
              </div>
              <div key="social" className={cn("h-full", activeTool === 'social' ? "block" : "hidden")}>
                <SocialEngTool />
              </div>
              <div key="combined" className={cn("h-full", activeTool === 'combined' ? "block" : "hidden")}>
                <CombinedAttacksTool />
              </div>
              <div key="dataviewer" className={cn("h-full", activeTool === 'dataviewer' ? "block" : "hidden")}>
                <DataViewerTool />
              </div>
            </div>
          </div>
        </main>
        
        {/* Right Sidebar */}
        <aside 
          className="w-[180px] lg:w-[220px] bg-surface/90 backdrop-blur-md border-l border-border-main flex flex-col shrink-0 overflow-hidden z-20"
        >
          <div className="h-10 flex items-center px-4 border-b border-border-main overflow-hidden">
            <span className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em]">Auxiliary</span>
          </div>
          <nav className="flex-1 py-2 space-y-0.5 overflow-y-auto custom-scrollbar">
            {rightNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTool(item.id as Tool)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-1.5 transition-all group text-left",
                  activeTool === item.id 
                    ? "bg-accent-blue/10 text-accent-blue border-r-2 border-accent-blue" 
                    : "text-text-dim hover:text-text-main hover:bg-white/5 border-r-2 border-transparent"
                )}
              >
                <item.icon className={cn("w-4 h-4 shrink-0", activeTool === item.id ? "text-accent-blue" : "text-text-dim group-hover:text-text-main")} />
                <span className="text-[13px] font-medium truncate">{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>
      </div>
    </div>
  );
}

