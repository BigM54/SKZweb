import React, { useEffect, useRef, useState } from "react";
import QRCodeStyling from "qr-code-styling";
import { useUser } from '@clerk/clerk-react';

export default function QrCode() {
    
    const { user} = useUser();
    const qrCode = new QRCodeStyling({
    type: "canvas",
    shape: "square",
    width: 300,
    height: 300,
    data: user.id,
    margin: 0,
    qrOptions: {
        typeNumber: 0,
        mode: "Byte",
        errorCorrectionLevel: "Q",
    },
    image: "/skz_logo.png",
    imageOptions: {
        saveAsBlob: true,
        hideBackgroundDots: true,
        imageSize: 0.4,
        margin: 0,
    },
    dotsOptions: {
        type: "classy-rounded",
        color: "#6a1a4c",
        roundSize: true,
        gradient: {
        type: "linear",
        rotation: 0,
        colorStops: [
            { offset: 0, color: "#030084" },
            { offset: 1, color: "#3cc9ff" },
        ],
        },
    },
    backgroundOptions: {
        round: 0,
        color: "#ffffff",
    },
    cornersSquareOptions: {
        type: "extra-rounded",
        color: "#001399",
        gradient: {
        type: "linear",
        rotation: 0,
        colorStops: [
            { offset: 0, color: "#000495" },
            { offset: 1, color: "#14c4fe" },
        ],
        },
    },
    cornersDotOptions: {
        type: "dot",
        color: "#0011df",
        gradient: {
        type: "linear",
        rotation: 0,
        colorStops: [
            { offset: 0, color: "#001fae" },
            { offset: 1, color: "#1ad1ff" },
        ],
        },
    },
    });

  const ref = useRef(null);

  useEffect(() => {
    qrCode.append(ref.current);
  }, []);


  return (
    <div className="App">
        <div ref={ref} style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center' }} />
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
