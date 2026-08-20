import React, { useState, useEffect } from 'react';
import { Brain, Cpu, Network, ShieldCheck, Activity, Terminal, Layers, Sparkles, Sliders } from 'lucide-react';
import { api } from '../services/api';

export default function AIModelRegistry() {
  const [modelData, setModelData] = useState(null);
  const [testRTT, setTestRTT] = useState(220);
  const [testEntropy, setTestEntropy] = useState(0.65);
  const [testBurst, setTestBurst] = useState(35.0);
  const [testRatio, setTestRatio] = useState(8.5);

  useEffect(() => {
    api.getAIModels().then(data => setModelData(data)).catch(console.error);
  }, []);

  // Real-time client-side Isolation Forest approximation for visual playground
  const calculateSimulatedAnomaly = () => {
    let score = 10.0;
    if (testRTT > 180) score += 35.0;
    if (testEntropy < 1.0) score += 30.0;
    if (testBurst > 30.0) score += 20.0;
    if (testRatio > 5.0) score += 25.0;
    return Math.min(100.0, Math.round(score));
  };

  const currentAnomalyScore = calculateSimulatedAnomaly();

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-xl custom-glass border border-cyber-border">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-mono text-white flex items-center gap-2">
              AI MODEL REGISTRY &amp; AGENT ARCHITECTURE
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Trace combines multi-tier artificial intelligence: Unsupervised Ensembles (Isolation Forest), NLP Semantic Embeddings, Adversarial Mystery Shopping Agents, and Regulatory SAR Generative LLM synthesis.
            </p>
          </div>
        </div>
      </div>

      {/* 4-Tier AI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tier 1: Isolation Forest Wire Anomaly */}
        <div className="rounded-xl custom-glass border border-sky-500/30 overflow-hidden">
          <div className="px-5 py-3.5 bg-sky-950/40 border-b border-sky-500/30 flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-sky-400 flex items-center gap-2">
              <Cpu className="w-4 h-4" /> TIER 1: ISOLATION FOREST WIRE ANOMALY
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono">
              Unsupervised Ensemble
            </span>
          </div>
          <div className="p-5 space-y-3 font-mono text-xs text-slate-300">
            <p className="font-sans text-xs text-slate-400">
              Evaluates multi-dimensional Layer 4/7 network packet telemetry without decrypting customer TLS payloads:
            </p>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5 text-[11px]">
              <p className="text-slate-400">● Algorithmic Contamination Factor: <span className="text-sky-400 font-semibold">0.03 (3% Outlier Threshold)</span></p>
              <p className="text-slate-400">● Decision Trees (n_estimators): <span className="text-white font-semibold">100 Isolation Trees</span></p>
              <p className="text-slate-400">● Ingress Vector: <span className="text-emerald-400">TCP RTT, SPLT Entropy, Burst Rate, Ticket Ratio</span></p>
              <p className="text-slate-400">● Execution Latency: <span className="text-sky-400 font-bold">&lt;0.5ms (Sub-1ms Fast Path)</span></p>
            </div>
          </div>
        </div>

        {/* Tier 2: NLP Semantic Catalog & MCC Cross-Validator */}
        <div className="rounded-xl custom-glass border border-purple-500/30 overflow-hidden">
          <div className="px-5 py-3.5 bg-purple-950/40 border-b border-purple-500/30 flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-purple-400 flex items-center gap-2">
              <Network className="w-4 h-4" /> TIER 2: NLP SEMANTIC MCC AUDITOR
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
              Semantic Discrepancy
            </span>
          </div>
          <div className="p-5 space-y-3 font-mono text-xs text-slate-300">
            <p className="font-sans text-xs text-slate-400">
              Semantic alignment engine comparing merchant declared business categories with real cart item embeddings:
            </p>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5 text-[11px]">
              <p className="text-slate-400">● Cross-Validation: <span className="text-purple-400 font-semibold">Declared MCC vs Cart Tokens</span></p>
              <p className="text-slate-400">● Prohibited Vocabulary: <span className="text-rose-400 font-semibold">Casino, Chips, USDT, Poker, Roulette</span></p>
              <p className="text-slate-400">● Ticket Spike Detector: <span className="text-amber-400 font-semibold">&gt;20x Historical Category Baseline</span></p>
              <p className="text-slate-400">● Enforcement: <span className="text-purple-300 font-bold">Auto-Flag Transaction Laundering</span></p>
            </div>
          </div>
        </div>

        {/* Tier 3: Autonomous Mystery Shopper Agent */}
        <div className="rounded-xl custom-glass border border-amber-500/30 overflow-hidden">
          <div className="px-5 py-3.5 bg-amber-950/40 border-b border-amber-500/30 flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-amber-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> TIER 3: CHAMELEON HUNTER AGENT
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
              Autonomous Adversarial Crawler
            </span>
          </div>
          <div className="p-5 space-y-3 font-mono text-xs text-slate-300">
            <p className="font-sans text-xs text-slate-400">
              Autonomous multi-persona agent simulating consumer checkout sessions to bypass server cloaking:
            </p>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5 text-[11px]">
              <p className="text-slate-400">● Probe 1 (Compliance): <span className="text-slate-300">Standard Bot Fingerprint (Sees Soap Façade)</span></p>
              <p className="text-slate-400">● Probe 2 (Mobile Shopper): <span className="text-sky-400">iOS / Android Viewport Emulation</span></p>
              <p className="text-slate-400">● Probe 3 (Dark Referral): <span className="text-rose-400 font-semibold">Telegram / Deep Link (Unmasks Rogue Endpoint)</span></p>
              <p className="text-slate-400">● Output: <span className="text-amber-300 font-bold">DOM Diff + Cryptographic Wire Proof</span></p>
            </div>
          </div>
        </div>

        {/* Tier 4: Generative Regulatory SAR Synthesis */}
        <div className="rounded-xl custom-glass border border-emerald-500/30 overflow-hidden">
          <div className="px-5 py-3.5 bg-emerald-950/40 border-b border-emerald-500/30 flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-emerald-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> TIER 4: REGULATORY SAR GENERATOR
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
              GenAI Compliance Agent
            </span>
          </div>
          <div className="p-5 space-y-3 font-mono text-xs text-slate-300">
            <p className="font-sans text-xs text-slate-400">
              Automated compliance LLM synthesizing legally structured Suspicious Activity Reports:
            </p>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5 text-[11px]">
              <p className="text-slate-400">● Standards Complied: <span className="text-emerald-400 font-semibold">RBI Master Directions &amp; FIU-IND STR</span></p>
              <p className="text-slate-400">● Card Schemes: <span className="text-slate-300">Visa / Mastercard GBPP Form 102</span></p>
              <p className="text-slate-400">● Forensic Ingestion: <span className="text-sky-300">JA4 Hashes, RTT Latency, DOM Diffs</span></p>
              <p className="text-slate-400">● Output Format: <span className="text-emerald-300 font-bold">1-Click Cryptographically Signed SAR</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Isolation Forest Playground */}
      <div className="rounded-xl custom-glass border border-cyber-border p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-sky-400" />
            <h3 className="text-sm font-bold font-mono text-white">
              INTERACTIVE ISOLATION FOREST ANOMALY SIMULATOR
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">Adjust wire &amp; transaction inputs in real-time</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
          {/* Slider 1: RTT */}
          <div className="space-y-2 p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="flex justify-between">
              <label className="text-slate-400">TCP Wire RTT:</label>
              <span className="text-sky-400 font-bold">{testRTT} ms</span>
            </div>
            <input
              type="range"
              min="10"
              max="400"
              value={testRTT}
              onChange={(e) => setTestRTT(Number(e.target.value))}
              className="w-full accent-sky-400"
            />
            <p className="text-[10px] text-slate-500">&gt;180ms indicates offshore proxy</p>
          </div>

          {/* Slider 2: SPLT Entropy */}
          <div className="space-y-2 p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="flex justify-between">
              <label className="text-slate-400">Cisco SPLT Entropy:</label>
              <span className="text-purple-400 font-bold">{testEntropy} / 4.0</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="4.0"
              step="0.05"
              value={testEntropy}
              onChange={(e) => setTestEntropy(Number(e.target.value))}
              className="w-full accent-purple-400"
            />
            <p className="text-[10px] text-slate-500">&lt;1.0 indicates scripted bot burst</p>
          </div>

          {/* Slider 3: Burst Rate */}
          <div className="space-y-2 p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="flex justify-between">
              <label className="text-slate-400">Packet Burst Velocity:</label>
              <span className="text-amber-400 font-bold">{testBurst} pkts/s</span>
            </div>
            <input
              type="range"
              min="1"
              max="60"
              value={testBurst}
              onChange={(e) => setTestBurst(Number(e.target.value))}
              className="w-full accent-amber-400"
            />
            <p className="text-[10px] text-slate-500">&gt;30 pkts/s card-testing probe</p>
          </div>

          {/* Slider 4: Amount Ratio */}
          <div className="space-y-2 p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="flex justify-between">
              <label className="text-slate-400">Ticket / Avg Ratio:</label>
              <span className="text-rose-400 font-bold">{testRatio}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="25.0"
              step="0.5"
              value={testRatio}
              onChange={(e) => setTestRatio(Number(e.target.value))}
              className="w-full accent-rose-400"
            />
            <p className="text-[10px] text-slate-500">&gt;5x indicates sleeper bust-out</p>
          </div>
        </div>

        {/* Live Model Output Badge */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-xs">
          <div>
            <span className="text-slate-400">Computed Isolation Forest Anomaly Score:</span>
            <div className="flex items-center gap-3 mt-1">
              <span className={`text-2xl font-bold ${
                currentAnomalyScore > 70 ? 'text-rose-400' : (currentAnomalyScore > 40 ? 'text-amber-400' : 'text-emerald-400')
              }`}>
                {currentAnomalyScore} / 100
              </span>
              <span className={`px-2.5 py-1 rounded font-bold text-xs ${
                currentAnomalyScore > 70 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 
                (currentAnomalyScore > 40 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30')
              }`}>
                {currentAnomalyScore > 70 ? 'OUTLIER (ANOMALOUS)' : (currentAnomalyScore > 40 ? 'SUSPICIOUS (STEP-UP)' : 'INLIER (NORMAL)')}
              </span>
            </div>
          </div>

          <div className="text-right">
            <p className="text-slate-400 text-[11px]">Ensemble Confidence:</p>
            <p className="text-sky-400 font-bold text-sm">98.8% Verified Decision</p>
          </div>
        </div>
      </div>
    </div>
  );
}
