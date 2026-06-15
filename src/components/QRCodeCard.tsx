"use client";

import React from "react";
import { QRCodeSVG } from "qrcode.react";

interface QRCodeCardProps {
  url: string;
}

export default function QRCodeCard({ url }: QRCodeCardProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-xl max-w-sm mx-auto border border-gray-100">
      <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
        Escanea para ver mi Perfil
      </h3>
      <div className="p-4 bg-white rounded-xl border-2 border-orange-100 flex items-center justify-center">
        
        <div className="relative inline-flex items-center justify-center">
          <QRCodeSVG
            value={url}
            size={256}
            bgColor={"#ffffff"}
            fgColor={"#000000"}
            level={"H"} // Highest error correction
            includeMargin={false}
          />
          {/* Cajas blancas con formato rectangular estricto y logo más grande */}
          <div className="absolute inset-0 m-auto bg-white flex items-center justify-center" style={{ width: 100, height: 38 }}>
            <img 
              src="/LOGOWPNARANJA.png" 
              alt="Logo WP" 
              style={{ width: 85, height: "auto", display: "block" }}
            />
          </div>
        </div>

      </div>
      <p className="mt-4 text-sm text-gray-500 text-center">
        Apunta la cámara de tu teléfono al código QR.
      </p>
    </div>
  );
}
