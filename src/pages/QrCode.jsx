import React, { useEffect, useRef, useState } from "react";
function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}
import QRCodeStyling from "qr-code-styling";
import { useUser } from '@clerk/clerk-react';
import { Container, Row, Col, Card } from 'react-bootstrap';

function QrCode({ style }) {
    const { user } = useUser();
    const ref = useRef(null);
    const [qrCode, setQrCode] = useState(null);

    useEffect(() => {
        if (!user?.id) return;
        // Génère un QR code simple, sans options avancées qui peuvent gêner la détection
        const qr = new QRCodeStyling({
            width: 300,
            height: 300,
            data: user.id,
            type: "canvas",
            margin: 2,
            qrOptions: {
                errorCorrectionLevel: "M"
            },
            dotsOptions: {
                color: "#003250",
                type: "square"
            },
            image: "/skz_logo_low_res.png",
            imageOptions: {
              crossOrigin: "anonymous",
              saveAsBlob: true,
              hideBackgroundDots: true,
              imageSize: 0.7,
              margin: 0,
            },
            backgroundOptions: {
                color: "#fff"
            }
        });
        setQrCode(qr);
    }, [user]);

    useEffect(() => {
        if (qrCode && ref.current) {
            qrCode.append(ref.current);
        }
    }, [qrCode]);

    return (
        <div className="App">
            <div ref={ref} style={{ ...style, margin: "0 auto" }} />
        </div>
    );
}

export default function QrCodePage() {
  // Lien vers le .pkpass généré côté serveur (à adapter selon ton backend)
  const pkpassUrl = "/skz-pass.pkpass";
  return (
    <Container className="full-width d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <Row className="justify-content-center w-100">
        <Col sm={12} lg={8} xl={6}>
          <Card className="shadow-lg border-0 mb-4">
            <Card.Body>
              <h2 className="mb-4 text-center">🎫 Mon QR Code SKZ</h2>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                {/* On force le QR code à être responsive */}
                <div style={{ maxWidth: 320, width: '100%' }}>
                  <QrCode style={{ width: '100%', height: 'auto', maxWidth: 320, display: 'block', margin: '0 auto' }} />
                </div>
              </div>
              {isIOS() && (
                <div className="text-center mt-4">
                  <a href={pkpassUrl} download style={{ textDecoration: 'none' }}>
                    <button className="btn btn-success">Ajouter à Cartes (Apple Wallet)</button>
                  </a>
                  <div style={{ fontSize: '0.9em', color: '#888', marginTop: 4 }}>Format Apple Wallet (.pkpass)</div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

const styles = {
  inputWrapper: {
    margin: "20px 0",
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
  },
  inputBox: {
    flexGrow: 1,
    marginRight: 20,
  },
};
