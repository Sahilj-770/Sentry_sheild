from typing import Dict, Any
from .base import BaseVendorParser

class FortinetParser(BaseVendorParser):
    vendor_name = "Fortinet"

    def parse(self, configuration: str) -> Dict[str, Any]:
        data = self.create_normalized_data(self.vendor_name)

        weak_passwords = {"admin", "password", "fortinet", "123456", "12345"}
        lines = [l.strip() for l in configuration.splitlines() if l.strip() and not l.strip().startswith("#")]

        for line in lines:
            line_l = line.lower()
            tokens = line_l.split()
            raw_tokens = line.split()

            if tokens[:2] == ["set", "hostname"] and len(raw_tokens) > 2:
                data["hostname"] = raw_tokens[2].strip('"')

            if tokens[:2] == ["set", "allowaccess"]:
                if "telnet" in tokens:
                    data["telnet_enabled"] = True
                if "ssh" in tokens:
                    data["ssh_enabled"] = True
                    data["ssh_configured"] = True
                if "http" in tokens and "https" not in tokens:
                    data["http_enabled"] = True

            if "config log" in line_l or "set status enable" in line_l:
                data["logging_configured"] = True
            if "config log syslogd" in line_l:
                data["centralized_logging_configured"] = True

            if "config system ntp" in line_l or tokens[:2] == ["set", "ntpserver"]:
                data["ntp_configured"] = True

            if "config system snmp" in line_l or "community" in tokens:
                if any(c in tokens for c in ["public", "private", 'public"']):
                    data["snmp_public"] = True

            if tokens[:2] == ["set", "password"]:
                if any(w in tokens for w in weak_passwords) or (len(tokens) > 2 and tokens[2].strip('"') in weak_passwords):
                    data["has_plaintext_users"] = True
                    data["plaintext_account_names"].append("admin (FortiOS user)")

            if "action accept" in line_l and ('srcaddr "all"' in line_l or 'dstaddr "all"' in line_l):
                data["overly_permissive_acl"] = True
                data["permissive_acl_rules"].append(line)

        return data
