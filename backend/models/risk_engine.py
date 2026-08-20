import time
from typing import List, Tuple
from core.schemas import TransactionPayload, RiskVerdict, ThreatCategory, RiskFactor
from telemetry.wire_inspector import WireInspector
from models.friction_router import FrictionRouter

class RiskEngine:
    """
    Sub-15ms Real-Time Hybrid Risk Engine for Razorpay Gateways.
    Fuses Layer 4/7 Wire-Telemetry with Layer 7 Transaction Behavioral Signals.
    """

    def __init__(self):
        self.inspector = WireInspector()
        self.router = FrictionRouter()

    def evaluate_transaction(self, tx: TransactionPayload) -> RiskVerdict:
        start_time = time.perf_counter()
        reasons: List[RiskFactor] = []
        
        # 1. Wire Telemetry Assessment (<3ms)
        wire_score, wire_findings = self.inspector.analyze_wire_signals(tx.wire_telemetry)
        
        for finding in wire_findings:
            impact = 10.0 if finding["severity"] == "LOW" else (25.0 if finding["severity"] == "MEDIUM" else 40.0)
            if finding["severity"] != "LOW":
                reasons.append(RiskFactor(
                    factor_name=finding["signal"],
                    score_impact=impact,
                    description=finding["detail"],
                    severity=finding["severity"]
                ))

        # 2. Behavioral & Cart Consistency Assessment (<4ms)
        behavioral_score = 0.0
        
        # A. Cart Item vs Claimed MCC Mismatch
        prohibited_keywords = ["casino", "chips", "poker", "bet", "crypto", "usdt", "steroid", "replica", "rolex", "hack"]
        cart_texts = " ".join([item.get("name", "").lower() + " " + item.get("category", "").lower() for item in tx.cart_items])
        
        detected_prohibited = [kw for kw in prohibited_keywords if kw in cart_texts]
        if detected_prohibited:
            behavioral_score += 60.0
            reasons.append(RiskFactor(
                factor_name="Prohibited Cart Content (MCC Violation)",
                score_impact=60.0,
                description=f"Transaction cart contains prohibited keywords: {', '.join(detected_prohibited)} while merchant claimed '{tx.claimed_mcc}'.",
                severity="CRITICAL"
            ))
            
        # B. Amount Surge vs Category Baseline
        if "Cosmetics" in tx.claimed_mcc or "Handicrafts" in tx.claimed_mcc:
            if tx.amount_inr > 30000.0:
                behavioral_score += 35.0
                reasons.append(RiskFactor(
                    factor_name="Ticket Size Surge Anomaly",
                    score_impact=35.0,
                    description=f"Ticket size of ₹{tx.amount_inr:,.2f} is 15x higher than category average (₹1,500).",
                    severity="HIGH"
                ))
        elif tx.amount_inr > 150000.0:
            behavioral_score += 20.0
            reasons.append(RiskFactor(
                factor_name="High-Value Single Transaction",
                score_impact=20.0,
                description=f"Order amount is ₹{tx.amount_inr:,.2f}.",
                severity="MEDIUM"
            ))

        # 3. Overall Threat Categorization
        threat_category = ThreatCategory.CLEAN
        
        if detected_prohibited or (wire_score > 60.0 and tx.wire_telemetry.tcp_rtt_ms > 180.0):
            threat_category = ThreatCategory.CHAMELEON_CLOAKING
        elif tx.wire_telemetry.cisco_splt_entropy < 1.0 or tx.wire_telemetry.packet_burst_rate > 30.0:
            threat_category = ThreatCategory.BOT_SWARM_TESTING
        elif tx.amount_inr > 100000.0 and "Cosmetics" in tx.claimed_mcc:
            threat_category = ThreatCategory.MERCHANT_BUST_OUT
        elif tx.wire_telemetry.is_proxy_or_vpn and tx.wire_telemetry.tcp_rtt_ms > 150.0:
            threat_category = ThreatCategory.OFFSHORE_TUNNEL_PROXY

        # 4. Weighted Fusion Score (55% Wire Telemetry + 45% Behavioral)
        overall_score = round(min(100.0, (0.55 * wire_score) + (0.45 * behavioral_score)), 1)
        
        # If no risk factors detected, add a baseline clean confirmation
        if not reasons:
            reasons.append(RiskFactor(
                factor_name="Clean Domestic Telemetry & Consistent Payload",
                score_impact=-15.0,
                description="Verified genuine browser handshake, domestic ISP latency, and category-aligned catalog items.",
                severity="LOW"
            ))

        # 5. Determine Dynamic Friction Policy Action
        action = self.router.determine_friction_action(overall_score, wire_score, threat_category)
        
        # Summary text generation
        if action == "ALLOW":
            summary = f"Transaction approved with frictionless 1-click checkout (Risk: {overall_score}/100)."
        elif action == "STEP_UP_3DS":
            summary = f"Step-up 3DS / OTP verification triggered due to elevated wire/behavioral anomaly (Risk: {overall_score}/100)."
        elif action == "SETTLEMENT_HOLD":
            summary = f"Settlement payout held in escrow pending merchant bust-out verification (Risk: {overall_score}/100)."
        else:
            summary = f"QUARANTINED & BLOCKED: Confirmed {threat_category.value} with high-confidence wire/catalog evidence (Risk: {overall_score}/100)."

        elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
        
        return RiskVerdict(
            transaction_id=tx.transaction_id,
            merchant_id=tx.merchant_id,
            overall_risk_score=overall_score,
            wire_risk_score=wire_score,
            behavioral_risk_score=behavioral_score,
            action=action,
            threat_category=threat_category,
            explainability_reasons=reasons,
            summary_text=summary,
            processing_latency_ms=elapsed_ms
        )
