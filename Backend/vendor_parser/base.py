from abc import ABC, abstractmethod
from typing import Dict, Any

class BaseVendorParser(ABC):
    """
    Abstract base class for vendor-specific configuration parsers.
    Standardizes raw vendor configurations into a normalized schema.
    """
    vendor_name: str = "Generic"

    @classmethod
    def create_normalized_data(cls, vendor: str) -> Dict[str, Any]:
        """
        Returns the standard normalized dictionary schema.
        """
        return {
            "vendor": vendor,
            "hostname": None,

            # Line-level audit evidence tracking (rule/check -> metadata with line numbers)
            "evidence_details": {},

            # Remote access
            "telnet_enabled": False,
            "ssh_enabled": False,
            "http_enabled": False,

            # Logging and time
            "logging_configured": False,
            "logging_console_disabled": False,
            "centralized_logging_configured": False,
            "ntp_configured": False,

            # Security protocols
            "snmp_public": False,
            "snmp_rw": False,

            # Authentication
            "aaa_configured": False,
            "weak_password_policy": False,
            "password_min_length": None,
            "login_protection": False,

            # Credential security (NEVER store actual passwords)
            "has_plaintext_users": False,
            "plaintext_account_names": [],
            "has_privileged_plaintext_user": False,
            "has_weak_enable_password": False,

            # Cryptography & SSH details
            "ssh_configured": False,
            "ssh_v1_enabled": False,
            "rsa_key_modulus": None,
            "weak_rsa_key": False,

            # Access control lists
            "overly_permissive_acl": False,
            "permissive_acl_rules": [],

            # Services
            "unnecessary_services": False,

            # Management checks
            "ssh_root_login_allowed": False
        }

    @abstractmethod
    def parse(self, configuration: str) -> Dict[str, Any]:
        """
        Parses the raw vendor configuration and returns normalized data.
        """
        pass
