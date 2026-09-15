# Sentry — Network Security & Compliance Auditing Platform

> **Find the gaps. Secure the network.**

Sentry is an automated network security and compliance auditing platform that analyzes network configurations, identifies security vulnerabilities and compliance gaps, evaluates the overall security posture, and provides actionable remediation recommendations.

## Platform Highlights

- **Multi-Vendor Configuration Parsing**: Comprehensive support for Cisco IOS/IOS-XE, Juniper JunOS, Fortinet FortiOS, Palo Alto PAN-OS, and Huawei VRP.
- **Deterministic Compliance & Security Rules**: Granular inspection mapping to CIS Benchmarks and NIST SP 800-53 controls (SSH hardening, AAA authentication, ACL boundaries, weak password hashing, SNMP security, and management isolation).
- **Zero-Trust Role-Based Access Control (RBAC)**: Secure user management with Argon2id password hashing and JWT authentication distinguishing Auditor and Admin roles.
- **Executive Audit Reporting & QR Verification**: Automated ReportLab PDF audit reports complete with tamper-evident cryptographic QR verification tags.
- **Interactive Security Dashboard**: Modern, responsive analytics console featuring real-time telemetry, risk classification gauges, and copyable CLI remediation scripts.

## Architecture

`
Frontend (React + Vite + Tailwind CSS)
    ↓
FastAPI Backend (Authentication, Parser, Security Engine)
    ↓
SQLite Database (Users, Audit History, Findings)
`

## Quick Start

### 1. Backend Setup
`ash
cd Backend
python -m venv venv
# Windows:
venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
`

### 2. Frontend Setup
`ash
cd Frontend
npm install
npm run dev
`

### 3. Running Automated Tests
`ash
cd Backend
python test_security_e2e.py
`
