'use client';

import { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function BarcodeScanner({ onScan, onClose }: { onScan: (isbn: string) => void, onClose: () => void }) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Initialize the scanner targeting ISBN barcodes (EAN-13)
    scannerRef.current = new Html5QrcodeScanner(
      "barcode-reader",
      { 
        fps: 10, 
        qrbox: { width: 300, height: 150 },
        formatsToSupport: [ 1 ], // 1 = EAN_13, which is the global standard for ISBNs
        rememberLastUsedCamera: true
      },
      false
    );

    scannerRef.current.render(
      (decodedText) => {
        // Stop scanning immediately once a target is acquired
        if (scannerRef.current) {
          scannerRef.current.clear();
        }
        onScan(decodedText);
      },
      (errorMessage) => {
        // Silently ignore background scan errors as it analyzes frames
      }
    );

    // Cleanup when the user closes the camera
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => console.error("Failed to clear scanner.", error));
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-950/90 backdrop-blur-md p-4">
      <div className="w-full max-w-lg bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-800">
          <h3 className="text-white font-bold tracking-widest uppercase text-sm">Align Barcode in Frame</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        {/* The target reticle and video feed will render inside this div */}
        <div id="barcode-reader" className="w-full bg-black"></div>
      </div>
    </div>
  );
}