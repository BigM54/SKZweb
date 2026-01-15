import React, { useEffect, useRef, useState } from "react";
import QRCodeStyling from "qr-code-styling";
import { useUser } from '@clerk/clerk-react';
import { Container, Row, Col, Card } from 'react-bootstrap';

function QrCode({ style }) {
    const { user } = useUser();
    const ref = useRef(null);
    const [qrCode, setQrCode] = useState(null);
    const [size, setSize] = useState(300);

    useEffect(() => {
        const updateSize = () => {
            setSize(Math.min(window.innerWidth - 40, 600)); // Max 600px, min padding
        };
        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    useEffect(() => {
        if (!user?.id) return;
        // Génère un QR code simple, sans options avancées qui peuvent gêner la détection
        const qr = new QRCodeStyling({
            width: size,
            height: size,
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
            backgroundOptions: {
                color: "#fff"
            }
        });
        setQrCode(qr);
    }, [user, size]);

    useEffect(() => {
        if (qrCode && ref.current) {
            ref.current.innerHTML = ''; // Clear previous
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
  return (
    <Container className="full-width d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '80vh', padding: '20px' }}>
      <Row className="justify-content-center w-100">
        <Col sm={12} lg={10} xl={8}>
          <Card className="shadow-lg border-0 mb-4">
            <Card.Body>
              <h2 className="mb-4 text-center">🎫 Mon QR Code SKZ</h2>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                {/* QR code prend toute la largeur disponible */}
                <div style={{ width: '100%', maxWidth: '600px' }}>
                  <QrCode style={{ width: '100%', height: 'auto', display: 'block', margin: '0 auto' }} />
                </div>
              </div>
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
