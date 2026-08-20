import asyncio
import json
import random
import logging
from typing import List, Set
from datetime import datetime, timezone
from fastapi import WebSocket
from simulator.attack_scenarios import attack_simulator
from models.risk_engine import RiskEngine
from core.database import SessionLocal, MerchantModel, TransactionModel

logger = logging.getLogger("trace.stream_manager")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")

class StreamManager:
    """
    Manages active WebSocket client connections and coordinates live transaction event streaming.
    """

    def __init__(self):
        self.active_connections: Set[WebSocket] = set()
        self.is_streaming: bool = False
        self.current_scenario: str = "MIXED" # CLEAN, CLOAKED, BOT_SWARM, BUST_OUT, MIXED
        self.risk_engine = RiskEngine()
        self.stream_task: asyncio.Task = None

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)
        logger.info(f"WebSocket client connected. Total active: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)
        logger.info(f"WebSocket client disconnected. Total active: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        if not self.active_connections:
            return
        dead_connections = []
        for connection in list(self.active_connections):
            try:
                await connection.send_text(json.dumps(message))
            except Exception as e:
                logger.warning(f"Error sending message to client: {e}. Marking connection for removal.")
                dead_connections.append(connection)
        for dead in dead_connections:
            self.disconnect(dead)

    async def _simulation_loop(self):
        logger.info(f"Starting simulation loop with scenario: {self.current_scenario}")
        try:
            while self.is_streaming:
                # Select generator based on scenario
                if self.current_scenario == "CLEAN":
                    tx = attack_simulator.generate_clean_transaction()
                elif self.current_scenario == "CLOAKED":
                    tx = attack_simulator.generate_cloaked_casino_transaction()
                elif self.current_scenario == "BOT_SWARM":
                    tx = attack_simulator.generate_bot_swarm_transaction()
                elif self.current_scenario == "BUST_OUT":
                    tx = attack_simulator.generate_bust_out_transaction()
                else: # MIXED
                    dice = random.random()
                    if dice < 0.60:
                        tx = attack_simulator.generate_clean_transaction()
                    elif dice < 0.75:
                        tx = attack_simulator.generate_cloaked_casino_transaction()
                    elif dice < 0.90:
                        tx = attack_simulator.generate_bot_swarm_transaction()
                    else:
                        tx = attack_simulator.generate_bust_out_transaction()

                # Evaluate transaction in real-time
                verdict = self.risk_engine.evaluate_transaction(tx)

                # Persist dynamically generated attack data to SQLite DB
                try:
                    db = SessionLocal()
                    existing_m = db.query(MerchantModel).filter(MerchantModel.merchant_id == tx.merchant_id).first()
                    if not existing_m:
                        new_m = MerchantModel(
                            merchant_id=tx.merchant_id,
                            merchant_name=tx.merchant_name,
                            claimed_mcc=tx.claimed_mcc,
                            registered_category=tx.registered_category,
                            website_url=f"https://{tx.merchant_id.replace('_', '-')}.in",
                            status="QUARANTINED" if verdict.threat_category.value == "CHAMELEON_CLOAKING" else ("SETTLEMENT_HOLD" if verdict.threat_category.value == "MERCHANT_BUST_OUT" else "ACTIVE_VERIFIED"),
                            risk_score=verdict.overall_risk_score,
                            threat=verdict.threat_category.value,
                            monthly_volume_inr=round(tx.amount_inr * 25.0, 2),
                            last_audited=datetime.now(timezone.utc)
                        )
                        db.add(new_m)
                    
                    tx_rec = TransactionModel(
                        transaction_id=tx.transaction_id,
                        merchant_id=tx.merchant_id,
                        merchant_name=tx.merchant_name,
                        amount_inr=tx.amount_inr,
                        payment_method=tx.payment_method,
                        claimed_mcc=tx.claimed_mcc,
                        overall_risk_score=verdict.overall_risk_score,
                        wire_risk_score=verdict.wire_risk_score,
                        behavioral_risk_score=verdict.behavioral_risk_score,
                        action=verdict.action.value,
                        threat_category=verdict.threat_category.value,
                        client_ip=tx.wire_telemetry.client_ip,
                        tcp_rtt_ms=tx.wire_telemetry.tcp_rtt_ms,
                        ja4_fingerprint=tx.wire_telemetry.ja4_fingerprint,
                        cisco_splt_entropy=tx.wire_telemetry.cisco_splt_entropy,
                        asn_org=tx.wire_telemetry.asn_org,
                        summary_text=verdict.summary_text,
                        timestamp=datetime.now(timezone.utc)
                    )
                    db.add(tx_rec)
                    db.commit()
                    db.close()
                except Exception as e:
                    logger.warning(f"Could not persist attack event to DB: {e}")

                # Broadcast combined packet + verdict event
                event = {
                    "type": "TRANSACTION_EVENT",
                    "transaction": tx.model_dump(mode="json"),
                    "verdict": verdict.model_dump(mode="json")
                }
                await self.broadcast(event)

                # Interval between simulated transactions
                delay = 0.4 if self.current_scenario == "BOT_SWARM" else random.uniform(1.2, 2.5)
                await asyncio.sleep(delay)
        except asyncio.CancelledError:
            logger.info("Simulation loop cancelled gracefully.")
        except Exception as e:
            logger.error(f"Unexpected error in simulation loop: {e}", exc_info=True)

    async def start_stream(self, scenario: str = "MIXED"):
        self.current_scenario = scenario
        if not self.is_streaming:
            self.is_streaming = True
            loop = asyncio.get_running_loop()
            self.stream_task = loop.create_task(self._simulation_loop())
            logger.info(f"Stream initiated on scenario: {scenario}")

    async def stop_stream(self):
        self.is_streaming = False
        if self.stream_task and not self.stream_task.done():
            self.stream_task.cancel()
        logger.info("Stream stopped.")

stream_manager = StreamManager()
