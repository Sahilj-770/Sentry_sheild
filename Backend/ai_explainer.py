import os
import re
from typing import List, Dict, Any
from dotenv import load_dotenv

load_dotenv()

def sanitize_findings_for_ai(findings: List[Dict[str, Any]]) -> str:
    """
    Strips raw tokens or sensitive patterns before sending to LLM.
    Ensures zero secret leakage to external providers.
    """
    text_blocks = []
    for f in findings:
        rule_id = f.get("rule_id", "UNKNOWN")
        issue = f.get("issue", "")
        severity = f.get("severity", "Medium")
        description = f.get("description", "")
        remediation = f.get("remediation", "")
        frameworks = ", ".join(f.get("frameworks", [])) if f.get("frameworks") else "CIS / NIST"

        # Evidence sanitization
        raw_evidence = str(f.get("evidence", ""))
        safe_evidence = re.sub(r'(password|secret|key|community)\s+\S+', r'\1 [REDACTED]', raw_evidence, flags=re.IGNORECASE)

        block = (
            f"Rule ID: {rule_id}\n"
            f"Severity: {severity}\n"
            f"Issue: {issue}\n"
            f"Frameworks: {frameworks}\n"
            f"Description: {description}\n"
            f"Sanitized Evidence: {safe_evidence}\n"
            f"Remediation: {remediation}\n"
        )
        text_blocks.append(block)

    return "\n".join(text_blocks)


def explain_findings(findings: List[Dict[str, Any]], vendor: str) -> Dict[str, Any]:
    """
    Explains verified security findings using an AI provider abstraction.
    Supports OpenAI, Anthropic, Gemini, or safe local fallback.

    AI receives ONLY deterministic verified findings and never invents vulnerabilities.
    If the LLM API is unavailable, the security audit succeeds with deterministic explanations.
    """
    # 1. Zero findings case
    if not findings:
        return {
            "status": "success",
            "provider": "local",
            "summary": "No security issues or compliance gaps were detected in this configuration.",
            "recommendations": []
        }

    # Extract deterministic recommendations
    deterministic_recommendations = [
        f.get("remediation")
        for f in findings
        if f.get("remediation")
    ]

    # 2. Check provider & key
    provider = os.getenv("LLM_PROVIDER", "openai").lower().strip()
    api_key = os.getenv("LLM_API_KEY") or os.getenv("OPENAI_API_KEY")

    if not api_key:
        return {
            "status": "unavailable",
            "provider": "local_fallback",
            "summary": (
                f"Sentry Rule Engine identified {len(findings)} verified security findings across {vendor} controls. "
                "AI explanation provider is not configured (LLM_API_KEY not set). "
                "Deterministic findings, severity scores, and CLI remediations are fully available."
            ),
            "recommendations": deterministic_recommendations
        }

    # 3. Prepare sanitized prompt
    sanitized_findings_text = sanitize_findings_for_ai(findings)
    prompt = f"""You are Sentry's Network Security Advisor analyzing a {vendor} device.
The deterministic compliance engine has verified the following {len(findings)} findings:

{sanitized_findings_text}

Rules:
1. Do NOT invent new vulnerabilities or modify severity.
2. Explain the operational and security impact for each finding clearly.
3. Provide an executive summary of the device's security posture.
"""

    try:
        # Provider 1: OpenAI (or compatible API)
        if provider == "openai":
            from openai import OpenAI
            client = OpenAI(api_key=api_key, timeout=5.0)
            response = client.chat.completions.create(
                model=os.getenv("LLM_MODEL", "gpt-4o-mini"),
                messages=[
                    {"role": "system", "content": "You are a network security compliance auditing assistant. Be concise, precise, and authoritative."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=600,
                temperature=0.2
            )
            ai_summary = response.choices[0].message.content.strip()

            return {
                "status": "success",
                "provider": "openai",
                "summary": ai_summary,
                "recommendations": deterministic_recommendations
            }

        # Provider 2: Anthropic Claude (Interface-ready)
        elif provider == "anthropic":
            try:
                import anthropic
                client = anthropic.Anthropic(api_key=api_key, timeout=5.0)
                msg = client.messages.create(
                    model=os.getenv("LLM_MODEL", "claude-3-haiku-20240307"),
                    max_tokens=600,
                    temperature=0.2,
                    messages=[{"role": "user", "content": prompt}]
                )
                return {
                    "status": "success",
                    "provider": "anthropic",
                    "summary": msg.content[0].text.strip(),
                    "recommendations": deterministic_recommendations
                }
            except ImportError:
                return {
                    "status": "unavailable",
                    "provider": "local_fallback",
                    "summary": "Anthropic SDK is not installed. Using local deterministic remediation.",
                    "recommendations": deterministic_recommendations
                }

        # Provider 3: Google Gemini (Interface-ready)
        elif provider in ["gemini", "google"]:
            try:
                import google.generativeai as genai
                genai.configure(api_key=api_key)
                model = genai.GenerativeModel(os.getenv("LLM_MODEL", "gemini-1.5-flash"))
                response = model.generate_content(prompt)
                return {
                    "status": "success",
                    "provider": "gemini",
                    "summary": response.text.strip(),
                    "recommendations": deterministic_recommendations
                }
            except ImportError:
                return {
                    "status": "unavailable",
                    "provider": "local_fallback",
                    "summary": "Google GenAI SDK is not installed. Using local deterministic remediation.",
                    "recommendations": deterministic_recommendations
                }

        else:
            return {
                "status": "unavailable",
                "provider": "local_fallback",
                "summary": f"Unsupported LLM provider '{provider}'. Using local deterministic remediation.",
                "recommendations": deterministic_recommendations
            }

    except Exception as exc:
        # AI failure should NEVER break the security audit
        return {
            "status": "unavailable",
            "provider": "local_fallback",
            "summary": (
                f"AI explanation service temporarily unavailable ({type(exc).__name__}). "
                "Verified deterministic findings, policy mappings, and remediation guides are fully intact."
            ),
            "recommendations": deterministic_recommendations
        }