from core.schemas import FrictionAction, ThreatCategory
from core.config import settings

class FrictionRouter:
    """
    Adaptive Risk Policy Matrix for dynamic checkout routing.
    Balances friction (conversion rate) vs risk prevention (chargebacks/fraud).
    """

    @staticmethod
    def determine_friction_action(
        overall_score: float,
        wire_score: float,
        threat_category: ThreatCategory
    ) -> FrictionAction:
        # Critical override: if confirmed cloaked transaction laundering or offshore bulletproof host -> Quarantine
        if threat_category == ThreatCategory.CHAMELEON_CLOAKING:
            return FrictionAction.BLOCK_QUARANTINE
            
        if threat_category == ThreatCategory.MERCHANT_BUST_OUT:
            # For bust-out, allow transaction to capture funds, but quarantine settlement in escrow
            return FrictionAction.SETTLEMENT_HOLD
            
        if threat_category == ThreatCategory.BOT_SWARM_TESTING:
            if wire_score > settings.RISK_STEP_UP_THRESHOLD:
                return FrictionAction.BLOCK_QUARANTINE
            return FrictionAction.STEP_UP_3DS

        # Standard score-based policy using configured thresholds
        if overall_score < settings.RISK_ALLOW_THRESHOLD:
            return FrictionAction.ALLOW
        elif overall_score < settings.RISK_STEP_UP_THRESHOLD:
            return FrictionAction.STEP_UP_3DS
        elif overall_score < settings.RISK_SETTLEMENT_HOLD_THRESHOLD:
            return FrictionAction.SETTLEMENT_HOLD
        else:
            return FrictionAction.BLOCK_QUARANTINE
