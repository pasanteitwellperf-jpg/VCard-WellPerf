"use client";
import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Eraser } from 'lucide-react';

export interface SignaturePadRef {
  isEmpty: () => boolean;
  toDataURL: () => string;
  clear: () => void;
}

const SignaturePad = forwardRef<SignaturePadRef>((props, ref) => {
  const sigCanvas = useRef<SignatureCanvas>(null);

  useImperativeHandle(ref, () => ({
    isEmpty: () => sigCanvas.current?.isEmpty() ?? true,
    toDataURL: () => sigCanvas.current?.getTrimmedCanvas().toDataURL('image/png') ?? '',
    clear: () => sigCanvas.current?.clear(),
  }));

  const clear = () => {
    sigCanvas.current?.clear();
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm relative">
      <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">Firma Digital (Dibuja aquí)</span>
        <button
          type="button"
          onClick={clear}
          className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1 transition-colors"
        >
          <Eraser size={16} /> Limpiar
        </button>
      </div>
      <SignatureCanvas
        ref={sigCanvas}
        penColor="black"
        canvasProps={{
          className: 'w-full h-48 sm:h-64 cursor-crosshair touch-none',
        }}
      />
    </div>
  );
});

SignaturePad.displayName = 'SignaturePad';
export default SignaturePad;
