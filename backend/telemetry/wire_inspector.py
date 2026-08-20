import hashlib
import random
import math
from typing import Dict, Any, List, Tuple
from core.schemas import WireTelemetry

# Known JA4 signatures for human browsers vs automated tooling
KNOWN_JA4_DATABASE = {
    # Genuine Human Browsers (Chrome, Safari, Firefox on Desktop/Mobile)
    "t13d1516h2_8daaf6152771_b7f2f1e29e92": {"client": "Chrome 128 (Windows 11)", "is_bot": False, "trust_score": 98},
    "t13i1909h2_7909a349c819_8435d64472f8": {"client": "Safari 17 (iOS 18)", "is_bot": False, "trust_score": 99},
    "t13d2012h2_d0a1b2c3d4e5_f6a7b8c9d0e1": {"client": "Firefox 130 (macOS)", "is_bot": False, "trust_score": 95},
    
    # Automated Scrapers / Headless Bots / Custom Attack Scripts
    "t12d0804h0_5a1098df23aa_c91028ba491a": {"client": "Python Requests / Urllib", "is_bot": True, "trust_score": 12},
    "t13d0905h2_000000000000_111111111111": {"client": "Puppeteer / Headless Chromium", "is_bot": True, "trust_score": 18},
    "t11d0402h0_fa4910dc8901_3389021fa4b1": {"client": "Go-http-client / Carding Bot", "is_bot": True, "trust_score": 5},
    "t13d9999h0_666666666666_999999999999": {"client": "Laundering Reverse Proxy Relay", "is_bot": True, "trust_score": 8},
}

