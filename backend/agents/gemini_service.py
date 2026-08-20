import os
import logging
import httpx
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class GeminiService:
    """
    Optional External LLM Engine powered by Google Gemini.
    Provides deep narrative synthesis, regulatory legal citations, and zero-shot semantic reasoning.
    Gracefully falls back to deterministic/offline models if no API key is provided.
    """

    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY", "")
        self.model = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
        self.endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent"

    @property
    def is_enabled(self) -> bool:
        return bool(self.api_key and len(self.api_key) > 5)

    async def generate_content(self, prompt: str, system_instruction: Optional[str] = None) -> Optional[str]:
        """
        Calls the Gemini REST API via httpx.
        """
        if not self.is_enabled:
            return None

        try:
            headers = {"Content-Type": "application/json"}
            params = {"key": self.api_key}

            payload: Dict[str, Any] = {
                "contents": [
                    {
                        "parts": [{"text": prompt}]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.2,
                    "maxOutputTokens": 2048
                }
            }

            if system_instruction:
                payload["systemInstruction"] = {
                    "parts": [{"text": system_instruction}]
                }

            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(
                    self.endpoint,
                    params=params,
                    headers=headers,
                    json=payload
                )

                if response.status_code == 200:
                    data = response.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts:
                            return parts[0].get("text", "")
                else:
                    logger.warning(f"Gemini API returned status {response.status_code}: {response.text}")
                    return None
        except Exception as e:
            logger.error(f"Error calling Gemini API: {str(e)}")
            return None

    async def generate_sar_narrative(
        self,
        report_id: str,
        merchant_name: str,
        merchant_id: str,
        claimed_business: str,
        unmasked_business: str,
        violation: str,
        risk_score: float,
        wire_telemetry: Dict[str, Any],
        estimated_volume_inr: float
    ) -> Optional[str]:
        """
        Uses Gemini to generate a high-level executive & legal SAR narrative with Indian regulatory statutes.
        """
        if not self.is_enabled:
            return None

        system_prompt = (
            "You are the Chief Regulatory Officer and AML Compliance Officer at Razorpay. "
            "You write authoritative, formal Suspicious Activity Reports (SAR) and Suspicious Transaction Reports (STR) "
            "for the Reserve Bank of India (RBI) and Financial Intelligence Unit - India (FIU-IND) under PMLA (Prevention of Money Laundering Act, 2002). "
            "Your output must be clean, structured GitHub Markdown."
        )

        user_prompt = f"""
Draft an official Suspicious Activity Report (SAR) with reference ID `{report_id}`.

SUBJECT ENTITY DETAILS:
- Legal Merchant Name: {merchant_name}
- Merchant ID: {merchant_id}
- Declared Onboarding Line: {claimed_business} (MCC 5977)
- Actual Detected Prohibited Business: {unmasked_business} (MCC 7995)
- Estimated Illicit Volume: ₹{estimated_volume_inr:,.2f}
- Gateway Risk Score: {risk_score}/100 (CRITICAL ENFORCEMENT)

FORENSIC WIRE-TELEMETRY CAPTURED:
- JA4 Client TLS Hello Hash: {wire_telemetry.get('ja4_fingerprint', 't13d9999h0_666666666666_999999999999')}
- TCP RTT Wire Latency: {wire_telemetry.get('tcp_rtt_ms', 242.4)} ms (proves offshore reverse-proxy)
- Cisco SPLT Packet Entropy: {wire_telemetry.get('cisco_splt_entropy', 0.42)} / 4.00 (synthetic automated timing)
- Ingress ASN: {wire_telemetry.get('asn_org', 'Offshore Bulletproof Cloud Hosters')} ({wire_telemetry.get('asn_type', 'Datacenter')})

SECTIONS TO INCLUDE IN CLEAN MARKDOWN:
# SUSPICIOUS ACTIVITY REPORT (SAR)
**Report Reference:** `{report_id}`
**Jurisdiction / Regulatory Standard:** RBI Master Directions (AML/CFT) & FIU-IND STR Format
**Filing Entity:** Trace Autonomous AI Risk Gateway (Razorpay Aggregator Protection)

---
## 1. SUBJECT ENTITY IDENTIFICATION
(Include legal name, MID, declared vs actual business, and estimated illicit volume)

---
## 2. EXECUTIVE SUMMARY & STATUTORY VIOLATION
(Detail transaction laundering, MCC misclassification, and quote relevant sections of RBI Master Directions on Payment Aggregators & PMLA 2002)

---
## 3. LAYER 4 / LAYER 7 WIRE-TELEMETRY FORENSICS
(Present JA4 TLS hash, TCP RTT offshore physics, Cisco SPLT packet entropy, and ASN routing evidence)

---
## 4. MULTI-AGENT ADVERSARIAL MYSTERY SHOPPING AUDIT
(Explain how compliance crawlers saw the facade while referral personas unmasked the real payment flow)

---
## 5. ENFORCEMENT ACTION & REGULATORY DISPOSITION
(Immediate API key quarantine, 100% rolling escrow hold, and STR submission to FIU-IND)
"""
        return await self.generate_content(user_prompt, system_prompt)

gemini_service = GeminiService()
