from typing import Dict, Any
from .base import BaseVendorParser

class JuniperParser(BaseVendorParser):
    vendor_name = "Juniper"

    def parse(self, configuration: str) -> Dict[str, Any]:
        data = self.create_normalized_data(self.vendor_name)

        weak_passwords = {
            "12345", "123456", "1234", "juniper", "admin", "password",
            "root", "test", "juniper123", "admin123", "pass", "cisco"
        }
        other_unnecessary = False

        for raw_line in configuration.splitlines():
            line = raw_line.strip()
            if not line or line.startswith("#") or line.startswith("/*") or line.endswith("*/"):
                continue

            line_l = line.lower()
            tokens = line_l.split()
            raw_tokens = line.split()

            if tokens[0] == "set":
                if "host-name" in tokens:
                    idx = tokens.index("host-name")
                    if idx + 1 < len(raw_tokens):
                        data["hostname"] = raw_tokens[idx + 1].strip(";")

                if "services" in tokens:
                    if "telnet" in tokens:
                        data["telnet_enabled"] = True
                    if "ssh" in tokens:
                        data["ssh_enabled"] = True
                        data["ssh_configured"] = True
                        if "protocol-version" in tokens and "v1" in tokens:
                            data["ssh_v1_enabled"] = True
                            data["ssh_enabled"] = False
                        if "root-login" in tokens and "allow" in tokens:
                            data["ssh_root_login_allowed"] = True
                    if "web-management" in tokens and "http" in tokens and "https" not in tokens:
                        data["http_enabled"] = True
                    if any(t in tokens for t in ["finger", "rlogin", "rsh", "tftp"]):
                        other_unnecessary = True

                if "syslog" in tokens or "logging" in tokens:
                    data["logging_configured"] = True
                    if "host" in tokens:
                        data["centralized_logging_configured"] = True

                if "ntp" in tokens and "server" in tokens:
                    data["ntp_configured"] = True

                if "snmp" in tokens and "community" in tokens:
                    if any(c in tokens for c in ["public", "private"]):
                        data["snmp_public"] = True

                if "authentication-order" in tokens:
                    if any(a in tokens for a in ["radius", "tacplus", "password"]):
                        data["aaa_configured"] = True

                if "login" in tokens and "user" in tokens:
                    user_name = "junos_user"
                    try:
                        u_idx = tokens.index("user")
                        if u_idx + 1 < len(raw_tokens):
                            user_name = raw_tokens[u_idx + 1].strip(";")
                    except (ValueError, IndexError):
                        pass

                    if "plain-text-password" in tokens or any(w in tokens for w in weak_passwords):
                        data["has_plaintext_users"] = True
                        desc = f"{user_name} (local user)"
                        if desc not in data["plaintext_account_names"]:
                            data["plaintext_account_names"].append(desc)

                if "firewall" in tokens and "then" in tokens and "accept" in tokens:
                    if "from" not in tokens or ("source-address" not in tokens and "destination-address" not in tokens):
                        data["overly_permissive_acl"] = True
                        data["permissive_acl_rules"].append(line)

        data["unnecessary_services"] = other_unnecessary or data["http_enabled"]
        return data
