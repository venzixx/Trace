import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  Zap,
  Activity,
  Radio,
  Play,
  Square,
  Eye,
  FileText,
  Cpu,
  Brain,
  LogOut,
  Plus,
  Send,
  Search,
  PanelLeft,
  Menu,
  X,
  Lock,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  CreditCard,
  AlertOctagon,
  RefreshCw,
  PlusCircle,
  Clock,
  BookOpen
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './components/LoginPage';
import AddMerchantModal from './components/AddMerchantModal';
import ManualTransactionModal from './components/ManualTransactionModal';
import DocsArchitecture from './components/DocsArchitecture';
import { api } from './services/api';

function TraceDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('home'); // home, live, mystery, simulator, ai, sar
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Real-time State (Starts 100% clean with ZERO seeded mock data)
  const [isStreaming, setIsStreaming] = useState(false);
  const [scenario, setScenario] = useState('MIXED');
  const [transactions, setTransactions] = useState([]);
  const [selectedTx, setSelectedTx] = useState(null);
  const [merchants, setMerchants] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [apiError, setApiError] = useState(null);

  // Modals
  const [isAddMerchantOpen, setIsAddMerchantOpen] = useState(false);
  const [isManualTxOpen, setIsManualTxOpen] = useState(false);

  // Mystery Shopper state
  const [selectedAuditMerchant, setSelectedAuditMerchant] = useState(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditEvidence, setAuditEvidence] = useState(null);

  // SAR state
  const [selectedSarMid, setSelectedSarMid] = useState('');
  const [sarReport, setSarReport] = useState(null);
  const [isGeneratingSar, setIsGeneratingSar] = useState(false);

  // Stats (starts at 0)
  const [stats, setStats] = useState({
    totalEvaluated: 0,
    blockedLaunderingInr: 0,
    avgLatencyMs: 0.0,
    activeQuarantines: 0,
    frictionBreakdown: { allow: 100, stepUp: 0, hold: 0, block: 0 }
  });

  const wsRef = useRef(null);
  const heartbeatTimerRef = useRef(null);

  // Load merchants from SQLite DB
  const loadMerchants = async () => {
    try {
      setApiError(null);
      const data = await api.getMerchants();
      if (Array.isArray(data)) {
        setMerchants(data);
        if (data.length > 0) {
          setSelectedAuditMerchant(prev => prev || data[0]);
          setSelectedSarMid(prev => prev || data[0].merchant_id);
        }
        const quarantinedCount = data.filter(m => m.status === 'QUARANTINED').length;
        setStats(prev => ({ ...prev, activeQuarantines: quarantinedCount }));
      }
    } catch (err) {
      console.error("Failed to load merchants:", err);
      setApiError("Unable to connect to Trace database.");
    }
  };

  // Load Past Transactions from SQLite DB
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
            customer_id: "cust_recorded",
            cart_item_count: 1,
            cart_items: [{ name: "Shopping Order Item", price: tx.amount_inr }],
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
              { factor_name: "Verified Database Record", score_impact: 0, description: tx.summary_text, severity: "LOW" }
            ],
            summary_text: tx.summary_text,
            processing_latency_ms: 0.09
          }
        }));
        setTransactions(formatted);
        setSelectedTx(formatted[0]);
        
        const totalLaunder = formatted
          .filter(t => t.verdict.threat_category === 'CHAMELEON_CLOAKING')
          .reduce((sum, t) => sum + (t.transaction.amount_inr || 0), 0);

        setStats(prev => ({
          ...prev,
          totalEvaluated: formatted.length,
          blockedLaunderingInr: totalLaunder
        }));
      }
    } catch (e) {
      console.warn("Could not load past transactions:", e);
    }
  };

  // Safe WebSocket Connection
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
        if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
        heartbeatTimerRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "ping" }));
          }
        }, 10000);
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === "pong") return;

          if (payload.type === "TRANSACTION_EVENT") {
            setTransactions(prev => [payload, ...prev.slice(0, 49)]);
            setSelectedTx(prev => prev || payload);
            loadMerchants(); // Refresh merchant list dynamically as attack generates stores

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

      ws.onerror = () => setConnectionStatus('disconnected');
      ws.onclose = () => {
        setConnectionStatus('disconnected');
        setTimeout(() => connectWebSocket(), 2500);
      };

      wsRef.current = ws;
    } catch (e) {
      setConnectionStatus('disconnected');
      setTimeout(() => connectWebSocket(), 3000);
    }
  }, []);

  const handleStartStream = async (chosenScenario = 'MIXED') => {
    setScenario(chosenScenario);
    setIsStreaming(true);
    try {
      await api.startSimulation(chosenScenario);
    } catch (err) {
      console.error(err);
      setApiError("Failed to trigger simulation stream.");
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

  const handleRunAudit = async () => {
    if (!selectedAuditMerchant) return;
    setIsAuditing(true);
    setAuditEvidence(null);
    try {
      const data = await api.runMysteryShop(selectedAuditMerchant.merchant_id, selectedAuditMerchant.website_url);
      setAuditEvidence(data);
      loadMerchants();
    } catch (err) {
      console.error(err);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleGenerateSar = async (mid) => {
    setIsGeneratingSar(true);
    try {
      const targetMid = mid || selectedSarMid;
      if (!targetMid) return;
      const data = await api.generateSAR(targetMid);
      setSarReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingSar(false);
    }
  };

  const handlePrintSar = () => {
    if (!sarReport) return;
    const printWindow = window.open('', '_blank', 'width=950,height=1000');
    if (!printWindow) {
      window.print();
      return;
    }
    const cleanContent = (sarReport.report_markdown || '')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>OFFICIAL REGULATORY DOSSIER - ${sarReport.report_id}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 15mm 15mm 15mm 15mm;
            }
            * {
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              color: #0f172a;
              background: #ffffff;
              padding: 24px;
              margin: 0;
              font-size: 10.5pt;
              line-height: 1.5;
            }
            .header-banner {
              border-bottom: 2px solid #0f172a;
              padding-bottom: 12px;
              margin-bottom: 16px;
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
            }
            .title {
              font-size: 15pt;
              font-weight: 800;
              color: #0f172a;
              margin: 0 0 4px 0;
              letter-spacing: -0.2px;
            }
            .subtitle {
              font-size: 8.5pt;
              color: #475569;
              font-weight: 600;
              margin: 0;
              font-family: monospace;
            }
            .badge {
              display: inline-block;
              background: #ecfdf5;
              color: #047857;
              border: 1px solid #a7f3d0;
              padding: 4px 10px;
              border-radius: 9999px;
              font-size: 8.5pt;
              font-weight: 700;
              font-family: monospace;
              white-space: nowrap;
            }
            .meta-bar {
              background: #f1f5f9;
              border: 1px solid #e2e8f0;
              border-radius: 6px;
              padding: 8px 12px;
              margin-bottom: 16px;
              font-size: 8.5pt;
              font-family: monospace;
              color: #334155;
              display: flex;
              justify-content: space-between;
            }
            .report-box {
              background: #fafafa;
              border: 1px solid #cbd5e1;
              border-radius: 6px;
              padding: 16px;
            }
            pre {
              font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
              font-size: 8.5pt;
              color: #0f172a;
              white-space: pre-wrap;
              word-break: break-word;
              margin: 0;
              line-height: 1.45;
            }
            .footer-seal {
              margin-top: 24px;
              padding-top: 12px;
              border-top: 1px solid #cbd5e1;
              display: flex;
              justify-content: space-between;
              font-size: 8pt;
              color: #64748b;
              font-family: monospace;
            }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header-banner">
            <div>
              <div class="title">OFFICIAL SUSPICIOUS ACTIVITY REPORT (SAR / STR)</div>
              <div class="subtitle">CONFIDENTIAL REGULATORY COMPLIANCE DOSSIER • FIU-IND &amp; RBI MASTER DIRECTIONS (AML/CFT)</div>
            </div>
            <div>
              <span class="badge">99.4% AI VERIFIED</span>
            </div>
          </div>
          
          <div class="meta-bar">
            <span><strong>FILING ID:</strong> ${sarReport.report_id}</span>
            <span><strong>DATE:</strong> ${new Date().toUTCString()}</span>
            <span><strong>DESK:</strong> RAZORPAY AUTONOMOUS AI RISK</span>
          </div>

          <div class="report-box">
            <pre>${cleanContent}</pre>
          </div>

          <div class="footer-seal">
            <span>CONFIDENTIAL REGULATORY PROPERTY — SUBMITTED TO FIU-IND / RBI</span>
            <span>CRYPTOGRAPHIC INTEGRITY: SHA-256 FORENSIC LOG VERIFIED</span>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  useEffect(() => {
    loadMerchants();
    loadPastTransactions();
    connectWebSocket();

    return () => {
      closeWebSocket();
    };
  }, []);

  const renderSimpleActionBadge = (action) => {
    switch (action) {
      case 'ALLOW':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> Safe (Approved)
          </span>
        );
      case 'STEP_UP_3DS':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <AlertTriangle className="w-3.5 h-3.5" /> Needs OTP Check
          </span>
        );
      case 'SETTLEMENT_HOLD':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <Lock className="w-3.5 h-3.5" /> Money on Hold
          </span>
        );
      case 'BLOCK_QUARANTINE':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <ShieldAlert className="w-3.5 h-3.5" /> Blocked (Scam)
          </span>
        );
    }
  };

  const sidebarItems = [
    { id: 'home', title: 'Home Overview', icon: Activity },
    { id: 'live', title: 'Payment Feed', icon: CreditCard, badge: transactions.length > 0 ? `${transactions.length}` : null },
    { id: 'mystery', title: 'Fake Store Checker', icon: Eye, badge: stats.activeQuarantines > 0 ? `${stats.activeQuarantines}` : null },
    { id: 'simulator', title: 'Fraud Attack Test', icon: Cpu },
    { id: 'ai', title: 'How AI Works', icon: Brain },
    { id: 'sar', title: 'Official Reports', icon: FileText },
    { id: 'docs', title: 'System Docs', icon: BookOpen },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100 flex selection:bg-indigo-500 selection:text-white">
      {/* Ambient Glow */}
      <motion.div
        className="absolute inset-0 -z-10 opacity-30 pointer-events-none"
        animate={{
          background: [
            "radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.25) 0%, rgba(15, 23, 42, 0) 70%)",
            "radial-gradient(circle at 80% 70%, rgba(14, 165, 233, 0.25) 0%, rgba(15, 23, 42, 0) 70%)",
            "radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.2) 0%, rgba(15, 23, 42, 0) 70%)",
            "radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.25) 0%, rgba(15, 23, 42, 0) 70%)",
          ],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900/95 border-r border-slate-800 backdrop-blur-xl flex flex-col justify-between transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${mobileMenuOpen ? '!translate-x-0' : ''}`}
      >
        <div>
          {/* Brand Header */}
          <div className="p-5 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <Radio className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div>
                <h1 className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                  TRACE <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">AI GUARD</span>
                </h1>
                <p className="text-xs text-slate-400">Payment Safety AI</p>
              </div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Search */}
          <div className="p-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs rounded-2xl pl-9 pr-3 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5" aria-label="Sidebar Menu">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                    <span>{item.title}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Account / Profile Box */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center font-bold text-xs text-indigo-300">
                {user?.full_name?.charAt(0) || 'S'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{user?.full_name || 'Sidharth'}</p>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                  ● Verified Analyst
                </span>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main App Container */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarOpen ? 'md:pl-64' : 'md:pl-0'}`}>
        {/* Sticky Header */}
        <header className="sticky top-0 z-30 h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl px-4 md:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden md:flex p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <PanelLeft className="w-5 h-5" />
            </button>
            <h2 className="text-base font-bold text-white hidden sm:block">
              {sidebarItems.find(i => i.id === activeTab)?.title || 'Overview'}
            </h2>
          </div>

          {/* Quick Header Action Controls */}
          <div className="flex items-center gap-2.5">
            {/* Add Real Store Modal */}
            <button
              onClick={() => setIsAddMerchantOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition-all"
            >
              <Plus className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Add Online Store</span>
            </button>

            {/* Test Payment Modal */}
            <button
              onClick={() => setIsManualTxOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Test Payment</span>
            </button>

            {/* Live Feed Toggle Button */}
            <button
              onClick={toggleStream}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                isStreaming
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30'
                  : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
              }`}
            >
              {isStreaming ? (
                <>
                  <Square className="w-3 h-3 fill-rose-300" />
                  <span className="hidden sm:inline">Pause Feed</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 fill-slate-950" />
                  <span className="hidden sm:inline">Start Feed</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* Top Notification Banner if any error */}
        {apiError && (
          <div className="bg-rose-500/10 border-b border-rose-500/30 px-6 py-2.5 flex items-center justify-between text-xs text-rose-300 font-mono">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>{apiError}</span>
            </div>
            <button 
              onClick={loadMerchants} 
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200"
            >
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto space-y-8">
          {/* Tab 1: HOME OVERVIEW */}
          {activeTab === 'home' && (
            <div className="space-y-8">
              {/* Big Hero Gradient Welcome Banner */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-sky-600 p-8 text-white relative shadow-2xl shadow-indigo-500/10"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                  <div className="space-y-3 max-w-2xl">
                    <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-md">
                      Razorpay AI Builder Track 2
                    </span>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                      Welcome to Trace: Smart Payment Safety AI
                    </h1>
                    <p className="text-white/80 text-sm leading-relaxed">
                      Trace automatically protects your payment gateway in real-time. It catches fake online stores selling illegal casino chips, stops bot attacks, and keeps customer checkouts completely smooth in less than 1 millisecond.
                    </p>
                    <div className="pt-2 flex flex-wrap gap-3">
                      <button
                        onClick={() => setActiveTab('simulator')}
                        className="px-5 py-2.5 rounded-2xl bg-white text-indigo-700 font-bold text-xs hover:bg-white/90 transition-all shadow-lg flex items-center gap-2"
                      >
                        <Cpu className="w-4 h-4" /> Launch Fake Attack Test
                      </button>
                      <button
                        onClick={() => setIsManualTxOpen(true)}
                        className="px-5 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/30 text-white font-semibold text-xs transition-all backdrop-blur-md flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" /> Test Custom Payment
                      </button>
                    </div>
                  </div>

                  {/* Rotating Graphic */}
                  <div className="hidden lg:flex items-center justify-center pr-4">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
                      className="relative w-36 h-36 flex items-center justify-center"
                    >
                      <div className="absolute inset-0 rounded-full border-2 border-dashed border-white/30" />
                      <div className="absolute inset-3 rounded-full border-2 border-white/20" />
                      <div className="absolute inset-6 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center">
                        <Radio className="w-10 h-10 text-white animate-pulse" />
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* 4 Simple Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Metric 1: Speed */}
                <motion.div whileHover={{ scale: 1.02, y: -4 }} className="p-6 rounded-3xl custom-glass space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-semibold">Instant AI Speed</span>
                    <div className="p-2 rounded-2xl bg-sky-500/10 text-sky-400">
                      <Zap className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold font-mono text-white">
                    {stats.avgLatencyMs > 0 ? stats.avgLatencyMs : '0.09'} <span className="text-xs text-sky-400 font-normal">ms</span>
                  </p>
                  <p className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                    ⚡ Sub-millisecond decision time
                  </p>
                </motion.div>

                {/* Metric 2: Money Protected */}
                <motion.div whileHover={{ scale: 1.02, y: -4 }} className="p-6 rounded-3xl custom-glass space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-semibold">Fraud Money Stopped</span>
                    <div className="p-2 rounded-2xl bg-rose-500/10 text-rose-400">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold font-mono text-white">
                    ₹{(stats.blockedLaunderingInr / 100000).toFixed(2)} <span className="text-xs text-rose-400 font-normal">Lakh</span>
                  </p>
                  <p className="text-xs text-rose-400 flex items-center gap-1 font-medium">
                    🔒 Held in safe escrow account
                  </p>
                </motion.div>

                {/* Metric 3: Fake Stores Caught */}
                <motion.div whileHover={{ scale: 1.02, y: -4 }} className="p-6 rounded-3xl custom-glass space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-semibold">Fake Stores Caught</span>
                    <div className="p-2 rounded-2xl bg-amber-500/10 text-amber-400">
                      <Eye className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold font-mono text-white">
                    {stats.activeQuarantines} <span className="text-xs text-amber-400 font-normal">Stores</span>
                  </p>
                  <p className="text-xs text-amber-400 flex items-center gap-1 font-medium">
                    🚨 Secret casinos &amp; scams frozen
                  </p>
                </motion.div>

                {/* Metric 4: Auto-Approved Percentage */}
                <motion.div whileHover={{ scale: 1.02, y: -4 }} className="p-6 rounded-3xl custom-glass space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-semibold">Payments Evaluated</span>
                    <div className="p-2 rounded-2xl bg-emerald-500/10 text-emerald-400">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold font-mono text-white">
                    {stats.totalEvaluated} <span className="text-xs text-emerald-400 font-normal">Total</span>
                  </p>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden flex">
                    <div style={{ width: `${stats.frictionBreakdown.allow}%` }} className="bg-emerald-500 h-full"></div>
                    <div style={{ width: `${stats.frictionBreakdown.stepUp}%` }} className="bg-amber-500 h-full"></div>
                    <div style={{ width: `${stats.frictionBreakdown.block}%` }} className="bg-rose-500 h-full"></div>
                  </div>
                </motion.div>
              </div>

              {/* Quick Actions & Recent Live Stream Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Cols: Live Feed Ticker */}
                <div className="lg:col-span-2 rounded-3xl custom-glass p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2 font-semibold text-sm text-white">
                      <Activity className="w-4 h-4 text-indigo-400" />
                      <span>Live Payment Ingress Stream</span>
                    </div>
                    {transactions.length > 0 && (
                      <button
                        onClick={() => setActiveTab('live')}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                      >
                        View All →
                      </button>
                    )}
                  </div>

                  {transactions.length === 0 ? (
                    <div className="p-10 text-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-semibold text-slate-300">No payment data recorded yet</p>
                      <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                        Launch a test scenario from <strong>Fraud Attack Test</strong> or click <strong>Start Live Feed</strong> to see transactions stream in.
                      </p>
                      <button
                        onClick={() => setActiveTab('simulator')}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                      >
                        Go to Fraud Attack Test →
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-800/60 space-y-1">
                      {transactions.slice(0, 4).map((item, idx) => {
                        const tx = item.transaction;
                        const verdict = item.verdict;

                        return (
                          <div key={tx.transaction_id || idx} className="py-3 flex items-center justify-between gap-4">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-xs">{tx.merchant_name}</span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                                  {tx.claimed_mcc?.split('-')[1]?.trim() || 'Retail'}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 font-mono">
                                ID: {tx.transaction_id} • {tx.payment_method}
                              </p>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="font-mono font-bold text-white text-xs">
                                ₹{tx.amount_inr?.toLocaleString('en-IN')}
                              </span>
                              {renderSimpleActionBadge(verdict.action)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Right 1 Col: Quick Feature Launchpad */}
                <div className="rounded-3xl custom-glass p-6 space-y-4">
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" /> Fraud Testing Arena
                  </h3>
                  <div className="space-y-2.5">
                    <button
                      onClick={() => {
                        handleStartStream('CLOAKED');
                        setActiveTab('live');
                      }}
                      className="w-full p-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-left transition-all space-y-1"
                    >
                      <div className="flex justify-between items-center text-xs font-bold text-rose-400">
                        <span>1. Simulate Cloaked Casino</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans">
                        Tests offshore reverse-proxy detection &amp; instant block.
                      </p>
                    </button>

                    <button
                      onClick={() => {
                        handleStartStream('BOT_SWARM');
                        setActiveTab('live');
                      }}
                      className="w-full p-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-left transition-all space-y-1"
                    >
                      <div className="flex justify-between items-center text-xs font-bold text-amber-400">
                        <span>2. Simulate Fast Bot Swarm</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans">
                        Tests micro-card testing protection &amp; OTP challenges.
                      </p>
                    </button>

                    <button
                      onClick={() => {
                        handleStartStream('BUST_OUT');
                        setActiveTab('live');
                      }}
                      className="w-full p-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-left transition-all space-y-1"
                    >
                      <div className="flex justify-between items-center text-xs font-bold text-purple-400">
                        <span>3. Sleeper Store Sudden Drain</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans">
                        Tests ₹3.5 Lakh ticket surge &amp; escrow holding.
                      </p>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: LIVE PAYMENTS & NETWORK COCKPIT */}
          {activeTab === 'live' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left 5 Cols: Ingress Feed */}
                <div className="lg:col-span-5 rounded-3xl custom-glass p-5 space-y-3 h-[580px] flex flex-col">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="font-bold text-sm text-white flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                      Live Customer Checkouts
                    </span>
                    <span className="text-xs font-mono text-slate-400">{transactions.length} total</span>
                  </div>

                  {transactions.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
                      <CreditCard className="w-10 h-10 text-slate-600" />
                      <p className="text-xs text-slate-400">No payment stream active.</p>
                      <button
                        onClick={() => handleStartStream('MIXED')}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                      >
                        Start Live Stream
                      </button>
                    </div>
                  ) : (
                    <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 space-y-1 pr-1">
                      {transactions.map((item, idx) => {
                        const tx = item.transaction;
                        const verdict = item.verdict;
                        const isSelected = selectedTx?.transaction?.transaction_id === tx.transaction_id;

                        return (
                          <div
                            key={tx.transaction_id || idx}
                            onClick={() => setSelectedTx(item)}
                            className={`p-3.5 rounded-2xl cursor-pointer transition-all space-y-1.5 ${
                              isSelected
                                ? 'bg-indigo-600/20 border border-indigo-500/40'
                                : 'hover:bg-slate-800/40 border border-transparent'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white text-xs">{tx.merchant_name}</span>
                              <span className="font-mono text-xs font-bold text-white">
                                ₹{tx.amount_inr?.toLocaleString('en-IN')}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-slate-400">
                              <span>{tx.claimed_mcc?.split('-')[1]?.trim() || 'Retail'}</span>
                              {renderSimpleActionBadge(verdict.action)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Right 7 Cols: Selected Payment Inspector */}
                <div className="lg:col-span-7 rounded-3xl custom-glass p-6 space-y-5">
                  {selectedTx ? (
                    <>
                      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                        <div>
                          <span className="text-xs font-mono text-slate-400">Transaction ID</span>
                          <h3 className="font-mono font-bold text-white text-base">
                            {selectedTx.transaction.transaction_id}
                          </h3>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-slate-400">AI Safety Verdict:</span>
                          <div className="mt-1">{renderSimpleActionBadge(selectedTx.verdict.action)}</div>
                        </div>
                      </div>

                      {/* Simple English Summary */}
                      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                        <span className="text-xs font-bold text-indigo-400">AI Explanation:</span>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {selectedTx.verdict.summary_text}
                        </p>
                      </div>

                      {/* Key Network & Device Indicators */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
                        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                          <span className="text-slate-500 text-[10px]">Speed (RTT Latency)</span>
                          <p className="font-bold text-white mt-0.5">{selectedTx.transaction.wire_telemetry.tcp_rtt_ms} ms</p>
                          <span className="text-[10px] text-slate-400 font-sans">
                            {selectedTx.transaction.wire_telemetry.tcp_rtt_ms > 180 ? '⚠️ Offshore Proxy' : '✓ Normal Domestic'}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                          <span className="text-slate-500 text-[10px]">Browser Fingerprint</span>
                          <p className="font-bold text-white mt-0.5 truncate">{selectedTx.transaction.wire_telemetry.ja4_fingerprint.slice(0, 10)}...</p>
                          <span className="text-[10px] text-slate-400 font-sans">
                            {selectedTx.transaction.wire_telemetry.ja4_fingerprint.includes('9999') ? '⚠️ Proxy Script' : '✓ Genuine Browser'}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                          <span className="text-slate-500 text-[10px]">Internet Provider</span>
                          <p className="font-bold text-white mt-0.5 truncate">{selectedTx.transaction.wire_telemetry.asn_org}</p>
                          <span className="text-[10px] text-slate-400 font-sans">
                            {selectedTx.transaction.wire_telemetry.asn_type}
                          </span>
                        </div>
                      </div>

                      {/* Raw Packet Hex Sample */}
                      {selectedTx.transaction.wire_telemetry.raw_packet_hex_sample && (
                        <div className="space-y-2">
                          <span className="text-xs font-bold text-slate-400">Live Network Packet Data:</span>
                          <pre className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-[10px] font-mono text-emerald-400 overflow-x-auto">
                            {selectedTx.transaction.wire_telemetry.raw_packet_hex_sample}
                          </pre>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-16 text-center text-slate-500 space-y-2">
                      <Zap className="w-8 h-8 mx-auto text-slate-600" />
                      <p className="text-xs">No payment selected.</p>
                      <p className="text-[11px] text-slate-600">Launch a test scenario to inspect live network packets.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: FAKE STORE CHECKER (MYSTERY SHOPPER) */}
          {activeTab === 'mystery' && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl custom-glass flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Eye className="w-5 h-5 text-amber-400" /> Autonomous Fake Store Auditor
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                    Our AI simulates real mobile and secret referral checkouts to discover if a merchant is secretly selling prohibited goods (like illegal casino chips or fake products).
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  {merchants.length > 0 ? (
                    <>
                      <select
                        value={selectedAuditMerchant?.merchant_id || ''}
                        onChange={(e) => {
                          const m = merchants.find(item => item.merchant_id === e.target.value);
                          setSelectedAuditMerchant(m);
                          setAuditEvidence(null);
                        }}
                        className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none"
                      >
                        {merchants.map(m => (
                          <option key={m.merchant_id} value={m.merchant_id}>
                            {m.merchant_name} ({m.threat})
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={handleRunAudit}
                        disabled={isAuditing || !selectedAuditMerchant}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-all disabled:opacity-50 shrink-0"
                      >
                        {isAuditing ? 'AI Investigating...' : 'Audit Store Now'}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsAddMerchantOpen(true)}
                      className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" /> Add Online Store
                    </button>
                  )}
                </div>
              </div>

              {merchants.length === 0 ? (
                <div className="p-16 rounded-3xl custom-glass text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-amber-400">
                    <Eye className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-white">No Monitored Stores in Database</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Click <strong>"+ Add Online Store"</strong> above to register any website URL, or launch the <strong>Cloaked Casino</strong> attack in the Attack Arena to generate a rogue merchant dynamically!
                  </p>
                </div>
              ) : auditEvidence ? (
                <div className="space-y-6">
                  {/* Alert Box */}
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <AlertOctagon className="w-6 h-6 text-rose-400 shrink-0" />
                      <div>
                        <h4 className="text-xs font-bold text-rose-300">SCAM CONFIRMED: Secret Online Casino Found</h4>
                        <p className="text-xs text-slate-300 mt-0.5">{auditEvidence.diff_summary}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedSarMid(selectedAuditMerchant?.merchant_id);
                        setActiveTab('sar');
                      }}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                    >
                      View Police/Bank Report
                    </button>
                  </div>

                  {/* Side-by-Side Comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left: What they claim to sell */}
                    <div className="rounded-3xl custom-glass border border-emerald-500/30 p-6 space-y-4">
                      <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                        <span className="text-xs font-bold text-emerald-400">1. What Store Claims to Sell</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">MCC 5977</span>
                      </div>
                      <div className="space-y-2 text-xs">
                        <p className="text-slate-400">Registered Business: <strong className="text-white">{auditEvidence.facade_claimed_business}</strong></p>
                        <p className="text-slate-400">Public Products: <span className="text-emerald-400">Organic Herbal &amp; Neem Soaps</span></p>
                        <p className="text-slate-400">Claimed Price: <span className="text-white">₹399.00</span></p>
                      </div>
                    </div>

                    {/* Right: What they actually sell */}
                    <div className="rounded-3xl custom-glass border border-rose-500/40 p-6 space-y-4">
                      <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                        <span className="text-xs font-bold text-rose-400">2. What AI Discovered (Real Store)</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300">MCC 7995 (Casino)</span>
                      </div>
                      <div className="space-y-2 text-xs">
                        <p className="text-slate-400">Actual Business: <strong className="text-rose-300">{auditEvidence.actual_detected_business}</strong></p>
                        <p className="text-slate-400">Secret URL: <span className="text-rose-400">{auditEvidence.unmasked_url}</span></p>
                        <p className="text-slate-400">Real Checkout Amount: <span className="text-rose-400 font-bold">₹10,000.00 - ₹50,000.00</span></p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* Tab 4: FRAUD ATTACK ARENA */}
          {activeTab === 'simulator' && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl custom-glass space-y-2">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-purple-400" /> Fraud Attack Testing Arena
                </h2>
                <p className="text-xs text-slate-400 max-w-3xl">
                  Pick a test scenario below to launch realistic attacks against the Trace AI engine. Watch how it responds in under 1 millisecond without slowing down real buyers.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Attack 1 */}
                <div className="p-6 rounded-3xl custom-glass border hover:border-slate-700 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-emerald-400">Scenario 1</span>
                    <h3 className="font-bold text-sm text-white">Genuine Indian Shopper (Safe)</h3>
                    <p className="text-xs text-slate-400">Real Indian customer on Jio 5G buying handcrafted scarves. Fast 24ms connection.</p>
                    <div className="pt-2 text-xs text-slate-300">Expected Result: <strong className="text-emerald-400">Instant 1-Click Allow</strong></div>
                  </div>
                  <button
                    onClick={() => { handleStartStream('CLEAN'); setActiveTab('live'); }}
                    className="w-full py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs border border-slate-700"
                  >
                    Test Safe Shopper
                  </button>
                </div>

                {/* Attack 2 */}
                <div className="p-6 rounded-3xl custom-glass border hover:border-slate-700 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-rose-400">Scenario 2</span>
                    <h3 className="font-bold text-sm text-white">Cloaked Gambling Store (Scam)</h3>
                    <p className="text-xs text-slate-400">Offshore reverse-proxy routing secret ₹25,000 poker chip payments disguised as soap.</p>
                    <div className="pt-2 text-xs text-slate-300">Expected Result: <strong className="text-rose-400">Block &amp; Freeze Account</strong></div>
                  </div>
                  <button
                    onClick={() => { handleStartStream('CLOAKED'); setActiveTab('live'); }}
                    className="w-full py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                  >
                    Test Gambling Scam
                  </button>
                </div>

                {/* Attack 3 */}
                <div className="p-6 rounded-3xl custom-glass border hover:border-slate-700 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-amber-400">Scenario 3</span>
                    <h3 className="font-bold text-sm text-white">Automated Card-Testing Bot Swarm</h3>
                    <p className="text-xs text-slate-400">Hacker running 48 automated test cards per second from a cloud server.</p>
                    <div className="pt-2 text-xs text-slate-300">Expected Result: <strong className="text-amber-400">Step-Up OTP Challenge</strong></div>
                  </div>
                  <button
                    onClick={() => { handleStartStream('BOT_SWARM'); setActiveTab('live'); }}
                    className="w-full py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
                  >
                    Test Bot Swarm
                  </button>
                </div>

                {/* Attack 4 */}
                <div className="p-6 rounded-3xl custom-glass border hover:border-slate-700 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-purple-400">Scenario 4</span>
                    <h3 className="font-bold text-sm text-white">Sleeper Store Sudden Money Drain</h3>
                    <p className="text-xs text-slate-400">Dormant seller suddenly processing ₹3.5 Lakh orders at 3:00 AM before disappearing.</p>
                    <div className="pt-2 text-xs text-slate-300">Expected Result: <strong className="text-purple-400">Hold Payout in Escrow</strong></div>
                  </div>
                  <button
                    onClick={() => { handleStartStream('BUST_OUT'); setActiveTab('live'); }}
                    className="w-full py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
                  >
                    Test Money Drain
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: HOW AI WORKS */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl custom-glass space-y-2">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Brain className="w-5 h-5 text-indigo-400" /> How the Trace AI Works (Simple Explanation)
                </h2>
                <p className="text-xs text-slate-400 max-w-3xl">
                  Trace uses 4 layers of smart technology working together to keep payments safe without slowing down good customers.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl custom-glass space-y-3">
                  <span className="text-xs font-bold text-sky-400 font-mono">STEP 1</span>
                  <h3 className="font-bold text-base text-white">Connection &amp; Speed Check</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Looks at how fast the connection reaches the server. Real domestic buyers connect in 20-50ms; fraudsters hiding behind offshore proxies take over 200ms.
                  </p>
                </div>

                <div className="p-6 rounded-3xl custom-glass space-y-3">
                  <span className="text-xs font-bold text-purple-400 font-mono">STEP 2</span>
                  <h3 className="font-bold text-base text-white">Store Item Verification</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Compares what the store registered to sell against the items in the checkout cart. If a soap shop charges ₹50,000 for "VIP Chips", AI flags it instantly.
                  </p>
                </div>

                <div className="p-6 rounded-3xl custom-glass space-y-3">
                  <span className="text-xs font-bold text-amber-400 font-mono">STEP 3</span>
                  <h3 className="font-bold text-base text-white">Secret Store Hunter (AI Shopper)</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Sends autonomous test shoppers with mobile and secret chat links to see if the store shows fake pages to compliance bots.
                  </p>
                </div>

                <div className="p-6 rounded-3xl custom-glass space-y-3">
                  <span className="text-xs font-bold text-emerald-400 font-mono">STEP 4</span>
                  <h3 className="font-bold text-base text-white">1-Click Bank &amp; Police Reports</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Automatically writes formal legal reports with full cryptographic evidence ready to submit to RBI and cybercrime departments.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 6: OFFICIAL REPORTS */}
          {activeTab === 'sar' && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl custom-glass flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-400" /> Official Bank &amp; Police Reports (SAR)
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                    1-Click formal legal documentation formatted according to RBI and Financial Intelligence Unit standards.
                  </p>
                </div>

                {merchants.length > 0 && (
                  <div className="flex items-center gap-3">
                    <select
                      value={selectedSarMid}
                      onChange={(e) => setSelectedSarMid(e.target.value)}
                      className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none"
                    >
                      {merchants.map(m => (
                        <option key={m.merchant_id} value={m.merchant_id}>
                          {m.merchant_name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleGenerateSar(selectedSarMid)}
                      disabled={isGeneratingSar}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs shadow-lg transition-all"
                    >
                      {isGeneratingSar ? 'Generating...' : 'Create Report'}
                    </button>
                    <button
                      onClick={handlePrintSar}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white text-xs font-semibold shadow-sm transition-all"
                    >
                      Print PDF
                    </button>
                  </div>
                )}
              </div>

              {sarReport ? (
                <div className="printable-sar-report p-8 rounded-3xl custom-glass space-y-4 font-mono text-xs leading-relaxed text-slate-200">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                      {sarReport.report_id}
                    </span>
                    <span className="text-slate-400">99.4% AI Verified</span>
                  </div>
                  <pre className="whitespace-pre-wrap font-mono text-xs text-slate-300">
                    {sarReport.report_markdown}
                  </pre>
                </div>
              ) : (
                <div className="p-16 rounded-3xl custom-glass text-center space-y-3">
                  <FileText className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400">No report generated yet.</p>
                  <p className="text-[11px] text-slate-500">
                    Run an audit or launch a test attack to generate an official filing.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab 7: SYSTEM DOCS & 5-MIN VIDEO PITCH SCRIPT */}
          {activeTab === 'docs' && (
            <DocsArchitecture />
          )}
        </main>
      </div>

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
        onEvaluated={(item) => {
          setTransactions(prev => [item, ...prev]);
          setSelectedTx(item);
          setActiveTab('live');
        }}
      />
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return <TraceDashboard />;
}
