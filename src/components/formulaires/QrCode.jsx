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
        imageSize: 1,
        margin: 0,
    },
    dotsOptions: {
        type: "square",
        color: "#003250",
        roundSize: true,
        gradient: null,
    },
    backgroundOptions: {
        round: 0,
        color: "white",
    },
    cornersSquareOptions: {
        type: "square",
        color: "#003250",
        gradient: null,
    },
    dotsOptionsHelper:{"colorType":{"single":true,"gradient":false},"gradient":{"linear":true,"radial":false,"color1":"#6a1a4c","color2":"#6a1a4c","rotation":"0"}},
    cornersSquareOptionsHelper:{"colorType":{"single":true,"gradient":false},"gradient":{"linear":true,"radial":false,"color1":"#000000","color2":"#000000","rotation":"0"}},
    cornersDotOptions: {
        type: "square",
        color: "#003250",
        gradient: null,
    },
    cornersDotOptionsHelper:{"colorType":{"single":true,"gradient":false},"gradient":{"linear":true,"radial":false,"color1":"#000000","color2":"#000000","rotation":"0"}},
    backgroundOptionsHelper:{"colorType":{"single":true,"gradient":false},"gradient":{"linear":true,"radial":false,"color1":"#ffffff","color2":"#ffffff","rotation":"0"}},
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
