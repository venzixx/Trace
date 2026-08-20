import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './components/LoginPage';
import Navbar from './components/Navbar';
import RiskMetrics from './components/RiskMetrics';
import WirePacketInspector from './components/WirePacketInspector';
import TransactionFeed from './components/TransactionFeed';
import ChameleonUnmasker from './components/ChameleonUnmasker';
import AttackSimulatorPage from './components/AttackSimulatorPage';
import AIModelRegistry from './components/AIModelRegistry';
import SARReportStudio from './components/SARReportStudio';
import AddMerchantModal from './components/AddMerchantModal';
import ManualTransactionModal from './components/ManualTransactionModal';
import { api } from './services/api';
import { Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

function TraceDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('live');
  const [isStreaming, setIsStreaming] = useState(false);
  const [scenario, setScenario] = useState('MIXED');
  const [transactions, setTransactions] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [merchants, setMerchants] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [apiError, setApiError] = useState(null);
  
  // Modals
  const [isAddMerchantOpen, setIsAddMerchantOpen] = useState(false);
  const [isManualTxOpen, setIsManualTxOpen] = useState(false);

  const [stats, setStats] = useState({
    totalEvaluated: 0,
    blockedLaunderingInr: 0,
    avgLatencyMs: 0.09,
    activeQuarantines: 0,
    frictionBreakdown: { allow: 85, stepUp: 10, hold: 3, block: 2 }
  });

  const wsRef = useRef(null);
  const heartbeatTimerRef = useRef(null);
  const isStreamingRef = useRef(false);

  const loadMerchants = async () => {
    try {
      setApiError(null);
      const data = await api.getMerchants();
      if (Array.isArray(data)) {
        setMerchants(data);
        // Calculate initial stats from real DB
        const quarantinedCount = data.filter(m => m.status === 'QUARANTINED').length;
        setStats(prev => ({
          ...prev,
          activeQuarantines: quarantinedCount
        }));
      }
    } catch (err) {
      console.error("Failed to load merchants:", err);
      setApiError("Unable to connect to Trace Backend database.");
    }
  };

  const loadPastTransactions = async () => {
    try {
      const past = await api.getRecordedTransactions();
      if (Array.isArray(past) && past.length > 0) {
        const formatted = past.map(tx => ({
          type: "TRANSACTION_EVENT",
          transaction: {
            transaction_id: tx.transaction_id,
            merchant_id: tx.merchant_id,
            merchant_name: tx.merchant_name,
            claimed_mcc: tx.claimed_mcc,
            registered_category: "Retail",
            amount_inr: tx.amount_inr,
            currency: "INR",
            payment_method: tx.payment_method,
            customer_id: "cust_db_record",
            cart_item_count: 1,
            cart_items: [{ name: "Checkout Line Item", price: tx.amount_inr }],
            device_user_agent: "Mozilla/5.0 Ingress",
            timestamp: tx.timestamp,
            wire_telemetry: {
              client_ip: tx.client_ip || "103.24.12.88",
              server_ip: "52.66.191.144",
              tcp_rtt_ms: tx.tcp_rtt_ms || 32.0,
              ttl_hops: 54,
              ja4_fingerprint: tx.ja4_fingerprint || "t13d1516h2_8daaf6152771_b7f2f1e29e92",
              tls_cipher_suite: "TLS_AES_128_GCM_SHA256",
              tls_version: "TLSv1.3",
              asn_org: tx.asn_org || "Reliance Jio Infocomm",
              asn_type: "Residential",
              cisco_splt_entropy: tx.cisco_splt_entropy || 2.8,
              packet_burst_rate: 4.2,
              http2_header_order_hash: "h2_std_chrome",
              is_proxy_or_vpn: false
            }
          },
          verdict: {
            transaction_id: tx.transaction_id,
            merchant_id: tx.merchant_id,
            overall_risk_score: tx.overall_risk_score,
            wire_risk_score: tx.wire_risk_score,
            behavioral_risk_score: tx.behavioral_risk_score,
            action: tx.action,
            threat_category: tx.threat_category,
            explainability_reasons: [
              { factor_name: "Persistent DB Record", score_impact: 0, description: tx.summary_text, severity: "LOW" }
            ],
            summary_text: tx.summary_text,
            processing_latency_ms: 0.12
          }
        }));
        setTransactions(formatted);
        setSelectedItem(formatted[0]);
        setStats(prev => ({
          ...prev,
          totalEvaluated: formatted.length
        }));
      }
    } catch (e) {
      console.warn("Could not load past transactions:", e);
    }
  };

  const closeWebSocket = () => {
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
    if (wsRef.current) {
      try {
        wsRef.current.onclose = null;
        wsRef.current.onerror = null;
        wsRef.current.close();
      } catch (e) {}
      wsRef.current = null;
    }
    setConnectionStatus('disconnected');
  };

  const connectWebSocket = useCallback(() => {
    closeWebSocket();
    setConnectionStatus('connecting');
    const wsUrl = api.getWebSocketUrl();

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setConnectionStatus('connected');
        setApiError(null);
        // Start 15s heartbeat
        heartbeatTimerRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "ping" }));
          }
        }, 15000);
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === "TRANSACTION_EVENT") {
            setTransactions(prev => [payload, ...prev.slice(0, 49)]);
            setSelectedItem(prev => prev || payload);

            setStats(prev => {
              const isLaunder = payload.verdict.threat_category === 'CHAMELEON_CLOAKING';
              const action = payload.verdict.action;
              const newTotal = prev.totalEvaluated + 1;

              const allowCount = Math.round((prev.frictionBreakdown.allow / 100) * prev.totalEvaluated) + (action === 'ALLOW' ? 1 : 0);
              const stepUpCount = Math.round((prev.frictionBreakdown.stepUp / 100) * prev.totalEvaluated) + (action === 'STEP_UP_3DS' ? 1 : 0);
              const holdCount = Math.round((prev.frictionBreakdown.hold / 100) * prev.totalEvaluated) + (action === 'SETTLEMENT_HOLD' ? 1 : 0);

              const allowPct = Math.round((allowCount / newTotal) * 100);
              const stepUpPct = Math.round((stepUpCount / newTotal) * 100);
              const holdPct = Math.round((holdCount / newTotal) * 100);
              const blockPct = Math.max(0, 100 - (allowPct + stepUpPct + holdPct));

              return {
                ...prev,
                totalEvaluated: newTotal,
                blockedLaunderingInr: isLaunder 
                  ? prev.blockedLaunderingInr + (payload.transaction.amount_inr || 0)
                  : prev.blockedLaunderingInr,
                activeQuarantines: prev.activeQuarantines + (action === 'BLOCK_QUARANTINE' ? 1 : 0),
                avgLatencyMs: payload.verdict.processing_latency_ms || 0.09,
                frictionBreakdown: { allow: allowPct, stepUp: stepUpPct, hold: holdPct, block: blockPct }
              };
            });
          }
        } catch (err) {
          console.error("Failed to parse WS event:", err);
        }
      };

      ws.onerror = () => {
        setConnectionStatus('disconnected');
      };

      ws.onclose = () => {
        setConnectionStatus('disconnected');
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
    closeWebSocket();
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

  const handleManualEvaluated = (evaluatedItem) => {
    setTransactions(prev => [evaluatedItem, ...prev]);
    setSelectedItem(evaluatedItem);
    setActiveTab('live');
  };

  useEffect(() => {
    loadMerchants();
    loadPastTransactions();

    return () => {
      closeWebSocket();
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
        onOpenAddMerchant={() => setIsAddMerchantOpen(true)}
        onOpenManualTx={() => setIsManualTxOpen(true)}
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

        {/* Tab 1: Live Wire Cockpit */}
        {activeTab === 'live' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              <div className="xl:col-span-5">
                <TransactionFeed
                  transactions={transactions}
                  selectedTx={selectedItem?.transaction}
                  onSelectTx={(item) => setSelectedItem(item)}
                />
              </div>

              <div className="xl:col-span-7">
                <WirePacketInspector
                  transaction={selectedItem?.transaction}
                  verdict={selectedItem?.verdict}
                />
              </div>
            </div>

            {/* Explainable AI Decision Breakdown */}
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

        {/* Tab 3: Dedicated Attack Simulator Arena */}
        {activeTab === 'simulator' && (
          <AttackSimulatorPage
            onLaunchScenario={handleLaunchScenario}
            activeScenario={scenario}
            isStreaming={isStreaming}
            onToggleStream={toggleStream}
          />
        )}

        {/* Tab 4: AI Model Registry & Agent Brain */}
        {activeTab === 'ai' && (
          <AIModelRegistry />
        )}

        {/* Tab 5: Regulatory SAR Studio */}
        {activeTab === 'sar' && (
          <SARReportStudio
            merchants={merchants}
          />
        )}
      </main>

      {/* Modals */}
      <AddMerchantModal
        isOpen={isAddMerchantOpen}
        onClose={() => setIsAddMerchantOpen(false)}
        onMerchantAdded={loadMerchants}
      />

      <ManualTransactionModal
        isOpen={isManualTxOpen}
        onClose={() => setIsManualTxOpen(false)}
        merchants={merchants}
        onEvaluated={handleManualEvaluated}
      />

      {/* Footer */}
      <footer className="border-t border-cyber-border py-4 px-6 text-center text-xs font-mono text-slate-500 bg-cyber-dark">
        Trace Autonomous Risk Engine • Layer 4/7 Wire Telemetry &amp; Isolation Forest AI • Razorpay AI Builder 2026
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cyber-dark flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return <TraceDashboard />;
}
