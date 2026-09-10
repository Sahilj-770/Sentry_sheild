import qrcode
from pathlib import Path


def generate_audit_qr(audit_id: str):
    """
    Generate a QR code for a specific audit.

    The QR contains the audit ID, not the network configuration.
    """

    qr_data = f"Audit ID: {audit_id}"

    qr = qrcode.QRCode(
        version=1,
        box_size=10,
        border=4
    )

    qr.add_data(qr_data)
    qr.make(fit=True)

    img = qr.make_image()

    filename = Path(f"{audit_id}_qr.png")
    img.save(filename)

    return str(filename)


if __name__ == "__main__":
    audit_id = input("Enter Audit ID: ")

    qr_file = generate_audit_qr(audit_id)

    print(f"QR generated successfully: {qr_file}")