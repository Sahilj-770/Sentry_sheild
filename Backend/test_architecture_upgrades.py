import os
import sys
from pathlib import Path

# Add Backend to sys.path
sys.path.insert(0, r"C:\Users\SAHIL\OneDrive\Desktop\SIHfinal\Backend")

from fastapi.testclient import TestClient
from main import app
from vendor_detector import detect_vendor
from config_parser import parse_configuration

client = TestClient(app)

def run_tests():
    print("=" * 60)
    print("TESTING SENTRY ARCHITECTURE UPGRADES & INTEGRATIONS")
    print("=" * 60)

    # 1. Login as auditor to get token
    login_resp = client.post("/api/auth/login", json={
        "email": "auditor@aegisnet-sih.gov.in",
        "password": "CyberSecurity@2025"
    })
    assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("[PASS] 1. Authenticated successfully for architecture testing")

    # 2. Scanner status endpoint
    scan_status = client.get("/api/scanner/status", headers=headers)
    assert scan_status.status_code == 200
    data = scan_status.json()
    assert "available" in data
    assert "status" in data
    print(f"[PASS] 2. Scanner status endpoint: {data['status']}")

    # 3. Scanner injection safety & scan execution
    bad_scan = client.post("/api/scanner/scan", headers=headers, json={
        "target": "192.168.1.1; rm -rf /"
    })
    assert bad_scan.status_code == 400
    print("[PASS] 3. Scanner target command injection successfully blocked (400 Bad Request)")

    valid_scan = client.post("/api/scanner/scan", headers=headers, json={
        "target": "127.0.0.1",
        "ports": "22,80"
    })
    assert valid_scan.status_code == 200
    scan_data = valid_scan.json()
    assert "status" in scan_data
    assert "ports_queried" in scan_data
    print(f"[PASS] 4. Scanner execution returned honest status: {scan_data['status']}")

    # 4. Threat Intel status & lookup
    ti_status = client.get("/api/threat-intel/status", headers=headers)
    assert ti_status.status_code == 200
    ti_data = ti_status.json()
    assert "local_db_entries" in ti_data
    print(f"[PASS] 5. Threat Intel status: {ti_data['mode']} ({ti_data['local_db_entries']} entries)")

    ti_lookup = client.post("/api/threat-intel/lookup", headers=headers, json={
        "rule_id": "CISCO-TELNET-001"
    })
    assert ti_lookup.status_code == 200
    lookup_data = ti_lookup.json()
    assert lookup_data["found"] is True
    assert lookup_data["intel"]["cve"] == "CVE-1999-0524"
    print(f"[PASS] 6. Threat Intel lookup CISCO-TELNET-001 -> {lookup_data['intel']['cve']} (CVSS {lookup_data['intel']['cvss']})")

    # 5. Enterprise Integrations status & test
    integ_status = client.get("/api/integrations/status", headers=headers)
    assert integ_status.status_code == 200
    integ_data = integ_status.json()
    assert "siem" in integ_data and "ticketing" in integ_data and "notifications" in integ_data
    print(f"[PASS] 7. Enterprise integrations status: SIEM={integ_data['siem']['status']}, Ticketing={integ_data['ticketing']['status']}")

    integ_test = client.post("/api/integrations/test", headers=headers, json={
        "service": "siem"
    })
    assert integ_test.status_code == 200
    test_result = integ_test.json()
    assert test_result["success"] is False
    assert test_result["status"] == "Integration not configured"
    print(f"[PASS] 8. Integrations test returned honest unconfigured status: {test_result['status']}")

    # 6. Audit & AI Feedback loop
    with open(r"C:\Users\SAHIL\OneDrive\Desktop\SIHfinal\test_configs\aegis-router-01.cfg", "rb") as f:
        file_bytes = f.read()

    upload_resp = client.post(
        "/api/audits/upload",
        headers=headers,
        files={"file": ("cisco_test.cfg", file_bytes, "application/octet-stream")}
    )
    assert upload_resp.status_code == 200
    audit_id = upload_resp.json()["audit_id"]
    findings = upload_resp.json()["findings"]
    assert len(findings) == 12
    # Verify frameworks and CVE enriched on findings
    telnet_finding = next((f for f in findings if f.get("rule_id") == "CISCO-TELNET-001"), None)
    assert telnet_finding is not None
    assert "frameworks" in telnet_finding and len(telnet_finding["frameworks"]) > 0
    assert telnet_finding.get("cve") == "CVE-1999-0524"
    print(f"[PASS] 9. Findings enriched with frameworks ({telnet_finding['frameworks']}) and CVE ({telnet_finding['cve']})")

    feedback_resp = client.post(
        f"/api/audits/{audit_id}/feedback",
        headers=headers,
        json={
            "rating": "helpful",
            "feedback_text": "Accurately flagged unencrypted Telnet and provided correct SSH v2 migration commands.",
            "rule_id": "CISCO-TELNET-001"
        }
    )
    assert feedback_resp.status_code == 200
    print(f"[PASS] 10. AI feedback loop persisted successfully for audit {audit_id}")

    # Verify audit retrieval includes audit_status and feedback
    detail_resp = client.get(f"/api/audits/{audit_id}", headers=headers)
    assert detail_resp.status_code == 200
    detail_data = detail_resp.json()
    assert detail_data.get("audit_status") == "Completed"
    assert "user_feedback" in detail_data.get("risk_data", {})
    print(f"[PASS] 11. Audit record retrieval verified: audit_status='{detail_data.get('audit_status')}', feedback retained in risk_data_json")

    # 7. Multi-vendor parsing checks
    # Arista EOS
    arista_cfg = "hostname ARISTA-LEAF-01\nmanagement api http-commands\n   no shutdown\n"
    v_arista = detect_vendor(arista_cfg)
    assert v_arista == "Arista", f"Expected Arista, got {v_arista}"
    p_arista = parse_configuration(arista_cfg, v_arista)
    assert p_arista["hostname"] == "ARISTA-LEAF-01"
    assert p_arista["vendor"] == "Arista"
    print("[PASS] 12. Arista EOS detection & parsing verified")

    # pfSense
    pfsense_cfg = "<?xml version='1.0'?>\n<pfsense>\n  <system>\n    <hostname>pfsense-gw</hostname>\n    <domain>internal.net</domain>\n  </system>\n</pfsense>"
    v_pfsense = detect_vendor(pfsense_cfg)
    assert v_pfsense == "pfSense", f"Expected pfSense, got {v_pfsense}"
    p_pfsense = parse_configuration(pfsense_cfg, v_pfsense)
    assert p_pfsense["hostname"] == "pfsense-gw"
    assert p_pfsense["vendor"] == "pfSense"
    print("[PASS] 13. pfSense XML detection & parsing verified")

    # Fortinet
    forti_cfg = "config system global\n    set hostname FGT-CORE-01\nend\n"
    v_forti = detect_vendor(forti_cfg)
    assert v_forti == "Fortinet", f"Expected Fortinet, got {v_forti}"
    p_forti = parse_configuration(forti_cfg, v_forti)
    assert p_forti["hostname"] == "FGT-CORE-01"
    assert p_forti["vendor"] == "Fortinet"
    print("[PASS] 14. Fortinet detection & parsing verified")

    # Palo Alto
    palo_cfg = "set deviceconfig system hostname PA-5220-EDGE\n"
    v_palo = detect_vendor(palo_cfg)
    assert v_palo == "Palo Alto", f"Expected Palo Alto, got {v_palo}"
    p_palo = parse_configuration(palo_cfg, v_palo)
    assert p_palo["hostname"] == "PA-5220-EDGE"
    assert p_palo["vendor"] == "Palo Alto"
    print("[PASS] 15. Palo Alto detection & parsing verified")

    # Huawei
    huawei_cfg = "sysname HUAWEI-NE40E\ntelnet server enable\n"
    v_huawei = detect_vendor(huawei_cfg)
    assert v_huawei == "Huawei", f"Expected Huawei, got {v_huawei}"
    p_huawei = parse_configuration(huawei_cfg, v_huawei)
    assert p_huawei["hostname"] == "HUAWEI-NE40E"
    assert p_huawei["vendor"] == "Huawei"
    print("[PASS] 16. Huawei detection & parsing verified")

    print("=" * 60)
    print("ALL 16 ARCHITECTURE UPGRADE TESTS PASSED!")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
