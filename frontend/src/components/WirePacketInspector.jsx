import React, { useState } from 'react';
import { Network, Server, Shield, Layers, Hash, Clock, Cpu, ChevronRight, ChevronDown, Binary, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

export default function WirePacketInspector({ transaction, verdict }) {
  const [expandedLayer, setExpandedLayer] = useState(3); // Default expand TLS layer

  if (!transaction) {
    return (
      <div className="p-8 rounded-xl custom-glass border border-cyber-border text-center text-slate-400">
        <Network className="w-12 h-12 text-slate-600 mx-auto mb-3 animate-pulse" />
        <p className="font-mono text-sm">Awaiting incoming packet stream...</p>
        <p className="text-xs text-slate-500 mt-1">Start the live stream to inspect wire-level packet captures.</p>
      </div>
    );
  }

  const wire = transaction.wire_telemetry;
  const layers = wire.packet_layers || [];

  return (
    <div className="rounded-xl custom-glass border border-cyber-border overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-cyber-border bg-cyber-card/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-sky-400" />
          <span className="font-mono text-xs font-semibold text-white tracking-wide">
            WIRESHARK / CISCO ETA TELEMETRY INSPECTOR
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold flex items-center gap-1 ${
            wire.is_proxy_or_vpn 
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
          }`}>
            {wire.is_proxy_or_vpn ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
            {wire.is_proxy_or_vpn ? 'PROXY / VPN DETECTED' : 'CLEAN RESIDENTIAL INGRESS'}
          </span>
        </div>
      </div>

      <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Protocol Tree */}
        <div className="lg:col-span-2 space-y-2">
          <p className="text-xs text-slate-400 font-mono mb-2 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-sky-400" /> Packet Protocol Dissection Tree
          </p>

          {layers.map((layer, idx) => {
            const isExpanded = expandedLayer === idx;
            const layerKey = `${layer.name}-${idx}`;
            return (
              <div 
                key={layerKey} 
                className={`rounded-lg border transition-all ${
                  isExpanded 
                    ? 'border-sky-500/40 bg-slate-900/90 shadow-md' 
                    : 'border-slate-800/80 bg-slate-950/50 hover:border-slate-700'
                }`}
              >
                <button
                  onClick={() => setExpandedLayer(isExpanded ? null : idx)}
                  className="w-full px-3.5 py-2.5 flex items-center justify-between text-left font-mono text-xs text-slate-200"
                >
                  <div className="flex items-center gap-2 truncate">
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    )}
                    <span className="truncate">{layer.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 px-2 py-0.5 rounded bg-slate-800/60 shrink-0 ml-2">
                    L{idx === 0 ? '2' : (idx === 1 ? '2' : (idx === 2 ? '3' : (idx === 3 ? '4' : '7')))}
                  </span>
                </button>

                {isExpanded && layer.details && (
                  <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/80 text-xs font-mono space-y-1.5">
                    {Object.entries(layer.details).map(([key, val]) => (
                      <div key={key} className="flex justify-between items-center py-0.5 border-b border-slate-900 last:border-0">
                        <span className="text-slate-400">{key}:</span>
                        <span className={`font-semibold ${
                          String(val).includes('ms') && parseFloat(val) > 150 
                            ? 'text-rose-400 animate-pulse' 
                            : (String(val).includes('Bot') || String(val).includes('Proxy') ? 'text-amber-400' : 'text-slate-200')
                        }`}>
                          {String(val)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Hex Dump Section */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                <Binary className="w-3.5 h-3.5 text-emerald-400" /> Raw Wire Packet Hex Dump (Pcap Sample)
              </span>
              <span className="text-[10px] font-mono text-slate-500">Offset: 0x0000 - 0x0040</span>
            </div>
            <pre className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-400/90 overflow-x-auto leading-relaxed selection:bg-emerald-500 selection:text-slate-950">
              {wire.raw_packet_hex_sample || "0000  00 1a 2b 3c 4d 5e f0 de  f1 23 45 67 08 00 45 00\n0010  02 34 a1 b2 40 00 40 06  b7 12 67 89 ab cd ef 01\n0020  0a 00 00 01 c0 5a 01 bb  1a 2b 3c 4d 5e 6f 70 81\n0030  50 18 01 f5 b4 71 00 00  17 03 03 01 e8 00 00 00"}
            </pre>
          </div>
        </div>

        {/* Right Col: Deep Signals & JA4 Breakdown */}
        <div className="space-y-4">
          {/* Card 1: JA4 TLS Fingerprint */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-slate-300 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-sky-400" /> JA4 TLS Fingerprint
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono">
                {wire.tls_version}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 font-mono text-[11px] break-all text-sky-300">
              {wire.ja4_fingerprint}
            </div>
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>Cipher:</span>
              <span className="text-slate-200 font-mono">{wire.tls_cipher_suite}</span>
            </div>
          </div>

          {/* Card 2: Wire Latency & Distance Anomaly */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" /> TCP Round-Trip (RTT)
              </span>
              <span className={`text-xs font-mono font-bold ${
                wire.tcp_rtt_ms > 180 ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                {wire.tcp_rtt_ms} ms
              </span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
              <div 
                style={{ width: `${Math.min(100, (wire.tcp_rtt_ms / 300) * 100)}%` }} 
                className={`h-full ${wire.tcp_rtt_ms > 180 ? 'bg-rose-500' : (wire.tcp_rtt_ms > 90 ? 'bg-amber-500' : 'bg-emerald-500')}`}
              ></div>
            </div>
            <p className="text-[11px] text-slate-400">
              {wire.tcp_rtt_ms > 180 
                ? '⚠️ Off-shore proxy hop detected (>180ms threshold)' 
                : '✓ Domestic low-latency route verified'}
            </p>
          </div>

          {/* Card 3: Cisco SPLT Entropy */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-slate-300 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-purple-400" /> Cisco SPLT Entropy
              </span>
              <span className="text-xs font-mono font-bold text-purple-300">
                {wire.cisco_splt_entropy} / 4.00
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {wire.cisco_splt_entropy < 1.0 
                ? '🚨 Micro-burst traffic with zero entropy (Automated bot attack)' 
                : '✓ Natural human browsing timing entropy'}
            </p>
          </div>

          {/* Card 4: Origin ASN & IP Routing */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5 text-xs font-mono">
            <div className="text-slate-400 flex justify-between">
              <span>Client IP:</span>
              <span className="text-slate-200">{wire.client_ip}</span>
            </div>
            <div className="text-slate-400 flex justify-between">
              <span>ASN Organization:</span>
              <span className="text-slate-200">{wire.asn_org}</span>
            </div>
            <div className="text-slate-400 flex justify-between">
              <span>Infrastructure:</span>
              <span className="text-sky-400 font-semibold">{wire.asn_type}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