class WireInspector:
    """
    Performs Deep Packet Inspection & Wire Telemetry Analysis on checkout connections.
    Emulates Wireshark / Zeek / Cisco ETA Layer 4 & Layer 7 feature extraction.
    """

    @staticmethod
    def compute_splt_entropy(packet_lengths: List[int], packet_intervals_ms: List[float]) -> float:
        """
        Cisco ETA: Sequence of Packet Lengths & Timing (SPLT) Entropy.
        Automated bots have repetitive, near-zero entropy; humans have natural variability.
        """
        if not packet_lengths or not packet_intervals_ms:
            return 2.45
        
        # Calculate Shannon entropy over length distribution
        length_counts = {}
        for l in packet_lengths:
            bucket = l // 100
            length_counts[bucket] = length_counts.get(bucket, 0) + 1
        
        total = len(packet_lengths)
        entropy = 0.0
        for count in length_counts.values():
            p = count / total
            if p > 0:
                entropy -= p * math.log2(p)
                
        # Factor in timing variance
        if len(packet_intervals_ms) > 1:
            mean_t = sum(packet_intervals_ms) / len(packet_intervals_ms)
            variance_t = sum((t - mean_t) ** 2 for t in packet_intervals_ms) / len(packet_intervals_ms)
            std_t = math.sqrt(variance_t)
            if std_t < 2.0: # Mechanically identical packet timing (bot farm)
                entropy *= 0.4
                
        return round(max(0.1, min(entropy, 4.0)), 2)

    @staticmethod
    def analyze_wire_signals(telemetry: WireTelemetry) -> Tuple[float, List[Dict[str, Any]]]:
        """
        Scores the wire telemetry from 0 (ultra-safe) to 100 (critical threat).
        Returns wire_risk_score and detailed telemetry findings.
        """
        wire_score = 0.0
        findings = []

        # 1. JA4 TLS Fingerprint Inspection
        ja4_info = KNOWN_JA4_DATABASE.get(telemetry.ja4_fingerprint)
        if ja4_info:
            if ja4_info["is_bot"]:
                wire_score += 45.0
                findings.append({
                    "layer": "Layer 7 (TLS JA4)",
                    "signal": "Automated Headless / Bot TLS Fingerprint Detected",
                    "detail": f"Matched known signature: {ja4_info['client']}",
                    "severity": "CRITICAL"
                })
            else:
                findings.append({
                    "layer": "Layer 7 (TLS JA4)",
                    "signal": "Authentic Browser Handshake Verified",
                    "detail": f"Matched trusted profile: {ja4_info['client']}",
                    "severity": "LOW"
                })
        else:
            # Unknown JA4
            wire_score += 15.0
            findings.append({
                "layer": "Layer 7 (TLS JA4)",
                "signal": "Unregistered / Custom TLS Client Hello",
                "detail": f"JA4 hash {telemetry.ja4_fingerprint[:16]}... not in global browser registry",
                "severity": "MEDIUM"
            })

        # 2. TCP RTT & Geographic Wire Latency Anomaly
        if telemetry.tcp_rtt_ms > 180.0:
            wire_score += 35.0
            findings.append({
                "layer": "Layer 4 (TCP RTT)",
                "signal": "Abnormal Offshore Wire Latency (Proxy Tunnel)",
                "detail": f"Measured RTT {telemetry.tcp_rtt_ms}ms exceeds domestic threshold (85ms). Indicates offshore relay.",
                "severity": "HIGH"
            })
        elif telemetry.tcp_rtt_ms > 100.0:
            wire_score += 10.0
            findings.append({
                "layer": "Layer 4 (TCP RTT)",
                "signal": "Elevated Round-Trip Latency",
                "detail": f"RTT is {telemetry.tcp_rtt_ms}ms",
                "severity": "MEDIUM"
            })
        else:
            findings.append({
                "layer": "Layer 4 (TCP RTT)",
                "signal": "Clean Domestic Wire Latency",
                "detail": f"Fast domestic connection ({telemetry.tcp_rtt_ms}ms)",
                "severity": "LOW"
            })

        # 3. Cisco ETA Packet Timing Entropy (SPLT)
        if telemetry.cisco_splt_entropy < 1.0:
            wire_score += 25.0
            findings.append({
                "layer": "Layer 4 (Cisco ETA SPLT)",
                "signal": "Zero-Variance Packet Cadence (Scripted Swarm)",
                "detail": f"SPLT Entropy is {telemetry.cisco_splt_entropy} (Normal: 2.2 - 3.8). Micro-burst traffic.",
                "severity": "CRITICAL"
            })
        elif telemetry.cisco_splt_entropy < 1.6:
            wire_score += 10.0
            findings.append({
                "layer": "Layer 4 (Cisco ETA SPLT)",
                "signal": "Low Packet Entropy",
                "detail": f"SPLT Entropy is {telemetry.cisco_splt_entropy}",
                "severity": "MEDIUM"
            })

        # 4. ASN & Routing Infrastructure
        if telemetry.asn_type in ["Datacenter", "Tor/VPN"]:
            wire_score += 30.0
            findings.append({
                "layer": "Layer 3 (IP/ASN)",
                "signal": "Non-Residential Hosting Infrastructure",
                "detail": f"Origin ASN is '{telemetry.asn_org}' ({telemetry.asn_type}). Consumer checkouts rarely originate from server farms.",
                "severity": "HIGH"
            })
        if telemetry.is_proxy_or_vpn:
            wire_score += 15.0
            findings.append({
                "layer": "Layer 3 (Routing)",
                "signal": "Anonymized Proxy / VPN Ingress Detected",
                "detail": "Connection routed through an anonymizer node.",
                "severity": "MEDIUM"
            })

        final_score = round(max(0.0, min(wire_score, 100.0)), 1)
        return final_score, findings

    @staticmethod
    def generate_wireshark_packet_dump(telemetry: WireTelemetry, amount: float, merchant: str) -> Dict[str, Any]:
        """
        Generates realistic Wireshark packet capture layers and raw hex dump for UI rendering.
        """
        seq_num = random.randint(1000000, 9999999)
        ack_num = random.randint(1000000, 9999999)
        
        # Hex representation sample
        hex_data = [
            f"0000  00 1a 2b 3c 4d 5e f0 de  f1 23 45 67 08 00 45 00",
            f"0010  02 34 a1 b2 40 00 40 06  b7 12 {telemetry.client_ip.replace('.', ' ')}",
            f"0020  {telemetry.server_ip.replace('.', ' ')} c0 5a 01 bb {seq_num % 256:02x} {ack_num % 256:02x}",
            f"0030  50 18 01 f5 b4 71 00 00  17 03 03 01 e8 00 00 00",
            f"0040  00 00 00 01 {telemetry.ja4_fingerprint[:8]} 7f 89 2a 3b 4c",
        ]
        
        layers = [
            {
                "name": "Frame 1422: 574 bytes on wire",
                "protocols": "eth:ethertype:ip:tcp:tls",
                "summary": f"TCP {telemetry.client_ip}:54122 → {telemetry.server_ip}:443 [PSH, ACK] Seq={seq_num} Ack={ack_num} Len=520"
            },
            {
                "name": "Ethernet II, Src: Router_Hop (f0:de:f1:23:45:67), Dst: Gateway_Ingress (00:1a:2b:3c:4d:5e)",
                "details": {"Type": "IPv4 (0x0800)"}
            },
            {
                "name": f"Internet Protocol Version 4, Src: {telemetry.client_ip}, Dst: {telemetry.server_ip}",
                "details": {
                    "Time to Live (TTL)": telemetry.ttl_hops,
                    "Protocol": "TCP (6)",
                    "Header Checksum": "0xb712 [verified]",
                    "ASN Classification": f"{telemetry.asn_org} ({telemetry.asn_type})"
                }
            },
            {
                "name": f"Transmission Control Protocol, Src Port: 54122, Dst Port: 443, Seq: {seq_num}, Ack: {ack_num}",
                "details": {
                    "Measured Wire RTT": f"{telemetry.tcp_rtt_ms} ms",
                    "Window Size": "65535",
                    "Flags": "0x018 (PSH, ACK)"
                }
            },
            {
                "name": f"Transport Layer Security (TLSv1.3) / HTTP/2 Stream",
                "details": {
                    "JA4 TLS Hash": telemetry.ja4_fingerprint,
                    "Cipher Suite": telemetry.tls_cipher_suite,
                    "Cisco SPLT Packet Entropy": f"{telemetry.cisco_splt_entropy} / 4.00",
                    "Burst Rate": f"{telemetry.packet_burst_rate} pkts/sec",
                    "Target Host": f"api.razorpay.com/v1/checkout"
                }
            }
        ]
        
        return {
            "hex_dump": "\n".join(hex_data),
            "layers": layers
        }
