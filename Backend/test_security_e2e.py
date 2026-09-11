import io
import sys
from fastapi.testclient import TestClient

from main import app
from database import init_db
from auth import hash_password

init_db(hash_password)

client = TestClient(app)

def run_tests():
    print("==================================================")
    print("RUNNING AEGISNET SECURITY & AUTHENTICATION TESTS")
    print("==================================================")

    # 1. Health check
    res = client.get("/")
    assert res.status_code == 200, f"Health check failed: {res.status_code}"
    print("[PASS] 1. Backend health check (200 OK)")

    # 2. Modern Security Headers
    headers = res.headers
    assert headers.get("x-content-type-options") == "nosniff", "Missing X-Content-Type-Options"
    assert headers.get("x-frame-options") == "DENY", "Missing X-Frame-Options"
    assert headers.get("referrer-policy") == "strict-origin-when-cross-origin", "Missing Referrer-Policy"
    assert "x-xss-protection" not in headers, "Obsolete X-XSS-Protection should not be present"
    print("[PASS] 2. Modern Security Headers enforced (no obsolete X-XSS-Protection)")

    # 3. Seeded Demo Auditor Login
    res = client.post("/api/auth/login", json={
        "email": "auditor@aegisnet-sih.gov.in",
        "password": "CyberSecurity@2025"
    })
    assert res.status_code == 200, f"Auditor login failed: {res.text}"
    auditor_data = res.json()
    auditor_token = auditor_data["access_token"]
    assert auditor_data["user"]["role"] == "auditor", "Seeded user is not auditor"
    print("[PASS] 3. Demo Auditor login succeeded with Argon2 + JWT")

    # 4. Seeded Demo Admin Login
    res = client.post("/api/auth/login", json={
        "email": "admin@aegisnet-sih.gov.in",
        "password": "AdminSecurity@2025"
    })
    assert res.status_code == 200, f"Admin login failed: {res.text}"
    admin_data = res.json()
    admin_token = admin_data["access_token"]
    assert admin_data["user"]["role"] == "admin", "Seeded user is not admin"
    print("[PASS] 4. Demo Admin login succeeded with Argon2 + JWT")

    # 5. Invalid Login Credentials
    res = client.post("/api/auth/login", json={
        "email": "auditor@aegisnet-sih.gov.in",
        "password": "WrongPassword123!"
    })
    assert res.status_code == 401, f"Expected 401, got {res.status_code}"
    print("[PASS] 5. Invalid credentials correctly rejected (401 Unauthorized)")

    # 6. Protected /api/auth/me without token
    res = client.get("/api/auth/me")
    assert res.status_code == 401, f"Expected 401, got {res.status_code}"
    print("[PASS] 6. Unauthenticated request correctly rejected (401)")

    # 7. Protected /api/auth/me with Auditor token
    res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {auditor_token}"})
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    assert res.json()["email"] == "auditor@aegisnet-sih.gov.in"
    print("[PASS] 7. Authenticated /api/auth/me succeeded")

    # 8. User Registration: Role tamper test
    # Attempt to register with custom role
    test_email = "new_user_eval@test.gov.in"
    res = client.post("/api/auth/register", json={
        "name": "Jane Auditor",
        "email": test_email,
        "password": "ComplexPassword@2026",
        "role": "admin"  # Attempting privilege escalation
    })
    if res.status_code == 201:
        reg_user = res.json()["user"]
        assert reg_user["role"] == "auditor", f"Privilege escalation vulnerability! Role was {reg_user['role']}"
        print("[PASS] 8. Registration permanently forced to 'auditor' role; prevented admin elevation")
    elif res.status_code == 400:
        print("[PASS] 8. Registration test user already exists")

    # 9. Role-Based Access Control (RBAC):
    # Auditor attempting to access admin route
    res = client.get("/api/admin/users", headers={"Authorization": f"Bearer {auditor_token}"})
    assert res.status_code == 403, f"Expected 403 Forbidden for auditor accessing admin route, got {res.status_code}"
    print("[PASS] 9. RBAC enforced: Auditor blocked from /api/admin/users (403 Forbidden)")

    # Admin accessing admin route
    res = client.get("/api/admin/users", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 200, f"Expected 200 for admin accessing admin route, got {res.status_code}"
    users = res.json()
    assert len(users) >= 2, "Expected at least 2 users"
    print(f"[PASS] 10. RBAC enforced: Admin successfully accessed /api/admin/users (found {len(users)} users)")

    # 11. Upload Security: Disallowed file extensions (.exe)
    fake_exe = io.BytesIO(b"MZ\x90\x00\x03\x00\x00\x00")
    res = client.post(
        "/api/audits/upload",
        headers={"Authorization": f"Bearer {auditor_token}"},
        files={"file": ("malware.exe", fake_exe, "application/octet-stream")}
    )
    assert res.status_code == 400, f"Expected 400 for .exe file, got {res.status_code}"
    print("[PASS] 11. Upload file extension filter rejected non-config file (.exe)")

    # 12. Upload Security: Path traversal in filename
    cfg_content = b"""
    hostname core-switch-01
    transport input telnet ssh
    ip http server
    snmp-server community public RO
    """
    res = client.post(
        "/api/audits/upload",
        headers={"Authorization": f"Bearer {auditor_token}"},
        files={"file": ("../../etc/shadow.cfg", io.BytesIO(cfg_content), "text/plain")}
    )
    assert res.status_code == 200, f"Upload failed: {res.text}"
    audit_data = res.json()
    assert audit_data["filename"] == "shadow.cfg", f"Path traversal not sanitized: {audit_data['filename']}"
    assert "audit_id" in audit_data, "Missing audit_id in response"
    assert len(audit_data["findings"]) > 0, "Security rules did not trigger"
    audit_id = audit_data["audit_id"]
    print(f"[PASS] 12. Upload sanitized path traversal filename to 'shadow.cfg' and audited successfully ({audit_id})")

    # 13. Query Audit by ID
    res = client.get(f"/api/audits/{audit_id}", headers={"Authorization": f"Bearer {auditor_token}"})
    assert res.status_code == 200, f"Get audit by ID failed: {res.status_code}"
    assert res.json()["audit_id"] == audit_id
    print(f"[PASS] 13. Retrieved audit record from database by audit_id")

    # 14. Query Audit History
    res = client.get("/api/audits", headers={"Authorization": f"Bearer {auditor_token}"})
    assert res.status_code == 200
    assert res.json()["total_records"] >= 1
    print(f"[PASS] 14. Retrieved user audit history list ({res.json()['total_records']} records)")

    # 15. PDF Report Generation with QR
    res = client.get(f"/api/reports/{audit_id}", headers={"Authorization": f"Bearer {auditor_token}"})
    assert res.status_code == 200, f"Report download failed: {res.status_code}"
    assert res.headers.get("content-type") == "application/pdf"
    assert len(res.content) > 1000, "PDF content too short"
    print(f"[PASS] 15. Generated server-side ReportLab PDF report with QR code ({len(res.content)} bytes)")

    # 16. Regression Test: Vulnerable Cisco Configuration (AEGIS-ROUTER-01)
    vulnerable_cisco_cfg = """hostname AEGIS-ROUTER-01

version 17.9

interface GigabitEthernet0/0
 description WAN Interface
 ip address 192.168.1.1 255.255.255.0
 no shutdown

interface GigabitEthernet0/1
 description LAN Interface
 ip address 10.0.0.1 255.255.255.0
 no shutdown

username admin privilege 15 password admin123
username operator privilege 1 password operator123

enable password cisco123

ip domain-name aegisnet.local
crypto key generate rsa modulus 1024
ip ssh version 1

line vty 0 4
 password telnet123
 login
 transport input telnet

line console 0
 password console123
 login

ip http server

snmp-server community public RO

no logging console

ntp server 10.0.0.10

cdp run

security passwords min-length 6

access-list 10 permit any

end"""

    res = client.post(
        "/api/audits",
        headers={"Authorization": f"Bearer {auditor_token}"},
        json={
            "vendor": "Cisco",
            "device": "AEGIS-ROUTER-01",
            "configuration": vulnerable_cisco_cfg
        }
    )
    assert res.status_code == 200, f"Audit failed: {res.text}"
    vuln_result = res.json()
    vuln_findings = vuln_result["findings"]
    vuln_risk = vuln_result["risk"]
    vuln_audit_id = vuln_result["audit_id"]

    # Verify rule IDs present
    found_rule_ids = {f["rule_id"] for f in vuln_findings}
    expected_rule_ids = {
        "CISCO-TELNET-001",  # 1. Telnet enabled
        "CISCO-SSH-001",     # 2. Insecure SSH version 1
        "CISCO-CRYPTO-001",  # 3. Weak RSA key length
        "CISCO-AUTH-001",    # 4. Weak / plaintext user credentials
        "CISCO-AUTH-002",    # 5. Weak enable password
        "CISCO-SNMP-001",    # 6. SNMP public community
        "CISCO-WEB-001",     # 7. HTTP management enabled
        "CISCO-AAA-001",     # 8. AAA not configured
        "CISCO-PWD-001",     # 9. Weak password policy
        "CISCO-LOGIN-001",   # 10. Login protection not configured
        "CISCO-LOG-001",     # 11. Console logging disabled / logging issue
        "CISCO-ACL-001",     # 12. Overly permissive ACL
    }
    missing_rules = expected_rule_ids - found_rule_ids
    assert not missing_rules, f"Missing expected rules: {missing_rules}"

    # Critical anti-regression checks
    assert "CISCO-SSH-002" not in found_rule_ids, (
        "CONTRADICTION DETECTED: 'SSH is not configured' (CISCO-SSH-002) was emitted despite 'ip ssh version 1' being configured!"
    )
    assert "NET-002" not in found_rule_ids, (
        "Generic 'SSH is not configured' was emitted!"
    )

    # Password & Secret Leakage Check
    raw_findings_text = str(vuln_findings)
    forbidden_secrets = ["admin123", "operator123", "cisco123", "telnet123", "console123"]
    for secret in forbidden_secrets:
        assert secret not in raw_findings_text, f"SECURITY VULNERABILITY: Password '{secret}' leaked in findings/evidence!"

    # Scoring Check
    assert vuln_risk["security_score"] == 12, f"Expected vulnerable score 12, got {vuln_risk['security_score']}"
    assert vuln_risk["risk_level"] == "Critical", f"Expected 'Critical' risk, got {vuln_risk['risk_level']}"
    assert vuln_risk["high_findings"] == 10, f"Expected 10 High findings, got {vuln_risk['high_findings']}"
    assert vuln_risk["medium_findings"] == 2, f"Expected 2 Medium findings, got {vuln_risk['medium_findings']}"

    # PDF generation for vulnerable audit
    pdf_res = client.get(f"/api/reports/{vuln_audit_id}", headers={"Authorization": f"Bearer {auditor_token}"})
    assert pdf_res.status_code == 200
    for secret_bytes in [b"admin123", b"operator123", b"cisco123"]:
        assert secret_bytes not in pdf_res.content, f"Password leaked in generated PDF report: {secret_bytes}"
    print(f"[PASS] 16. Vulnerable Cisco test configuration detected all 12 exact findings (Score: {vuln_risk['security_score']}/100, 0 password leaks, mutually exclusive SSH logic verified)")

    # 17. Regression Test: Secure Cisco Configuration
    secure_cisco_cfg = """hostname SECURE-ROUTER-01

version 17.9

ip domain-name aegisnet.local
crypto key generate rsa modulus 4096
ip ssh version 2

username secadmin privilege 15 secret 9 $9$dummySaltSecretHash
username secoperator privilege 1 secret 9 $9$anotherDummyHash

enable secret 9 $9$enableSecretSaltedHash

aaa new-model
aaa authentication login default group radius local
aaa authorization exec default group radius local

line vty 0 4
 transport input ssh
 login authentication default

line console 0
 login authentication default

no ip http server
ip http secure-server

snmp-server group SECGROUP v3 priv
snmp-server user secuser SECGROUP v3 auth sha StrongAuthKey priv aes 256 StrongPrivKey

logging host 10.0.0.50
logging buffered 64000 informational

login block-for 180 attempts 3 within 60
login delay 2

ntp server 10.0.0.10

security passwords min-length 14

access-list 10 permit 10.0.0.0 0.0.0.255
access-list 10 deny any log

end"""

    res = client.post(
        "/api/audits",
        headers={"Authorization": f"Bearer {auditor_token}"},
        json={
            "vendor": "Cisco",
            "device": "SECURE-ROUTER-01",
            "configuration": secure_cisco_cfg
        }
    )
    assert res.status_code == 200, f"Audit failed: {res.text}"
    sec_result = res.json()
    sec_risk = sec_result["risk"]
    sec_audit_id = sec_result["audit_id"]

    assert len(sec_result["findings"]) == 0, f"Expected 0 findings for secure config, got: {sec_result['findings']}"
    assert sec_risk["security_score"] == 100, f"Expected score 100, got {sec_risk['security_score']}"
    assert sec_risk["risk_level"] == "Low", f"Expected 'Low' risk level, got {sec_risk['risk_level']}"
    assert sec_risk["security_score"] > vuln_risk["security_score"], "Secure config did not score higher than vulnerable config!"

    # PDF generation for secure audit
    sec_pdf_res = client.get(f"/api/reports/{sec_audit_id}", headers={"Authorization": f"Bearer {auditor_token}"})
    assert sec_pdf_res.status_code == 200
    print(f"[PASS] 17. Secure Cisco configuration scored {sec_risk['security_score']}/100 (Low Risk, 0 findings), significantly higher than vulnerable config ({vuln_risk['security_score']}/100)")

    # 18. Multi-Vendor Compatibility Test (Juniper)
    juniper_cfg = """set system host-name core-switch-01
set system services telnet
set system services ssh protocol-version v2
set snmp community public authorization read-only
"""
    res = client.post(
        "/api/audits",
        headers={"Authorization": f"Bearer {auditor_token}"},
        json={
            "vendor": "Juniper",
            "device": "core-switch-01",
            "configuration": juniper_cfg
        }
    )
    assert res.status_code == 200, f"Juniper audit failed: {res.text}"
    jun_findings = res.json()["findings"]
    jun_rule_ids = {f["rule_id"] for f in jun_findings}
    assert "NET-001" in jun_rule_ids, "Juniper Telnet rule (NET-001) not triggered"
    assert "SNMP-001" in jun_rule_ids, "Juniper SNMP rule (SNMP-001) not triggered"
    assert "NET-002" not in jun_rule_ids, "SSH is configured (v2); NET-002 should not be triggered"
    print(f"[PASS] 18. Multi-vendor compatibility verified: Juniper rules executed successfully ({len(jun_findings)} findings)")

    print("==================================================")
    print("ALL 18 SECURITY, ACCURACY & REGRESSION TESTS PASSED!")
    print("==================================================")


if __name__ == "__main__":
    run_tests()

