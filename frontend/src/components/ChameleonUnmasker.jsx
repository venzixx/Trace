import React, { useState } from 'react';
import { Eye, Sparkles, AlertOctagon, Terminal, CheckCircle, FileText, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function ChameleonUnmasker({ merchants = [], onNavigateToSAR }) {
  const [selectedMerchant, setSelectedMerchant] = useState(merchants[0] || null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [evidence, setEvidence] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Keep selectedMerchant synced with merchants prop if not yet selected
  React.useEffect(() => {
    if (!selectedMerchant && merchants.length > 0) {
      setSelectedMerchant(merchants[0]);
    }
  }, [merchants, selectedMerchant]);

  const handleRunAudit = async () => {
    if (!selectedMerchant) return;
    setIsAuditing(true);
    setEvidence(null);
    setErrorMsg(null);
    try {
      const data = await api.runMysteryShop(selectedMerchant.merchant_id, selectedMerchant.website_url);
      setEvidence(data);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to execute mystery shopping investigation. Please check backend connection.");
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Control Banner */}
      <div className="p-6 rounded-xl custom-glass border border-cyber-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold font-mono text-white">
              CHAMELEON MERCHANT &amp; CLOAKING UNMASKER
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Autonomous adversarial crawler that bypasses bot-detection cloaking by simulating real consumer referral channels, unmasking hidden transaction laundering and MCC violations.
          </p>
        </div>

        {/* Merchant Dropdown & Run Button */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <label htmlFor="merchant-select" className="sr-only">Select Monitored Merchant</label>
          <select
            id="merchant-select"
            aria-label="Select Monitored Merchant"
            value={selectedMerchant?.merchant_id || ''}
            onChange={(e) => {
              const m = merchants.find(item => item.merchant_id === e.target.value);
              setSelectedMerchant(m);
              setEvidence(null);
              setErrorMsg(null);
            }}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2.5 font-mono focus:outline-none focus:border-amber-500"
          >
            {merchants.map(m => (
              <option key={m.merchant_id} value={m.merchant_id}>
                {m.merchant_name} ({m.threat})
              </option>
            ))}
          </select>

          <button
            onClick={handleRunAudit}
            disabled={isAuditing || !selectedMerchant}
            aria-label="Audit Merchant Storefront"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 shrink-0"
          >
            <Sparkles className={`w-4 h-4 ${isAuditing ? 'animate-spin' : ''}`} />
            {isAuditing ? 'DEPLOYING AGENTS...' : 'AUDIT STOREFRONT'}
          </button>
        </div>
      </div>

      {/* Error State */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300 font-mono text-xs">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* When Evidence is Available */}
      {evidence && (
        <div className="space-y-6">
          {/* Top Alert Banner */}
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 shrink-0">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-mono text-rose-300 flex items-center gap-2">
                  TRANSACTION LAUNDERING DETECTED: {evidence.mcc_violation_code}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">{evidence.diff_summary}</p>
              </div>
            </div>

            <button
              onClick={() => onNavigateToSAR && onNavigateToSAR(selectedMerchant?.merchant_id)}
              aria-label="View Auto-SAR Dossier"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold shadow-md transition-all shrink-0"
            >
              <FileText className="w-3.5 h-3.5" />
              VIEW AUTO-SAR DOSSIER
            </button>
          </div>

          {/* Side-by-Side Visual Storefront Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: What Compliance Sees (Façade) */}
            <div className="rounded-xl custom-glass border border-emerald-500/30 overflow-hidden">
              <div className="px-4 py-3 bg-emerald-950/40 border-b border-emerald-500/30 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" /> 1. CLAIMED FAÇADE (Compliance Bot View)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                  MCC 5977 (Cosmetics)
                </span>
              </div>
              <div className="p-5 space-y-4">
                <div className="rounded-lg bg-slate-950 border border-slate-800 p-4 font-mono text-xs space-y-2">
                  <p className="text-slate-400">Merchant: <span className="text-white font-semibold">{evidence.facade_claimed_business}</span></p>
                  <p className="text-slate-400">Observed Products: <span className="text-emerald-400 font-semibold">Organic Neem &amp; Jasmine Handmade Soaps</span></p>
                  <p className="text-slate-400">Claimed Ticket Size: <span className="text-slate-200">₹399.00</span></p>
                  <p className="text-slate-400">Response Code: <span className="text-emerald-400">200 OK (Clean DOM)</span></p>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-400 text-xs">
                  <p className="text-[11px] font-mono text-emerald-300">✓ Passes static web crawlers &amp; superficial KYC review.</p>
                </div>
              </div>
            </div>

            {/* Right: What Real Users / Fraudsters See (Unmasked) */}
            <div className="rounded-xl custom-glass border border-rose-500/40 overflow-hidden">
              <div className="px-4 py-3 bg-rose-950/40 border-b border-rose-500/40 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-rose-400 flex items-center gap-1.5">
                  <AlertOctagon className="w-3.5 h-3.5" /> 2. UNMASKED ROGUE STOREFRONT (Real Buyer View)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono">
                  MCC 7995 (Illegal Casino)
                </span>
              </div>
              <div className="p-5 space-y-4">
                <div className="rounded-lg bg-slate-950 border border-slate-800 p-4 font-mono text-xs space-y-2">
                  <p className="text-slate-400">Unmasked Endpoint: <span className="text-rose-400 font-semibold truncate block">{evidence.unmasked_url}</span></p>
                  <p className="text-slate-400">Actual Operations: <span className="text-rose-300 font-semibold">{evidence.actual_detected_business}</span></p>
                  <p className="text-slate-400">Actual Checkout Amount: <span className="text-rose-400 font-bold">₹10,000.00 - ₹50,000.00</span></p>
                  <p className="text-slate-400">Payment Rails: <span className="text-amber-400 font-mono">{evidence.detected_payment_rails.join(', ')}</span></p>
                </div>
                <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-900 text-rose-300 text-xs">
                  <p className="text-[11px] font-mono">🚨 Unmasked via adversarial Telegram referral header &amp; dynamic DOM mutation intercept.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Audit Phase Timeline */}
          <div className="rounded-xl custom-glass border border-cyber-border p-5">
            <h4 className="text-xs font-mono font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-sky-400" /> Multi-Agent Adversarial Mystery Shopping Timeline
            </h4>
            <div className="space-y-3 font-mono text-xs">
              {evidence.audit_trail.map((step, idx) => (
                <div key={`${step.phase}-${idx}`} className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-sky-400 font-semibold">
                    <span>{step.phase}</span>
                    <span className="text-[10px] text-slate-500 font-normal">{step.persona}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{step.headers}</p>
                  <p className={`text-xs ${step.observation.includes('UNMASKED') ? 'text-rose-400 font-bold' : 'text-slate-300'}`}>
                    {step.observation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
