from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime, timezone
from enum import Enum

def get_current_utc_time():
    return datetime.now(timezone.utc)

class FrictionAction(str, Enum):
    ALLOW = "ALLOW"                      # Frictionless 1-Click checkout
    STEP_UP_3DS = "STEP_UP_3DS"          # Step-up biometric / OTP challenge
    SETTLEMENT_HOLD = "SETTLEMENT_HOLD"  # Allow payment, but hold funds in escrow
    BLOCK_QUARANTINE = "BLOCK_QUARANTINE"# Block transaction, suspend keys, alert risk team

class ThreatCategory(str, Enum):
    CLEAN = "CLEAN"
    CHAMELEON_CLOAKING = "CHAMELEON_CLOAKING"
    BOT_SWARM_TESTING = "BOT_SWARM_TESTING"
    MERCHANT_BUST_OUT = "MERCHANT_BUST_OUT"
    MULE_RING_VELOCITY = "MULE_RING_VELOCITY"
    OFFSHORE_TUNNEL_PROXY = "OFFSHORE_TUNNEL_PROXY"

class WireTelemetry(BaseModel):
    client_ip: str
    server_ip: str
    tcp_rtt_ms: float
    ttl_hops: int
    ja4_fingerprint: str
    tls_cipher_suite: str
    tls_version: str
    asn_org: str
    asn_type: str                         # Residential, Datacenter, Tor/VPN, Mobile
    cisco_splt_entropy: float             # Sequence of Packet Lengths & Timing entropy (0.0 to 4.0)
    packet_burst_rate: float              # Packets per second
    http2_header_order_hash: str
    is_proxy_or_vpn: bool
    raw_packet_hex_sample: Optional[str] = None
    packet_layers: Optional[List[Dict[str, Any]]] = None

class TransactionPayload(BaseModel):
    transaction_id: str
    merchant_id: str
    merchant_name: str
    claimed_mcc: str                      # E.g. "5977 - Cosmetics & Soap", "7995 - Gambling"
    registered_category: str
    amount_inr: float
    currency: str = "INR"
    payment_method: str                   # UPI, CARD, NETBANKING, WALLET
    customer_id: str
    cart_item_count: int
    cart_items: List[Dict[str, Any]]
    device_user_agent: str
    timestamp: datetime = Field(default_factory=get_current_utc_time)
    wire_telemetry: WireTelemetry

class RiskFactor(BaseModel):
    factor_name: str
    score_impact: float                   # + or - contribution
    description: str
    severity: str                         # LOW, MEDIUM, HIGH, CRITICAL

class RiskVerdict(BaseModel):
    transaction_id: str
    merchant_id: str
    overall_risk_score: float             # 0 - 100
    wire_risk_score: float                # 0 - 100 (Layer 4/7 signals)
    behavioral_risk_score: float          # 0 - 100 (Velocity & cart mismatch)
    action: FrictionAction
    threat_category: ThreatCategory
    explainability_reasons: List[RiskFactor]
    summary_text: str
    timestamp: datetime = Field(default_factory=get_current_utc_time)
    processing_latency_ms: float

class CloakingEvidence(BaseModel):
    unmasked_url: str
    facade_claimed_business: str
    actual_detected_business: str
    mcc_violation_code: str
    risk_level: str
    diff_summary: str
    detected_payment_rails: List[str]
    evidence_screenshots: List[str]
    audit_trail: List[Dict[str, str]]

class SARReport(BaseModel):
    report_id: str
    generated_at: datetime = Field(default_factory=get_current_utc_time)
    merchant_id: str
    merchant_name: str
    regulatory_body: str = "RBI / FIU-IND / FinCEN"
    primary_violation: str
    estimated_illicit_volume_inr: float
    confidence_score: float
    wire_telemetry_forensics: Dict[str, Any]
    agent_investigation_log: List[str]
    remediation_recommendations: List[str]
    report_markdown: str
