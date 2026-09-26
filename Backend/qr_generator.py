import os
import hashlib
from pathlib import Path
from typing import Optional
import qrcode


def generate_audit_qr(
    audit_id: str,
    output_dir: str = "reports",
    verification_url: Optional[str] = None,
    integrity_hash: Optional[str] = None
) -> str:
    """
    Generate an audit verification QR code for a specific audit.

    Encodes audit verification data / URL rather than sensitive raw configuration.
    Saves the generated QR code inside the reports/ directory.
    """
    reports_dir = Path(output_dir)
    reports_dir.mkdir(parents=True, exist_ok=True)

    if verification_url:
        qr_data = verification_url
    else:
        # Default structured verification payload
        short_hash = integrity_hash or hashlib.sha256(audit_id.encode()).hexdigest()[:16]
        qr_data = f"https://sentryshield.gov.in/verify?audit_id={audit_id}&checksum={short_hash}"

    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=8,
        border=3
    )

    qr.add_data(qr_data)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")

    filename = reports_dir / f"{audit_id}_qr.png"
    img.save(filename)

    return str(filename)


if __name__ == "__main__":
    test_id = "AUDIT-2026-TEST"
    qr_file = generate_audit_qr(test_id)
    print(f"QR generated successfully: {qr_file}")
