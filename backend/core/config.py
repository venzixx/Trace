import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "Trace: Autonomous Wire-Telemetry & Chameleon Risk Engine"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Risk Engine Thresholds (0 - 100)
    RISK_ALLOW_THRESHOLD: float = 30.0
    RISK_STEP_UP_THRESHOLD: float = 65.0
    RISK_SETTLEMENT_HOLD_THRESHOLD: float = 85.0
    # Above 85 -> BLOCK & QUARANTINE
    
    # Wire Telemetry Thresholds
    MAX_DOMESTIC_RTT_MS: float = 85.0     # Normal domestic RTT in India (15-60ms)
    SUSPICIOUS_RTT_THRESHOLD: float = 180.0 # Indication of offshore proxy/tunnel
    MIN_PACKET_ENTROPY: float = 1.2       # Below this indicates scripted bot burst
    
    # Port & Host
    HOST: str = "0.0.0.0"
    PORT: int = 8000

settings = Settings()
