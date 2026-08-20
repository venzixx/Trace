import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';

export default function DocsArchitecture() {
  const [activeDocTab, setActiveDocTab] = useState('pipeline'); // pipeline, l4l7, ml, gemini, mystery, regulatory

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl custom-glass border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Icon icon="solar:book-bookmark-bold-duotone" className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              TRACE SYSTEM ARCHITECTURE &amp; WORKFLOW
            </h2>
          </div>
        </div>

        {/* Documentation Section Navigation */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-900 border border-slate-800 overflow-x-auto max-w-full scrollbar-none">
          <button
            onClick={() => setActiveDocTab('pipeline')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeDocTab === 'pipeline' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Icon icon="solar:layers-bold-duotone" className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>
          <button
            onClick={() => setActiveDocTab('l4l7')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeDocTab === 'l4l7' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Icon icon="solar:bolt-bold-duotone" className="w-3.5 h-3.5" />
            <span>Wire Telemetry</span>
          </button>
          <button
            onClick={() => setActiveDocTab('ml')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeDocTab === 'ml' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Icon icon="solar:cpu-bolt-bold-duotone" className="w-3.5 h-3.5" />
            <span>ML Engine</span>
          </button>
          <button
            onClick={() => setActiveDocTab('gemini')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeDocTab === 'gemini' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Icon icon="solar:sparkles-bold-duotone" className="w-3.5 h-3.5 text-amber-300" />
            <span>Gemini LLM</span>
          </button>
          <button
            onClick={() => setActiveDocTab('mystery')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeDocTab === 'mystery' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Icon icon="solar:shop-2-bold-duotone" className="w-3.5 h-3.5" />
            <span>Store Hunter</span>
          </button>
          <button
            onClick={() => setActiveDocTab('regulatory')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeDocTab === 'regulatory' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Icon icon="solar:document-text-bold-duotone" className="w-3.5 h-3.5" />
            <span>SAR Reports</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: END-TO-END PIPELINE & LATENCY BENCHMARK */}
      {activeDocTab === 'pipeline' && (
        <div className="space-y-8">
          {/* Main Visual Flow Graph */}
          <div className="p-6 md:p-8 rounded-3xl custom-glass border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-indigo-400 font-bold">DUAL-SPEED ARCHITECTURE</span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  End-to-End Real-Time Ingress &amp; Forensic Flow
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  ⚡ 0.09ms Fast-Path
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  🔍 Async Gemini Deep-Audit
                </span>
              </div>
            </div>

            {/* Visual Interactive Pipeline Graph Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
              {/* Node 1 */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 relative hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 font-bold text-xs flex items-center justify-center font-mono">01</span>
                  <Icon icon="solar:radar-2-bold-duotone" className="w-4 h-4 text-sky-400 animate-pulse" />
                </div>
                <h4 className="font-bold text-xs text-white">Payment Ingress</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Extracts TCP 3-way handshake, TLS Client Hello packet, IP header, and encrypted checkout payload.
                </p>
                <div className="pt-2 border-t border-slate-800 text-[10px] font-mono text-sky-400">
                  Latency: 0.00 ms (Zero Overhead)
                </div>
              </div>

              {/* Node 2 */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-indigo-500/40 space-y-3 relative shadow-lg shadow-indigo-500/10 hover:border-indigo-400 transition-all">
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 font-bold text-xs flex items-center justify-center font-mono">02</span>
                  <Icon icon="solar:bolt-bold-duotone" className="w-4 h-4 text-indigo-400" />
                </div>
                <h4 className="font-bold text-xs text-indigo-300">Fast-Path Wire Engine</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Computes JA4+ TLS fingerprint, calculates Cisco SPLT entropy, and tests TCP RTT for offshore proxy relays.
                </p>
                <div className="pt-2 border-t border-slate-800 text-[10px] font-mono text-emerald-400">
                  Latency: 0.09 ms (Sub-1ms)
                </div>
              </div>

              {/* Node 3 */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-purple-500/40 space-y-3 relative shadow-lg shadow-purple-500/10 hover:border-purple-400 transition-all">
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 font-bold text-xs flex items-center justify-center font-mono">03</span>
                  <Icon icon="solar:cpu-bolt-bold-duotone" className="w-4 h-4 text-purple-400" />
                </div>
                <h4 className="font-bold text-xs text-purple-300">Multi-Tier AI Matrix</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Isolation Forest ML outlier scoring + NLP Semantic MCC check + Async Google Gemini 1.5 Flash Deep Forensic Audit.
                </p>
                <div className="pt-2 border-t border-slate-800 text-[10px] font-mono text-purple-300">
                  Model: IsolationForest + Gemini
                </div>
              </div>

              {/* Node 4 */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-emerald-500/40 space-y-3 relative shadow-lg shadow-emerald-500/10 hover:border-emerald-400 transition-all">
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center font-mono">04</span>
                  <Icon icon="solar:shield-check-bold-duotone" className="w-4 h-4 text-emerald-400" />
                </div>
                <h4 className="font-bold text-xs text-emerald-300">Adaptive Friction Matrix</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Dispatches ALLOW (1-Click), STEP-UP 3DS (OTP), SETTLEMENT HOLD (Escrow), or BLOCK &amp; QUARANTINE.
                </p>
                <div className="pt-2 border-t border-slate-800 text-[10px] font-mono text-emerald-300">
                  Action: Real-Time Enforcement
                </div>
              </div>
            </div>

            {/* High-Resolution Latency Comparison Graph */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <Icon icon="solar:pulse-2-bold-duotone" className="w-4 h-4 text-sky-400" /> Latency Benchmark: Trace vs Legacy Cloud WAF
                </span>
                <span className="text-xs font-mono text-emerald-400">99.96% Faster Decision Time</span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                {/* Trace bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span className="font-bold text-indigo-400">Trace Sub-1ms Fast-Path Wire Engine</span>
                    <span className="text-emerald-400 font-bold">0.09 ms</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden p-0.5 border border-slate-800">
                    <div className="bg-gradient-to-r from-indigo-500 to-sky-400 h-full rounded-full w-[1.5%]"></div>
                  </div>
                </div>

                {/* Legacy WAF bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>Legacy Cloud WAF + Decrypted HTTP JSON Parser</span>
                    <span className="text-rose-400">220.00 ms - 450.00 ms</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden p-0.5 border border-slate-800">
                    <div className="bg-gradient-to-r from-rose-500 to-amber-500 h-full rounded-full w-[95%]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: L4/L7 WIRE TELEMETRY DEEP-DIVE */}
      {activeDocTab === 'l4l7' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: JA4+ */}
            <div className="p-6 rounded-3xl custom-glass border border-sky-500/30 space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-sky-400 font-mono">FEATURE 1</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono">TLS Layer 7</span>
              </div>
              <h3 className="font-bold text-sm text-white">JA4+ Client Fingerprinting</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Calculates cryptographic hash of TLS Client Hello protocol, cipher suite sequence, and TLS extensions before application decryption.
              </p>
              <div className="p-3 rounded-xl bg-slate-950 font-mono text-[11px] text-slate-400 space-y-1">
                <div>Chrome 122: <span className="text-emerald-400">t13d1516h2_8daaf...</span></div>
                <div>Python Bot: <span className="text-rose-400">t13d9999h2_badbeef...</span></div>
              </div>
            </div>

            {/* Card 2: SPLT Entropy */}
            <div className="p-6 rounded-3xl custom-glass border border-purple-500/30 space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-purple-400 font-mono">FEATURE 2</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono">Cisco ETA L4</span>
              </div>
              <h3 className="font-bold text-sm text-white">Cisco SPLT Shannon Entropy</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Evaluates the sequence of packet lengths and inter-arrival times (SPLT). Natural human checkouts display high entropy (&gt;2.5); automated bot swarms exhibit flat timing (&lt;1.0).
              </p>
              <div className="p-3 rounded-xl bg-slate-950 font-mono text-[11px] text-slate-400 space-y-1">
                <div>Human Shopper: <span className="text-emerald-400">Entropy = 3.12 (Normal)</span></div>
                <div>Bot Swarm: <span className="text-rose-400">Entropy = 0.41 (Mechanical)</span></div>
              </div>
            </div>

            {/* Card 3: TCP RTT */}
            <div className="p-6 rounded-3xl custom-glass border border-emerald-500/30 space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-emerald-400 font-mono">FEATURE 3</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">Wire Physics</span>
              </div>
              <h3 className="font-bold text-sm text-white">TCP RTT Offshore Proxy Radar</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Measures TCP 3-way handshake round-trip latency against domestic ISP baselines (Jio/Airtel). Detects cloaked offshore reverse-proxies even when the client claims a local IP.
              </p>
              <div className="p-3 rounded-xl bg-slate-950 font-mono text-[11px] text-slate-400 space-y-1">
                <div>Direct Mumbai: <span className="text-emerald-400">22.4 ms (Genuine)</span></div>
                <div>Offshore Relay: <span className="text-rose-400">248.8 ms (Cloaked)</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: MACHINE LEARNING MODEL ARCHITECTURE */}
      {activeDocTab === 'ml' && (
        <div className="space-y-6">
          <div className="p-6 md:p-8 rounded-3xl custom-glass border border-slate-800 space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <span className="text-xs font-mono text-purple-400 font-bold">UNSUPERVISED AI</span>
              <h3 className="text-base font-bold text-white mt-0.5">
                Isolation Forest Multi-Dimensional Outlier Ensemble
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3 text-xs text-slate-300">
                <h4 className="font-bold text-sm text-white">1. Hyperparameter Configuration</h4>
                <ul className="space-y-2 font-mono text-slate-400 list-disc pl-4">
                  <li><strong className="text-slate-200">n_estimators:</strong> 100 Isolation Trees partitioning multi-dimensional space.</li>
                  <li><strong className="text-slate-200">contamination:</strong> 0.03 (Tuned to isolate the top 3% mathematical anomalies).</li>
                  <li><strong className="text-slate-200">Feature Vector:</strong> [tcp_rtt_ms, cisco_splt_entropy, packet_burst_rate, amount_inr, hour_of_day].</li>
                  <li><strong className="text-slate-200">Inference Runtime:</strong> Optimized C-compiled scikit-learn &lt;0.5ms.</li>
                </ul>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <h4 className="font-bold text-sm text-white">2. Mathematical Anomaly Scoring</h4>
                <p className="leading-relaxed">
                  The anomaly score is calculated based on the average path length required to isolate a sample across all 100 trees:
                </p>
                <div className="p-3 rounded-2xl bg-slate-950 font-mono text-xs text-purple-300 border border-slate-800">
                  s(x, n) = 2^(- E(h(x)) / c(n))
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  Shorter path lengths indicate easily isolated outliers (e.g. 240ms RTT with flat 0.4 SPLT entropy).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: GOOGLE GEMINI EXTERNAL LLM INTEGRATION */}
      {activeDocTab === 'gemini' && (
        <div className="space-y-6">
          <div className="p-6 md:p-8 rounded-3xl custom-glass border border-amber-500/30 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-amber-400 font-bold flex items-center gap-1.5">
                  <Icon icon="solar:sparkles-bold-duotone" className="w-4 h-4 text-amber-300" /> HYBRID DUAL-SPEED ARCHITECTURE
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Google Gemini 1.5 / 2.0 Flash External LLM Integration
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                Model: gemini-1.5-flash
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
                <div className="flex items-center gap-2 text-sky-400 font-bold text-xs">
                  <Icon icon="solar:document-text-bold-duotone" className="w-4 h-4" />
                  <span>1. Courtroom-Ready SARs</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Gemini analyzes packet captures, unmasked DOM nodes, and ledger discrepancies to draft formal SAR/STR dossiers with legal citations under PMLA 2002 and RBI Master Directions.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
                <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
                  <Icon icon="solar:shield-warning-bold-duotone" className="w-4 h-4" />
                  <span>2. Zero-Shot Cart Deobfuscation</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Understands semantic intent behind cloaked catalog items (e.g. recognizing "5000 Dragon VIP Coins" in a cosmetic store as illegal gambling token laundering).
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <Icon icon="solar:bolt-bold-duotone" className="w-4 h-4" />
                  <span>3. Zero-Overhead Gateway</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Trace executes Gemini <strong>asynchronously in the background</strong> so in-line payment checkouts remain lightning fast (&lt;1ms) with zero cloud LLM latency penalty.
                </p>
              </div>
            </div>

            {/* Architecture Code Config Box */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
              <div className="text-slate-400 text-[11px] flex justify-between">
                <span>Secure Environment Configuration (`.env`):</span>
                <span className="text-emerald-400">✓ Gitignored (100% Protected)</span>
              </div>
              <pre className="text-indigo-300 bg-slate-900/80 p-3 rounded-xl overflow-x-auto text-[11px]">
{`# Google Gemini Integration (Async Forensic Layer)
GEMINI_API_KEY=AQ.Ab8RN6LF... [SECURED IN .ENV]
GEMINI_MODEL=gemini-1.5-flash`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: CHAMELEON STORE HUNTER */}
      {activeDocTab === 'mystery' && (
        <div className="space-y-6">
          <div className="p-6 md:p-8 rounded-3xl custom-glass border border-slate-800 space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <span className="text-xs font-mono text-amber-400 font-bold">ADVERSARIAL AGENT</span>
              <h3 className="text-base font-bold text-white mt-0.5">
                Autonomous Multi-Persona Mystery Shopper Crawler
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-emerald-500/30 space-y-2">
                <span className="text-emerald-400 font-bold">Persona 1: Compliance Bot</span>
                <p className="text-slate-400 font-sans text-[11px]">
                  Simulates standard Googlebot &amp; Razorpay compliance crawler. Captures facade catalog (e.g. ₹399 Organic Soap).
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/90 border border-amber-500/30 space-y-2">
                <span className="text-amber-400 font-bold">Persona 2: Mobile Shopper</span>
                <p className="text-slate-400 font-sans text-[11px]">
                  Simulates authentic iOS Safari browser on Indian 5G carrier with cookies and realistic viewport dimensions.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/90 border border-rose-500/40 space-y-2">
                <span className="text-rose-400 font-bold">Persona 3: Dark Referral</span>
                <p className="text-slate-400 font-sans text-[11px]">
                  Simulates Telegram referral deep link (?ref=vip_bet). Unmasks hidden ₹25,000 casino chip checkout!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 6: REGULATORY SAR SPECIFICATION */}
      {activeDocTab === 'regulatory' && (
        <div className="space-y-6">
          <div className="p-6 md:p-8 rounded-3xl custom-glass border border-slate-800 space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <span className="text-xs font-mono text-emerald-400 font-bold">COMPLIANCE STANDARDS</span>
              <h3 className="text-base font-bold text-white mt-0.5">
                Regulatory Legal Report Specifications
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-mono text-slate-300">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <h4 className="font-bold text-white text-xs">RBI Master Directions (AML/CFT)</h4>
                <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                  Sections 35-38: Mandatory STR filing within 7 days of unmasking suspicious transaction laundering or MCC misclassification.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <h4 className="font-bold text-white text-xs">FIU-IND STR Format</h4>
                <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                  Automated generation of XML/JSON STR schema containing IP logs, payment hashes, ASN data, and DOM evidence.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <h4 className="font-bold text-white text-xs">Visa/Mastercard GBPP Form 102</h4>
                <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                  Global Brand Protection Program compliance document with cryptographic packet capture for immediate acquirer audit.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
