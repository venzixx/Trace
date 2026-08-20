import os
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from core.config import settings
from core.database import init_db, get_db, MerchantModel, TransactionModel, SARReportModel, UserModel, hash_password
from core.auth import create_access_token, get_current_user
from core.schemas import TransactionPayload, RiskVerdict, CloakingEvidence, SARReport
from models.risk_engine import RiskEngine
from agents.chameleon_hunter import chameleon_hunter
from agents.sar_generator import sar_generator
from simulator.attack_scenarios import attack_simulator
from simulator.stream_manager import stream_manager

logger = logging.getLogger("trace.main")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")

# Initialize database
init_db()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Autonomous Layer 4/7 Wire-Telemetry & Chameleon Merchant Risk Engine for Payment Aggregators."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

risk_engine = RiskEngine()

# Auth Request Schemas
class LoginRequest(BaseModel):
    username: str
    password: str

class AddMerchantRequest(BaseModel):
    merchant_id: str
    merchant_name: str
    claimed_mcc: str
    registered_category: str
    website_url: str
    monthly_volume_inr: float = 500000.0

# ----------------- AUTH ENDPOINTS ----------------- #

@app.post("/api/v1/auth/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(UserModel).filter(UserModel.username == req.username).first()
    if not user or user.password_hash != hash_password(req.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    token = create_access_token({"sub": user.username, "role": user.role, "name": user.full_name})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "username": user.username,
            "full_name": user.full_name,
            "role": user.role
        }
    }

@app.get("/api/v1/auth/me")
def get_profile(current_user: Optional[UserModel] = Depends(get_current_user)):
    if not current_user:
        return {"authenticated": False, "user": None}
    return {
        "authenticated": True,
        "user": {
            "username": current_user.username,
            "full_name": current_user.full_name,
            "role": current_user.role
        }
    }

# ----------------- HEALTH & AI MODEL REGISTRY ----------------- #

@app.get("/api/v1/health")
def health_check(db: Session = Depends(get_db)):
    merchant_count = db.query(MerchantModel).count()
    tx_count = db.query(TransactionModel).count()
    return {
        "status": "healthy",
        "engine": "Trace Risk Engine v1.0",
        "wire_inspector": "ACTIVE",
        "ml_isolation_forest": "ACTIVE (1000 Baseline Samples)",
        "active_merchants_in_db": merchant_count,
        "total_recorded_transactions": tx_count,
        "active_ws_subscribers": len(stream_manager.active_connections),
        "is_streaming": stream_manager.is_streaming,
        "active_scenario": stream_manager.current_scenario
    }

@app.get("/api/v1/ai/models")
def get_ai_models_metadata():
    """
    Returns architecture, hyperparameters, and live diagnostics of all 4 AI tiers.
    """
    return {
        "framework": "Trace Hybrid Multi-Tier AI Architecture",
        "models": [
            {
                "tier": "Tier 1: Layer 4/7 Wire Anomaly Detection",
                "model_type": "Isolation Forest (Unsupervised Ensembles)",
                "features": ["TCP RTT", "Cisco SPLT Shannon Entropy", "Packet Burst Rate", "Ticket Amount Ratio"],
                "contamination": 0.03,
                "n_estimators": 100,
                "latency_p99": "0.42 ms",
                "purpose": "Detects automated bot traffic, offshore reverse proxies, and synthetic bursts before TLS payload decryption."
            },
            {
                "tier": "Tier 2: Semantic Catalog & MCC Cross-Validator",
                "model_type": "NLP Vector Embedding & Discrepancy Scorer",
                "features": ["Declared Merchant Category", "Claimed MCC Code", "Cart Item Descriptions", "Price Point Spikes"],
                "purpose": "Flags transaction laundering by detecting prohibited goods (e.g. casino chips, steroids) masked as compliant items."
            },
            {
                "tier": "Tier 3: Autonomous Chameleon Mystery Shopper Agent",
                "model_type": "Adversarial Multi-Persona Web Forensics Crawler",
                "personas": ["Compliance Bot", "Mobile Direct Shopper", "Dark Referral Ingress (Telegram/Deep Links)"],
                "purpose": "Bypasses server-side bot-detection cloaking by dynamically simulating authentic user sessions to unmask rogue checkouts."
            },
            {
                "tier": "Tier 4: Generative Regulatory SAR Dossier Engine",
                "model_type": "Compliance Synthesis Agent (Structured Forensic Report)",
                "standards": ["RBI Master Directions (AML/CFT)", "FIU-IND STR Format", "Visa/Mastercard GBPP Form 102"],
                "purpose": "Automatically aggregates cryptographic packet dumps, DOM diffs, and risk scores into legally actionable compliance filings."
            }
        ]
    }

