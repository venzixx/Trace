import React, { useState, useEffect } from 'react';
import { FileText, Copy, Check, Printer, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function SARReportStudio({ merchantId, merchants = [] }) {
  const [selectedMid, setSelectedMid] = useState(merchantId || (merchants[0]?.merchant_id || "mid_herbals_4412"));
  const [sarReport, setSarReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Sync selectedMid if merchants array changes and selectedMid not set
  useEffect(() => {
    if (!selectedMid && merchants.length > 0) {
      setSelectedMid(merchants[0].merchant_id);
    }
  }, [merchants, selectedMid]);

  useEffect(() => {
    if (selectedMid) {
      fetchReport(selectedMid);
    }
  }, [selectedMid]);

  const fetchReport = async (mid) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await api.generateSAR(mid);
      setSarReport(data);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to generate regulatory SAR report. Please check backend connectivity.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (sarReport?.report_markdown) {
      navigator.clipboard.writeText(sarReport.report_markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="p-6 rounded-xl custom-glass border border-cyber-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold font-mono text-white">
              REGULATORY SUSPICIOUS ACTIVITY REPORT (SAR) STUDIO
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Automated compliance engine generating legally binding Suspicious Activity Reports (SAR/STR) formatted for RBI Master Directions, FIU-IND, and Visa/Mastercard GBPP programs.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <label htmlFor="sar-merchant-select" className="sr-only">Select Merchant for SAR Dossier</label>
          <select
            id="sar-merchant-select"
            aria-label="Select Merchant for SAR Dossier"
            value={selectedMid}
            onChange={(e) => setSelectedMid(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2.5 font-mono focus:outline-none focus:border-emerald-500"
          >
            {merchants.length > 0 ? (
              merchants.map(m => (
                <option key={m.merchant_id} value={m.merchant_id}>
                  {m.merchant_name} ({m.threat})
                </option>
              ))
            ) : (
              <option value="mid_herbals_4412">Pure Herbals Organics (CHAMELEON_CLOAKING)</option>
            )}
          </select>

          <button
            onClick={handleCopy}
            disabled={!sarReport}
            aria-label="Copy SAR Markdown"
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 transition-all disabled:opacity-50"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'COPIED' : 'COPY'}
          </button>

          <button
            onClick={handlePrint}
            disabled={!sarReport}
            aria-label="Print or export SAR report as PDF"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-mono font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
          >
            <Printer className="w-3.5 h-3.5" />
            PRINT / PDF
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

      {/* SAR Document Viewer */}
      {isLoading ? (
        <div className="p-16 rounded-xl custom-glass border border-cyber-border text-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="font-mono text-xs text-slate-400">Compiling regulatory evidence and cryptographic signatures...</p>
        </div>
      ) : sarReport ? (
        <div className="rounded-xl custom-glass border border-cyber-border overflow-hidden p-8 font-mono text-xs leading-relaxed text-slate-300">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
            <div>
              <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 text-xs">
                OFFICIAL REGULATORY DOSSIER: {sarReport.report_id}
              </span>
              <p className="text-[11px] text-slate-400 mt-1">Target Authority: {sarReport.regulatory_body}</p>
            </div>
            <div className="text-right">
              <span className="text-slate-400 text-[11px]">AI Confidence:</span>
              <p className="text-emerald-400 font-bold text-sm">{sarReport.confidence_score}% Verified</p>
            </div>
          </div>

          {/* Render Markdown formatted SAR */}
          <div className="space-y-4 whitespace-pre-wrap font-mono text-xs text-slate-200">
            {sarReport.report_markdown}
          </div>
        </div>
      ) : null}
    </div>
  );
}
