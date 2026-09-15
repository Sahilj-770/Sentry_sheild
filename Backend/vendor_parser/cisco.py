from typing import Dict, Any
from .base import BaseVendorParser

class CiscoParser(BaseVendorParser):
    vendor_name = "Cisco"

    def parse(self, configuration: str) -> Dict[str, Any]:
        data = self.create_normalized_data(self.vendor_name)

        configuration_lines = []
        for line in configuration.splitlines():
            line = line.strip()
            if line.startswith("!"):
                continue
            if line:
                configuration_lines.append(line)

        weak_passwords = {
            "12345", "123456", "1234", "cisco", "admin", "password",
            "test", "cisco123", "admin123", "pass"
        }
        other_unnecessary = False

        for line in configuration_lines:
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
            elif tokens[:3] == ["no", "aaa", "new-model"]:
                data["aaa_configured"] = False

            # HTTP Management
            if tokens[:3] == ["ip", "http", "server"]:
                data["http_enabled"] = True
            elif tokens[:4] == ["no", "ip", "http", "server"]:
                data["http_enabled"] = False

            # Logging Console
            if tokens[:3] == ["no", "logging", "console"]:
                data["logging_console_disabled"] = True

            # Centralized Remote Syslog / Host Logging
            if tokens[:2] == ["logging", "host"] or (tokens[0] == "logging" and len(tokens) > 1 and tokens[1] not in ["console", "buffered", "trap", "monitor", "on"]):
                data["centralized_logging_configured"] = True
                data["logging_configured"] = True
            elif tokens[:2] == ["logging", "on"] or tokens[:2] == ["logging", "buffered"] or tokens[:2] == ["logging", "trap"]:
                data["logging_configured"] = True

            # NTP
            if tokens[0] == "ntp" and "server" in tokens:
                data["ntp_configured"] = True

            # SSH Configuration & Version
            if tokens[:3] == ["ip", "ssh", "version"]:
                data["ssh_configured"] = True
                if len(tokens) > 3:
                    if tokens[3] == "1":
                        data["ssh_v1_enabled"] = True
                        data["ssh_enabled"] = False
                    elif tokens[3] == "2":
                        data["ssh_v1_enabled"] = False
                        data["ssh_enabled"] = True
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
                        except ValueError:
                            pass

            # Passwords & Accounts
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

            # Enable Password / Secret
            if tokens[:2] == ["enable", "password"]:
                data["has_weak_enable_password"] = True
            elif tokens[:2] == ["enable", "secret"]:
                data["has_weak_enable_password"] = False

            # Password Policies
            if tokens[:3] == ["security", "passwords", "min-length"]:
                try:
                    min_len = int(tokens[3])
                    data["password_min_length"] = min_len
                    if min_len < 10:
                        data["weak_password_policy"] = True
                    else:
                        data["weak_password_policy"] = False
                except (ValueError, IndexError):
                    data["weak_password_policy"] = True

            # Login Protection
            if tokens[:2] == ["login", "block-for"] or tokens[:2] == ["login", "quiet-mode"]:
                data["login_protection"] = True

            # Line VTY Remote Management
            if tokens[:2] == ["transport", "input"]:
                if "telnet" in tokens:
                    data["telnet_enabled"] = True
                if "ssh" in tokens:
                    data["ssh_configured"] = True
                    if not data["ssh_v1_enabled"]:
                        data["ssh_enabled"] = True

            # SNMP Community
            if tokens[0] == "snmp-server" and "community" in tokens:
                if "public" in tokens or "private" in tokens:
                    data["snmp_public"] = True

            # Access Control Lists (ACL)
            if tokens[0] == "access-list" and len(tokens) > 2:
                rest_tokens = tokens[2:]
                if rest_tokens == ["permit", "any"] or (
                    len(rest_tokens) >= 3
                    and rest_tokens[:3] == ["permit", "ip", "any"]
                    and (len(rest_tokens) == 3 or rest_tokens[3] == "any")
                ):
                    data["overly_permissive_acl"] = True
                    data["permissive_acl_rules"].append(line)
            elif tokens[0] == "permit" and "any" in tokens:
                if tokens == ["permit", "any"] or tokens[:4] == ["permit", "ip", "any", "any"]:
                    data["overly_permissive_acl"] = True
                    data["permissive_acl_rules"].append(line)

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