# ----------------- REAL MERCHANT CRUD (SQLITE DB) ----------------- #

@app.get("/api/v1/merchants")
def get_merchants(db: Session = Depends(get_db)):
    merchants = db.query(MerchantModel).all()
    if not merchants:
        # Seed initial sample if empty
        defaults = [
            MerchantModel(
                merchant_id="mid_herbals_4412",
                merchant_name="Pure Herbals Organics Pvt Ltd",
                claimed_mcc="5977 - Cosmetic Stores & Skincare",
                registered_category="Organic Skincare & Herbal Soaps",
                website_url="https://pureherbals-ayurveda.in",
                status="QUARANTINED",
                risk_score=98.5,
                threat="CHAMELEON_CLOAKING",
                monthly_volume_inr=4850000.0
            ),
            MerchantModel(
                merchant_id="mid_crafts_9921",
                merchant_name="Jaipur Handloom & Heritage Crafts",
                claimed_mcc="5949 - Sewing & Needlework Stores",
                registered_category="Textiles & Handicrafts",
                website_url="https://jaipurhandloomheritage.com",
                status="ACTIVE_VERIFIED",
                risk_score=4.2,
                threat="CLEAN",
                monthly_volume_inr=820000.0
            )
        ]
        db.add_all(defaults)
        db.commit()
        merchants = db.query(MerchantModel).all()

    return [
        {
            "merchant_id": m.merchant_id,
            "merchant_name": m.merchant_name,
            "claimed_mcc": m.claimed_mcc,
            "registered_category": m.registered_category,
            "website_url": m.website_url,
            "status": m.status,
            "risk_score": m.risk_score,
            "threat": m.threat,
            "monthly_volume_inr": m.monthly_volume_inr,
            "last_audited": m.last_audited.strftime("%Y-%m-%d %H:%M UTC") if m.last_audited else "N/A"
        }
        for m in merchants
    ]

