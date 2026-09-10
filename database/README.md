# Network Security Auditor - Backend Modules

This repository contains the backend work developed for the SIH2026
Network Security Compliance Auditor project.

## My Contributions

### 1. Firebase Authentication

Firebase Authentication has been configured for:

- Email/Password authentication
- Phone/OTP authentication
- Firebase Admin SDK
- FastAPI authentication
- Firebase ID-token verification
- Protected API endpoint

Authentication flow:

Firebase Login
       ↓
Firebase ID Token
       ↓
Authorization: Bearer <token>
       ↓
FastAPI
       ↓
Firebase ID-token verification
       ↓
Protected API

### 2. QR Code Generation

QR codes are generated for individual audit IDs.

Example:

    AUDIT-2026-0001

The QR code contains the audit ID and does not contain the
network configuration.

The QR generator is implemented in:

    qr_generator.py

Example usage:

    from qr_generator import generate_audit_qr

    generate_audit_qr("AUDIT-2026-0001")

This generates:

    AUDIT-2026-0001_qr.png

The generated QR code has been tested by scanning it with a mobile phone.

### 3. PDF Audit Report Generation

PDF reports are generated using ReportLab.

The PDF generator is implemented in:

    pdf_report.py

The current report contains:

- Basic Information
- Audit ID
- Vendor
- Security Score
- Security Findings
- Severity of findings
- Suggestions / Remediation
- Audit Verification QR Code

Example report:

    AUDIT-2026-0001_Report.pdf

The PDF generation has been tested successfully.

## Files

| File | Purpose |
|------|---------|
| `main.py` | FastAPI application and Firebase authentication |
| `qr_generator.py` | Generates QR codes for audit IDs |
| `pdf_report.py` | Generates PDF security audit reports |
| `requirements.txt` | Python dependencies |
| `.gitignore` | Prevents unnecessary/sensitive files from being committed |

## Requirements

Python 3.14+

Install the dependencies:

    pip install -r requirements.txt

## Firebase Configuration

Firebase Admin SDK is used by the FastAPI backend.

The Firebase service-account JSON file must NOT be placed inside
this repository or uploaded to GitHub.

Set the credential path as an environment variable:

    $env:GOOGLE_APPLICATION_CREDENTIALS="C:\Users\HP\firebase-service-account.json"

Do not share or commit the Firebase service-account private key.

## Running the FastAPI Backend

Activate the virtual environment and run:

    uvicorn main:app --reload

The backend will run at:

    http://127.0.0.1:8000

FastAPI documentation:

    http://127.0.0.1:8000/docs

## Authentication Endpoint

### Public endpoint

    GET /

### Protected endpoint

    GET /auth/me

The `/auth/me` endpoint requires a valid Firebase ID token.

Without a valid authentication token, the API returns:

    401 Unauthorized

## QR Code Testing

Run:

    python qr_generator.py

Enter an audit ID when prompted.

Example:

    AUDIT-2026-0001

A QR image will be generated for that audit.

## PDF Testing

Run:

    python pdf_report.py

The test generates:

    AUDIT-2026-0001_Report.pdf

The generated PDF contains the audit information, security findings,
remediation suggestions, and QR code.

## Integration Status

The following modules are currently implemented and tested independently:

- Firebase authentication
- FastAPI token verification
- QR code generation
- PDF report generation

The QR and PDF modules currently use test audit data.

They are intended to be connected to the main SIH2026 audit pipeline,
where the actual:

- Audit ID
- Vendor
- Security findings
- Risk/security score
- Remediation suggestions

will be passed to the QR and PDF generation functions.

## Handoff

This repository contains my independent backend contribution.

The main SIH2026 backend can integrate these modules into its existing
audit pipeline without replacing the existing auditor logic.
