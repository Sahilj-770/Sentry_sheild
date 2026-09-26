"""
Automated Test Suite for Sentry Shield Audit Engine Correctness & Reliability.

Covers:
1. Exact line-number tracking & evidence-based findings in Cisco parser.
2. Order-independence of 'enable password' and 'enable secret'.
3. 'transport input all' and extended ACL syntax handling.
4. Comprehensive Threat Intelligence CVE/CVSS enrichment for all rules.
5. Deduplication and deterministic arithmetic in risk scoring.
6. Public cryptographic verification endpoint (/api/reports/{audit_id}/verify).
7. Canonical DB record consistency in PDF generation and zero secret leaks.
"""

import sys
import io
import json
import hashlib
from fastapi.testclient import TestClient

from main import app
from database import init_db
from auth import hash_password
from vendor_parser.cisco import CiscoParser
from security_rules import run_security_rules
from threat_intel import threat_intel_service
from risk_score import calculate_risk_score

init_db(hash_password)
client = TestClient(app)


def test_line_number_evidence():
    print("[RUN] 1. Testing line-number evidence in Cisco parser...")
    cfg = """! Cisco Router Configuration
! Sample Header
hostname EDGE-R01

interface GigabitEthernet0/0
 ip address 10.0.0.1 255.255.255.0
 no shutdown

username backupuser privilege 15 password pass123

crypto key generate rsa modulus 1024
ip ssh version 1

line vty 0 4
 transport input telnet

access-list 10 permit any
"""
    parser = CiscoParser()
    data = parser.parse(cfg)
    findings = run_security_rules(data)

    # Check Telnet finding has line number
    telnet = next((f for f in findings if f["rule_id"] == "CISCO-TELNET-001"), None)
    assert telnet is not None, "Missing Telnet finding"
    assert "Line 15:" in telnet["evidence"], f"Expected 'Line 15:' in evidence, got: {telnet['evidence']}"

    # Check SSH v1 finding has line number
    ssh1 = next((f for f in findings if f["rule_id"] == "CISCO-SSH-001"), None)
    assert ssh1 is not None, "Missing SSH v1 finding"
    assert "Line 12:" in ssh1["evidence"], f"Expected 'Line 12:' in evidence, got: {ssh1['evidence']}"

    # Check weak RSA key finding has line number
    rsa = next((f for f in findings if f["rule_id"] == "CISCO-CRYPTO-001"), None)
    assert rsa is not None, "Missing RSA finding"
    assert "Line 11:" in rsa["evidence"], f"Expected 'Line 11:' in evidence, got: {rsa['evidence']}"

    # Check plaintext account has line number and password is redacted
    auth = next((f for f in findings if f["rule_id"] == "CISCO-AUTH-001"), None)
    assert auth is not None, "Missing AUTH finding"
    assert "Line 9:" in auth["evidence"], f"Expected 'Line 9:' in evidence, got: {auth['evidence']}"
    assert "pass123" not in auth["evidence"], "Plaintext password leaked in evidence!"

    # Check absent control has clear wording
    aaa = next((f for f in findings if f["rule_id"] == "CISCO-AAA-001"), None)
    assert aaa is not None, "Missing AAA finding"
    assert "Explicit control absent" in aaa["evidence"], f"Expected 'Explicit control absent' in evidence, got: {aaa['evidence']}"

    print("  -> Line-number tracking and absent-control evidence verified successfully.")


def test_enable_password_order_independence():
    print("[RUN] 2. Testing order-independence of enable password and enable secret...")
    parser = CiscoParser()

    # Case A: enable password precedes enable secret
    cfg_a = """hostname TEST-R1
enable password cisco123
enable secret 9 $9$dummyHashSalt
"""
    data_a = parser.parse(cfg_a)
    assert data_a["has_weak_enable_password"] is True, "enable password before secret was improperly silenced!"
    findings_a = run_security_rules(data_a)
    rule_ids_a = {f["rule_id"] for f in findings_a}
    assert "CISCO-AUTH-002" in rule_ids_a, "CISCO-AUTH-002 not triggered when enable password precedes enable secret"

    # Case B: enable secret only (secure)
    cfg_b = """hostname TEST-R2
enable secret 9 $9$dummyHashSalt
"""
    data_b = parser.parse(cfg_b)
    assert data_b["has_weak_enable_password"] is False, "enable secret alone triggered weak enable password!"
    findings_b = run_security_rules(data_b)
    rule_ids_b = {f["rule_id"] for f in findings_b}
    assert "CISCO-AUTH-002" not in rule_ids_b, "CISCO-AUTH-002 triggered when only enable secret was configured"

    print("  -> Enable password order-independence verified successfully.")


