import React from 'react';
import { Activity, ShieldCheck, Radio, AlertTriangle, Play, Square, Eye, FileText, Cpu } from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  isStreaming, 
  toggleStream, 
  scenario, 
  setScenario, 
  latencyMs, 
  threatCount 
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-cyber-border bg-cyber-dark/95 backdrop-blur-md px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-sky-500 to-indigo-600 shadow-lg shadow-sky-500/20">
            <Radio className="w-5 h-5 text-white animate-pulse" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-cyber-dark"></div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5 font-mono">
                TRACE <span className="text-xs px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-400 border border-sky-500/30">L4/L7 WIRE AI</span>
              </h1>
            </div>
            <p className="text-xs text-slate-400">Autonomous Wire-Telemetry &amp; Chameleon Risk Engine</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 bg-cyber-card/80 p-1 rounded-xl border border-cyber-border/80">
          <button
            onClick={() => setActiveTab('live')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'live'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Live Wire Stream
          </button>
          
          <button
            onClick={() => setActiveTab('mystery')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'mystery'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Chameleon Unmasker
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'simulator'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            Attack Simulator
          </button>

          <button
            onClick={() => setActiveTab('sar')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'sar'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Regulatory SAR Studio
          </button>
        </nav>

        {/* Live Controls & Telemetry Stats */}
        <div className="flex items-center gap-3">
          {/* Latency Pill */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyber-card border border-cyber-border text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-slate-400">ENGINE:</span>
            <span className="text-emerald-400 font-semibold">{latencyMs || '0.12'} ms</span>
          </div>

          {/* Stream Toggle Button */}
          <button
            onClick={toggleStream}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all shadow-md ${
              isStreaming
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                : 'bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 shadow-emerald-500/20'
            }`}
          >
            {isStreaming ? (
              <>
                <Square className="w-3.5 h-3.5 fill-rose-300" />
                PAUSE FEED
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                START LIVE WIRE
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
