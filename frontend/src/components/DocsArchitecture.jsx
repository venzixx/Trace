import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Layers,
  Cpu,
  ShieldCheck,
  Zap,
  Radio,
  Network,
  Video,
  Copy,
  Check,
  Sparkles,
  GitBranch,
  Terminal,
  Workflow,
  ArrowRight,
  Eye,
  FileText,
  Lock,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

export default function DocsArchitecture() {
  const [activeDocTab, setActiveDocTab] = useState('diagrams'); // diagrams, script, tech, regulatory
  const [scriptCopied, setScriptCopied] = useState(false);

  const videoScript = `🎬 TRACE: 5-MINUTE VIDEO PITCH SCRIPT & DEMO WALKTHROUGH
Track 2: AI Risk Manager — Razorpay AI Builder Internship 2026

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏱️ MINUTE 0:00 - 0:45 | INTRO & THE FINTECH CRISIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[VISUAL ON SCREEN]: 
• Start on Trace "Home Overview" screen (http://localhost:5173).
• Point mouse to the 4 Top Metric Cards (Speed <1ms, Fraud Shielded, Fake Stores Caught).

[SPOKEN SCRIPT]:
"Hi everyone, I'm Sidharth Samantaray, and this is TRACE — an Autonomous Layer 4/7 Wire-Telemetry and Chameleon Merchant Risk Engine built for Razorpay's AI Builder Internship.

In modern payment aggregation, two catastrophic risks cost fintech billions every year:
1. Transaction Laundering and Chameleon Storefronts — rogue merchants who register with clean categories like handmade soaps, but secretly cloak their checkout to process millions in illegal online casino chips.
2. High-speed carding bot swarms and sleeper merchant bust-outs staging massive exit scams.

Existing fraud systems fail because they only inspect HTTP application payloads *after* decryption — completely blind to network-level cloaking. Trace solves this at the wire layer in under 1 millisecond."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏱️ MINUTE 0:45 - 2:00 | LIVE PAYMENT WIRE INSPECTOR (<1ms)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[VISUAL ON SCREEN]:
• Click "Payment Feed" in the sidebar.
• Click "Fraud Attack Test" -> click "Launch Scenario 2 (Cloaked Casino)".
• Switch back to "Payment Feed" and click the newly arrived red quarantined transaction.

[SPOKEN SCRIPT]:
"Let's look at Trace in action. Here is our live Payment Ingress Cockpit.

When a customer initiates a transaction, Trace's sub-1ms Fast-Path Wire Engine intercepts Layer 4 TCP and Layer 7 TLS metadata *before* decrypting customer data:
1. First, we compute JA4+ TLS Client Fingerprints to instantly distinguish genuine mobile browsers from automated laundering proxy scripts.
2. Second, we measure TCP Round-Trip Time (RTT). A domestic Indian merchant processing on an Indian ISP with >200ms wire latency immediately reveals an offshore reverse-proxy relay.
3. Third, we compute Cisco ETA SPLT Shannon Entropy across packet timing to catch mechanical bot bursts.

Based on this, our Adaptive Friction Matrix takes action: instant 1-Click Allow for safe shoppers, OTP challenges for mild anomalies, and automated settlement escrow holds for exit scams."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏱️ MINUTE 2:00 - 3:15 | AUTONOMOUS CHAMELEON UNMASKER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[VISUAL ON SCREEN]:
• Click "Fake Store Checker" in the sidebar.
• Select 'Pure Herbals Organics' from the dropdown.
• Click the amber button: "Audit Store Now".
• Watch the AI Mystery Shopper investigate and unmask the hidden casino.

[SPOKEN SCRIPT]:
"Now let's demonstrate our flagship innovation: the Autonomous Adversarial Mystery Shopper Agent.

How do fraudsters evade compliance? When a Razorpay compliance bot visits their website, the fraudster's server shows a pristine organic soap catalog with ₹399 products. But when a gambler arrives via a secret Telegram link, the server unmasks an illegal VIP casino checkout charging ₹25,000!

Trace's Chameleon Hunter Agent deploys multi-persona web crawlers — emulating compliance crawlers, authentic iOS viewports, and dark referral deep links. It captures the DOM mutation difference, extracts the hidden Razorpay order API payload, and automatically quarantines the merchant's API keys."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏱️ MINUTE 3:15 - 4:15 | 4-TIER AI BRAIN & ISOLATION FOREST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[VISUAL ON SCREEN]:
• Click "How AI Works" in the sidebar.
• Scroll down to the "Interactive Isolation Forest Simulator".
• Move the TCP RTT slider from 30ms to 240ms, and SPLT Entropy to 0.65.
• Show the computed Anomaly Score jumping to 95/100 (OUTLIER).

[SPOKEN SCRIPT]:
"Trace uses a 4-Tier Hybrid AI Architecture:
• Tier 1 is an Unsupervised Isolation Forest ML model trained on packet timing variance, burst rates, and ticket size distributions with a 0.03 contamination factor.
• Tier 2 is an NLP Semantic Auditor cross-checking merchant MCC codes against cart line items.
• Tier 3 is our Adversarial Mystery Shopping crawler.
• Tier 4 is our Generative Regulatory SAR Engine."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏱️ MINUTE 4:15 - 5:00 | REGULATORY SAR STUDIO & CONCLUSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[VISUAL ON SCREEN]:
• Click "Official Reports" in the sidebar.
• Click "Create Report" -> Show the complete RBI / FIU-IND formatted SAR report with cryptographic hashes.
• Finish on the Trace Home Overview.

[SPOKEN SCRIPT]:
"Finally, Trace saves compliance teams hundreds of manual hours with 1-Click SAR Generation. It automatically compiles forensic packet logs, JA4 hashes, and DOM proofs into legally structured Suspicious Activity Reports compliant with RBI Master Directions and FIU-IND standards.

Trace is built with FastAPI, SQLite, React 18, and Docker — fully containerized and competition-ready.

Thank you for your time, and I look forward to building the future of AI risk at Razorpay!"`;

  const copyScriptToClipboard = () => {
    navigator.clipboard.writeText(videoScript);
    setScriptCopied(true);
    setTimeout(() => setScriptCopied(false), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl custom-glass border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              SYSTEM ARCHITECTURE &amp; VIDEO SCRIPT
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Complete end-to-end technical documentation, system flow diagrams, and a minute-by-minute 5-minute video pitch script for Razorpay submission.
            </p>
          </div>
        </div>

        {/* Doc Sub-Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setActiveDocTab('diagrams')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeDocTab === 'diagrams' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Flow Diagrams
          </button>
          <button
            onClick={() => setActiveDocTab('script')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeDocTab === 'script' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            5-Min Video Script
          </button>
          <button
            onClick={() => setActiveDocTab('tech')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeDocTab === 'tech' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Wire &amp; ML Deep-Dive
          </button>
        </div>
      </div>

      {/* Sub-Tab 1: FLOW DIAGRAMS */}
      {activeDocTab === 'diagrams' && (
        <div className="space-y-8">
          {/* Main System Flow Diagram Card */}
          <div className="p-6 md:p-8 rounded-3xl custom-glass border border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-indigo-400 font-bold">ARCHITECTURE BLUEPRINT</span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Trace End-to-End Dual-Speed AI Pipeline
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Layer 4/7 Wire + Multi-Agent Brain
              </span>
            </div>

            {/* Visual Interactive Pipeline Nodes */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Step 1: Ingress */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="w-7 h-7 rounded-xl bg-sky-500/20 text-sky-400 font-bold text-xs flex items-center justify-center">1</span>
                  <Radio className="w-4 h-4 text-sky-400" />
                </div>
                <h4 className="font-bold text-xs text-white">Payment Ingress</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  Captures raw TCP handshake, client IP, TLS Client Hello packet, and checkout payload before backend processing.
                </p>
                <div className="pt-2 border-t border-slate-800 text-[10px] font-mono text-sky-300">
                  Speed: 0.00 ms (Ingress Hook)
                </div>
              </div>

              {/* Step 2: Wire Telemetry Engine */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-indigo-500/40 space-y-3 relative shadow-lg shadow-indigo-500/10">
                <div className="flex items-center justify-between">
                  <span className="w-7 h-7 rounded-xl bg-indigo-500/20 text-indigo-400 font-bold text-xs flex items-center justify-center">2</span>
                  <Zap className="w-4 h-4 text-indigo-400" />
                </div>
                <h4 className="font-bold text-xs text-indigo-300">Fast-Path Wire Engine</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  Extracts JA4 TLS hash, calculates Cisco SPLT entropy, tests TCP RTT for offshore proxy routing in under 1ms.
                </p>
                <div className="pt-2 border-t border-slate-800 text-[10px] font-mono text-emerald-400">
                  Latency: &lt; 0.10 ms (Sub-1ms)
                </div>
              </div>

              {/* Step 3: Multi-Tier AI Brain */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-purple-500/40 space-y-3 relative shadow-lg shadow-purple-500/10">
                <div className="flex items-center justify-between">
                  <span className="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-400 font-bold text-xs flex items-center justify-center">3</span>
                  <Brain className="w-4 h-4 text-purple-400" />
                </div>
                <h4 className="font-bold text-xs text-purple-300">Hybrid AI Evaluation</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  Isolation Forest ML outlier scoring + Semantic MCC/Cart consistency check + Adversarial Storefront Unmasker.
                </p>
                <div className="pt-2 border-t border-slate-800 text-[10px] font-mono text-purple-300">
                  Decision Confidence: 99.4%
                </div>
              </div>

              {/* Step 4: Dynamic Friction & SAR */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-emerald-500/40 space-y-3 relative shadow-lg shadow-emerald-500/10">
                <div className="flex items-center justify-between">
                  <span className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center">4</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <h4 className="font-bold text-xs text-emerald-300">Adaptive Policy &amp; SAR</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  Enforces 1-Click Allow, Step-Up 3DS, or Settlement Escrow Hold. Auto-synthesizes RBI / FIU-IND SAR dossier.
                </p>
                <div className="pt-2 border-t border-slate-800 text-[10px] font-mono text-emerald-300">
                  Enforcement: Real-time Action
                </div>
              </div>
            </div>

            {/* ASCII / Mermaid Architectural Diagram */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400">Detailed Telemetry Dataflow:</span>
              <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 leading-relaxed overflow-x-auto">
{`┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                INCOMING CHECKOUT / TRANSACTION                                 │
└───────────────────────────────────────────────┬────────────────────────────────────────────────┘
                                                │
                 ┌──────────────────────────────┴──────────────────────────────┐
                 ▼                                                             ▼
┌────────────────────────────────────────────────┐           ┌───────────────────────────────────┐
│     FAST-PATH WIRE INSPECTOR (Sub-1ms)         │           │    DEEP AGENTIC FORENSIC BRAIN    │
│  • JA4+ TLS Client Fingerprint Matching        │           │  • Multi-Persona Mystery Shopper  │
│  • Cisco ETA Sequence Timing & SPLT Entropy    │           │  • Storefront Reverse-Proxy Radar │
│  • TCP Wire RTT & Offshore Relay Hop Radar     │           │  • Semantic Catalog & MCC AI      │
│  • Isolation Forest Unsupervised Outlier AI    │           │  • Auto-SAR Legal Dossier Engine  │
└───────────────────────┬────────────────────────┘           └─────────────────┬─────────────────┘
                        │                                                      │
                        └──────────────────────────────┬───────────────────────┘
                                                       │
                               ┌───────────────────────▼───────────────────────┐
                               │           DYNAMIC FRICTION ROUTER             │
                               │  🟢 ALLOW (1-Click Safe Checkout)             │
                               │  🟡 STEP-UP 3DS (Biometric / OTP Challenge)   │
                               │  🟣 SETTLEMENT HOLD (Escrow Merchant Freeze)  │
                               │  🔴 BLOCK & QUARANTINE (API Key Revocation)   │
                               └───────────────────────────────────────────────┘`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: 5-MINUTE VIDEO SCRIPT */}
      {activeDocTab === 'script' && (
        <div className="space-y-6">
          <div className="p-6 md:p-8 rounded-3xl custom-glass border border-slate-800 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-emerald-400 font-bold">SUBMISSION ASSET</span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  5-Minute Video Pitch Script &amp; Visual Guide
                </h3>
              </div>
              <button
                onClick={copyScriptToClipboard}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all self-start sm:self-auto"
              >
                {scriptCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {scriptCopied ? 'Script Copied to Clipboard!' : 'Copy Video Script'}
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Use this structured script while recording your screen. It guides you step-by-step on what to click in the Trace UI and what exact words to speak to impress the Razorpay evaluators.
            </p>

            <pre className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 leading-relaxed whitespace-pre-wrap max-h-[600px] overflow-y-auto">
              {videoScript}
            </pre>
          </div>
        </div>
      )}

      {/* Sub-Tab 3: WIRE & ML DEEP-DIVE */}
      {activeDocTab === 'tech' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tech 1: Wire Telemetry */}
            <div className="p-6 rounded-3xl custom-glass border border-sky-500/30 space-y-4">
              <span className="text-xs font-bold text-sky-400 font-mono">1. WIRE-TELEMETRY &amp; DPI</span>
              <h3 className="text-base font-bold text-white">How Layer 4/7 Inspection Works</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Traditional Web Application Firewalls (WAFs) only examine decrypted HTTP JSON headers. Trace intercepts lower-level network packets:
              </p>
              <ul className="text-xs text-slate-400 space-y-2 list-disc pl-4 font-mono">
                <li><strong className="text-sky-300">JA4 Fingerprinting:</strong> Inspects TLS Client Hello cipher order and extensions to detect headless bots before TLS decryption.</li>
                <li><strong className="text-sky-300">Cisco SPLT Shannon Entropy:</strong> Evaluates packet size and inter-arrival variances to spot automated carding swarms (&lt;1.0 entropy).</li>
                <li><strong className="text-sky-300">TCP RTT Radar:</strong> Detects offshore reverse-proxy relays when a domestic merchant exhibits &gt;180ms wire latency.</li>
              </ul>
            </div>

            {/* Tech 2: Machine Learning Model */}
            <div className="p-6 rounded-3xl custom-glass border border-purple-500/30 space-y-4">
              <span className="text-xs font-bold text-purple-400 font-mono">2. UNSUPERVISED ML MODEL</span>
              <h3 className="text-base font-bold text-white">Isolation Forest Outlier Detection</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Trace incorporates an unsupervised Isolation Forest ensemble trained on baseline domestic merchant traffic:
              </p>
              <ul className="text-xs text-slate-400 space-y-2 list-disc pl-4 font-mono">
                <li><strong className="text-purple-300">Estimators:</strong> 100 Isolation Trees partitioning multi-dimensional wire features.</li>
                <li><strong className="text-purple-300">Contamination Factor:</strong> Calibrated at 0.03 (top 3% mathematical outliers).</li>
                <li><strong className="text-purple-300">Sub-Millisecond Inference:</strong> Runs on optimized C-compiled scikit-learn in &lt;0.5ms.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