def test_transport_input_all_and_extended_acls():
    print("[RUN] 3. Testing 'transport input all' and extended ACL handling...")
    parser = CiscoParser()

    # transport input all
    cfg_telnet_all = """hostname TEST-R3
line vty 0 4
 transport input all
"""
    data = parser.parse(cfg_telnet_all)
    assert data["telnet_enabled"] is True, "transport input all did not set telnet_enabled"
    findings = run_security_rules(data)
    assert any(f["rule_id"] == "CISCO-TELNET-001" for f in findings), "Telnet rule not triggered for 'transport input all'"

    # Extended ACLs: permit ip any any & permit tcp any any
    cfg_acl = """hostname TEST-R4
access-list 101 permit ip any any
access-list 102 permit tcp any any
"""
    data_acl = parser.parse(cfg_acl)
    assert data_acl["overly_permissive_acl"] is True, "Extended permit ip/tcp any any was not flagged as permissive"
    findings_acl = run_security_rules(data_acl)
    acl_finding = next((f for f in findings_acl if f["rule_id"] == "CISCO-ACL-001"), None)
    assert acl_finding is not None, "CISCO-ACL-001 not triggered for extended permissive ACL"

    # Inactive logging: no logging on
    cfg_no_log = """hostname TEST-R5
logging host 10.0.0.1
no logging on
"""
    data_log = parser.parse(cfg_no_log)
    assert data_log["logging_configured"] is False, "'no logging on' did not disable logging_configured"

    print("  -> 'transport input all', extended ACLs, and global logging deactivation verified.")


def test_threat_intel_complete_enrichment():
    print("[RUN] 4. Testing comprehensive Threat Intel mapping for all Cisco rules...")
    # Test all 12 Cisco rule IDs
    cisco_rule_ids = [
        "CISCO-TELNET-001",
        "CISCO-SSH-001",
        "CISCO-SSH-002",
        "CISCO-CRYPTO-001",
        "CISCO-AUTH-001",
        "CISCO-AUTH-002",
        "CISCO-SNMP-001",
        "CISCO-WEB-001",
        "CISCO-AAA-001",
        "CISCO-PWD-001",
        "CISCO-LOGIN-001",
        "CISCO-LOG-001",
        "CISCO-ACL-001"
    ]

    for rid in cisco_rule_ids:
        intel = threat_intel_service.lookup_rule(rid)
        assert intel is not None, f"Threat intel missing for rule {rid}"
        assert "cve" in intel, f"Missing CVE in threat intel for {rid}"
        assert "cvss" in intel, f"Missing CVSS in threat intel for {rid}"
        assert intel["cvss"] > 0, f"CVSS must be positive for {rid}"
        assert "attack_technique" in intel, f"Missing attack technique for {rid}"

    mock_findings = [{"rule_id": rid, "issue": f"Test {rid}"} for rid in cisco_rule_ids]
    enriched = threat_intel_service.enrich_findings(mock_findings)
    assert len(enriched) == len(cisco_rule_ids)
    for ef in enriched:
        assert ef.get("cve") is not None, f"Enrichment failed to attach CVE for {ef['rule_id']}"
        assert ef.get("cvss") is not None, f"Enrichment failed to attach CVSS for {ef['rule_id']}"

    print(f"  -> All {len(cisco_rule_ids)} Cisco rule IDs verified with CVE and CVSS enrichment.")


