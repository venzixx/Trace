# ⚡ Trace: Autonomous Wire-Telemetry & Chameleon Merchant Risk Engine

[![Python](https://img.shields.io/badge/Python-3.11%2B-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115%2B-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://reactjs.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)](https://tailwindcss.com)
[![Latency](https://img.shields.io/badge/Fast--Path%20Latency-%3C1ms-brightgreen.svg)]()
[![Defense](https://img.shields.io/badge/Layer-L4%20%2F%20L7%20Wire-purple.svg)]()

> **Submission for Razorpay AI Builder Internship 2026 — Track 2: AI Risk Manager**

---

## 🎯 Executive Overview

**Trace** is a next-generation AI Risk Management system engineered for high-throughput payment aggregators (like **Razorpay**). It fuses **Layer 4 / Layer 7 Network Packet Telemetry** (Wireshark & Cisco ETA-style deep packet inspection) with an **Autonomous Multi-Agent Adversarial Mystery Shopper** to eradicate the two most catastrophic risks in modern fintech:

1. **Chameleon Storefronts & Transaction Laundering (Underwriting Evasion):** Merchants who register with clean MCCs (e.g. handmade soaps) but dynamically cloak their servers to process illegal online casino deposits, banned crypto, or counterfeit goods.
2. **Coordinated Bot Swarms & Sleeper Merchant Bust-Out Attacks:** High-velocity micro-card testing probes and 60-day dormant sleeper accounts staging massive exit-scam volume spikes.

---

## 🏛️ System Architecture

```
                                  ┌─────────────────────────────────────────────────────────┐
                                  │             INCOMING TRANSACTION / CHECKOUT             │
                                  └────────────────────────────┬────────────────────────────┘
                                                               │
                     ┌─────────────────────────────────────────┴─────────────────────────────────────────┐
                     ▼                                                                                   ▼
    ┌─────────────────────────────────┐                                                 ┌─────────────────────────────────┐
    │   FAST-PATH WIRE ENGINE (<1ms)  │                                                 │   DEEP AGENTIC FORENSIC BRAIN   │
    │  • JA4 TLS Client Fingerprint   │                                                 │  • Adversarial Mystery Shopper  │
    │  • Cisco ETA Packet Timing/SPLT │                                                 │  • Chameleon Cloaking Unmasker  │
    │  • TCP RTT & Offshore Hop Radar │                                                 │  • Multi-Modal Catalog & MCC AI │
    │  • Dynamic Friction Router      │                                                 │  • Auto-SAR Dossier Generator   │
    │    (Allow / 3DS / Hold / Block) │                                                 │    (FIU-IND / RBI Master FMT)   │
    └────────────────┬────────────────┘                                                 └────────────────┬────────────────┘
                     │                                                                                   │
                     └─────────────────────────────────────────┬─────────────────────────────────────────┘
                                                               │
                                  ┌────────────────────────────▼────────────────────────────┐
                                  │              TRACE COMMAND COCKPIT (UI)                 │
                                  │  • Live Wireshark-style Network Packet Stream           │
                                  │  • Real-time Risk Decision & Dynamic Friction Badges    │
                                  │  • Side-by-Side Storefront Cloaking Unmasker            │
                                  │  • Live Attack Simulator (Card Testing, Cloaked Casino) │
                                  │  • 1-Click Regulatory SAR Report Export Studio          │
                                  └─────────────────────────────────────────────────────────┘
```

---

## 🚀 Key Innovations & Technical Depth

### 1. Wire-Level Telemetry & Deep Packet Inspection (DPI)
* **JA4+ TLS Client Hello Fingerprinting:** Differentiates authentic mobile/desktop browsers (`t13d1516h2...`) from automated headless bot swarms (`t11d0402h0...`) and laundering proxies before decrypting payload.
* **Cisco ETA SPLT Entropy:** Computes Shannon entropy over Sequence of Packet Lengths & Timing (SPLT) to flag mechanical micro-burst bot velocity (<1.0 entropy).
* **TCP Wire Latency (RTT) Anomaly:** Detects offshore reverse-proxy relays when a domestic merchant exhibits >180ms wire latency.

### 2. Autonomous Adversarial Mystery Shopper Agent
* **Multi-Persona Ingress:** Crawls merchant storefronts using varying consumer personas (Compliance Crawler $\rightarrow$ Mobile Consumer $\rightarrow$ Dark Channel / Telegram Deep Link).
* **Dynamic DOM & Gateway Interception:** Unmasks cloaked payment sessions where the public catalog shows herbal soaps but the live Razorpay API order processes poker chips.

### 3. Adaptive Friction Matrix (Dynamic Policy)
* `ALLOW` (Zero-friction 1-Click checkout for trusted transactions).
* `STEP_UP_3DS` (Biometric / OTP step-up challenge for moderate anomalies).
* `SETTLEMENT_HOLD` (Captures transaction but holds payout in escrow to prevent merchant bust-out losses).
* `BLOCK_QUARANTINE` (Revokes merchant API keys and flags for enforcement).

### 4. Automated Regulatory SAR / STR Studio
* 1-Click generation of formal **Suspicious Activity Reports (SAR)** formatted according to **RBI Master Directions** and **FIU-IND** standards with cryptographic evidence logs.

---

## ⚡ Quickstart & Local Setup

### 1. Clone the Repository
```bash
git clone https://github.com/venzixx/Trace.git
cd Trace
```

### 2. Backend Setup
```bash
cd backend
python -m venv .venv

# On Windows:
.\.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
python main.py
```
*Backend runs on `http://localhost:8000` (API docs at `http://localhost:8000/docs`).*

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 🧪 Interactive Attack Scenarios Included

1. **Clean Domestic Merchant:** Jaipur Handloom Crafts (MCC 5949) — Authentic Jio/Airtel 5G, 24ms RTT $\rightarrow$ `1-CLICK ALLOW`.
2. **Cloaked Casino Laundering:** Pure Herbals Organics (MCC 5977 $\rightarrow$ 7995) — Offshore 242ms RTT, laundering proxy JA4 $\rightarrow$ `BLOCK & QUARANTINE`.
3. **Headless Bot Swarm:** QuickCoffee Express (MCC 5814) — 48 req/s burst, Datacenter ASN $\rightarrow$ `STEP-UP 3DS / BLOCK`.
4. **Sleeper Merchant Bust-Out:** Apex IT Solutions (MCC 5732) — ₹3.5 Lakh ticket surge at 3 AM $\rightarrow$ `SETTLEMENT HOLD`.

---

## 📄 License
MIT License. Built for Razorpay AI Builder Internship 2026.
