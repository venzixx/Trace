import os
import logging
from typing import Dict, Any, List
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from core.config import settings
from core.schemas import TransactionPayload, RiskVerdict, CloakingEvidence, SARReport
from models.risk_engine import RiskEngine
from agents.chameleon_hunter import chameleon_hunter
from agents.sar_generator import sar_generator
from simulator.attack_scenarios import attack_simulator
from simulator.stream_manager import stream_manager

logger = logging.getLogger("trace.main")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Autonomous Layer 4/7 Wire-Telemetry & Chameleon Merchant Risk Engine for Payment Aggregators."
)

# Enable CORS for local dev and VPS deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

risk_engine = RiskEngine()

# Monitored merchants catalog
MONITORED_MERCHANTS = [
    {
        "merchant_id": "mid_herbals_4412",
        "merchant_name": "Pure Herbals Organics Pvt Ltd",
        "claimed_mcc": "5977 - Cosmetic Stores & Skincare",
        "registered_category": "Organic Skincare & Herbal Soaps",
        "website_url": "https://pureherbals-ayurveda.in",
        "status": "QUARANTINED",
        "risk_score": 98.5,
        "threat": "CHAMELEON_CLOAKING",
        "monthly_volume_inr": 4850000,
        "last_audited": "2026-08-20 18:42 UTC"
    },
    {
        "merchant_id": "mid_crafts_9921",
        "merchant_name": "Jaipur Handloom & Heritage Crafts",
        "claimed_mcc": "5949 - Sewing & Needlework Stores",
        "registered_category": "Textiles & Handicrafts",
        "website_url": "https://jaipurhandloomheritage.com",
        "status": "ACTIVE_VERIFIED",
        "risk_score": 4.2,
        "threat": "CLEAN",
        "monthly_volume_inr": 820000,
        "last_audited": "2026-08-20 18:50 UTC"
    },
    {
        "merchant_id": "mid_apex_sleeper_88",
        "merchant_name": "Apex IT Solutions & Peripherals",
        "claimed_mcc": "5732 - Electronic Sales & Stores",
        "registered_category": "Computer Hardware",
        "website_url": "https://apexit-peripherals.co.in",
        "status": "SETTLEMENT_HOLD",
        "risk_score": 82.0,
        "threat": "MERCHANT_BUST_OUT",
        "monthly_volume_inr": 12500000,
        "last_audited": "2026-08-20 19:01 UTC"
    },
    {
        "merchant_id": "mid_cafe_1109",
        "merchant_name": "QuickCoffee Express Mumbai",
        "claimed_mcc": "5814 - Fast Food Restaurants",
        "registered_category": "Food & Beverage",
        "website_url": "https://quickcoffeeexpress.in",
        "status": "STEP_UP_ACTIVE",
        "risk_score": 64.0,
        "threat": "BOT_SWARM_TESTING",
        "monthly_volume_inr": 340000,
        "last_audited": "2026-08-20 19:04 UTC"
    }
]

@app.get("/api/v1/health")
def health_check():
    return {
        "status": "healthy",
        "engine": "Trace Risk Engine v1.0",
        "wire_inspector": "ACTIVE",
        "active_ws_subscribers": len(stream_manager.active_connections),
        "is_streaming": stream_manager.is_streaming,
        "active_scenario": stream_manager.current_scenario
    }

@app.post("/api/v1/analyze", response_model=RiskVerdict)
def analyze_transaction(payload: TransactionPayload):
    """
    Sub-15ms fast-path transaction evaluation endpoint.
    """
    return risk_engine.evaluate_transaction(payload)

@app.post("/api/v1/mystery-shop", response_model=CloakingEvidence)
async def run_mystery_shopper(merchant_id: str = Query("mid_herbals_4412"), website_url: str = Query("https://pureherbals-ayurveda.in")):
    """
    Triggers the autonomous adversarial mystery shopper agent to unmask cloaked websites.
    """
    return await chameleon_hunter.investigate_merchant(merchant_id, website_url)

@app.get("/api/v1/merchants")
def get_monitored_merchants():
    return MONITORED_MERCHANTS

@app.post("/api/v1/simulate/start")
def start_simulation(scenario: str = Query("MIXED", description="Scenario: CLEAN, CLOAKED, BOT_SWARM, BUST_OUT, MIXED")):
    stream_manager.start_stream(scenario)
    return {"status": "started", "scenario": scenario}

@app.post("/api/v1/simulate/stop")
def stop_simulation():
    stream_manager.stop_stream()
    return {"status": "stopped"}

@app.post("/api/v1/sar/generate", response_model=SARReport)
async def generate_sar_report(merchant_id: str = "mid_herbals_4412"):
    merchant = next((m for m in MONITORED_MERCHANTS if m["merchant_id"] == merchant_id), MONITORED_MERCHANTS[0])
    evidence = await chameleon_hunter.investigate_merchant(merchant["merchant_id"], merchant["website_url"])
    dummy_tx = attack_simulator.generate_cloaked_casino_transaction()
    verdict = risk_engine.evaluate_transaction(dummy_tx)
    
    return sar_generator.generate_sar(
        merchant_id=merchant["merchant_id"],
        merchant_name=merchant["merchant_name"],
        evidence=evidence,
        verdict=verdict,
        wire_telemetry=dummy_tx.wire_telemetry.model_dump()
    )

@app.websocket("/ws/telemetry")
async def websocket_telemetry_endpoint(websocket: WebSocket):
    await stream_manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        stream_manager.disconnect(websocket)
    except Exception as e:
        logger.warning(f"WebSocket telemetry client disconnected: {e}")
        stream_manager.disconnect(websocket)

# Serve Frontend static build if present
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
        raise HTTPException(status_code=404, detail="SPA entry index.html not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
