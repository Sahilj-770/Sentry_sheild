from typing import Dict, Any
from .base import BaseVendorParser

class AristaParser(BaseVendorParser):
    """
    Arista EOS Configuration Parser.
    EOS syntax is standard CLI based on industry norms with EOS management directives.
    """
    vendor_name = "Arista"

    def parse(self, configuration: str) -> Dict[str, Any]:
        data = self.create_normalized_data(self.vendor_name)

        weak_passwords = {"admin", "arista", "password", "12345", "123456", "admin123"}
        lines = [l.strip() for l in configuration.splitlines() if l.strip() and not l.strip().startswith("!")]

        for line in lines:
            line_l = line.lower()
            tokens = line_l.split()
            raw_tokens = line.split()

            if tokens[0] == "hostname" and len(raw_tokens) > 1:
                data["hostname"] = raw_tokens[1]

            if tokens[:2] == ["transport", "input"]:
                if "telnet" in tokens:
                    data["telnet_enabled"] = True
                if "ssh" in tokens:
                    data["ssh_enabled"] = True
                    data["ssh_configured"] = True

            if tokens[:2] == ["management", "ssh"] or tokens[:2] == ["ip", "ssh"]:
                data["ssh_configured"] = True
                if "version 1" in line_l:
                    data["ssh_v1_enabled"] = True
                    data["ssh_enabled"] = False
                elif "version 2" in line_l:
                    data["ssh_v1_enabled"] = False
                    data["ssh_enabled"] = True

            if tokens[:3] == ["management", "api", "http-commands"]:
                if "no shutdown" in configuration.lower():
                    data["http_enabled"] = True

            if tokens[:2] == ["logging", "host"] or tokens[:2] == ["logging", "server"]:
                data["logging_configured"] = True
                data["centralized_logging_configured"] = True
            elif tokens[0] == "logging" and "on" in tokens:
                data["logging_configured"] = True

            if tokens[0] == "ntp" and "server" in tokens:
                data["ntp_configured"] = True

            if tokens[0] == "snmp-server" and "community" in tokens:
                if any(c in tokens for c in ["public", "private"]):
                    data["snmp_public"] = True

            if tokens[:2] == ["aaa", "root"]:
                if tokens[:3] == ["no", "aaa", "root"]:
                    data["aaa_configured"] = True
            elif tokens[:2] == ["aaa", "authentication"]:
                data["aaa_configured"] = True

            if tokens[0] == "username":
                user_name = raw_tokens[1] if len(raw_tokens) > 1 else "user"
                if "password" in tokens and "secret" not in tokens:
                    data["has_plaintext_users"] = True
                    data["plaintext_account_names"].append(f"{user_name} (EOS user)")
                elif any(w in tokens for w in weak_passwords):
                    data["has_plaintext_users"] = True
                    data["plaintext_account_names"].append(f"{user_name} (weak user)")

            if tokens[0] == "access-list" and "permit" in tokens and "any" in tokens:
                data["overly_permissive_acl"] = True
                data["permissive_acl_rules"].append(line)

        return data
