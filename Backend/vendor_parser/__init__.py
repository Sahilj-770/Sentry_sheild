from typing import Dict, Any, Optional
from .base import BaseVendorParser
from .cisco import CiscoParser
from .juniper import JuniperParser
from .fortinet import FortinetParser
from .paloalto import PaloAltoParser
from .huawei import HuaweiParser
from .arista import AristaParser
from .pfsense import PfSenseParser

_PARSER_REGISTRY: Dict[str, BaseVendorParser] = {
    "cisco": CiscoParser(),
    "juniper": JuniperParser(),
    "fortinet": FortinetParser(),
    "palo alto": PaloAltoParser(),
    "paloalto": PaloAltoParser(),
    "huawei": HuaweiParser(),
    "arista": AristaParser(),
    "pfsense": PfSenseParser()
}

def get_vendor_parser(vendor: str) -> Optional[BaseVendorParser]:
    """
    Returns the parser instance registered for the specified vendor.
    """
    if not vendor:
        return None
    normalized_key = vendor.lower().strip()
    return _PARSER_REGISTRY.get(normalized_key)

def register_vendor_parser(vendor: str, parser: BaseVendorParser) -> None:
    """
    Extensible interface: register custom vendor parser dynamically.
    """
    _PARSER_REGISTRY[vendor.lower().strip()] = parser

def parse_configuration(configuration: str, vendor: str) -> Dict[str, Any]:
    """
    Unified entrypoint for parsing raw network configuration into
    a normalized security-related representation.
    """
    parser = get_vendor_parser(vendor)
    if parser:
        return parser.parse(configuration)

    # Fallback to Cisco if unknown
    fallback = _PARSER_REGISTRY["cisco"]
    res = fallback.parse(configuration)
    res["vendor"] = vendor
    return res
