import React, { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from './components/Navbar';
import RiskMetrics from './components/RiskMetrics';
import WirePacketInspector from './components/WirePacketInspector';
import TransactionFeed from './components/TransactionFeed';
import ChameleonUnmasker from './components/ChameleonUnmasker';
import AttackControlConsole from './components/AttackControlConsole';
import SARReportStudio from './components/SARReportStudio';
import { api } from './services/api';
import { Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('live');
  const [isStreaming, setIsStreaming] = useState(false);
  const [scenario, setScenario] = useState('MIXED');
  const [transactions, setTransactions] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [merchants, setMerchants] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [apiError, setApiError] = useState(null);
  const [stats, setStats] = useState({
    totalEvaluated: 142,
    blockedLaunderingInr: 4850000,
    avgLatencyMs: 0.09,
    activeQuarantines: 2,
    frictionBreakdown: { allow: 82, stepUp: 10, hold: 4, block: 4 }
  });

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const isStreamingRef = useRef(isStreaming);
  isStreamingRef.current = isStreaming;

  const loadMerchants = async () => {
    try {
      setApiError(null);
      const data = await api.getMerchants();
      if (Array.isArray(data)) setMerchants(data);
    } catch (err) {
      console.error("Failed to load merchants:", err);
      setApiError("Unable to connect to Trace Backend. Please verify the server is running on port 8000.");
    }
  };

  const connectWebSocket = useCallback(() => {
    if (wsRef.current) {
      try { wsRef.current.close(); } catch(e){}
    }

    setConnectionStatus('connecting');
    const wsUrl = api.getWebSocketUrl();
    
    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setConnectionStatus('connected');
        reconnectAttemptsRef.current = 0;
        setApiError(null);
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
              const action = payload.verdict.action;
              
              const currentCounts = {
                allow: Math.round((prev.frictionBreakdown.allow / 100) * prev.totalEvaluated) + (action === 'ALLOW' ? 1 : 0),
                stepUp: Math.round((prev.frictionBreakdown.stepUp / 100) * prev.totalEvaluated) + (action === 'STEP_UP_3DS' ? 1 : 0),
                hold: Math.round((prev.frictionBreakdown.hold / 100) * prev.totalEvaluated) + (action === 'SETTLEMENT_HOLD' ? 1 : 0),
                block: Math.round((prev.frictionBreakdown.block / 100) * prev.totalEvaluated) + (action === 'BLOCK_QUARANTINE' ? 1 : 0),
              };
              
              const newTotal = prev.totalEvaluated + 1;
              const allowPct = Math.round((currentCounts.allow / newTotal) * 100);
              const stepUpPct = Math.round((currentCounts.stepUp / newTotal) * 100);
              const holdPct = Math.round((currentCounts.hold / newTotal) * 100);
              const blockPct = Math.max(0, 100 - (allowPct + stepUpPct + holdPct));

              return {
                ...prev,
                totalEvaluated: newTotal,
                blockedLaunderingInr: isLaunder 
                  ? prev.blockedLaunderingInr + (payload.transaction.amount_inr || 0)
                  : prev.blockedLaunderingInr,
                activeQuarantines: prev.activeQuarantines + (action === 'BLOCK_QUARANTINE' ? 1 : 0),
                avgLatencyMs: payload.verdict.processing_latency_ms || 0.09,
                frictionBreakdown: {
                  allow: allowPct,
                  stepUp: stepUpPct,
                  hold: holdPct,
                  block: blockPct
                }
              };
            });
          }
        } catch (err) {
          console.error("Failed to parse WS message:", err);
        }
      };

      ws.onerror = () => {
        setConnectionStatus('disconnected');
      };

      ws.onclose = () => {
        setConnectionStatus('disconnected');
        // Auto-reconnect with exponential backoff if still supposed to be streaming
        if (isStreamingRef.current) {
          const delay = Math.min(1000 * Math.pow(1.5, reconnectAttemptsRef.current), 10000);
          reconnectAttemptsRef.current += 1;
          reconnectTimeoutRef.current = setTimeout(() => {
            if (isStreamingRef.current) {
              connectWebSocket();
            }
          }, delay);
        }
      };

      wsRef.current = ws;
    } catch (e) {
      setConnectionStatus('disconnected');
    }
  }, []);

  const handleStartStream = async (chosenScenario = 'MIXED') => {
    setScenario(chosenScenario);
    setIsStreaming(true);
    isStreamingRef.current = true;
    connectWebSocket();
    try {
      await api.startSimulation(chosenScenario);
    } catch (err) {
      console.error(err);
      setApiError("Failed to trigger simulation stream.");
    }
  };

  const handleStopStream = async () => {
    setIsStreaming(false);
    isStreamingRef.current = false;
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (e) {}
      wsRef.current = null;
    }
    setConnectionStatus('disconnected');
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

  // Initial load
  useEffect(() => {
    loadMerchants();
    handleStartStream('MIXED');

    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        try { wsRef.current.close(); } catch(e){}
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-cyber-dark text-slate-100 flex flex-col selection:bg-sky-500 selection:text-black">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isStreaming={isStreaming}
        toggleStream={toggleStream}
        latencyMs={stats.avgLatencyMs}
        connectionStatus={connectionStatus}
      />

      {/* API Error Notification */}
      {apiError && (
        <div className="bg-rose-500/10 border-b border-rose-500/30 px-6 py-2.5 flex items-center justify-between text-xs text-rose-300 font-mono">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>{apiError}</span>
          </div>
          <button 
            onClick={loadMerchants} 
            className="flex items-center gap-1 px-2 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-200"
          >
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </div>
      )}

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
                    <div key={`${reason.factor_name}-${idx}`} className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs space-y-1 font-mono">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-sky-300">{reason.factor_name}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
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
            onNavigateToSAR={() => setActiveTab('sar')}
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
