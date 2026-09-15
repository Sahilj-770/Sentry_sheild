from typing import Dict, Any
from .base import BaseVendorParser

class PaloAltoParser(BaseVendorParser):
    vendor_name = "Palo Alto"

    def parse(self, configuration: str) -> Dict[str, Any]:
        data = self.create_normalized_data(self.vendor_name)

        lines = [l.strip() for l in configuration.splitlines() if l.strip()]
        for line in lines:
            line_l = line.lower()
            tokens = line_l.split()
            raw_tokens = line.split()

            if "hostname" in tokens:
                idx = tokens.index("hostname")
                if idx + 1 < len(raw_tokens):
                    data["hostname"] = raw_tokens[idx + 1]

            if "telnet" in tokens and ("service" in tokens or "enable" in tokens or "yes" in tokens):
                data["telnet_enabled"] = True
            if "ssh" in tokens and ("service" in tokens or "enable" in tokens or "yes" in tokens):
                data["ssh_enabled"] = True
                data["ssh_configured"] = True
            if "http" in tokens and "https" not in tokens:
                data["http_enabled"] = True

            if "syslog" in line_l or "logging" in line_l:
                data["logging_configured"] = True
                data["centralized_logging_configured"] = True

            if "ntp" in tokens or "ntp-servers" in tokens:
                data["ntp_configured"] = True

            if "snmp" in line_l and ("public" in line_l or "private" in line_l):
                data["snmp_public"] = True

            if "action allow" in line_l and ("source any" in line_l or "destination any" in line_l):
                data["overly_permissive_acl"] = True
                data["permissive_acl_rules"].append(line)

        return data
