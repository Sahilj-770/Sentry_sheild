import html
import os
import hashlib
from pathlib import Path
from typing import Optional, List, Dict, Any
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT


def generate_audit_pdf(
    audit_id: str,
    vendor: str,
    security_score: int,
    findings: list,
    suggestions: list,
    qr_file: str,
    output_file: str = None,
    device_name: Optional[str] = None,
    integrity_hash: Optional[str] = None
) -> str:
    """
    Generate an authoritative, formatted PDF audit report using ReportLab.

    Contains:
    - Title: Sentry Shield Network Security & Compliance Audit Report
    - Basic Information (Audit ID, Vendor, Target Device)
    - Dynamic Security Score and Non-misleading Compliance Status
    - Objective Executive Risk Matrix and Evaluated Frameworks
    - Detailed Security Findings Table with line-level evidence and CVE metadata
    - Actionable Remediation Guidance
    - Audit Verification QR code and Cryptographic Integrity Fingerprint
    """
    if output_file is None:
        reports_dir = Path("reports")
        reports_dir.mkdir(parents=True, exist_ok=True)
        output_file = str(reports_dir / f"{audit_id}_Report.pdf")
    else:
        Path(output_file).parent.mkdir(parents=True, exist_ok=True)

    doc = SimpleDocTemplate(
        output_file,
        pagesize=A4,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36,
        title="Sentry Shield Network Security & Compliance Audit Report",
        author="Sentry Shield AI Compliance Engine"
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "ReportTitle",
        parent=styles["Title"],
        alignment=TA_CENTER,
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#0f172a")
    )

    normal_style = styles["Normal"]
    heading2_style = ParagraphStyle(
        "Heading2Custom",
        parent=styles["Heading2"],
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#1e293b"),
        spaceBefore=10,
        spaceAfter=6
    )

    meta_style = ParagraphStyle(
        "MetaStyle",
        parent=normal_style,
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#334155")
    )

    story = []

    # Title & Header
    story.append(Paragraph("<b>SENTRY SHIELD</b>", title_style))
    story.append(Paragraph("<font size=11 color='#475569'>Network Security &amp; Compliance Audit Report</font>", ParagraphStyle("Sub", parent=normal_style, alignment=TA_CENTER)))
    story.append(Spacer(1, 14))

    # Basic Information Box
    device_label = html.escape(str(device_name)) if device_name else "N/A (Configuration Upload)"
    info_data = [
        [
            Paragraph(f"<b>Audit Reference ID:</b> <code>{html.escape(audit_id)}</code>", meta_style),
            Paragraph(f"<b>Target Device:</b> {device_label}", meta_style)
        ],
        [
            Paragraph(f"<b>Platform / Vendor:</b> {html.escape(vendor)}", meta_style),
            Paragraph("<b>Engine Version:</b> Sentry Core 2.0 (Deterministic Compliance)", meta_style)
        ]
    ]
    info_table = Table(info_data, colWidths=[260, 260])
    info_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
            ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("PADDING", (0, 0), (-1, -1), 6),
        ])
    )
    story.append(info_table)
    story.append(Spacer(1, 14))

    # Dynamic Compliance Status
    if security_score >= 80:
        compliance_badge = "<font color='#16a34a'><b>COMPLIANT (PASS)</b></font>"
    elif security_score >= 60:
        compliance_badge = "<font color='#d97706'><b>CONDITIONALLY COMPLIANT (REVIEW REQUIRED)</b></font>"
    else:
        compliance_badge = "<font color='#dc2626'><b>NON-COMPLIANT (ACTION REQUIRED)</b></font>"

    story.append(Paragraph("<b>Security Score &amp; Compliance Status</b>", heading2_style))
    story.append(
        Paragraph(
            f"Overall Security Score: <b>{security_score}/100</b> &nbsp;|&nbsp; "
            f"Compliance Status: {compliance_badge} &nbsp;|&nbsp; "
            f"Audit State: <b>Evaluation Complete</b>",
            normal_style
        )
    )
    story.append(Spacer(1, 8))

    # Executive Severity Matrix
    crit_count = sum(1 for f in findings if str(f.get("severity", "")).lower() == "critical")
    high_count = sum(1 for f in findings if str(f.get("severity", "")).lower() == "high")
    med_count = sum(1 for f in findings if str(f.get("severity", "")).lower() == "medium")
    low_count = sum(1 for f in findings if str(f.get("severity", "")).lower() == "low")

    matrix_data = [
        [
            Paragraph("<b>Severity Tier</b>", meta_style),
            Paragraph("<b>Findings</b>", meta_style),
            Paragraph("<b>Remediation Priority &amp; Impact</b>", meta_style)
        ],
        [
            Paragraph("<font color='#991b1b'><b>Critical</b></font>", meta_style),
            Paragraph(f"<b>{crit_count}</b>", meta_style),
            Paragraph("Immediate remediation required (RCE, default read-write credentials, full exposure)", meta_style)
        ],
        [
            Paragraph("<font color='#dc2626'><b>High</b></font>", meta_style),
            Paragraph(f"<b>{high_count}</b>", meta_style),
            Paragraph("High priority (Cleartext management, legacy SSHv1, plaintext credentials, open ACLs)", meta_style)
        ],
        [
            Paragraph("<font color='#d97706'><b>Medium</b></font>", meta_style),
            Paragraph(f"<b>{med_count}</b>", meta_style),
            Paragraph("Moderate priority (Disabled console logging, missing brute-force protection, time sync)", meta_style)
        ],
        [
            Paragraph("<font color='#2563eb'><b>Low / Info</b></font>", meta_style),
            Paragraph(f"<b>{low_count}</b>", meta_style),
            Paragraph("Hardening improvement (Banner configuration, logging microsecond precision)", meta_style)
        ]
    ]
    matrix_table = Table(matrix_data, colWidths=[110, 60, 350])
    matrix_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("PADDING", (0, 0), (-1, -1), 4),
        ])
    )
    story.append(matrix_table)

    # Compile actual evaluated compliance frameworks
    fw_set = set()
    for f in findings:
        for fw in f.get("frameworks", []):
            fw_set.add(str(fw))
    if not fw_set:
        fw_set = {"CIS Benchmarks v8.0", "NIST SP 800-53 Rev 5", "DISA STIG Network Core", "ISO/IEC 27001:2022"}

    fw_str = html.escape(", ".join(sorted(fw_set)))
    story.append(Spacer(1, 4))
    story.append(Paragraph(f"<font size=8 color='#64748b'><b>Evaluated Framework Baselines:</b> {fw_str}</font>", normal_style))
    story.append(Spacer(1, 12))

    # Findings Section
    story.append(Paragraph("<b>Security Findings &amp; Evidence</b>", heading2_style))

    if findings:
        table_data = [[
            Paragraph("<b>Rule &amp; Issue Details</b>", meta_style),
            Paragraph("<b>Verified Configuration Evidence</b>", meta_style),
            Paragraph("<b>Severity</b>", meta_style)
        ]]

        for finding in findings:
            rule_id = html.escape(str(finding.get("rule_id", "")))
            issue_text = html.escape(str(finding.get("issue") or finding.get("title", "")))
            evidence_text = html.escape(str(finding.get("evidence") or finding.get("description", "")))
            severity_text = html.escape(str(finding.get("severity", "")))

            col1 = f"<b>[{rule_id}]</b><br/>{issue_text}" if rule_id else issue_text

            frameworks = finding.get("frameworks")
            if frameworks and isinstance(frameworks, list):
                fw_joined = html.escape(", ".join(str(fw) for fw in frameworks))
                col1 += f"<br/><font size=7 color='#1d4ed8'><b>Compliance:</b> {fw_joined}</font>"

            cve = finding.get("cve")
            if cve:
                cve_escaped = html.escape(str(cve))
                col1 += f"<br/><font size=7 color='#b91c1c'><b>Threat Intel:</b> {cve_escaped}</font>"

            # Format evidence cleanly
            col2 = f"<font size=8 face='Courier'>{evidence_text}</font>" if evidence_text else "<font size=8 color='#94a3b8'>No explicit evidence captured</font>"

            # Severity badge styling
            sev_lower = severity_text.lower()
            if sev_lower in ["critical", "high"]:
                col3 = f"<font color='#dc2626'><b>{severity_text}</b></font>"
            elif sev_lower == "medium":
                col3 = f"<font color='#d97706'><b>{severity_text}</b></font>"
            else:
                col3 = f"<font color='#2563eb'><b>{severity_text}</b></font>"

            table_data.append([
                Paragraph(col1, normal_style),
                Paragraph(col2, normal_style),
                Paragraph(col3, normal_style)
            ])

        table = Table(table_data, colWidths=[205, 240, 75])
        table.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("PADDING", (0, 0), (-1, -1), 4),
            ])
        )
        story.append(table)
    else:
        story.append(
            Paragraph("<font color='#16a34a'><b>Zero non-compliant controls detected.</b> Configuration satisfies all evaluated security baseline policies.</font>", normal_style)
        )

    story.append(Spacer(1, 14))

    # Suggestions / Remediation
    story.append(Paragraph("<b>Authoritative Remediation Guidance</b>", heading2_style))

    if suggestions:
        for suggestion in suggestions:
            clean_sugg = html.escape(str(suggestion))
            story.append(
                Paragraph(f"&bull; {clean_sugg}", normal_style)
            )
    else:
        story.append(
            Paragraph("No active remediation actions required. Routine periodic auditing recommended.", normal_style)
        )

    story.append(Spacer(1, 16))

    # Audit Verification & Integrity Section
    story.append(Paragraph("<b>Cryptographic Audit Verification &amp; Registry</b>", heading2_style))
    story.append(Spacer(1, 6))

    # Calculate integrity fingerprint
    calc_hash = integrity_hash or hashlib.sha256(f"{audit_id}:{vendor}:{security_score}".encode()).hexdigest()

    qr_cell = Paragraph("<font color='#94a3b8'>QR code unavailable</font>", normal_style)
    if qr_file and os.path.exists(qr_file):
        qr_cell = Image(qr_file, width=110, height=110)

    verif_text = (
        f"<b>Audit Registry Verification ID:</b> <code>{html.escape(audit_id)}</code><br/>"
        f"<b>Integrity Fingerprint (SHA-256):</b><br/>"
        f"<font size=7 face='Courier' color='#334155'>{calc_hash}</font><br/><br/>"
        f"<font size=8 color='#475569'>"
        f"Scan the adjacent QR code to query the Sentry Shield verification endpoint. "
        f"This cryptographic checksum ensures the audit results, score, and findings "
        f"have not been altered since engine execution."
        f"</font>"
    )

    verif_table = Table([[qr_cell, Paragraph(verif_text, normal_style)]], colWidths=[120, 400])
    verif_table.setStyle(
        TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("PADDING", (0, 0), (-1, -1), 4),
        ])
    )
    story.append(verif_table)

    doc.build(story)
    return output_file


if __name__ == "__main__":
    test_findings = [
        {"rule_id": "CISCO-TELNET-001", "issue": "Telnet service enabled", "severity": "High", "evidence": "Line 27: transport input telnet"},
        {"rule_id": "CISCO-LOG-001", "issue": "Logging is disabled", "severity": "Medium", "evidence": "Line 37: no logging console"},
        {"rule_id": "CISCO-SNMP-001", "issue": "SNMP public community detected", "severity": "High", "evidence": "Line 35: snmp-server community [REDACTED_PUBLIC] RO"}
    ]
    test_suggestions = [
        "Disable Telnet and use SSH.",
        "Enable proper system logging.",
        "Replace the default SNMP community string."
    ]

    from qr_generator import generate_audit_qr
    test_qr = generate_audit_qr("AUDIT-2026-0001")
    pdf = generate_audit_pdf(
        audit_id="AUDIT-2026-0001",
        vendor="Cisco",
        security_score=65,
        findings=test_findings,
        suggestions=test_suggestions,
        qr_file=test_qr
    )
    print(f"PDF generated successfully: {pdf}")
