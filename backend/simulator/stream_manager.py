import asyncio
import json
import random
from typing import List, Set
from fastapi import WebSocket
from simulator.attack_scenarios import attack_simulator
from models.risk_engine import RiskEngine

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

    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)

    async def broadcast(self, message: dict):
        if not self.active_connections:
            return
        dead_connections = []
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message))
            except Exception:
                dead_connections.append(connection)
        for dead in dead_connections:
            self.disconnect(dead)

    async def _simulation_loop(self):
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
            else: # MIXED (60% Clean, 15% Cloaked, 15% Bot, 10% Bust Out)
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

            # Broadcast combined packet + verdict event
            event = {
                "type": "TRANSACTION_EVENT",
                "transaction": tx.model_dump(mode="json"),
                "verdict": verdict.model_dump(mode="json")
            }
            await self.broadcast(event)

            # Interval between simulated transactions
            delay = 0.35 if self.current_scenario == "BOT_SWARM" else random.uniform(1.2, 2.5)
            await asyncio.sleep(delay)

    def start_stream(self, scenario: str = "MIXED"):
        self.current_scenario = scenario
        if not self.is_streaming:
            self.is_streaming = True
            self.stream_task = asyncio.create_task(self._simulation_loop())

    def stop_stream(self):
        self.is_streaming = False
        if self.stream_task and not self.stream_task.done():
            self.stream_task.cancel()

stream_manager = StreamManager()
