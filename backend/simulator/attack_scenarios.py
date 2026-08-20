import uuid
import random
from datetime import datetime, timezone
from typing import Dict, Any, List
from core.schemas import TransactionPayload, WireTelemetry
from core.config import settings
from telemetry.wire_inspector import WireInspector

class AttackSimulator:
    """
    Generates realistic live financial attack scenarios and clean baseline traffic.
    """

    @staticmethod
    def generate_clean_transaction() -> TransactionPayload:
        tx_id = f"pay_live_{uuid.uuid4().hex[:12]}"
        cust_id = f"cust_in_{random.randint(10000, 99999)}"
        rtt = round(random.uniform(18.0, 48.0), 1)
        amount = round(random.choice([499.0, 1250.0, 2490.0, 3999.0]), 2)
        
        # Calculate dynamic SPLT entropy
        packet_lengths = [random.randint(200, 1400) for _ in range(25)]
        packet_intervals = [random.uniform(12.0, 45.0) for _ in range(25)]
        splt_entropy = WireInspector.compute_splt_entropy(packet_lengths, packet_intervals)

        telemetry = WireTelemetry(
            client_ip=f"103.24.{random.randint(10, 90)}.{random.randint(2, 250)}", # Jio/Airtel India subnet
            server_ip=settings.SERVER_IP_GATEWAY,
            tcp_rtt_ms=rtt,
            ttl_hops=random.randint(52, 58),
            ja4_fingerprint="t13d1516h2_8daaf6152771_b7f2f1e29e92", # Chrome 128 on Windows
            tls_cipher_suite="TLS_AES_128_GCM_SHA256",
            tls_version="TLSv1.3",
            asn_org="Reliance Jio Infocomm Ltd",
            asn_type="Residential / Mobile",
            cisco_splt_entropy=splt_entropy,
            packet_burst_rate=round(random.uniform(1.2, 4.5), 1),
            http2_header_order_hash="h2_std_chrome_v1",
            is_proxy_or_vpn=False
        )
        
        packet_dump = WireInspector.generate_wireshark_packet_dump(telemetry, amount, "Jaipur Handloom Crafts")
        telemetry.raw_packet_hex_sample = packet_dump["hex_dump"]
        telemetry.packet_layers = packet_dump["layers"]

        return TransactionPayload(
            transaction_id=tx_id,
            merchant_id="mid_crafts_9921",
            merchant_name="Jaipur Handloom & Heritage Crafts",
            claimed_mcc="5949 - Sewing, Needlework & Fabric Stores",
            registered_category="Textiles & Handicrafts",
            amount_inr=amount,
            currency="INR",
            payment_method="UPI_INTENT",
            customer_id=cust_id,
            cart_item_count=2,
            cart_items=[
                {"name": "Handmade Indigo Cotton Scarf", "category": "Textiles", "price": amount * 0.6},
                {"name": "Embroidered Table Runner", "category": "Home Decor", "price": amount * 0.4}
            ],
            device_user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
            timestamp=datetime.now(timezone.utc),
            wire_telemetry=telemetry
        )

    @staticmethod
    def generate_cloaked_casino_transaction() -> TransactionPayload:
        tx_id = f"pay_cloak_{uuid.uuid4().hex[:12]}"
        cust_id = f"cust_bet_{random.randint(10000, 99999)}"
        rtt = round(random.uniform(210.0, 275.0), 1) # Offshore latency anomaly
        amount = round(random.choice([10000.0, 25000.0, 50000.0]), 2)
        
        packet_lengths = [random.randint(500, 600) for _ in range(15)]
        packet_intervals = [random.uniform(1.0, 3.0) for _ in range(15)]
        splt_entropy = WireInspector.compute_splt_entropy(packet_lengths, packet_intervals)

        telemetry = WireTelemetry(
            client_ip=f"185.220.{random.randint(100, 150)}.{random.randint(2, 250)}", # Offshore bulletproof host
            server_ip=settings.SERVER_IP_GATEWAY,
            tcp_rtt_ms=rtt,
            ttl_hops=random.randint(38, 44),
            ja4_fingerprint="t13d9999h0_666666666666_999999999999", # Laundering Proxy Relay
            tls_cipher_suite="TLS_CHACHA20_POLY1305_SHA256",
            tls_version="TLSv1.3",
            asn_org="Offshore Bulletproof Cloud Hosters B.V.",
            asn_type="Datacenter",
            cisco_splt_entropy=splt_entropy,
            packet_burst_rate=round(random.uniform(15.0, 35.0), 1),
            http2_header_order_hash="h2_cloaked_nginx_relay",
            is_proxy_or_vpn=True
        )
        
        packet_dump = WireInspector.generate_wireshark_packet_dump(telemetry, amount, "Pure Herbals Organics")
        telemetry.raw_packet_hex_sample = packet_dump["hex_dump"]
        telemetry.packet_layers = packet_dump["layers"]

        return TransactionPayload(
            transaction_id=tx_id,
            merchant_id="mid_herbals_4412",
            merchant_name="Pure Herbals Organics Pvt Ltd",
            claimed_mcc="5977 - Cosmetic Stores & Skincare",
            registered_category="Organic Skincare & Herbal Soaps",
            amount_inr=amount,
            currency="INR",
            payment_method="NETBANKING",
            customer_id=cust_id,
            cart_item_count=1,
            cart_items=[
                {"name": "Royal Fortune VIP Poker Chips (Pack 5000)", "category": "Casino & Virtual Currency", "price": amount}
            ],
            device_user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15",
            timestamp=datetime.now(timezone.utc),
            wire_telemetry=telemetry
        )

    @staticmethod
    def generate_bot_swarm_transaction() -> TransactionPayload:
        tx_id = f"pay_bot_{uuid.uuid4().hex[:12]}"
        cust_id = f"cust_swarm_{random.randint(1000, 9999)}"
        rtt = round(random.uniform(70.0, 110.0), 1)
        amount = round(random.uniform(10.0, 85.0), 2) # Micro-card testing
        
        packet_lengths = [512 for _ in range(20)] # Constant packet lengths
        packet_intervals = [0.5 for _ in range(20)] # Zero variance timing
        splt_entropy = WireInspector.compute_splt_entropy(packet_lengths, packet_intervals)

        telemetry = WireTelemetry(
            client_ip=f"167.99.{random.randint(10, 250)}.{random.randint(2, 250)}", # DigitalOcean Datacenter
            server_ip=settings.SERVER_IP_GATEWAY,
            tcp_rtt_ms=rtt,
            ttl_hops=random.randint(48, 52),
            ja4_fingerprint="t11d0402h0_fa4910dc8901_3389021fa4b1", # Go-http-client / Carding Bot
            tls_cipher_suite="TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256",
            tls_version="TLSv1.2",
            asn_org="DigitalOcean Cloud Datacenters",
            asn_type="Datacenter",
            cisco_splt_entropy=splt_entropy,
            packet_burst_rate=48.5, # 48 req/s burst
            http2_header_order_hash="h2_bot_raw_go",
            is_proxy_or_vpn=True
        )
        
        packet_dump = WireInspector.generate_wireshark_packet_dump(telemetry, amount, "QuickCoffee Express")
        telemetry.raw_packet_hex_sample = packet_dump["hex_dump"]
        telemetry.packet_layers = packet_dump["layers"]

        return TransactionPayload(
            transaction_id=tx_id,
            merchant_id="mid_cafe_1109",
            merchant_name="QuickCoffee Express Mumbai",
            claimed_mcc="5814 - Fast Food Restaurants",
            registered_category="Food & Beverage",
            amount_inr=amount,
            currency="INR",
            payment_method="CARD",
            customer_id=cust_id,
            cart_item_count=1,
            cart_items=[
                {"name": "Espresso Shot Test Item", "category": "Beverage", "price": amount}
            ],
            device_user_agent="Go-http-client/2.0 (Automated Carding Probe)",
            timestamp=datetime.now(timezone.utc),
            wire_telemetry=telemetry
        )

    @staticmethod
    def generate_bust_out_transaction() -> TransactionPayload:
        tx_id = f"pay_bust_{uuid.uuid4().hex[:12]}"
        cust_id = f"cust_mule_{random.randint(10000, 99999)}"
        rtt = round(random.uniform(35.0, 75.0), 1)
        amount = round(random.uniform(180000.0, 450000.0), 2) # Massive ticket spike
        
        packet_lengths = [random.randint(400, 1200) for _ in range(15)]
        packet_intervals = [random.uniform(10.0, 30.0) for _ in range(15)]
        splt_entropy = WireInspector.compute_splt_entropy(packet_lengths, packet_intervals)

        telemetry = WireTelemetry(
            client_ip=f"115.112.{random.randint(10, 80)}.{random.randint(2, 250)}",
            server_ip=settings.SERVER_IP_GATEWAY,
            tcp_rtt_ms=rtt,
            ttl_hops=54,
            ja4_fingerprint="t13d1516h2_8daaf6152771_b7f2f1e29e92",
            tls_cipher_suite="TLS_AES_256_GCM_SHA384",
            tls_version="TLSv1.3",
            asn_org="Tata Communications Ltd",
            asn_type="Residential Broadband",
            cisco_splt_entropy=splt_entropy,
            packet_burst_rate=6.2,
            http2_header_order_hash="h2_std_chrome_v1",
            is_proxy_or_vpn=False
        )
        
        packet_dump = WireInspector.generate_wireshark_packet_dump(telemetry, amount, "Apex IT Electronics")
        telemetry.raw_packet_hex_sample = packet_dump["hex_dump"]
        telemetry.packet_layers = packet_dump["layers"]

        return TransactionPayload(
            transaction_id=tx_id,
            merchant_id="mid_apex_sleeper_88",
            merchant_name="Apex IT Solutions & Peripherals",
            claimed_mcc="5732 - Electronic Sales & Stores",
            registered_category="Computer Hardware",
            amount_inr=amount,
            currency="INR",
            payment_method="CARD",
            customer_id=cust_id,
            cart_item_count=10,
            cart_items=[
                {"name": "Bulk High-End Enterprise Server GPU Units", "category": "Electronics", "price": amount}
            ],
            device_user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0",
            timestamp=datetime.now(timezone.utc),
            wire_telemetry=telemetry
        )

attack_simulator = AttackSimulator()
