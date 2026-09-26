# =============================================================================
# AUTHORITATIVE COMPLIANCE & FRAMEWORK POLICY MAPPINGS
# =============================================================================
RULE_FRAMEWORK_MAPPINGS = {
    # Cisco IOS / IOS-XE
    "CISCO-TELNET-001": ["CIS Cisco IOS Benchmark v8 (1.1)", "NIST SP 800-53 (AC-17)", "DISA STIG (NET-040)"],
    "CISCO-SSH-001": ["CIS Cisco IOS Benchmark v8 (1.2)", "NIST SP 800-53 (IA-5, SC-8)", "DISA STIG (NET-045)"],
    "CISCO-SSH-002": ["CIS Cisco IOS Benchmark v8 (1.2)", "NIST SP 800-53 (AC-17)", "ISO/IEC 27001 (A.9.4.2)"],
    "CISCO-CRYPTO-001": ["NIST SP 800-131A", "CIS Cisco IOS Benchmark v8 (1.3)", "DISA STIG"],
    "CISCO-AUTH-001": ["CIS Cisco IOS Benchmark v8 (1.4)", "NIST SP 800-53 (IA-5)", "ISO/IEC 27001 (A.9.4.2)"],
    "CISCO-AUTH-002": ["CIS Cisco IOS Benchmark v8 (1.5)", "NIST SP 800-53 (IA-5)", "DISA STIG"],
    "CISCO-SNMP-001": ["CIS Cisco IOS Benchmark v8 (1.6)", "NIST SP 800-53 (SC-8)", "DISA STIG (NET-080)"],
    "CISCO-WEB-001": ["CIS Cisco IOS Benchmark v8 (1.7)", "NIST SP 800-53 (AC-17)", "DISA STIG"],
    "CISCO-AAA-001": ["CIS Cisco IOS Benchmark v8 (1.8)", "NIST SP 800-53 (AC-2, IA-2)"],
    "CISCO-PWD-001": ["CIS Cisco IOS Benchmark v8 (1.9)", "NIST SP 800-53 (IA-5)", "ISO/IEC 27001 (A.9.4.3)"],
    "CISCO-LOGIN-001": ["CIS Cisco IOS Benchmark v8 (1.10)", "NIST SP 800-53 (AC-7)"],
    "CISCO-LOG-001": ["CIS Cisco IOS Benchmark v8 (2.1)", "NIST SP 800-53 (AU-2, AU-3)"],
    "CISCO-ACL-001": ["CIS Cisco IOS Benchmark v8 (3.1)", "NIST SP 800-53 (AC-4)", "ISO/IEC 27001 (A.13.1.1)"],
    # Multi-vendor / Generic
    "NET-001": ["CIS Benchmark", "NIST SP 800-53 (AC-17)"],
    "NET-002": ["CIS Benchmark", "NIST SP 800-53 (AC-17)"],
    "NET-003": ["CIS Benchmark", "NIST SP 800-53 (IA-5, SC-8)"],
    "NET-004": ["CIS Benchmark", "NIST SP 800-53 (SC-8)"],
    "NET-005": ["CIS Benchmark", "NIST SP 800-53 (AC-17)"],
    "NET-006": ["CIS Benchmark", "NIST SP 800-53 (AC-3, IA-2)"],
    "NET-007": ["CIS Benchmark", "NIST SP 800-53 (AC-4)"],
    "NET-008": ["CIS Benchmark", "NIST SP 800-53 (CM-7)"],
    "NET-009": ["CIS Benchmark", "NIST SP 800-53 (AC-6)"],
    "LOG-001": ["CIS Benchmark", "NIST SP 800-53 (AU-2, AU-3)"],
    "NTP-001": ["CIS Benchmark", "NIST SP 800-53 (AU-8)"],
    "TIME-001": ["CIS Benchmark", "NIST SP 800-53 (AU-8)"],
    "SNMP-001": ["CIS Benchmark", "NIST SP 800-53 (SC-8)", "DISA STIG (NET-080)"],
    "WEB-001": ["CIS Benchmark", "NIST SP 800-53 (AC-17)"],
    "AUTH-001": ["CIS Benchmark", "NIST SP 800-53 (AC-2, IA-2)"],
    "AUTH-002": ["CIS Benchmark", "NIST SP 800-53 (IA-5)", "ISO/IEC 27001 (A.9.4.3)"],
    "AUTH-003": ["CIS Benchmark", "NIST SP 800-53 (AC-7)"],
    "AUTH-004": ["CIS Benchmark", "NIST SP 800-53 (AC-6)", "DISA STIG"],
    "SVC-001": ["CIS Benchmark", "NIST SP 800-53 (CM-7)"]
}

