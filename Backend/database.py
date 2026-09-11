import os
from datetime import datetime, timezone
from typing import Generator
from dotenv import load_dotenv
from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    Text,
    ForeignKey
)
from sqlalchemy.orm import declarative_base, sessionmaker, Session, relationship

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./network_security_auditor.db")

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    hashed_password = Column(String(500), nullable=False)
    role = Column(String(50), default="auditor", nullable=False)  # "auditor" or "admin"
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    audits = relationship("AuditRecord", back_populates="user", cascade="all, delete-orphan")


class AuditRecord(Base):
    __tablename__ = "audit_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    audit_id = Column(String(100), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    user_email = Column(String(255), nullable=True)
    timestamp = Column(String(100), nullable=False)
    vendor = Column(String(100), nullable=False)
    hostname = Column(String(255), nullable=True)
    security_score = Column(Integer, nullable=False)
    risk_level = Column(String(50), nullable=False)
    total_findings = Column(Integer, default=0, nullable=False)
    critical_findings = Column(Integer, default=0, nullable=False)
    high_findings = Column(Integer, default=0, nullable=False)
    medium_findings = Column(Integer, default=0, nullable=False)
    low_findings = Column(Integer, default=0, nullable=False)
    filename = Column(String(255), nullable=True)
    findings_json = Column(Text, nullable=True)
    risk_data_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="audits")


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency yielding a database session per request.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def seed_demo_accounts(db: Session, hash_func) -> None:
    """
    Seeds initial demo Auditor and Admin accounts if they do not exist.
    Passwords are read from environment variables with local defaults.
    """
    demo_auditor_email = os.getenv("DEMO_AUDITOR_EMAIL", "auditor@aegisnet-sih.gov.in")
    demo_auditor_pwd = os.getenv("DEMO_AUDITOR_PASSWORD", "CyberSecurity@2025")
    demo_auditor_name = os.getenv("DEMO_AUDITOR_NAME", "SIH Lead Auditor")

    demo_admin_email = os.getenv("DEMO_ADMIN_EMAIL", "admin@aegisnet-sih.gov.in")
    demo_admin_pwd = os.getenv("DEMO_ADMIN_PASSWORD", "AdminSecurity@2025")
    demo_admin_name = os.getenv("DEMO_ADMIN_NAME", "Chief SecOps Administrator")

    # Check auditor
    existing_auditor = db.query(User).filter(User.email == demo_auditor_email).first()
    if not existing_auditor:
        auditor_user = User(
            email=demo_auditor_email,
            name=demo_auditor_name,
            hashed_password=hash_func(demo_auditor_pwd),
            role="auditor",
            is_active=True
        )
        db.add(auditor_user)

    # Check admin
    existing_admin = db.query(User).filter(User.email == demo_admin_email).first()
    if not existing_admin:
        admin_user = User(
            email=demo_admin_email,
            name=demo_admin_name,
            hashed_password=hash_func(demo_admin_pwd),
            role="admin",
            is_active=True
        )
        db.add(admin_user)

    db.commit()


def init_db(hash_func=None) -> None:
    """
    Initialize database tables and optionally seed demo accounts.
    """
    Base.metadata.create_all(bind=engine)
    if hash_func:
        with SessionLocal() as db:
            seed_demo_accounts(db, hash_func)
