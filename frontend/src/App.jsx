import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import RiskMetrics from './components/RiskMetrics';
import WirePacketInspector from './components/WirePacketInspector';
import TransactionFeed from './components/TransactionFeed';
import ChameleonUnmasker from './components/ChameleonUnmasker';
import AttackControlConsole from './components/AttackControlConsole';
import SARReportStudio from './components/SARReportStudio';
import { api } from './services/api';
import { Shield, Sparkles, Activity, FileText, CheckCircle2, AlertOctagon, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('live');
  const [isStreaming, setIsStreaming] = useState(false);
  const [scenario, setScenario] = useState('MIXED');
  const [transactions, setTransactions] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [merchants, setMerchants] = useState([]);
  const [stats, setStats] = useState({
    totalEvaluated: 142,
    blockedLaunderingInr: 4850000,
    avgLatencyMs: 0.09,
    activeQuarantines: 2,
    frictionBreakdown: { allow: 82, stepUp: 10, hold: 4, block: 4 }
  });

  const wsRef = useRef(null);

  // Initialize merchants and initial transactions
  useEffect(() => {
    loadMerchants();
    // Start live stream by default
    handleStartStream('MIXED');

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const loadMerchants = async () => {
    try {
      const data = await api.getMerchants();
      if (Array.isArray(data)) setMerchants(data);
    } catch (err) {
      console.error("Failed to load merchants:", err);
    }
  };

  const connectWebSocket = () => {
    if (wsRef.current) {
      try { wsRef.current.close(); } catch(e){}
    }

    const wsUrl = api.getWebSocketUrl();
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("Trace Telemetry WebSocket connected:", wsUrl);
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === "TRANSACTION_EVENT") {
          setTransactions(prev => {
            const next = [payload, ...prev.slice(0, 49)];
            return next;
          });

          // Auto-select latest if none selected
          setSelectedItem(prev => prev || payload);

          // Update stats dynamically
          setStats(prev => {
            const isLaunder = payload.verdict.threat_category === 'CHAMELEON_CLOAKING';
            return {
              ...prev,
              totalEvaluated: prev.totalEvaluated + 1,
              blockedLaunderingInr: isLaunder 
                ? prev.blockedLaunderingInr + payload.transaction.amount_inr 
                : prev.blockedLaunderingInr,
              avgLatencyMs: payload.verdict.processing_latency_ms || 0.09
            };
          });
        }
      } catch (err) {
        console.error("Failed to parse WS message:", err);
      }
    };

    ws.onerror = (err) => {
      console.warn("WebSocket error, retrying...", err);
    };

    wsRef.current = ws;
  };

  const handleStartStream = async (chosenScenario = 'MIXED') => {
    setScenario(chosenScenario);
    setIsStreaming(true);
    connectWebSocket();
    try {
      await api.startSimulation(chosenScenario);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStopStream = async () => {
    setIsStreaming(false);
    try {
      await api.stopSimulation();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleStream = () => {
    if (isStreaming) {
      handleStopStream();
    } else {
      handleStartStream(scenario);
    }
  };

  const handleLaunchScenario = (scId) => {
    handleStartStream(scId);
    setActiveTab('live');
  };

  return (
    <div className="min-h-screen bg-cyber-dark text-slate-100 flex flex-col selection:bg-sky-500 selection:text-black">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isStreaming={isStreaming}
        toggleStream={toggleStream}
        scenario={scenario}
        setScenario={setScenario}
        latencyMs={stats.avgLatencyMs}
        threatCount={stats.activeQuarantines}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* Global Key Metrics Bar */}
        <RiskMetrics stats={stats} />

        {/* Tab 1: Live Wire Stream & Cockpit */}
        {activeTab === 'live' && (
          <div className="space-y-6">
            {/* Top Grid: Transaction Feed + Wireshark Packet Dissector */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              {/* Left 5 Cols: Ingress Feed */}
              <div className="xl:col-span-5">
                <TransactionFeed
                  transactions={transactions}
                  selectedTx={selectedItem?.transaction}
                  onSelectTx={(item) => setSelectedItem(item)}
                />
              </div>

              {/* Right 7 Cols: Wireshark Wire-Telemetry Dissector */}
              <div className="xl:col-span-7">
                <WirePacketInspector
                  transaction={selectedItem?.transaction}
                  verdict={selectedItem?.verdict}
                />
              </div>
            </div>

            {/* Bottom Row: Explainable AI Decision Breakdown */}
            {selectedItem && selectedItem.verdict && (
              <div className="rounded-xl custom-glass border border-cyber-border p-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <div className="flex items-center gap-2 font-mono">
                    <Sparkles className="w-4 h-4 text-sky-400" />
                    <h3 className="text-sm font-bold text-white">
                      EXPLAINABLE AI RISK REASONING: {selectedItem.transaction.transaction_id}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-xs">
                    <span className="text-slate-400">Wire Score: <span className="text-sky-400 font-bold">{selectedItem.verdict.wire_risk_score}/100</span></span>
                    <span className="text-slate-400">Behavioral Score: <span className="text-purple-400 font-bold">{selectedItem.verdict.behavioral_risk_score}/100</span></span>
                  </div>
                </div>

                <p className="text-xs font-mono text-slate-300 mb-4 bg-slate-950 p-3 rounded-lg border border-slate-800">
                  {selectedItem.verdict.summary_text}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {selectedItem.verdict.explainability_reasons?.map((reason, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs space-y-1 font-mono">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-sky-300">{reason.factor_name}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                          reason.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                          (reason.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300')
                        }`}>
                          {reason.severity}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] leading-relaxed font-sans">{reason.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Chameleon Storefront Unmasker */}
        {activeTab === 'mystery' && (
          <ChameleonUnmasker
            merchants={merchants}
            onNavigateToSAR={(mid) => setActiveTab('sar')}
          />
        )}

        {/* Tab 3: Interactive Attack Simulator */}
        {activeTab === 'simulator' && (
          <AttackControlConsole
            onLaunchScenario={handleLaunchScenario}
            activeScenario={scenario}
            isStreaming={isStreaming}
          />
        )}

        {/* Tab 4: Regulatory SAR Studio */}
        {activeTab === 'sar' && (
          <SARReportStudio
            merchants={merchants}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-cyber-border py-4 px-6 text-center text-xs font-mono text-slate-500 bg-cyber-dark">
        Trace Autonomous Risk Engine • Layer 4/7 Wire Telemetry &amp; Chameleon Mystery Shopper • Razorpay AI Builder 2026
      </footer>
    </div>
  );
}
