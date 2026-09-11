def calculate_risk_score(findings):
    """
    Calculates an overall security score from 0 to 100 based on verified findings.

    Scoring Logic:
    - Base score: 100 (Clean configuration)
    - Deductions per finding severity:
      * Critical: -15 points
      * High:     -8 points
      * Medium:   -4 points
      * Low:      -2 points
    - Score is clamped to minimum 0.

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

    for finding in findings:
        severity = finding.get("severity", "").lower()

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

    # Determine overall risk level
    if score >= 80:
        risk_level = "Low"
    elif score >= 60:
        risk_level = "Medium"
    elif score >= 30:
        risk_level = "High"
    else:
        risk_level = "Critical"

    return {
        "security_score": score,
        "risk_level": risk_level,
        "critical_findings": critical_count,
        "high_findings": high_count,
        "medium_findings": medium_count,
        "low_findings": low_count
    }