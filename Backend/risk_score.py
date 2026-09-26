def calculate_risk_score(findings, total_checks: int = None):
    """
    Calculates an overall security score from 0 to 100 based on verified findings.

    Scoring Logic:
    - Base score: 100 (Clean configuration)
    - Deductions per unique finding severity:
      * Critical: -15 points
      * High:     -8 points
      * Medium:   -4 points
      * Low:      -2 points
    - Score is clamped to minimum 0.
    - Findings are deduplicated by rule ID to prevent double penalties.

    Risk Levels:
    - 80 to 100: Low Risk
    - 60 to 79:  Medium Risk
    - 30 to 59:  High Risk
    - 0 to 29:   Critical Risk

    Example:
    - 10 High (-80) + 2 Medium (-8) = 12/100 (Critical Risk)
    - 0 findings = 100/100 (Low Risk)
    """
    score = 100

    critical_count = 0
    high_count = 0
    medium_count = 0
    low_count = 0

    seen_keys = set()
    deduped_findings = []
    for f in findings:
        key = f.get("rule_id") or f.get("issue") or f.get("title")
        if key and key in seen_keys:
            continue
        if key:
            seen_keys.add(key)
        deduped_findings.append(f)

    for finding in deduped_findings:
        severity = str(finding.get("severity", "")).lower()

        if severity == "critical":
            score -= 15
            critical_count += 1
        elif severity == "high":
            score -= 8
            high_count += 1
        elif severity == "medium":
            score -= 4
            medium_count += 1
        elif severity == "low":
            score -= 2
            low_count += 1

    # Score should never go below 0
    score = max(score, 0)

    # Determine overall hygiene risk level
    if score >= 80:
        risk_level = "Low"
    elif score >= 60:
        risk_level = "Medium"
    elif score >= 30:
        risk_level = "High"
    else:
        risk_level = "Critical"

    # Determine authoritative compliance status (severity-gated, not purely numerical)
    if critical_count > 0:
        compliance_status = "NON-COMPLIANT (CRITICAL CONTROLS FAILED)"
    elif high_count > 0:
        compliance_status = "NON-COMPLIANT (HIGH SEVERITY CONTROLS FAILED)"
    elif medium_count > 0:
        compliance_status = "CONDITIONALLY COMPLIANT (REVIEW REQUIRED)"
    else:
        compliance_status = "COMPLIANT (PASS)"

    total_eval = total_checks if total_checks is not None else max(len(deduped_findings), 12)
    checks_failed = len(deduped_findings)
    checks_passed = max(0, total_eval - checks_failed)

    return {
        "security_score": score,
        "risk_level": risk_level,
        "compliance_status": compliance_status,
        "critical_findings": critical_count,
        "high_findings": high_count,
        "medium_findings": medium_count,
        "low_findings": low_count,
        "total_findings": len(deduped_findings),
        "checks_evaluated": total_eval,
        "checks_passed": checks_passed,
        "checks_failed": checks_failed,
        "deduplicated": len(findings) != len(deduped_findings),
        "scoring_methodology": "Base 100 with deduplicated severity penalties (Critical: -15, High: -8, Medium: -4, Low: -2, clamped [0, 100])"
    }