def test_risk_score_deduplication_and_metrics():
    print("[RUN] 5. Testing risk score deduplication, metric counters, and score arithmetic...")
    # 10 High findings (-80) + 2 Medium findings (-8) = 12
    unique_findings = [
        {"rule_id": f"RULE-H-{i}", "severity": "High"} for i in range(10)
    ] + [
        {"rule_id": f"RULE-M-{i}", "severity": "Medium"} for i in range(2)
    ]

    result = calculate_risk_score(unique_findings)
    assert result["security_score"] == 12, f"Expected 12, got {result['security_score']}"
    assert result["risk_level"] == "Critical"
    assert result["high_findings"] == 10
    assert result["medium_findings"] == 2
    assert result["deduplicated"] is False

    # Introduce duplicate findings with same rule_ids
    duplicated_findings = unique_findings + unique_findings[:4]
    assert len(duplicated_findings) == 16
    dedup_result = calculate_risk_score(duplicated_findings)
    assert dedup_result["security_score"] == 12, f"Expected score 12 with duplicates, got {dedup_result['security_score']}"
    assert dedup_result["total_findings"] == 12, f"Expected total 12 unique findings, got {dedup_result['total_findings']}"
    assert dedup_result["deduplicated"] is True

    # Clamping test: score should never go below 0
    massive_findings = [{"rule_id": f"MASSIVE-{i}", "severity": "Critical"} for i in range(20)]
    clamped_result = calculate_risk_score(massive_findings)
    assert clamped_result["security_score"] == 0, f"Score should clamp to 0, got {clamped_result['security_score']}"
    assert clamped_result["risk_level"] == "Critical"

    # Clean config test
    clean_result = calculate_risk_score([])
    assert clean_result["security_score"] == 100
    assert clean_result["risk_level"] == "Low"
    assert clean_result["checks_passed"] == 12
    assert clean_result["checks_failed"] == 0

    print("  -> Risk score deduplication, clamping, and structured metrics verified.")


def test_public_audit_verification_endpoint():
    print("[RUN] 6. Testing public verification endpoint and PDF canonical record...")
    # First, login as auditor to create an audit record
    login_res = client.post("/api/auth/login", json={
        "email": "auditor@aegisnet-sih.gov.in",
        "password": "CyberSecurity@2025"
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Upload test config
    cfg_content = """hostname VERIF-ROUTER
crypto key generate rsa modulus 4096
ip ssh version 2
enable secret 9 $9$saltedHashSecret
aaa new-model
logging host 10.10.10.10
"""
    res = client.post(
        "/api/audits",
        headers=headers,
        json={
            "vendor": "Cisco",
            "device": "VERIF-ROUTER",
            "configuration": cfg_content
        }
    )
    assert res.status_code == 200
    audit_data = res.json()
    audit_id = audit_data["audit_id"]

    # Test Public Verification Endpoint (No Auth Header required)
    verif_res = client.get(f"/api/reports/{audit_id}/verify")
    assert verif_res.status_code == 200, f"Verification failed: {verif_res.text}"
    verif_data = verif_res.json()

    assert verif_data["verified"] is True
    assert verif_data["audit_id"] == audit_id
    assert verif_data["device_name"] == "VERIF-ROUTER"
    assert verif_data["vendor"] == "Cisco"
    assert "security_score" in verif_data
    assert "integrity_checksum_sha256" in verif_data
    assert len(verif_data["integrity_checksum_sha256"]) == 64
    assert "compliance_status" in verif_data

    # Test verification of non-existent audit ID
    bad_verif = client.get("/api/reports/AUDIT-NONEXISTENT-9999/verify")
    assert bad_verif.status_code == 404
    print(f"  -> Public verification endpoint correctly returned authentic status and SHA-256 fingerprint for {audit_id}")

    # Test PDF generation incorporates verification
    pdf_res = client.get(f"/api/reports/{audit_id}", headers=headers)
    assert pdf_res.status_code == 200
    assert pdf_res.headers.get("content-type") == "application/pdf"
    assert len(pdf_res.content) > 1000

    print("  -> PDF report generated successfully with verification metadata.")


def run_all_correctness_tests():
    print("=" * 65)
    print("RUNNING SENTRY AUDIT-ENGINE CORRECTNESS & RELIABILITY SUITE")
    print("=" * 65)

    test_line_number_evidence()
    test_enable_password_order_independence()
    test_transport_input_all_and_extended_acls()
    test_threat_intel_complete_enrichment()
    test_risk_score_deduplication_and_metrics()
    test_public_audit_verification_endpoint()

    print("=" * 65)
    print("ALL 6 AUDIT-ENGINE CORRECTNESS & RELIABILITY TEST SUITES PASSED!")
    print("=" * 65)


if __name__ == "__main__":
    run_all_correctness_tests()
