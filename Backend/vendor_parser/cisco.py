from typing import Dict, Any
from .base import BaseVendorParser

class CiscoParser(BaseVendorParser):
    vendor_name = "Cisco"

    def parse(self, configuration: str) -> Dict[str, Any]:
        data = self.create_normalized_data(self.vendor_name)

        indexed_lines = []
        for line_no, raw_line in enumerate(configuration.splitlines(), start=1):
            line = raw_line.strip()
            if not line or line.startswith("!"):
                continue
            indexed_lines.append((line_no, line))

        weak_passwords = {
            "12345", "123456", "1234", "cisco", "admin", "password",
            "test", "cisco123", "admin123", "pass"
        }
        other_unnecessary = False

        for line_no, line in indexed_lines:
            line_l = line.lower()
            tokens = line_l.split()
            raw_tokens = line.split()
            if not tokens:
                continue

            # Hostname
            if tokens[0] == "hostname" and len(raw_tokens) > 1:
                data["hostname"] = raw_tokens[1]

            # AAA
            if tokens[:2] == ["aaa", "new-model"]:
                data["aaa_configured"] = True
                data["evidence_details"]["aaa"] = {
                    "state": "configured",
                    "line_num": line_no,
                    "line": line
                }
            elif tokens[:3] == ["no", "aaa", "new-model"]:
                data["aaa_configured"] = False
                data["evidence_details"]["aaa"] = {
                    "state": "disabled",
                    "line_num": line_no,
                    "line": line
                }

            # HTTP Management
            if tokens[:3] == ["ip", "http", "server"]:
                data["http_enabled"] = True
                data["evidence_details"]["http"] = {
                    "state": "configured",
                    "line_num": line_no,
                    "line": line
                }
            elif tokens[:4] == ["no", "ip", "http", "server"]:
                data["http_enabled"] = False
                data["evidence_details"]["http"] = {
                    "state": "disabled",
                    "line_num": line_no,
                    "line": line
                }

            # Logging Console
            if tokens[:3] == ["no", "logging", "console"]:
                data["logging_console_disabled"] = True
                data["evidence_details"]["logging_console"] = {
                    "state": "disabled",
                    "line_num": line_no,
                    "line": line
                }
            elif tokens[:2] == ["no", "logging"] and "on" in tokens:
                data["logging_configured"] = False
                data["centralized_logging_configured"] = False
                data["evidence_details"]["logging_global"] = {
                    "state": "disabled",
                    "line_num": line_no,
                    "line": line
                }

            # Centralized Remote Syslog / Host Logging
            if tokens[:2] == ["logging", "host"] or (tokens[0] == "logging" and len(tokens) > 1 and tokens[1] not in ["console", "buffered", "trap", "monitor", "on"]):
                data["centralized_logging_configured"] = True
                data["logging_configured"] = True
                data["evidence_details"]["logging_host"] = {
                    "state": "configured",
                    "line_num": line_no,
                    "line": line
                }
            elif tokens[:2] == ["logging", "on"] or tokens[:2] == ["logging", "buffered"] or tokens[:2] == ["logging", "trap"]:
                data["logging_configured"] = True

            # NTP
            if tokens[0] == "ntp" and "server" in tokens:
                data["ntp_configured"] = True
                data["evidence_details"]["ntp"] = {
                    "state": "configured",
                    "line_num": line_no,
                    "line": line
                }

            # SSH Configuration & Version
            if tokens[:3] == ["ip", "ssh", "version"]:
                data["ssh_configured"] = True
                if len(tokens) > 3:
                    if tokens[3] == "1":
                        data["ssh_v1_enabled"] = True
                        data["ssh_enabled"] = False
                        data["evidence_details"]["ssh_v1"] = {
                            "state": "configured",
                            "line_num": line_no,
                            "line": line
                        }
                    elif tokens[3] == "2":
                        data["ssh_v1_enabled"] = False
                        data["ssh_enabled"] = True
                        data["evidence_details"]["ssh_v2"] = {
                            "state": "configured",
                            "line_num": line_no,
                            "line": line
                        }
            elif tokens[:2] == ["ip", "ssh"]:
                data["ssh_configured"] = True

            # Crypto RSA Key Length
            if "crypto" in tokens and "key" in tokens and "rsa" in tokens:
                for i, tok in enumerate(tokens):
                    if tok == "modulus" and i + 1 < len(tokens):
                        try:
                            modulus = int(tokens[i + 1])
                            data["rsa_key_modulus"] = modulus
                            if modulus < 2048:
                                data["weak_rsa_key"] = True
                                data["evidence_details"]["weak_rsa_key"] = {
                                    "state": "configured",
                                    "line_num": line_no,
                                    "line": line,
                                    "modulus": modulus
                                }
                        except ValueError:
                            pass

            # Passwords & Accounts (NEVER record raw plaintext secret in evidence)
            if tokens[0] == "username":
                user_name = raw_tokens[1] if len(raw_tokens) > 1 else "user"
                priv_level = 1
                if "privilege" in tokens:
                    try:
                        p_idx = tokens.index("privilege")
                        if p_idx + 1 < len(tokens):
                            priv_level = int(tokens[p_idx + 1])
                    except (ValueError, IndexError):
                        pass

                has_weak_token = any(weak in tokens for weak in weak_passwords)
                is_plaintext_type0 = ("password" in tokens and "secret" not in tokens and "0" in tokens)
                is_untyped_password = ("password" in tokens and "secret" not in tokens)

                if has_weak_token or is_plaintext_type0 or is_untyped_password:
                    data["has_plaintext_users"] = True
                    acct_desc = f"{user_name} (privilege {priv_level})"
                    if acct_desc not in data["plaintext_account_names"]:
                        data["plaintext_account_names"].append(acct_desc)
                    if priv_level >= 15:
                        data["has_privileged_plaintext_user"] = True

                    if "plaintext_accounts" not in data["evidence_details"]:
                        data["evidence_details"]["plaintext_accounts"] = []
                    data["evidence_details"]["plaintext_accounts"].append({
                        "line_num": line_no,
                        "user": user_name,
                        "privilege": priv_level,
                        "line": f"username {user_name} privilege {priv_level} password [PROTECTED]"
                    })

            # Enable Password / Secret
            # Fix order-dependence: enable password is weak and stored in NVRAM even if enable secret also exists.
            if tokens[:2] == ["enable", "password"]:
                data["has_weak_enable_password"] = True
                data["evidence_details"]["enable_password"] = {
                    "state": "configured",
                    "line_num": line_no,
                    "line": "enable password [PROTECTED]"
                }
            elif tokens[:3] == ["no", "enable", "password"]:
                data["has_weak_enable_password"] = False
            elif tokens[:2] == ["enable", "secret"]:
                data["evidence_details"]["enable_secret"] = {
                    "state": "configured",
                    "line_num": line_no,
                    "line": "enable secret [PROTECTED]"
                }

            # Password Policies
            if tokens[:3] == ["security", "passwords", "min-length"]:
                try:
                    min_len = int(tokens[3])
                    data["password_min_length"] = min_len
                    if min_len < 10:
                        data["weak_password_policy"] = True
                    else:
                        data["weak_password_policy"] = False
                    data["evidence_details"]["password_min_length"] = {
                        "state": "configured",
                        "line_num": line_no,
                        "line": line,
                        "min_length": min_len
                    }
                except (ValueError, IndexError):
                    data["weak_password_policy"] = True

            # Login Protection
            if tokens[:2] == ["login", "block-for"] or tokens[:2] == ["login", "quiet-mode"]:
                data["login_protection"] = True
                data["evidence_details"]["login_protection"] = {
                    "state": "configured",
                    "line_num": line_no,
                    "line": line
                }

            # Line VTY Remote Management
            # Include 'all' because transport input all permits Telnet as well as SSH
            if tokens[:2] == ["transport", "input"]:
                if "telnet" in tokens or "all" in tokens:
                    data["telnet_enabled"] = True
                    data["evidence_details"]["telnet"] = {
                        "state": "configured",
                        "line_num": line_no,
                        "line": line
                    }
                if "ssh" in tokens or "all" in tokens:
                    data["ssh_configured"] = True
                    if not data["ssh_v1_enabled"]:
                        data["ssh_enabled"] = True

            # SNMP Community (Redact community string in evidence)
            if tokens[0] == "snmp-server" and "community" in tokens:
                is_rw = "rw" in tokens or "write" in tokens
                if is_rw:
                    data["snmp_rw"] = True
                    data["evidence_details"]["snmp_rw"] = {
                        "state": "configured",
                        "line_num": line_no,
                        "line": "snmp-server community [REDACTED_SECRET] RW"
                    }
                if "public" in tokens or ("private" in tokens and not is_rw):
                    data["snmp_public"] = True
                    data["evidence_details"]["snmp_public"] = {
                        "state": "configured",
                        "line_num": line_no,
                        "line": "snmp-server community [REDACTED_PUBLIC] RO"
                    }

            # Access Control Lists (ACL)
            # Catch permit any, permit ip any any, permit tcp any any, permit udp any any
            if tokens[0] == "access-list" and len(tokens) > 2:
                rest_tokens = tokens[2:]
                is_permissive = (
                    rest_tokens == ["permit", "any"]
                    or (
                        len(rest_tokens) >= 3
                        and rest_tokens[:3] == ["permit", "ip", "any"]
                        and (len(rest_tokens) == 3 or rest_tokens[3] == "any")
                    )
                    or (
                        len(rest_tokens) >= 4
                        and rest_tokens[0] == "permit"
                        and rest_tokens[1] in ["ip", "tcp", "udp"]
                        and rest_tokens[2] == "any"
                        and rest_tokens[3] == "any"
                    )
                )
                if is_permissive:
                    data["overly_permissive_acl"] = True
                    data["permissive_acl_rules"].append(line)
                    if "acl" not in data["evidence_details"]:
                        data["evidence_details"]["acl"] = []
                    data["evidence_details"]["acl"].append({
                        "line_num": line_no,
                        "line": line
                    })
            elif tokens[0] == "permit" and "any" in tokens:
                is_permissive = (
                    tokens == ["permit", "any"]
                    or tokens[:4] == ["permit", "ip", "any", "any"]
                    or (
                        len(tokens) >= 4
                        and tokens[0] == "permit"
                        and tokens[1] in ["ip", "tcp", "udp"]
                        and tokens[2] == "any"
                        and tokens[3] == "any"
                    )
                )
                if is_permissive:
                    data["overly_permissive_acl"] = True
                    data["permissive_acl_rules"].append(line)
                    if "acl" not in data["evidence_details"]:
                        data["evidence_details"]["acl"] = []
                    data["evidence_details"]["acl"].append({
                        "line_num": line_no,
                        "line": line
                    })

            # Unnecessary Services
            if tokens[0] != "no":
                if (
                    tokens[:2] == ["service", "tcp-small-servers"]
                    or tokens[:2] == ["service", "udp-small-servers"]
                    or tokens[:3] == ["ip", "bootp", "server"]
                    or tokens[:1] == ["bootp-server"]
                    or tokens[:2] == ["ip", "finger"]
                    or tokens[:2] == ["service", "finger"]
                    or tokens[:3] == ["ip", "dns", "server"]
                    or tokens[:2] == ["ip", "source-route"]
                ):
                    other_unnecessary = True

        if data.get("password_min_length") is None and not data.get("weak_password_policy"):
            data["weak_password_policy"] = True

        data["unnecessary_services"] = other_unnecessary or data["http_enabled"]
        return data
