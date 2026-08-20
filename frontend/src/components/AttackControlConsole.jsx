import React from 'react';
import { ShieldCheck, ShieldAlert, Cpu, Zap, Radio, AlertTriangle, Layers, Play } from 'lucide-react';

export default function AttackControlConsole({ onLaunchScenario, activeScenario, isStreaming }) {
  const scenarios = [
    {
      id: "CLEAN",
      title: "1. Clean Domestic Merchant",
      subtitle: "Jaipur Handloom Crafts (MCC 5949)",
      description: "Authentic Indian retail customer on Jio/Airtel 5G. 24ms domestic RTT, authentic Chrome JA4 handshake, matching catalog line items.",
      expectedAction: "1-CLICK ALLOW (0-Friction)",
      actionBadgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      icon: ShieldCheck,
      iconColor: "text-emerald-400"
    },
    {
      id: "CLOAKED",
      title: "2. Cloaked Casino Laundering",
      subtitle: "Pure Herbals Organics (MCC 5977 -> 7995)",
      description: "Transaction laundering via cloaked reverse proxy. 242ms offshore RTT anomaly, proxy JA4 hash, high-ticket casino chip purchase.",
      expectedAction: "BLOCK & QUARANTINE",
      actionBadgeClass: "bg-rose-500/20 text-rose-300 border-rose-500/30",
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
      icon: Zap,
      iconColor: "text-amber-400"
    },
    {
      id: "BUST_OUT",
      title: "4. Sleeper Merchant Bust-Out",
      subtitle: "Apex IT Solutions (MCC 5732)",
      description: "60-day dormant merchant suddenly processing ₹3,50,000 enterprise orders at 3:15 AM before vanishing prior to chargebacks.",
      expectedAction: "SETTLEMENT ESCROW HOLD",
      actionBadgeClass: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      icon: AlertTriangle,
      iconColor: "text-purple-400"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-xl custom-glass border border-cyber-border">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-bold font-mono text-white">
            INTERACTIVE FRAUD ATTACK SIMULATOR
          </h2>
        </div>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl">
          Launch live attack vectors against the Trace Risk Engine to test real-time Layer 4/7 packet telemetry interception, dynamic friction enforcement, and automated merchant quarantining.
        </p>
      </div>

      {/* Scenario Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {scenarios.map((sc) => {
          const Icon = sc.icon;
          const isCurrentActive = isStreaming && activeScenario === sc.id;

          return (
            <div
              key={sc.id}
              className={`p-5 rounded-xl border transition-all flex flex-col justify-between ${
                isCurrentActive
                  ? 'border-purple-500/60 bg-purple-950/20 shadow-lg shadow-purple-500/10'
                  : 'custom-glass border-cyber-border hover:border-slate-700'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <Icon className={`w-5 h-5 ${sc.iconColor}`} />
                    </div>
                    <div>
                      <h3 className="font-mono text-sm font-bold text-white">{sc.title}</h3>
                      <p className="text-xs text-slate-400">{sc.subtitle}</p>
                    </div>
                  </div>
                  {isCurrentActive && (
                    <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-mono font-bold animate-pulse">
                      STREAMING LIVE
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-sans">{sc.description}</p>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Policy Verdict:</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${sc.actionBadgeClass}`}>
                    {sc.expectedAction}
                  </span>
                </div>
              </div>

              <button
                onClick={() => onLaunchScenario(sc.id)}
                className={`mt-4 w-full py-2.5 px-4 rounded-lg font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
                  isCurrentActive
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                }`}
              >
                <Play className="w-3.5 h-3.5" />
                {isCurrentActive ? 'SWITCH FEED' : `LAUNCH SCENARIO`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
