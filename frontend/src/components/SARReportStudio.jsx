import React, { useState, useEffect } from 'react';
import { FileText, Download, Copy, Check, ShieldCheck, Printer, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';

export default function SARReportStudio({ merchantId = "mid_herbals_4412", merchants = [] }) {
  const [selectedMid, setSelectedMid] = useState(merchantId);
  const [sarReport, setSarReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchReport(selectedMid);
  }, [selectedMid]);

  const fetchReport = async (mid) => {
    setIsLoading(true);
    try {
      const data = await api.generateSAR(mid);
      setSarReport(data);
    } catch (err) {
      console.error(err);
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
          <select
            value={selectedMid}
            onChange={(e) => setSelectedMid(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2.5 font-mono focus:outline-none focus:border-emerald-500"
          >
            {merchants.map(m => (
              <option key={m.merchant_id} value={m.merchant_id}>
                {m.merchant_name} ({m.threat})
              </option>
            ))}
          </select>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'COPIED' : 'COPY'}
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-mono font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            PRINT / PDF
          </button>
        </div>
      </div>

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
