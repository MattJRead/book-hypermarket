'use client';

import { useEffect, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export default function BarcodeScanner({ 
  onScanSuccess, 
  onClose 
}: { 
  onScanSuccess: (isbn: string) => void, 
  onClose: () => void 
}) {
  const [error, setError] = useState('');

  useEffect(() => {
    // 1. Initialize the raw core engine (bypassing the clunky UI)
    const html5QrCode = new Html5Qrcode("barcode-reader");

    // 2. Force start the rear camera automatically
    html5QrCode.start(
      { facingMode: "environment" }, // This strictly commands the phone to use the back camera
      {
        fps: 10, // Scans 10 frames per second
        qrbox: { width: 250, height: 150 } // Creates a targeted horizontal box for ISBNs
      },
      (decodedText) => {
        // 3. When it catches a barcode, stop the camera and pass the numbers back
        html5QrCode.stop().then(() => {
          onScanSuccess(decodedText);
        }).catch(console.error);
      },
      (errorMessage) => {
        // The engine constantly throws background errors when it doesn't see a barcode in the frame. We safely ignore these.
      }
    ).catch((err) => {
      setError('Camera failed to ignite. Please ensure browser permissions are granted.');
      console.error(err);
    });

    // 4. Critical Cleanup: Shut the camera off if the user closes the modal early
    return () => {
      if (html5QrCode.isScanning) {
        html5QrCode.stop().catch(console.error);
      }
    };
  }, [onScanSuccess]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-gray-950 rounded-3xl overflow-hidden border border-gray-800 shadow-2xl relative flex flex-col">
        
        {/* Header */}
        <div className="p-5 flex justify-between items-center border-b border-gray-900 bg-black">
          <h3 className="text-sky-500 font-bold tracking-widest text-xs uppercase">Scan ISBN Barcode</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        
        {/* Camera Feed Container */}
        <div className="relative w-full bg-black flex items-center justify-center overflow-hidden" style={{ minHeight: '300px' }}>
          {error ? (
             <p className="text-red-500 p-6 text-center text-sm font-mono">{error}</p>
          ) : (
             <div id="barcode-reader" className="w-full"></div>
          )}
        </div>
        
        {/* Footer Instructions */}
        <div className="p-6 text-center text-xs text-gray-500 uppercase tracking-widest bg-black">
          Align the barcode within the targeting frame
        </div>
      </div>
    </div>
  );
}