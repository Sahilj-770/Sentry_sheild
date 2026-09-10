from reportlab.lib.pagesizes import A4
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Image,
    Table,
    TableStyle
)
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.enums import TA_CENTER


def generate_audit_pdf(
    audit_id,
    vendor,
    security_score,
    findings,
    suggestions,
    qr_file,
    output_file
):
    """
    Generate a complete Network Security Audit PDF
    using the actual audit results.
    """

    doc = SimpleDocTemplate(
        output_file,
        pagesize=A4,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()

    title_style = styles["Title"]
    title_style.alignment = TA_CENTER

    story = []

    # =====================================================
    # TITLE
    # =====================================================

    story.append(
        Paragraph(
            "Network Security Audit Report",
            title_style
        )
    )

    story.append(Spacer(1, 20))

    # =====================================================
    # BASIC INFORMATION
    # =====================================================

    story.append(
        Paragraph(
            "Basic Information",
            styles["Heading2"]
        )
    )

    basic_info = [
        ["Audit ID", audit_id],
        ["Vendor", vendor],
        ["Security Score", f"{security_score}/100"]
    ]

    info_table = Table(
        basic_info,
        colWidths=[150, 300]
    )

    info_table.setStyle(
        TableStyle([
            ("GRID", (0, 0), (-1, -1), 0.5, colors.black),
            ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
            ("PADDING", (0, 0), (-1, -1), 7),
        ])
    )

    story.append(info_table)

    story.append(Spacer(1, 20))

    # =====================================================
    # SECURITY FINDINGS
    # =====================================================

    story.append(
        Paragraph(
            "Security Findings",
            styles["Heading2"]
        )
    )

    if findings:

        finding_table = [
            ["#", "Security Issue", "Severity"]
        ]

        for index, finding in enumerate(findings, start=1):

            finding_table.append([
                str(index),
                finding.get("issue", "Unknown issue"),
                finding.get("severity", "Unknown")
            ])

        table = Table(
            finding_table,
            colWidths=[35, 315, 100]
        )

        table.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.black),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("PADDING", (0, 0), (-1, -1), 6),
            ])
        )

        story.append(table)

    else:

        story.append(
            Paragraph(
                "No security issues were detected.",
                styles["Normal"]
            )
        )

    story.append(Spacer(1, 20))

    # =====================================================
    # SUGGESTIONS / REMEDIATION
    # =====================================================

    story.append(
        Paragraph(
            "Suggestions / Remediation",
            styles["Heading2"]
        )
    )

    if suggestions:

        for suggestion in suggestions:

            story.append(
                Paragraph(
                    f"• {suggestion}",
                    styles["Normal"]
                )
            )

            story.append(Spacer(1, 5))

    else:

        story.append(
            Paragraph(
                "No remediation suggestions available.",
                styles["Normal"]
            )
        )

    story.append(Spacer(1, 20))

    # =====================================================
    # QR CODE
    # =====================================================

    story.append(
        Paragraph(
            "Audit Verification QR",
            styles["Heading2"]
        )
    )

    story.append(Spacer(1, 10))

    qr_image = Image(
        qr_file,
        width=150,
        height=150
    )

    story.append(qr_image)

    story.append(Spacer(1, 10))

    story.append(
        Paragraph(
            f"Scan this QR code to identify audit {audit_id}.",
            styles["Normal"]
        )
    )

    # =====================================================
    # GENERATE PDF
    # =====================================================

    doc.build(story)

    return output_file


# =========================================================
# TEST
# =========================================================

if __name__ == "__main__":

    audit_id = "AUDIT-2026-0001"

    findings = [
        {
            "issue": "Telnet service enabled",
            "severity": "High"
        },
        {
            "issue": "Logging is disabled",
            "severity": "Medium"
        },
        {
            "issue": "SNMP public community detected",
            "severity": "High"
        }
    ]

    suggestions = [
        "Disable Telnet and use SSH.",
        "Enable system logging.",
        "Replace the default SNMP community string."
    ]

    pdf_file = generate_audit_pdf(
        audit_id=audit_id,
        vendor="Cisco",
        security_score=65,
        findings=findings,
        suggestions=suggestions,
        qr_file="AUDIT-2026-0001_qr.png",
        output_file="AUDIT-2026-0001_Report.pdf"
    )

    print(f"PDF generated successfully: {pdf_file}")