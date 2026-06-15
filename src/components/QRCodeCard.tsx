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
            imageSettings={{
              src: "/LOGOWPNARANJA.png",
              height: 48,
              width: 112,
              excavate: true,
            }}
          />
        </div>

      </div>
      <p className="mt-4 text-sm text-gray-500 text-center">
        Apunta la cámara de tu teléfono al código QR.
      </p>
    </div>
  );
}
