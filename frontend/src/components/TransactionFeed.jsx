import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, Lock, ArrowUpRight, CheckCircle2, XCircle } from 'lucide-react';

export default function TransactionFeed({ transactions, selectedTx, onSelectTx }) {
  const getActionBadge = (action) => {
    switch (action) {
      case 'ALLOW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" /> 1-CLICK ALLOW
          </span>
        );
      case 'STEP_UP_3DS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3" /> STEP-UP 3DS
          </span>
        );
      case 'SETTLEMENT_HOLD':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <Lock className="w-3 h-3" /> ESCROW HOLD
          </span>
        );
      case 'BLOCK_QUARANTINE':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <XCircle className="w-3 h-3" /> QUARANTINE
          </span>
        );
    }
  };

  return (
    <div className="rounded-xl custom-glass border border-cyber-border overflow-hidden flex flex-col h-[560px]">
      {/* Feed Header */}
      <div className="px-5 py-3.5 border-b border-cyber-border bg-cyber-card/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>
          <span className="font-mono text-xs font-semibold text-white tracking-wide">
            REAL-TIME PAYMENT INGRESS STREAM ({transactions.length})
          </span>
        </div>
        <span className="text-[11px] font-mono text-slate-400">Click transaction to inspect wire packets</span>
      </div>

      {/* Transactions List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 font-mono text-xs">
        {transactions.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p>No transactions captured yet.</p>
            <p className="text-[11px] mt-1 text-slate-600">Click 'START LIVE WIRE' to stream live gateway traffic.</p>
          </div>
        ) : (
          transactions.map((item, idx) => {
            const tx = item.transaction;
            const verdict = item.verdict;
            const isSelected = selectedTx?.transaction_id === tx.transaction_id;

            return (
              <div
                key={tx.transaction_id || idx}
                onClick={() => onSelectTx(item)}
                className={`p-4 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-sky-500/10 border-l-4 border-l-sky-500'
                    : 'hover:bg-slate-800/40 border-l-4 border-l-transparent'
                }`}
              >
                {/* Left: ID & Merchant */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sky-400 font-semibold">{tx.transaction_id}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {tx.payment_method}
                    </span>
                    <span className="text-[10px] text-slate-500">{new Date(tx.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300 text-xs font-sans">
                    <span className="font-medium text-white">{tx.merchant_name}</span>
                    <span className="text-slate-500 text-[11px]">({tx.claimed_mcc})</span>
                  </div>
                </div>

                {/* Right: Amount, Risk Score & Action Badge */}
                <div className="flex items-center gap-4 self-end sm:self-auto">
                  <div className="text-right">
                    <p className="font-bold text-white text-sm font-mono">₹{tx.amount_inr?.toLocaleString('en-IN')}</p>
                    <p className={`text-[10px] font-mono ${
                      verdict.overall_risk_score > 70 ? 'text-rose-400' : (verdict.overall_risk_score > 30 ? 'text-amber-400' : 'text-emerald-400')
                    }`}>
                      Risk Score: {verdict.overall_risk_score}/100
                    </p>
                  </div>

                  <div className="min-w-[130px] flex justify-end">
                    {getActionBadge(verdict.action)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
