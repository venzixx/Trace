import React, { useState } from 'react';
import { Cpu, Zap, ShieldAlert, AlertTriangle, ShieldCheck, Play, Square, Settings2, Sliders, Activity } from 'lucide-react';

export default function AttackSimulatorPage({ onLaunchScenario, activeScenario, isStreaming, onToggleStream }) {
  const [selectedScenario, setSelectedScenario] = useState(activeScenario || 'MIXED');

  const scenarios = [
    {
      id: "CLEAN",
      title: "1. Clean Domestic Indian Merchant",
      subtitle: "Jaipur Handloom Crafts (MCC 5949)",
      description: "Authentic Indian retail shopper on Jio/Airtel 5G. 24ms domestic RTT, authentic Chrome JA4 handshake, matching catalog line items.",
      expectedAction: "1-CLICK ALLOW (0-Friction)",
      actionBadgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      threatType: "CLEAN",
      icon: ShieldCheck,
      iconColor: "text-emerald-400"
    },
    {
      id: "CLOAKED",
      title: "2. Cloaked Casino Laundering",
      subtitle: "Pure Herbals Organics (MCC 5977 → 7995)",
      description: "Transaction laundering via cloaked reverse proxy. 242ms offshore RTT anomaly, proxy JA4 hash, high-ticket casino chip purchase disguised as organic soap.",
      expectedAction: "BLOCK & QUARANTINE",
      actionBadgeClass: "bg-rose-500/20 text-rose-300 border-rose-500/30",
      threatType: "CHAMELEON_CLOAKING",
      icon: ShieldAlert,
      iconColor: "text-rose-400"
    },
    {
      id: "BOT_SWARM",
      title: "3. Distributed Bot Swarm & Carding",
      subtitle: "QuickCoffee Express (MCC 5814)",
      description: "Automated headless card-testing probe from Datacenter VPS. Zero SPLT packet entropy, 48 req/sec burst velocity, Go-client JA4 signature.",
      expectedAction: "STEP-UP 3DS / BLOCK",
      actionBadgeClass: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      threatType: "BOT_SWARM_TESTING",
      icon: Zap,
      iconColor: "text-amber-400"
    },
    {
      id: "BUST_OUT",
      title: "4. Sleeper Merchant Bust-Out",
      subtitle: "Apex IT Solutions (MCC 5732)",
      description: "60-day dormant merchant suddenly processing ₹3,50,000 enterprise orders at 3:15 AM before vanishing prior to chargeback liability.",
      expectedAction: "SETTLEMENT ESCROW HOLD",
      actionBadgeClass: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      threatType: "MERCHANT_BUST_OUT",
      icon: AlertTriangle,
      iconColor: "text-purple-400"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-xl custom-glass border border-cyber-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-6 h-6 text-purple-400" />
            <h2 className="text-lg font-bold font-mono text-white">
              ADVERSARIAL FRAUD ATTACK SIMULATION ARENA
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Simulate sophisticated financial attack vectors directly against the Trace Risk Engine. Test Layer 4/7 wire packet inspection, ML anomaly scoring, and dynamic friction policy enforcement.
          </p>
        </div>

        {/* Global Stream Switch */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={onToggleStream}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold font-mono tracking-wide transition-all shadow-lg ${
              isStreaming
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-emerald-500/20'
            }`}
          >
            {isStreaming ? (
              <>
                <Square className="w-4 h-4 fill-rose-300" />
                PAUSE SIMULATION STREAM
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-slate-950" />
                START SIMULATION STREAM
              </>
            )}
          </button>
        </div>
      </div>

      {/* Scenario Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {scenarios.map((sc) => {
          const Icon = sc.icon;
          const isCurrentActive = isStreaming && activeScenario === sc.id;

          return (
            <div
              key={sc.id}
              className={`p-6 rounded-xl border transition-all flex flex-col justify-between ${
                isCurrentActive
                  ? 'border-purple-500/60 bg-purple-950/20 shadow-xl shadow-purple-500/10'
                  : 'custom-glass border-cyber-border hover:border-slate-700'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <Icon className={`w-6 h-6 ${sc.iconColor}`} />
                    </div>
                    <div>
                      <h3 className="font-mono text-sm font-bold text-white">{sc.title}</h3>
                      <p className="text-xs text-slate-400 font-mono">{sc.subtitle}</p>
                    </div>
                  </div>
                  {isCurrentActive && (
                    <span className="px-2.5 py-1 rounded bg-purple-500/20 text-purple-300 text-[10px] font-mono font-bold animate-pulse border border-purple-500/40">
                      ACTIVE STREAM
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-sans">{sc.description}</p>

                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Risk Policy Action:</span>
                  <span className={`px-2.5 py-1 rounded font-bold border ${sc.actionBadgeClass}`}>
                    {sc.expectedAction}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedScenario(sc.id);
                  onLaunchScenario(sc.id);
                }}
                className={`mt-5 w-full py-2.5 px-4 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
                  isCurrentActive
                    ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/20'
                    : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                }`}
              >
                <Play className="w-3.5 h-3.5" />
                {isCurrentActive ? 'STREAMING THIS SCENARIO' : `LAUNCH THIS ATTACK`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