def run_security_rules(parsed_data):
    """
    Runs deterministic security checks on the parsed configuration
    and returns all detected security findings with line-level evidence.

    Includes specific, vendor-aware rules for Cisco IOS/IOS-XE while
    preserving rules for Juniper, Fortinet, Palo Alto, and Huawei.
    """
    findings = []
    vendor = parsed_data.get("vendor", "")
    evidence_details = parsed_data.get("evidence_details", {})

    # =========================================================================
    # CISCO IOS / IOS-XE RULES
    # =========================================================================
    if vendor == "Cisco":
        # 1. Telnet Enabled (High)
        if parsed_data.get("telnet_enabled"):
            telnet_info = evidence_details.get("telnet")
            ev_str = f"Line {telnet_info['line_num']}: {telnet_info['line']}" if telnet_info else "transport input telnet"
            findings.append({
                "rule_id": "CISCO-TELNET-001",
                "title": "Telnet is enabled for remote management",
                "issue": "Telnet is enabled for remote management",
                "severity": "High",
                "category": "Access Control & Remote Management",
                "description": "Telnet transmits credentials and session traffic in cleartext over the network, leaving management sessions vulnerable to interception.",
                "evidence": ev_str,
                "remediation": "Disable Telnet and use SSH for secure remote administration."
            })

        # 2. SSH Protocol Version / Configuration (High)
        # CRITICAL: If SSH version 1 is present, report CISCO-SSH-001.
        # Do NOT report "SSH is not configured" when SSH version 1 exists.
        if parsed_data.get("ssh_v1_enabled"):
            ssh1_info = evidence_details.get("ssh_v1")
            ev_str = f"Line {ssh1_info['line_num']}: {ssh1_info['line']}" if ssh1_info else "ip ssh version 1"
            findings.append({
                "rule_id": "CISCO-SSH-001",
                "title": "Insecure SSH version 1 is enabled",
                "issue": "Insecure SSH version 1 is enabled",
                "severity": "High",
                "category": "Cryptographic Protocols",
                "description": "SSH version 1 has known cryptographic design flaws, including vulnerability to traffic decryption and man-in-the-middle attacks.",
                "evidence": ev_str,
                "remediation": "Disable SSH version 1 and configure SSH version 2."
            })
        elif not parsed_data.get("ssh_configured") and not parsed_data.get("ssh_enabled"):
            findings.append({
                "rule_id": "CISCO-SSH-002",
                "title": "SSH is not configured",
                "issue": "SSH is not configured",
                "severity": "High",
                "category": "Remote Management",
                "description": "Secure remote administration should use an encrypted management protocol (SSHv2).",
                "evidence": "Explicit control absent: No SSH configuration found on device",
                "remediation": "Enable SSH version 2 and generate a strong RSA crypto key."
            })

        # 3. Weak RSA Key Length (High)
        if parsed_data.get("weak_rsa_key"):
            modulus_val = parsed_data.get("rsa_key_modulus", 1024)
            crypto_info = evidence_details.get("weak_rsa_key")
            ev_str = f"Line {crypto_info['line_num']}: {crypto_info['line']}" if crypto_info else f"crypto key generate rsa modulus {modulus_val}"
            findings.append({
                "rule_id": "CISCO-CRYPTO-001",
                "title": "Weak RSA key length detected",
                "issue": "Weak RSA key length detected",
                "severity": "High",
                "category": "Cryptographic Security",
                "description": "RSA keys shorter than 2048 bits provide insufficient cryptographic strength against modern factorization and attack techniques.",
                "evidence": ev_str,
                "remediation": "Regenerate RSA keys using a stronger key size appropriate for the device and security policy (>= 2048 bits)."
            })

        # 4. Weak / Plaintext User Credentials (High)
        # SECURITY: NEVER expose the actual password values in the report or evidence!
        if parsed_data.get("has_plaintext_users"):
            is_privileged = parsed_data.get("has_privileged_plaintext_user", False)
            issue_title = (
                "Privileged user account uses a weak/plaintext password"
                if is_privileged
                else "Weak or plaintext user credentials detected"
            )
            pt_accounts = evidence_details.get("plaintext_accounts", [])
            if pt_accounts:
                summary_lines = [f"Line {a['line_num']}: username {a['user']} (privilege {a['privilege']}) password [PROTECTED]" for a in pt_accounts]
                accounts_summary = ", ".join(summary_lines)
            else:
                accounts_list = parsed_data.get("plaintext_account_names", [])
                accounts_summary = ", ".join(accounts_list) if accounts_list else "Configured local accounts"

            findings.append({
                "rule_id": "CISCO-AUTH-001",
                "title": issue_title,
                "issue": issue_title,
                "severity": "High",
                "category": "Authentication Security",
                "description": "User accounts configured with plaintext passwords or weak reversible encryption (type 0/7) expose credentials to unauthorized disclosure. Privileged accounts (privilege 15) must enforce strong cryptographic protection.",
                "evidence": f"Accounts configured with plaintext/weak password: {accounts_summary}",
                "remediation": "Use securely hashed/secret-protected credentials and enforce strong password policies."
            })

        # 5. Weak Enable Password (High)
        # SECURITY: NEVER expose "cisco123" or plain enable password in findings or evidence!
        if parsed_data.get("has_weak_enable_password"):
            en_info = evidence_details.get("enable_password")
            ev_str = f"Line {en_info['line_num']}: enable password [PROTECTED]" if en_info else "enable password [PROTECTED]"
            findings.append({
                "rule_id": "CISCO-AUTH-002",
                "title": "Weak enable password detected",
                "issue": "Weak enable password detected",
                "severity": "High",
                "category": "Privilege Management",
                "description": "The legacy 'enable password' command uses weak reversible encryption instead of salted irreversible hashes like 'enable secret'.",
                "evidence": ev_str,
                "remediation": "Replace the weak enable password with a stronger protected credential ('enable secret') and remove the legacy directive ('no enable password')."
            })

        # 6. SNMP Default / Public Community (High)
        # SECURITY: NEVER expose community secret strings in findings or evidence!
        if parsed_data.get("snmp_public"):
            snmp_info = evidence_details.get("snmp_public")
            ev_str = f"Line {snmp_info['line_num']}: snmp-server community [REDACTED_PUBLIC] RO" if snmp_info else "snmp-server community [REDACTED_PUBLIC] RO"
            findings.append({
                "rule_id": "CISCO-SNMP-001",
                "title": "SNMP is using the default/public community string",
                "issue": "SNMP is using the default/public community string",
                "severity": "High",
                "category": "Network Management Protocols",
                "description": "The default public SNMP community string allows unauthorized network reconnaissance and device information disclosure.",
                "evidence": ev_str,
                "remediation": "Replace the public community string with a unique protected value or migrate to SNMPv3."
            })

        # 7. HTTP Management Enabled (High)
        if parsed_data.get("http_enabled"):
            http_info = evidence_details.get("http")
            ev_str = f"Line {http_info['line_num']}: {http_info['line']}" if http_info else "ip http server"
            findings.append({
                "rule_id": "CISCO-WEB-001",
                "title": "HTTP management is enabled",
                "issue": "HTTP management is enabled",
                "severity": "High",
                "category": "Management Services",
                "description": "Unencrypted HTTP management exposes administrator credentials and session data to eavesdropping and interception across the network.",
                "evidence": ev_str,
                "remediation": "Disable insecure HTTP management ('no ip http server') and enforce HTTPS ('ip http secure-server')."
            })

        # 8. AAA Not Configured (High)
        if not parsed_data.get("aaa_configured"):
            aaa_info = evidence_details.get("aaa")
            if aaa_info and aaa_info.get("state") == "disabled":
                ev_str = f"Line {aaa_info['line_num']}: {aaa_info['line']} (Explicitly disabled)"
            else:
                ev_str = "Explicit control absent: 'aaa new-model' is not present in configuration"
            findings.append({
                "rule_id": "CISCO-AAA-001",
                "title": "AAA authentication may not be configured",
                "issue": "AAA authentication may not be configured",
                "severity": "High",
                "category": "Identity & Access Control",
                "description": "AAA provides centralized authentication, authorization and accounting for network access.",
                "evidence": ev_str,
                "remediation": "Configure AAA using an appropriate authentication service ('aaa new-model')."
            })

        # 9. Weak Password Policy (High)
        if parsed_data.get("weak_password_policy"):
            min_len = parsed_data.get("password_min_length")
            pwd_info = evidence_details.get("password_min_length")
            if pwd_info:
                evidence_str = f"Line {pwd_info['line_num']}: security passwords min-length {min_len} (minimum recommended is 10 or greater)"
            elif min_len is not None:
                evidence_str = f"security passwords min-length {min_len} (minimum recommended is 10 or greater)"
            else:
                evidence_str = "Explicit control absent: No minimum password length policy configured ('security passwords min-length')"

            findings.append({
                "rule_id": "CISCO-PWD-001",
                "title": "Weak password policy detected",
                "issue": "Weak password policy detected",
                "severity": "High",
                "category": "Password Security",
                "description": "Weak password policies or minimum length requirements below 10 characters increase the risk of credential compromise via brute-force attacks.",
                "evidence": evidence_str,
                "remediation": "Enforce strong passwords and appropriate password security policies ('security passwords min-length 10')."
            })

        # 10. Login Protection Not Configured (Medium)
        if not parsed_data.get("login_protection"):
            findings.append({
                "rule_id": "CISCO-LOGIN-001",
                "title": "Login protection may not be configured",
                "issue": "Login protection may not be configured",
                "severity": "Medium",
                "category": "Brute-Force Mitigation",
                "description": "Login protection can help reduce automated password-guessing attacks.",
                "evidence": "Explicit control absent: 'login block-for' / 'login quiet-mode' is not configured",
                "remediation": "Configure login attempt limits, lockout or equivalent protection ('login block-for 180 attempts 3 within 60')."
            })

        # 11. Logging Issue / Console Logging Disabled (Medium)
        if parsed_data.get("logging_console_disabled") and not parsed_data.get("centralized_logging_configured"):
            log_info = evidence_details.get("logging_console")
            prefix = f"Line {log_info['line_num']}: " if log_info else ""
            findings.append({
                "rule_id": "CISCO-LOG-001",
                "title": "Console logging is disabled or centralized logging configuration should be verified",
                "issue": "Console logging is disabled or centralized logging configuration should be verified",
                "severity": "Medium",
                "category": "Audit & Logging",
                "description": "Console logging is explicitly disabled ('no logging console') and centralized remote logging (syslog host) was not detected, limiting audit visibility and incident investigation.",
                "evidence": f"{prefix}no logging console (no remote syslog host configured)",
                "remediation": "Configure centralized system logging and monitor security events ('logging host <ip>')."
            })
        elif not parsed_data.get("logging_configured"):
            findings.append({
                "rule_id": "CISCO-LOG-001",
                "title": "Logging may not be configured",
                "issue": "Logging may not be configured",
                "severity": "Medium",
                "category": "Audit & Logging",
                "description": "Without proper logging, security events may be difficult to monitor and investigate.",
                "evidence": "Explicit control absent: No centralized syslog server or logging buffer configured",
                "remediation": "Configure centralized system logging and monitor security events."
            })

        # 12. Overly Permissive ACL (High)
        if parsed_data.get("overly_permissive_acl"):
            acl_details = evidence_details.get("acl", [])
            if acl_details:
                acl_evidence = ", ".join(f"Line {a['line_num']}: {a['line']}" for a in acl_details)
            else:
                acl_list = parsed_data.get("permissive_acl_rules", [])
                acl_evidence = ", ".join(acl_list) if acl_list else "access-list 10 permit any"

            findings.append({
                "rule_id": "CISCO-ACL-001",
                "title": "Overly permissive access-control rule detected",
                "issue": "Overly permissive access-control rule detected",
                "severity": "High",
                "category": "Firewall & Access Filtering",
                "description": "Permitting any source or destination traffic without specific IP or port restrictions creates an overly broad attack surface and bypasses network segmentation.",
                "evidence": acl_evidence,
                "remediation": "Restrict access-list rules to specific authorized hosts, subnets, and required service ports."
            })

    # =========================================================================
    # MULTI-VENDOR / DEFAULT RULES (Juniper, Fortinet, Palo Alto, Huawei)
    # =========================================================================
    else:
        # Rule 1: Telnet
        if parsed_data.get("telnet_enabled"):
            findings.append({
                "rule_id": "NET-001",
                "title": "Telnet is enabled",
                "issue": "Telnet is enabled",
                "severity": "High",
                "category": "Remote Access",
                "description": "Telnet is an insecure remote management protocol.",
                "evidence": "Telnet service is enabled in device configuration",
                "remediation": "Disable Telnet and use SSH for secure remote access."
            })

        # Rule 2: Insecure SSH protocol version (v1)
        if parsed_data.get("ssh_v1_enabled"):
            findings.append({
                "rule_id": "NET-003",
                "title": "Insecure SSH protocol version 1 is enabled",
                "issue": "Insecure SSH protocol version 1 is enabled",
                "severity": "High",
                "category": "Cryptographic Protocols",
                "description": "SSH version 1 has known cryptographic weaknesses and is vulnerable to traffic decryption and man-in-the-middle attacks.",
                "evidence": "SSH protocol version 1 enabled",
                "remediation": "Configure SSH to enforce protocol version 2 ('set system services ssh protocol-version v2')."
            })
        # Rule 3: SSH not configured (Mutually exclusive with SSH v1 enabled)
        elif parsed_data.get("ssh_enabled") is False:
            findings.append({
                "rule_id": "NET-002",
                "title": "SSH is not configured",
                "issue": "SSH is not configured",
                "severity": "High",
                "category": "Remote Access",
                "description": "Secure remote administration should use an encrypted management protocol.",
                "evidence": "SSH service is absent or disabled",
                "remediation": "Enable SSH and disable insecure remote management protocols."
            })

        # Rule 4: Logging
        if not parsed_data.get("logging_configured"):
            findings.append({
                "rule_id": "LOG-001",
                "title": "Logging may not be configured",
                "issue": "Logging may not be configured",
                "severity": "Medium",
                "category": "Audit & Logging",
                "description": "Without proper logging, security events may be difficult to monitor and investigate.",
                "evidence": "Centralized syslog or logging is not configured",
                "remediation": "Configure centralized system logging and monitor security events."
            })

        # Rule 5: SNMP public community
        if parsed_data.get("snmp_public"):
            findings.append({
                "rule_id": "SNMP-001",
                "title": "SNMP is using the public community string",
                "issue": "SNMP is using the public community string",
                "severity": "High",
                "category": "Management Protocols",
                "description": "The default public SNMP community string can allow unauthorized information access.",
                "evidence": "SNMP public community string configured",
                "remediation": "Replace the public community string with a strong, unique value or use SNMPv3."
            })

        # Rule 6: HTTP management
        if parsed_data.get("http_enabled"):
            findings.append({
                "rule_id": "WEB-001",
                "title": "HTTP management is enabled",
                "issue": "HTTP management is enabled",
                "severity": "High",
                "category": "Management Services",
                "description": "HTTP does not provide encrypted communication for management traffic.",
                "evidence": "Unencrypted HTTP web management is enabled",
                "remediation": "Disable HTTP management and use HTTPS instead."
            })

        # Rule 7: NTP
        if parsed_data.get("ntp_configured") is False:
            findings.append({
                "rule_id": "TIME-001",
                "title": "NTP may not be configured",
                "issue": "NTP may not be configured",
                "severity": "Medium",
                "category": "Time Synchronization",
                "description": "Accurate time synchronization is important for reliable security logs and incident investigation.",
                "evidence": "No NTP server or peer configured",
                "remediation": "Configure a trusted NTP server."
            })

        # Rule 8: AAA
        if parsed_data.get("aaa_configured") is False:
            findings.append({
                "rule_id": "AUTH-001",
                "title": "AAA authentication may not be configured",
                "issue": "AAA authentication may not be configured",
                "severity": "High",
                "category": "Authentication",
                "description": "AAA provides centralized authentication, authorization and accounting for network access.",
                "evidence": "Centralized AAA authentication order or server not configured",
                "remediation": "Configure AAA using an appropriate authentication service."
            })

        # Rule 9: Password policy
        if parsed_data.get("weak_password_policy"):
            findings.append({
                "rule_id": "AUTH-002",
                "title": "Weak password policy detected",
                "issue": "Weak password policy detected",
                "severity": "High",
                "category": "Password Security",
                "description": "Weak password policies can increase the risk of unauthorized access.",
                "evidence": "Plaintext password, weak password, or weak minimum length detected",
                "remediation": "Enforce strong passwords and appropriate password security policies."
            })

        # Rule 10: Unnecessary service
        if parsed_data.get("unnecessary_services"):
            findings.append({
                "rule_id": "SVC-001",
                "title": "Potentially unnecessary network services are enabled",
                "issue": "Potentially unnecessary network services are enabled",
                "severity": "Medium",
                "category": "Attack Surface Reduction",
                "description": "Unused services increase the device attack surface.",
                "evidence": "Insecure or legacy services enabled",
                "remediation": "Disable services that are not required for device operation."
            })

        # Rule 11: Login protection
        if parsed_data.get("login_protection") is False:
            findings.append({
                "rule_id": "AUTH-003",
                "title": "Login protection may not be configured",
                "issue": "Login protection may not be configured",
                "severity": "Medium",
                "category": "Brute-Force Protection",
                "description": "Login protection can help reduce automated password-guessing attacks.",
                "evidence": "Login retry lockout or delay options not configured",
                "remediation": "Configure login attempt limits, lockout or equivalent protection."
            })

        # Rule 12: SSH direct root login permitted (Junos)
        if parsed_data.get("ssh_root_login_allowed"):
            findings.append({
                "rule_id": "AUTH-004",
                "title": "Direct root login over SSH is permitted",
                "issue": "Direct root login over SSH is permitted",
                "severity": "Medium",
                "category": "Privileged Access",
                "description": "Allowing root login over SSH increases the risk of brute-force attacks targeting the administrative account.",
                "evidence": "root-login allow configured under SSH services",
                "remediation": "Disallow direct root login over SSH ('set system services ssh root-login deny')."
            })

    for f in findings:
        r_id = f.get("rule_id", "")
        if "frameworks" not in f:
            f["frameworks"] = RULE_FRAMEWORK_MAPPINGS.get(r_id, ["CIS Benchmark", "NIST SP 800-53"])
    return findings