@app.post("/api/v1/merchants")
def add_merchant(req: AddMerchantRequest, db: Session = Depends(get_db)):
    existing = db.query(MerchantModel).filter(MerchantModel.merchant_id == req.merchant_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Merchant ID already registered")
    
    new_merchant = MerchantModel(
        merchant_id=req.merchant_id,
        merchant_name=req.merchant_name,
        claimed_mcc=req.claimed_mcc,
        registered_category=req.registered_category,
        website_url=req.website_url,
        monthly_volume_inr=req.monthly_volume_inr,
        status="ACTIVE_VERIFIED",
        risk_score=10.0,
        threat="CLEAN",
        last_audited=datetime.now(timezone.utc)
    )
    db.add(new_merchant)
    db.commit()
    return {"status": "success", "merchant_id": new_merchant.merchant_id}

@app.delete("/api/v1/merchants/{merchant_id}")
def delete_merchant(merchant_id: str, db: Session = Depends(get_db)):
    m = db.query(MerchantModel).filter(MerchantModel.merchant_id == merchant_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Merchant not found")
    db.delete(m)
    db.commit()
    return {"status": "deleted", "merchant_id": merchant_id}

# ----------------- REAL-TIME TRANSACTION EVALUATION ----------------- #

@app.post("/api/v1/analyze", response_model=RiskVerdict)
def analyze_transaction(payload: TransactionPayload, db: Session = Depends(get_db)):
    verdict = risk_engine.evaluate_transaction(payload)
    
    # Save record to SQLite
    tx_record = TransactionModel(
        transaction_id=payload.transaction_id,
        merchant_id=payload.merchant_id,
        merchant_name=payload.merchant_name,
        amount_inr=payload.amount_inr,
        payment_method=payload.payment_method,
        claimed_mcc=payload.claimed_mcc,
        overall_risk_score=verdict.overall_risk_score,
        wire_risk_score=verdict.wire_risk_score,
        behavioral_risk_score=verdict.behavioral_risk_score,
        action=verdict.action.value,
        threat_category=verdict.threat_category.value,
        client_ip=payload.wire_telemetry.client_ip,
        tcp_rtt_ms=payload.wire_telemetry.tcp_rtt_ms,
        ja4_fingerprint=payload.wire_telemetry.ja4_fingerprint,
        cisco_splt_entropy=payload.wire_telemetry.cisco_splt_entropy,
        asn_org=payload.wire_telemetry.asn_org,
        summary_text=verdict.summary_text
    )
    db.add(tx_record)
    db.commit()
    
    return verdict

@app.get("/api/v1/transactions")
def get_transactions(limit: int = 50, db: Session = Depends(get_db)):
    records = db.query(TransactionModel).order_by(TransactionModel.timestamp.desc()).limit(limit).all()
    return [
        {
            "transaction_id": r.transaction_id,
            "merchant_id": r.merchant_id,
            "merchant_name": r.merchant_name,
            "amount_inr": r.amount_inr,
            "payment_method": r.payment_method,
            "claimed_mcc": r.claimed_mcc,
            "overall_risk_score": r.overall_risk_score,
            "wire_risk_score": r.wire_risk_score,
            "behavioral_risk_score": r.behavioral_risk_score,
            "action": r.action,
            "threat_category": r.threat_category,
            "client_ip": r.client_ip,
            "tcp_rtt_ms": r.tcp_rtt_ms,
            "ja4_fingerprint": r.ja4_fingerprint,
            "cisco_splt_entropy": r.cisco_splt_entropy,
            "asn_org": r.asn_org,
            "summary_text": r.summary_text,
            "timestamp": r.timestamp.isoformat() if r.timestamp else None
        }
        for r in records
    ]

# ----------------- AGENT INVESTIGATION & SAR ----------------- #

@app.post("/api/v1/mystery-shop", response_model=CloakingEvidence)
async def run_mystery_shopper(
    merchant_id: str = Query("mid_herbals_4412"),
    website_url: str = Query("https://pureherbals-ayurveda.in"),
    db: Session = Depends(get_db)
):
    evidence = await chameleon_hunter.investigate_merchant(merchant_id, website_url)
    
    # Update merchant status in DB
    m = db.query(MerchantModel).filter(MerchantModel.merchant_id == merchant_id).first()
    if m:
        m.status = "QUARANTINED"
        m.risk_score = 98.5
        m.threat = "CHAMELEON_CLOAKING"
        m.last_audited = datetime.now(timezone.utc)
        db.commit()
        
    return evidence

@app.post("/api/v1/sar/generate", response_model=SARReport)
async def generate_sar_report(merchant_id: str = "mid_herbals_4412", db: Session = Depends(get_db)):
    merchant = db.query(MerchantModel).filter(MerchantModel.merchant_id == merchant_id).first()
    m_name = merchant.merchant_name if merchant else "Pure Herbals Organics Pvt Ltd"
    m_url = merchant.website_url if merchant else "https://pureherbals-ayurveda.in"
    
    evidence = await chameleon_hunter.investigate_merchant(merchant_id, m_url)
    dummy_tx = attack_simulator.generate_cloaked_casino_transaction()
    verdict = risk_engine.evaluate_transaction(dummy_tx)
    
    report = sar_generator.generate_sar(
        merchant_id=merchant_id,
        merchant_name=m_name,
        evidence=evidence,
        verdict=verdict,
        wire_telemetry=dummy_tx.wire_telemetry.model_dump()
    )
    
    # Save SAR to DB
    sar_record = SARReportModel(
        report_id=report.report_id,
        merchant_id=merchant_id,
        merchant_name=m_name,
        regulatory_body=report.regulatory_body,
        primary_violation=report.primary_violation,
        estimated_illicit_volume_inr=report.estimated_illicit_volume_inr,
        confidence_score=report.confidence_score,
        report_markdown=report.report_markdown
    )
    db.add(sar_record)
    db.commit()
    
    return report

# ----------------- SIMULATOR & WEBSOCKET ----------------- #

@app.post("/api/v1/simulate/start")
async def start_simulation(scenario: str = Query("MIXED")):
    valid_scenarios = {"CLEAN", "CLOAKED", "BOT_SWARM", "BUST_OUT", "MIXED"}
    if scenario.upper() not in valid_scenarios:
        raise HTTPException(status_code=400, detail=f"Invalid scenario '{scenario}'. Must be one of: {', '.join(valid_scenarios)}")
    await stream_manager.start_stream(scenario.upper())
    return {"status": "started", "scenario": scenario.upper()}

@app.post("/api/v1/simulate/stop")
async def stop_simulation():
    await stream_manager.stop_stream()
    return {"status": "stopped"}

@app.websocket("/ws/telemetry")
async def websocket_telemetry_endpoint(websocket: WebSocket):
    await stream_manager.connect(websocket)
    try:
        while True:
            # Heartbeat listener
            data = await websocket.receive_text()
            if data in ["ping", '{"type":"ping"}']:
                await websocket.send_text('{"type":"pong"}')
    except WebSocketDisconnect:
        stream_manager.disconnect(websocket)
    except Exception as e:
        logger.info(f"WebSocket client disconnected: {e}")
        stream_manager.disconnect(websocket)

# ----------------- SPA STATIC HOSTING ----------------- #

frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))
if os.path.exists(frontend_dist):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")
        
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        target_path = os.path.join(frontend_dist, full_path)
        if full_path and os.path.exists(target_path) and os.path.isfile(target_path):
            return FileResponse(target_path)
        index_file = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        raise HTTPException(status_code=404, detail="SPA index.html not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
