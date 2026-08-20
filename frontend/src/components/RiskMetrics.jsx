import React from 'react';
import { ShieldAlert, Zap, Globe, DollarSign, Lock, AlertOctagon } from 'lucide-react';

export default function RiskMetrics({ stats }) {
  const defaultStats = {
    totalEvaluated: 1420,
    blockedLaunderingInr: 4850000,
    avgLatencyMs: 0.11,
    activeQuarantines: 3,
    frictionBreakdown: {
      allow: 88,
      stepUp: 7,
      hold: 3,
      block: 2
    },
    ...stats
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {/* Metric 1: Fast-Path Wire Latency */}
      <div className="p-4 rounded-xl custom-glass flex items-center justify-between border-l-4 border-l-sky-500">
        <div>
          <p className="text-xs text-slate-400 font-medium">Fast-Path Decision Latency</p>
          <p className="text-2xl font-bold font-mono text-white mt-1">
            {defaultStats.avgLatencyMs} <span className="text-xs text-sky-400 font-normal">ms</span>
          </p>
          <p className="text-[11px] text-emerald-400 mt-0.5 flex items-center gap-1 font-mono">
            <Zap className="w-3 h-3" /> Sub-1ms Real-time wire
          </p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-sky-500/10 flex items-center justify-center border border-sky-500/20">
          <Zap className="w-5 h-5 text-sky-400" />
        </div>
      </div>

      {/* Metric 2: Blocked Laundering Volume */}
      <div className="p-4 rounded-xl custom-glass flex items-center justify-between border-l-4 border-l-rose-500">
        <div>
          <p className="text-xs text-slate-400 font-medium">Laundering Volume Shielded</p>
          <p className="text-2xl font-bold font-mono text-white mt-1">
            ₹{(defaultStats.blockedLaunderingInr / 100000).toFixed(2)} <span className="text-xs text-rose-400 font-normal">Lakh</span>
          </p>
          <p className="text-[11px] text-rose-400 mt-0.5 flex items-center gap-1 font-mono">
            <Lock className="w-3 h-3" /> Escrow &amp; Key Revocation
          </p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
          <ShieldAlert className="w-5 h-5 text-rose-400" />
        </div>
      </div>

      {/* Metric 3: Quarantined Chameleon Merchants */}
      <div className="p-4 rounded-xl custom-glass flex items-center justify-between border-l-4 border-l-amber-500">
        <div>
          <p className="text-xs text-slate-400 font-medium">Quarantined Cloaked MIDs</p>
          <p className="text-2xl font-bold font-mono text-white mt-1">
            {defaultStats.activeQuarantines} <span className="text-xs text-amber-400 font-normal">Entities</span>
          </p>
          <p className="text-[11px] text-amber-400 mt-0.5 flex items-center gap-1 font-mono">
            <AlertOctagon className="w-3 h-3" /> Unmasked by AI Shopper
          </p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
          <Globe className="w-5 h-5 text-amber-400" />
        </div>
      </div>

      {/* Metric 4: Adaptive Friction Policy Split */}
      <div className="p-4 rounded-xl custom-glass flex flex-col justify-between border-l-4 border-l-emerald-500">
        <div className="flex justify-between items-center">
          <p className="text-xs text-slate-400 font-medium">Adaptive Friction Matrix</p>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
            {defaultStats.frictionBreakdown.allow}% 1-Click
          </span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-2 mt-3 flex overflow-hidden">
          <div style={{ width: `${defaultStats.frictionBreakdown.allow}%` }} className="bg-emerald-500 h-full" title="Allow"></div>
          <div style={{ width: `${defaultStats.frictionBreakdown.stepUp}%` }} className="bg-amber-500 h-full" title="Step-Up 3DS"></div>
          <div style={{ width: `${defaultStats.frictionBreakdown.hold}%` }} className="bg-purple-500 h-full" title="Settlement Hold"></div>
          <div style={{ width: `${defaultStats.frictionBreakdown.block}%` }} className="bg-rose-500 h-full" title="Block"></div>
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
          <span className="text-emerald-400">● Allow</span>
          <span className="text-amber-400">● 3DS</span>
          <span className="text-purple-400">● Hold</span>
          <span className="text-rose-400">● Block</span>
        </div>
      </div>
    </div>
  );
}
