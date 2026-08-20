import React, { useState } from 'react';
import { Icon } from '@iconify/react';
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
        merchant_id: merchantId || "mid_custom_test",
        merchant_name: "Monitored Online Store",
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
      const combined = {
        type: "TRANSACTION_EVENT",
        transaction: payload,
        verdict: verdict
      };

      setVerdictResult(verdict);
      if (onEvaluated) onEvaluated(combined);
    } catch (err) {
      setErrorMsg(err.message || "Failed to analyze transaction payload");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl rounded-3xl custom-glass border border-slate-800 p-6 space-y-5 relative shadow-2xl my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <Icon icon="solar:close-circle-bold-duotone" className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Icon icon="solar:plain-bold-duotone" className="w-5 h-5 text-indigo-400" /> TEST CUSTOM WIRE PACKET &amp; CHECKOUT
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Simulate a live payment with custom network wire metrics (TCP RTT, JA4, SPLT entropy) and cart items.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 font-mono">
            <Icon icon="solar:shield-warning-bold-duotone" className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleEvaluate} className="space-y-4">
          {/* Top Row: Merchant & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Target Online Store</label>
              <select
                value={merchantId}
                onChange={(e) => setMerchantId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                {merchants.length > 0 ? (
                  merchants.map(m => (
                    <option key={m.merchant_id} value={m.merchant_id}>
                      {m.merchant_name} ({m.claimed_mcc?.split('-')[0]})
                    </option>
                  ))
                ) : (
                  <option value="mid_test_store">Default Test Store (MCC 5977)</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Payment Amount (INR)</label>
              <input
                type="number"
                required
                placeholder="25000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Cart Item Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Cart Item Title (Semantic Audit)</label>
            <input
              type="text"
              required
              placeholder="e.g. Casino Chips VIP Pack 5000 or Neem Soap Bar"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Layer 4/7 Wire Metrics Box */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-sky-400 font-mono flex items-center gap-1.5">
              <Icon icon="solar:bolt-bold-duotone" className="w-3.5 h-3.5" /> Layer 4/7 Wire-Telemetry Simulation
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">TCP RTT (ms)</label>
                <input
                  type="number"
                  value={rtt}
                  onChange={(e) => setRtt(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Cisco SPLT Entropy</label>
                <input
                  type="number"
                  step="0.05"
                  value={entropy}
                  onChange={(e) => setEntropy(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Client IP</label>
                <input
                  type="text"
                  value={clientIp}
                  onChange={(e) => setClientIp(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-500 mb-1">JA4+ Client TLS Fingerprint</label>
              <input
                type="text"
                value={ja4Hash}
                onChange={(e) => setJa4Hash(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
              />
            </div>
          </div>

          {/* Result Alert if Evaluated */}
          {verdictResult && (
            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">AI Verdict:</span>
                <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 font-mono">
                  {verdictResult.action}
                </span>
              </div>
              <p className="text-xs text-slate-300">{verdictResult.summary_text}</p>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-semibold"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-2"
            >
              <Icon icon="solar:plain-bold-duotone" className="w-3.5 h-3.5" />
              {isSubmitting ? 'Evaluating AI...' : 'Send Wire Test & Evaluate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
