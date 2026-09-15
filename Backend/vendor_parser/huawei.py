from typing import Dict, Any
from .base import BaseVendorParser

class HuaweiParser(BaseVendorParser):
    vendor_name = "Huawei"

    def parse(self, configuration: str) -> Dict[str, Any]:
        data = self.create_normalized_data(self.vendor_name)

        weak_passwords = {"12345", "123456", "admin", "huawei", "password", "admin123"}
        lines = [l.strip() for l in configuration.splitlines() if l.strip() and not l.strip().startswith("#")]

        for line in lines:
            line_l = line.lower()
            tokens = line_l.split()
            raw_tokens = line.split()

            if tokens[0] == "sysname" and len(raw_tokens) > 1:
                data["hostname"] = raw_tokens[1]

            if tokens[:3] == ["telnet", "server", "enable"] or (tokens[:2] == ["undo", "telnet"] and "disable" in tokens):
                data["telnet_enabled"] = True
            elif tokens[:3] == ["undo", "telnet", "server"]:
                data["telnet_enabled"] = False

            if tokens[:3] == ["stelnet", "server", "enable"] or tokens[:3] == ["ssh", "server", "enable"]:
                data["ssh_enabled"] = True
                data["ssh_configured"] = True

            if tokens[:3] == ["http", "server", "enable"]:
                data["http_enabled"] = True

            if "info-center" in tokens:
                data["logging_configured"] = True
                if "loghost" in tokens:
                    data["centralized_logging_configured"] = True

            if tokens[:2] == ["ntp-service", "unicast-server"]:
                data["ntp_configured"] = True

            if "snmp-agent" in tokens and "community" in tokens:
                if any(c in tokens for c in ["public", "private"]):
                    data["snmp_public"] = True

            if "aaa" in tokens:
                data["aaa_configured"] = True

            if tokens[0] == "local-user":
                user_name = raw_tokens[1] if len(raw_tokens) > 1 else "user"
                if "password" in tokens and "simple" in tokens:
                    data["has_plaintext_users"] = True
                    desc = f"{user_name} (simple password)"
                    if desc not in data["plaintext_account_names"]:
                        data["plaintext_account_names"].append(desc)
                elif any(w in tokens for w in weak_passwords):
                    data["has_plaintext_users"] = True
                    desc = f"{user_name} (weak credential)"
                    if desc not in data["plaintext_account_names"]:
                        data["plaintext_account_names"].append(desc)

            if tokens[0] == "rule" and "permit" in tokens and "source" in tokens and "any" in tokens:
                data["overly_permissive_acl"] = True
                data["permissive_acl_rules"].append(line)

        return data
