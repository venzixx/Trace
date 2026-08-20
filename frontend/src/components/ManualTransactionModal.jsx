import React, { useState } from 'react';
import { Send, X, ShieldAlert, Cpu, AlertCircle, CheckCircle } from 'lucide-react';
import { api } from '../services/api';

export default function ManualTransactionModal({ isOpen, onClose, merchants = [], onEvaluated }) {
  const [merchantId, setMerchantId] = useState(merchants[0]?.merchant_id || 'mid_herbals_4412');
  const [amount, setAmount] = useState('25000');
  const [itemName, setItemName] = useState('Casino Chips VIP Pack 5000');
  const [clientIp, setClientIp] = useState('185.220.101.42');
  const [rtt, setRtt] = useState('240');
  const [entropy, setEntropy] = useState('0.75');
  const [ja4Hash, setJa4Hash] = useState('t13d9999h0_666666666666_999999999999');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verdictResult, setVerdictResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  const handleEvaluate = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setVerdictResult(null);
    setIsSubmitting(true);
    try {
      const selectedMerchant = merchants.find(m => m.merchant_id === merchantId) || {
        merchant_id: merchantId,
        merchant_name: "Selected Merchant",
        claimed_mcc: "5977 - Cosmetic Stores",
        registered_category: "Retail Cosmetics"
      };

      const payload = {
        transaction_id: `pay_custom_${Math.random().toString(36).slice(2, 10)}`,
        merchant_id: selectedMerchant.merchant_id,
        merchant_name: selectedMerchant.merchant_name,
        claimed_mcc: selectedMerchant.claimed_mcc,
        registered_category: selectedMerchant.registered_category,
        amount_inr: parseFloat(amount) || 1000.0,
        currency: "INR",
        payment_method: "CARD",
        customer_id: "cust_manual_test",
        cart_item_count: 1,
        cart_items: [
          { name: itemName, category: "Custom Item", price: parseFloat(amount) || 1000.0 }
        ],
        device_user_agent: "Mozilla/5.0 Custom Test Probe",
        wire_telemetry: {
          client_ip: clientIp,
          server_ip: "52.66.191.144",
          tcp_rtt_ms: parseFloat(rtt) || 35.0,
          ttl_hops: 52,
          ja4_fingerprint: ja4Hash,
          tls_cipher_suite: "TLS_AES_128_GCM_SHA256",
          tls_version: "TLSv1.3",
          asn_org: "Offshore Cloud Node",
          asn_type: parseFloat(rtt) > 180 ? "Datacenter" : "Residential",
          cisco_splt_entropy: parseFloat(entropy) || 2.5,
          packet_burst_rate: 15.0,
          http2_header_order_hash: "h2_manual_probe",
          is_proxy_or_vpn: parseFloat(rtt) > 180
        }
      };

      const verdict = await api.analyzeTransaction(payload);
      setVerdictResult(verdict);
      if (onEvaluated) onEvaluated({ transaction: payload, verdict });
    } catch (err) {
      setErrorMsg(err.message || "Failed to analyze custom transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl custom-glass border border-cyber-border p-6 space-y-5 relative shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold font-mono text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-purple-400" /> CUSTOM WIRE TRANSACTION SANDBOX
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Construct and inject custom Layer 4/7 wire telemetry and cart payloads directly into the live Risk Engine.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleEvaluate} className="space-y-4 font-mono text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 mb-1 font-semibold">Target Merchant</label>
              <select
                value={merchantId}
                onChange={(e) => setMerchantId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
              >
                {merchants.map(m => (
                  <option key={m.merchant_id} value={m.merchant_id}>
                    {m.merchant_name} ({m.claimed_mcc})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-semibold">Transaction Amount (₹)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-semibold">Cart Item Name</label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g. Casino Chips / Neem Soap / GPU Server"
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 mb-1 font-semibold">Client IP</label>
              <input
                type="text"
                value={clientIp}
                onChange={(e) => setClientIp(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-semibold">TCP RTT (ms)</label>
              <input
                type="number"
                value={rtt}
                onChange={(e) => setRtt(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-semibold">SPLT Entropy</label>
              <input
                type="number"
                step="0.05"
                value={entropy}
                onChange={(e) => setEntropy(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-semibold">JA4 TLS Fingerprint</label>
            <input
              type="text"
              value={ja4Hash}
              onChange={(e) => setJa4Hash(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              {isSubmitting ? 'EVALUATING IN REAL-TIME...' : 'INJECT & EVALUATE'}
            </button>
          </div>
        </form>

        {/* Live Evaluation Result */}
        {verdictResult && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-white">DECISION VERDICT:</span>
              <span className={`px-2.5 py-1 rounded font-bold text-xs ${
                verdictResult.action === 'ALLOW' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                (verdictResult.action === 'STEP_UP_3DS' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                (verdictResult.action === 'SETTLEMENT_HOLD' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'))
              }`}>
                {verdictResult.action} ({verdictResult.threat_category})
              </span>
            </div>

            <p className="text-slate-300">{verdictResult.summary_text}</p>
            <div className="flex items-center gap-4 text-[11px] text-slate-400">
              <span>Overall: <strong className="text-white">{verdictResult.overall_risk_score}/100</strong></span>
              <span>Wire: <strong className="text-sky-400">{verdictResult.wire_risk_score}/100</strong></span>
              <span>Latency: <strong className="text-emerald-400">{verdictResult.processing_latency_ms} ms</strong></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
