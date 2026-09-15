"""
Sentry Network Scanner Module
Provides safe, controlled active network port scanning via Nmap with strict target validation.
If Nmap is not installed in the environment, reports honest unconfigured status.
"""

import re
import shutil
import subprocess
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger("sentry.scanner")

# Strict regex patterns for validation to prevent command injection
IPV4_PATTERN = re.compile(r"^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$")
HOSTNAME_PATTERN = re.compile(r"^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$")
SAFE_PORT_PATTERN = re.compile(r"^[0-9]+(-[0-9]+)?(,[0-9]+(-[0-9]+)?)*$")

DEFAULT_PORTS = "21,22,23,80,443,161,830"


def validate_scan_target(target: str) -> str:
    """
    Validates that target is a legitimate IPv4 address or hostname.
    Strictly forbids shell metacharacters and invalid inputs.
    """
    if not target or not isinstance(target, str):
        raise ValueError("Target address cannot be empty.")

    target = target.strip()

    # Block any shell metacharacters explicitly
    illegal_chars = {";", "&", "|", "`", "$", "\n", "\r", ">", "<", "\\", '"', "'", " "}
    if any(char in illegal_chars for char in target):
        raise ValueError("Target contains illegal characters.")

    # Check if target is a valid IPv4
    ipv4_match = IPV4_PATTERN.match(target)
    if ipv4_match:
        octets = [int(g) for g in ipv4_match.groups()]
        if all(0 <= o <= 255 for o in octets):
            return target
        raise ValueError(f"Invalid IPv4 octet range in '{target}'.")

    # Check if target is a valid hostname/FQDN
    if HOSTNAME_PATTERN.match(target):
        return target

    raise ValueError(f"Invalid scan target '{target}'. Must be a valid IPv4 address or hostname.")


def validate_ports(ports: str) -> str:
    """
    Validates port specification string (e.g. '21,22,80' or '20-100').
    """
    ports = ports.strip().replace(" ", "")
    if not SAFE_PORT_PATTERN.match(ports):
        raise ValueError("Invalid port specification. Format must be numbers or ranges separated by commas (e.g. '22,80,443').")
    return ports


def check_nmap_available() -> bool:
    """
    Checks if Nmap CLI binary is present in system PATH.
    """
    return shutil.which("nmap") is not None


def run_network_scan(target: str, ports: Optional[str] = None) -> Dict[str, Any]:
    """
    Executes a network scan on the specified target.
    If Nmap binary is not found, safely returns honest 'not configured' status.
    """
    clean_target = validate_scan_target(target)
    port_spec = validate_ports(ports) if ports else DEFAULT_PORTS

    is_available = check_nmap_available()
    if not is_available:
        return {
            "available": False,
            "status": "Nmap integration available — scanner not configured",
            "target": clean_target,
            "ports_queried": port_spec,
            "message": (
                "Nmap binary is not detected in the system PATH. "
                "Network scan capability is fully architected and ready for deployment once Nmap is installed."
            ),
            "open_ports": [],
            "raw_output": ""
        }

    # Execute nmap safely with shell=False
    cmd = ["nmap", "-sT", "-T4", "-p", port_spec, clean_target]
    try:
        proc = subprocess.run(
            cmd,
            shell=False,
            capture_output=True,
            text=True,
            timeout=20
        )
        output = proc.stdout

        open_ports = []
        for line in output.splitlines():
            line_str = line.strip()
            if "/tcp" in line_str and "open" in line_str:
                parts = line_str.split()
                port_proto = parts[0]
                service = parts[2] if len(parts) > 2 else "unknown"
                open_ports.append({
                    "port": port_proto,
                    "state": "open",
                    "service": service
                })

        return {
            "available": True,
            "status": "Scan completed successfully",
            "target": clean_target,
            "ports_queried": port_spec,
            "open_ports": open_ports,
            "raw_output": output
        }
    except subprocess.TimeoutExpired:
        logger.warning(f"Nmap scan timed out for target {clean_target}")
        return {
            "available": True,
            "status": "Scan timed out (20s limit exceeded)",
            "target": clean_target,
            "ports_queried": port_spec,
            "open_ports": [],
            "raw_output": "Scan timed out."
        }
    except Exception as exc:
        logger.error(f"Error during Nmap scan: {exc}")
        return {
            "available": True,
            "status": f"Scan failed: {str(exc)}",
            "target": clean_target,
            "ports_queried": port_spec,
            "open_ports": [],
            "raw_output": ""
        }
