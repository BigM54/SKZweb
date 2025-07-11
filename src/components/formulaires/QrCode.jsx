import React, { useEffect, useRef, useState } from "react";
import QRCodeStyling from "qr-code-styling";
import { useUser } from '@clerk/clerk-react';

export default function QrCode() {
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
            image: "/skz_logo.png",
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
            <div ref={ref} style={{ width: 300, height: 300, margin: "0 auto" }} />
        </div>
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
