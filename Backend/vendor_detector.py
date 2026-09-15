def detect_vendor(configuration):
    configuration = configuration.lower()

    # Cisco
    if (
        "transport input" in configuration
        or "snmp-server" in configuration
        or "line vty" in configuration
        or "enable secret" in configuration
        or "enable password" in configuration
    ):
        return "Cisco"

    # Juniper
    elif any(
        marker in configuration
        for marker in [
            "set system",
            "set interfaces",
            "set security",
            "set protocols",
            "set snmp",
            "set routing-options",
            "set firewall",
            "set vlans",
            "system {",
            "interfaces {",
            "protocols {",
            "## last commit",
            "## last changed",
            "junos",
            "juniper"
        ]
    ):
        return "Juniper"

    # Palo Alto (checked before Fortinet to prevent 'deviceconfig system' substring collision)
    elif any(marker in configuration for marker in ["set deviceconfig", "pan-os", "paloalto", "palo alto"]):
        return "Palo Alto"

    # Fortinet
    elif any(marker in configuration for marker in ["config system ", "config system\n", "config firewall", "fortigate", "fortinet"]):
        return "Fortinet"

    # Arista EOS
    elif any(marker in configuration for marker in ["arista", "boot system flash:", "management api http-commands"]):
        return "Arista"

    # pfSense
    elif any(marker in configuration for marker in ["<pfsense>", "<pfsense", "pfsense", "<webgui>", "<sshd>"]):
        return "pfSense"

    # Huawei
    elif "sysname" in configuration or "huawei" in configuration:
        return "Huawei"

    return "Unknown"