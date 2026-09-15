"""
Sentry Enterprise Integrations Module
Provides webhook and API connectors for SIEM (Splunk, Elastic, QRadar),
Ticketing (Jira, ServiceNow), and SOC Notifications (Slack, Microsoft Teams).
Reports honest 'Integration not configured' status when external webhook URLs are absent.
"""

import os
import json
import logging
import urllib.request
import urllib.error
from typing import Dict, Any, Optional

logger = logging.getLogger("sentry.integrations")


class EnterpriseIntegrations:
    """
    Manager for external SIEM, ITSM, and SOC messaging hooks.
    """

    def __init__(self):
        self.siem_url = os.getenv("SIEM_WEBHOOK_URL", "").strip()
        self.ticketing_url = os.getenv("TICKETING_WEBHOOK_URL", "").strip()
        self.slack_url = os.getenv("SLACK_WEBHOOK_URL", "").strip()

    def get_status(self) -> Dict[str, Any]:
        """
        Returns the honest configuration state of all enterprise connectors.
        """
        return {
            "siem": {
                "name": "SIEM / SOC Event Collector (Splunk HEC / Elastic / QRadar)",
                "configured": bool(self.siem_url),
                "status": "Configured (Active)" if self.siem_url else "Integration not configured",
                "endpoint": self._mask_url(self.siem_url) if self.siem_url else "None",
                "description": "Streams audit findings as CEF / Syslog / JSON events to central SIEM."
            },
            "ticketing": {
                "name": "ITSM / Ticketing System (Jira / ServiceNow)",
                "configured": bool(self.ticketing_url),
                "status": "Configured (Active)" if self.ticketing_url else "Integration not configured",
                "endpoint": self._mask_url(self.ticketing_url) if self.ticketing_url else "None",
                "description": "Automatically opens remediation tickets with severity mapping."
            },
            "notifications": {
                "name": "Security Channel Notifications (Slack / MS Teams)",
                "configured": bool(self.slack_url),
                "status": "Configured (Active)" if self.slack_url else "Integration not configured",
                "endpoint": self._mask_url(self.slack_url) if self.slack_url else "None",
                "description": "Dispatches critical security audit alerts to SecOps channels."
            }
        }

    def send_event(self, service: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Dispatches an audit alert payload to the specified enterprise webhook.
        Safely reports unconfigured status if endpoint is not set.
        """
        service = service.lower().strip()
        url_map = {
            "siem": self.siem_url,
            "ticketing": self.ticketing_url,
            "notifications": self.slack_url,
            "slack": self.slack_url
        }

        target_url = url_map.get(service)
        if not target_url:
            return {
                "success": False,
                "service": service,
                "status": "Integration not configured",
                "message": f"{service.capitalize()} webhook URL is not configured. Set the environment variable to enable live delivery."
            }

        try:
            req_data = json.dumps(payload).encode("utf-8")
            req = urllib.request.Request(
                target_url,
                data=req_data,
                headers={"Content-Type": "application/json", "User-Agent": "Sentry-SIH-Integration/2.0"}
            )
            with urllib.request.urlopen(req, timeout=5) as resp:
                status_code = resp.getcode()
                return {
                    "success": True,
                    "service": service,
                    "status_code": status_code,
                    "message": f"Successfully dispatched event to {service}."
                }
        except urllib.error.HTTPError as he:
            logger.error(f"HTTP error dispatching to {service}: {he}")
            return {
                "success": False,
                "service": service,
                "status_code": he.code,
                "message": f"HTTP Error {he.code}: {he.reason}"
            }
        except Exception as exc:
            logger.error(f"Exception dispatching to {service}: {exc}")
            return {
                "success": False,
                "service": service,
                "message": f"Delivery failed: {str(exc)}"
            }

    @staticmethod
    def _mask_url(url: str) -> str:
        if not url or len(url) < 12:
            return "***"
        return url[:8] + "..." + url[-4:]


# Global singleton instance
enterprise_integrations = EnterpriseIntegrations()
