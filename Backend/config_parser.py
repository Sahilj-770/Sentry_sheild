"""
Sentry Network Security Configuration Parser.
Dispatches to modular vendor parsers (Cisco, Juniper, Fortinet, Palo Alto, Huawei, Arista, pfSense)
and returns a normalized security posture dictionary.
"""
from vendor_parser import (
    parse_configuration as _parse_config,
    get_vendor_parser,
    register_vendor_parser,
    BaseVendorParser
)

def parse_configuration(configuration: str, vendor: str):
    """
    Converts raw network configuration into
    standardized security-related information.
    Delegates to modular vendor parser architecture.
    """
    return _parse_config(configuration, vendor)
