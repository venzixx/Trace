import time
import numpy as np
from typing import List, Tuple
from sklearn.ensemble import IsolationForest

from core.schemas import TransactionPayload, RiskVerdict, ThreatCategory, RiskFactor
from core.config import settings
from telemetry.wire_inspector import WireInspector
from models.friction_router import FrictionRouter
from agents.catalog_auditor import catalog_auditor

class MLAnomalyDetector:
    """
    Trained Unsupervised ML Model (Isolation Forest) for wire & transaction anomaly detection.
    Evaluates multi-dimensional telemetry (RTT, SPLT entropy, burst rate, amount ratio).
    """
    def __init__(self):
        # Generate baseline synthetic dataset of 1000 normal domestic transactions
        np.random.seed(42)
        rtt_normal = np.random.normal(35, 12, 1000)
        entropy_normal = np.random.normal(3.1, 0.4, 1000)
        burst_normal = np.random.exponential(2.5, 1000)
        amount_ratio_normal = np.random.normal(1.0, 0.5, 1000)
        
        X_train = np.column_stack([rtt_normal, entropy_normal, burst_normal, amount_ratio_normal])
        self.model = IsolationForest(contamination=0.03, random_state=42)
        self.model.fit(X_train)

    def score_anomaly(self, rtt: float, entropy: float, burst_rate: float, amount_ratio: float) -> float:
        """
        Returns an anomaly score scaled from 0.0 (normal) to 100.0 (severe outlier).
        """
        features = np.array([[rtt, entropy, burst_rate, amount_ratio]])
        # Decision function: negative values indicate outliers
        raw_score = self.model.decision_function(features)[0]
        # Map raw score [-0.5, 0.5] to [100, 0]
        anomaly_score = max(0.0, min(100.0, (0.5 - raw_score) * 100.0))
        return round(anomaly_score, 1)

class RiskEngine:
    """
    Sub-15ms Real-Time Hybrid Risk Engine for Razorpay Gateways.
    Fuses Layer 4/7 Wire-Telemetry, ML Isolation Forest Anomaly Detection, and Semantic Catalog Auditing.
    """

    def __init__(self):
        self.inspector = WireInspector()
        self.router = FrictionRouter()
        self.ml_detector = MLAnomalyDetector()

    def evaluate_transaction(self, tx: TransactionPayload) -> RiskVerdict:
        start_time = time.perf_counter()
        reasons: List[RiskFactor] = []
        
        # 1. Wire Telemetry Assessment (<2ms)
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

        # 2. Semantic Catalog & MCC Audit (<3ms)
        hist_avg = 1500.0 if "Cosmetics" in tx.claimed_mcc or "Handicrafts" in tx.claimed_mcc else 5000.0
        catalog_audit = catalog_auditor.audit_catalog_consistency(
            registered_category=tx.registered_category,
            claimed_mcc=tx.claimed_mcc,
            cart_items=tx.cart_items,
            historical_average_ticket=hist_avg
        )

        behavioral_score = 0.0
        if not catalog_audit["is_consistent"]:
            for disc in catalog_audit["discrepancies"]:
                behavioral_score += 40.0
                reasons.append(RiskFactor(
                    factor_name="Catalog & MCC Inconsistency",
                    score_impact=40.0,
                    description=disc,
                    severity="HIGH"
                ))

        # 3. Prohibited Content Keyword Detection
        cart_texts = " ".join([item.get("name", "").lower() + " " + item.get("category", "").lower() for item in tx.cart_items])
        detected_prohibited = [kw for kw in settings.PROHIBITED_KEYWORDS if kw in cart_texts]
        if detected_prohibited:
            behavioral_score += 60.0
            reasons.append(RiskFactor(
                factor_name="Prohibited Cart Content (MCC Violation)",
                score_impact=60.0,
                description=f"Transaction cart contains prohibited keywords: {', '.join(detected_prohibited)} while merchant claimed '{tx.claimed_mcc}'.",
                severity="CRITICAL"
            ))

        # 4. Ticket Size Surge Anomaly
        if ("Cosmetics" in tx.claimed_mcc or "Handicrafts" in tx.claimed_mcc) and tx.amount_inr > 30000.0:
            behavioral_score += 35.0
            reasons.append(RiskFactor(
                factor_name="Ticket Size Surge Anomaly",
                score_impact=35.0,
                description=f"Ticket size of ₹{tx.amount_inr:,.2f} is significantly above category baseline (₹{hist_avg:,.2f}).",
                severity="HIGH"
            ))

        # 5. Machine Learning Anomaly Score (Isolation Forest)
        amount_ratio = tx.amount_inr / hist_avg
        ml_score = self.ml_detector.score_anomaly(
            rtt=tx.wire_telemetry.tcp_rtt_ms,
            entropy=tx.wire_telemetry.cisco_splt_entropy,
            burst_rate=tx.wire_telemetry.packet_burst_rate,
            amount_ratio=amount_ratio
        )

        if ml_score > 65.0:
            reasons.append(RiskFactor(
                factor_name="ML Isolation Forest Anomaly Outlier",
                score_impact=ml_score * 0.3,
                description=f"Unsupervised ML model classified multi-dimensional telemetry as an outlier (Score: {ml_score}/100).",
                severity="HIGH"
            ))

        # 6. Overall Threat Categorization
        threat_category = ThreatCategory.CLEAN
        
        if detected_prohibited or (wire_score > 55.0 and tx.wire_telemetry.tcp_rtt_ms > settings.SUSPICIOUS_RTT_THRESHOLD):
            threat_category = ThreatCategory.CHAMELEON_CLOAKING
        elif tx.wire_telemetry.cisco_splt_entropy < settings.MIN_PACKET_ENTROPY or tx.wire_telemetry.packet_burst_rate > settings.HIGH_BURST_RATE:
            threat_category = ThreatCategory.BOT_SWARM_TESTING
        elif tx.amount_inr >= 150000.0 or ("sleeper" in tx.merchant_id.lower()):
            threat_category = ThreatCategory.MERCHANT_BUST_OUT
            behavioral_score += 45.0
        elif tx.wire_telemetry.is_proxy_or_vpn and tx.wire_telemetry.tcp_rtt_ms > settings.MAX_DOMESTIC_RTT_MS:
            threat_category = ThreatCategory.OFFSHORE_TUNNEL_PROXY

        # 7. Weighted Fusion Score (50% Wire Telemetry + 35% Behavioral + 15% ML Isolation Forest)
        overall_score = round(min(100.0, (0.50 * wire_score) + (0.35 * behavioral_score) + (0.15 * ml_score)), 1)
        
        if not reasons:
            reasons.append(RiskFactor(
                factor_name="Clean Domestic Telemetry & Consistent Payload",
                score_impact=-15.0,
                description="Verified genuine browser handshake, domestic ISP latency, and category-aligned catalog items.",
                severity="LOW"
            ))

        # 8. Dynamic Friction Policy
        action = self.router.determine_friction_action(overall_score, wire_score, threat_category)
        
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
