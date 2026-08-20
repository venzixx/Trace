import os
import hashlib
from datetime import datetime, timezone
from sqlalchemy import create_engine, Column, String, Float, Integer, Text, DateTime, Boolean
from sqlalchemy.orm import declarative_base, sessionmaker

DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "trace.db"))
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class MerchantModel(Base):
    __tablename__ = "merchants"

    merchant_id = Column(String(64), primary_key=True, index=True)
    merchant_name = Column(String(128), nullable=False)
    claimed_mcc = Column(String(128), nullable=False)
    registered_category = Column(String(128), nullable=False)
    website_url = Column(String(256), nullable=False)
    status = Column(String(32), default="ACTIVE_VERIFIED") # ACTIVE_VERIFIED, STEP_UP_ACTIVE, SETTLEMENT_HOLD, QUARANTINED
    risk_score = Column(Float, default=0.0)
    threat = Column(String(64), default="CLEAN")
    monthly_volume_inr = Column(Float, default=0.0)
    last_audited = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class TransactionModel(Base):
    __tablename__ = "transactions"

    transaction_id = Column(String(64), primary_key=True, index=True)
    merchant_id = Column(String(64), index=True, nullable=False)
    merchant_name = Column(String(128), nullable=False)
    amount_inr = Column(Float, nullable=False)
    payment_method = Column(String(32), nullable=False)
    claimed_mcc = Column(String(128), nullable=False)
    overall_risk_score = Column(Float, nullable=False)
    wire_risk_score = Column(Float, nullable=False)
    behavioral_risk_score = Column(Float, nullable=False)
    action = Column(String(32), nullable=False)
    threat_category = Column(String(64), nullable=False)
    client_ip = Column(String(64))
    tcp_rtt_ms = Column(Float)
    ja4_fingerprint = Column(String(64))
    cisco_splt_entropy = Column(Float)
    asn_org = Column(String(128))
    summary_text = Column(Text)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class SARReportModel(Base):
    __tablename__ = "sar_reports"

    report_id = Column(String(64), primary_key=True, index=True)
    merchant_id = Column(String(64), index=True, nullable=False)
    merchant_name = Column(String(128), nullable=False)
    regulatory_body = Column(String(64), default="RBI / FIU-IND")
    primary_violation = Column(String(128), nullable=False)
    estimated_illicit_volume_inr = Column(Float, default=0.0)
    confidence_score = Column(Float, default=99.4)
    report_markdown = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class UserModel(Base):
    __tablename__ = "users"

    username = Column(String(64), primary_key=True, index=True)
    password_hash = Column(String(128), nullable=False)
    full_name = Column(String(128), default="Risk Analyst")
    role = Column(String(32), default="RISK_ANALYST") # RISK_ANALYST, COMPLIANCE_OFFICER, ADMIN
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Create default Admin / Analyst accounts if not exist
        if not db.query(UserModel).filter(UserModel.username == "analyst").first():
            analyst = UserModel(
                username="analyst",
                password_hash=hash_password("razorpay2026"),
                full_name="Sidharth Samantaray (Risk Ops)",
                role="RISK_ANALYST"
            )
            admin = UserModel(
                username="admin",
                password_hash=hash_password("admin123"),
                full_name="Lead Compliance Officer",
                role="ADMIN"
            )
            db.add(analyst)
            db.add(admin)
            db.commit()
    finally:
        db.close()
