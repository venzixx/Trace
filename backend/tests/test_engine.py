import unittest
from fastapi.testclient import TestClient
from main import app
from simulator.attack_scenarios import attack_simulator
from models.risk_engine import RiskEngine
from agents.catalog_auditor import catalog_auditor
from core.schemas import FrictionAction, ThreatCategory

class TestTraceRiskEngine(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        self.engine = RiskEngine()

    def test_health_endpoint(self):
        response = self.client.get("/api/v1/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "healthy")
        self.assertEqual(data["wire_inspector"], "ACTIVE")

    def test_clean_domestic_merchant(self):
        tx = attack_simulator.generate_clean_transaction()
        verdict = self.engine.evaluate_transaction(tx)
        self.assertEqual(verdict.action, FrictionAction.ALLOW)
        self.assertLess(verdict.overall_risk_score, 30.0)
        self.assertEqual(verdict.threat_category, ThreatCategory.CLEAN)
        self.assertLess(verdict.processing_latency_ms, 15.0)

    def test_cloaked_casino_quarantine(self):
        tx = attack_simulator.generate_cloaked_casino_transaction()
        verdict = self.engine.evaluate_transaction(tx)
        self.assertEqual(verdict.action, FrictionAction.BLOCK_QUARANTINE)
        self.assertGreater(verdict.overall_risk_score, 65.0)
        self.assertEqual(verdict.threat_category, ThreatCategory.CHAMELEON_CLOAKING)

    def test_bot_swarm_testing_detection(self):
        tx = attack_simulator.generate_bot_swarm_transaction()
        verdict = self.engine.evaluate_transaction(tx)
        self.assertIn(verdict.action, [FrictionAction.STEP_UP_3DS, FrictionAction.BLOCK_QUARANTINE])
        self.assertEqual(verdict.threat_category, ThreatCategory.BOT_SWARM_TESTING)

    def test_sleeper_bust_out_escrow_hold(self):
        tx = attack_simulator.generate_bust_out_transaction()
        verdict = self.engine.evaluate_transaction(tx)
        self.assertEqual(verdict.action, FrictionAction.SETTLEMENT_HOLD)
        self.assertEqual(verdict.threat_category, ThreatCategory.MERCHANT_BUST_OUT)

    def test_catalog_auditor_logic(self):
        result = catalog_auditor.audit_catalog_consistency(
            registered_category="Organic Herbal Soaps",
            claimed_mcc="5977 - Cosmetics",
            cart_items=[{"name": "5000 Casino Poker Chips", "price": 50000.0}],
            historical_average_ticket=500.0
        )
        self.assertFalse(result["is_consistent"])
        self.assertGreater(result["confidence_penalty"], 50.0)

    def test_mystery_shopper_api(self):
        response = self.client.post("/api/v1/mystery-shop?merchant_id=mid_herbals_4412&website_url=https://pureherbals-ayurveda.in")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("Gambling", data["actual_detected_business"])
        self.assertEqual(len(data["audit_trail"]), 4)

    def test_sar_generation_api(self):
        response = self.client.post("/api/v1/sar/generate?merchant_id=mid_herbals_4412")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["report_id"].startswith("SAR-IND-2026-"))
        self.assertIn("SUSPICIOUS ACTIVITY REPORT", data["report_markdown"])

if __name__ == "__main__":
    unittest.main()
