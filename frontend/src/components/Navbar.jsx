import React from 'react';
import { Activity, Radio, Play, Square, Eye, FileText, Cpu, Brain, Wifi, WifiOff, User, LogOut, Plus, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  isStreaming, 
  toggleStream, 
  latencyMs, 
  connectionStatus = 'connected',
  onOpenAddMerchant,
  onOpenManualTx
}) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-cyber-border bg-cyber-dark/95 backdrop-blur-md px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col xl:flex-row items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center justify-between w-full xl:w-auto">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-sky-500 to-indigo-600 shadow-lg shadow-sky-500/20">
              <Radio className="w-5 h-5 text-white animate-pulse" />
              <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-cyber-dark ${
                connectionStatus === 'connected' ? 'bg-emerald-400' : (connectionStatus === 'connecting' ? 'bg-amber-400 animate-ping' : 'bg-rose-500')
              }`}></div>
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

          {/* Mobile User badge */}
          {user && (
            <button
              onClick={logout}
              className="xl:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 bg-cyber-card/80 p-1 rounded-xl border border-cyber-border/80 overflow-x-auto max-w-full" aria-label="Main Navigation">
          <button
            onClick={() => setActiveTab('live')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
              activeTab === 'live'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Live Cockpit
          </button>
          
          <button
            onClick={() => setActiveTab('mystery')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
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
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
              activeTab === 'simulator'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            Attack Arena
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
              activeTab === 'ai'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            AI Brain &amp; Models
          </button>

          <button
            onClick={() => setActiveTab('sar')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
              activeTab === 'sar'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            SAR Studio
          </button>
        </nav>

        {/* Live Controls & Action Modals */}
        <div className="flex items-center gap-2.5">
          {/* Add Real Merchant Modal Trigger */}
          <button
            onClick={onOpenAddMerchant}
            title="Register new merchant entity into SQLite database"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-200 transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Add MID</span>
          </button>

          {/* Custom Transaction Injector Trigger */}
          <button
            onClick={onOpenManualTx}
            title="Inject custom telemetry and evaluate in real-time"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-200 transition-all"
          >
            <Send className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Test Wire</span>
          </button>

          {/* WS Status Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cyber-card border border-cyber-border text-xs font-mono">
            {connectionStatus === 'connected' ? (
              <Wifi className="w-3 h-3 text-emerald-400" />
            ) : (
              <WifiOff className="w-3 h-3 text-rose-400" />
            )}
            <span className={`font-semibold ${
              connectionStatus === 'connected' ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {connectionStatus.toUpperCase()}
            </span>
          </div>

          {/* User Account / Sign Out */}
          {user && (
            <div className="hidden xl:flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="text-right font-mono">
                <p className="text-[11px] font-bold text-white leading-none">{user.full_name?.split(' ')[0] || user.username}</p>
                <p className="text-[9px] text-sky-400 leading-none mt-0.5">{user.role}</p>
              </div>
              <button
                onClick={logout}
                title="Sign out of Trace Cockpit"
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-rose-400 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
