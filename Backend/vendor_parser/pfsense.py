import re
from typing import Dict, Any
from .base import BaseVendorParser

class PfSenseParser(BaseVendorParser):
    """
    pfSense Firewall & Router Configuration Parser.
    Handles XML export syntax and standard pfSense configuration blocks.
    """
    vendor_name = "pfSense"

    def parse(self, configuration: str) -> Dict[str, Any]:
        data = self.create_normalized_data(self.vendor_name)

        config_l = configuration.lower()

        # Hostname extraction from XML <hostname> or CLI
        host_match = re.search(r"<hostname>([^<]+)</hostname>", configuration, re.IGNORECASE)
        if host_match:
            data["hostname"] = host_match.group(1).strip()
        else:
            host_cli = re.search(r"hostname\s+([^\s;]+)", configuration, re.IGNORECASE)
            if host_cli:
                data["hostname"] = host_cli.group(1).strip()

        # WebGUI / HTTP
        if "<protocol>http</protocol>" in config_l or "webgui protocol http" in config_l:
            data["http_enabled"] = True
        elif "<protocol>https</protocol>" in config_l:
            data["http_enabled"] = False

        # SSH
        if "<sshd>" in config_l or "enable sshd" in config_l or "<enablesshd>" in config_l:
            if "<sshd_key_only>" not in config_l and "<sshd_key_only>disabled</sshd_key_only>" in config_l:
                data["has_plaintext_users"] = True
            data["ssh_enabled"] = True
            data["ssh_configured"] = True

        # Telnet (pfSense does not natively run telnet unless custom pkg installed)
        if "telnet" in config_l and "disable" not in config_l:
            if "<telnet>" in config_l or "telnet server" in config_l:
                data["telnet_enabled"] = True

        # Logging / Syslog
        if "<syslog>" in config_l or "<remotesyslog>" in config_l or "syslogd" in config_l:
            data["logging_configured"] = True
            if "<remoteserver>" in config_l or "remote syslog" in config_l:
                data["centralized_logging_configured"] = True

        # NTP
        if "<ntp>" in config_l or "<timeservers>" in config_l:
            data["ntp_configured"] = True

        # SNMP
        if "<snmpd>" in config_l:
            data["snmp_public"] = ("<rocommunity>public</rocommunity>" in config_l or "community public" in config_l)

        # Permissive Rules (<rule> with <type>pass</type> and <source><any/> and <destination><any/>)
        if "<source><any/>" in config_l and "<destination><any/>" in config_l and "<type>pass" in config_l:
            data["overly_permissive_acl"] = True
            data["permissive_acl_rules"].append("pfSense pass any to any rule")
        elif "pass in quick all" in config_l:
            data["overly_permissive_acl"] = True
            data["permissive_acl_rules"].append("pass in quick all")

        return data
