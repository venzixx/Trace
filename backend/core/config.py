import os
from typing import List
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "Trace: Autonomous Wire-Telemetry & Chameleon Risk Engine"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Risk Engine Thresholds (0 - 100)
    RISK_ALLOW_THRESHOLD: float = 30.0
    RISK_STEP_UP_THRESHOLD: float = 65.0
    RISK_SETTLEMENT_HOLD_THRESHOLD: float = 85.0
    
    # Wire Telemetry Thresholds
    MAX_DOMESTIC_RTT_MS: float = 85.0       # Normal domestic RTT in India (15-60ms)
    SUSPICIOUS_RTT_THRESHOLD: float = 180.0 # Indication of offshore proxy/tunnel
    MIN_PACKET_ENTROPY: float = 1.0         # Below this indicates scripted bot burst
    HIGH_BURST_RATE: float = 30.0           # Packets per second
    
    # High-Risk / Prohibited Keywords for Catalog Auditing
    PROHIBITED_KEYWORDS: List[str] = [
        "casino", "chips", "poker", "bet", "roulette", 
        "crypto", "usdt", "steroid", "replica", "rolex", 
        "hack", "gambling", "slots", "lottery"
    ]
    
    # Infrastructure & Gateway
    SERVER_IP_GATEWAY: str = "52.66.191.144" # Razorpay Mumbai AWS Ingress
    HOST: str = "0.0.0.0"
    PORT: int = 8000

settings = Settings()
