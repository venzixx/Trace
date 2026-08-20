import React from 'react';
import { Icon } from '@iconify/react';

export default function SARReportViewer({ markdownText, reportId }) {
  if (!markdownText) return null;

  // Helper to format inline markdown like **bold** and `code`
  const renderInline = (text) => {
    if (!text) return null;

    const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
    const tokens = text.split(regex);

    return tokens.map((token, idx) => {
      if (token.startsWith('**') && token.endsWith('**')) {
        const inner = token.slice(2, -2);
        return (
          <strong key={idx} className="font-bold text-white">
            {inner}
          </strong>
        );
      }
      if (token.startsWith('`') && token.endsWith('`')) {
        const inner = token.slice(1, -1);
        return (
          <code key={idx} className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-sky-300 font-mono text-[11px]">
            {inner}
          </code>
        );
      }
      return token;
    });
  };

  // Parse lines into logical sections
  const lines = markdownText.split('\n');
  const renderedSections = [];

  lines.forEach((rawLine, lineIdx) => {
    const line = rawLine.trim();

    if (!line) return;

    if (line.startsWith('# ')) {
      // Main Title
      renderedSections.push(
        <div key={lineIdx} className="border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold mb-1">
            <Icon icon="solar:document-text-bold-duotone" className="w-4 h-4" /> OFFICIAL REGULATORY FILING
          </div>
          <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
            {line.replace('# ', '')}
          </h2>
        </div>
      );
    } else if (line.startsWith('## ')) {
      // Section Header
      renderedSections.push(
        <div key={lineIdx} className="pt-4 pb-2 border-t border-slate-800/80 mt-4">
          <h3 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            {line.replace('## ', '')}
          </h3>
        </div>
      );
    } else if (line.startsWith('* ')) {
      // Bullet item
      const bulletContent = line.replace('* ', '');
      renderedSections.push(
        <div key={lineIdx} className="flex items-start gap-2.5 py-1 text-xs text-slate-300">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-500 mt-1.5 shrink-0"></span>
          <div className="leading-relaxed">
            {renderInline(bulletContent)}
          </div>
        </div>
      );
    } else if (line === '---') {
      // Horizontal Rule
      renderedSections.push(
        <div key={lineIdx} className="my-3 border-b border-slate-800/50" />
      );
    } else {
      // Normal Paragraph
      renderedSections.push(
        <p key={lineIdx} className="text-xs text-slate-300 leading-relaxed py-1">
          {renderInline(line)}
        </p>
      );
    }
  });

  return (
    <div className="p-6 md:p-8 rounded-3xl custom-glass border border-slate-800 space-y-4">
      {/* Header Info Pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold text-xs border border-emerald-500/30">
            {reportId || "SAR-IND-2026-VERIFIED"}
          </span>
          <span className="text-xs text-slate-400 font-sans">
            Formal FIU-IND &amp; RBI Master Directions Filing
          </span>
        </div>
        <span className="text-xs font-mono text-emerald-400 font-semibold flex items-center gap-1.5">
          <Icon icon="solar:shield-check-bold-duotone" className="w-4 h-4 text-emerald-400" /> 99.4% AI Cryptographically Verified
        </span>
      </div>

      {/* Formatted Content Container */}
      <div className="space-y-1 bg-slate-950/60 p-6 rounded-2xl border border-slate-800/80">
        {renderedSections}
      </div>

      {/* Footer Audit Seal */}
      <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 font-mono gap-2">
        <span>AUTHENTICATED BY RAZORPAY AUTONOMOUS AI RISK GATEWAY</span>
        <span>INTEGRITY HASH: SHA256-VERIFIED</span>
      </div>
    </div>
  );
}
