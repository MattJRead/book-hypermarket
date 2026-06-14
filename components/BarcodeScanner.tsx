'use client';

import { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export default function BarcodeScanner({ 
  onScanSuccess, 
  onClose 
}: { 
  onScanSuccess: (isbn: string) => void, 
  onClose: () => void 
}) {
  const [error, setError] = useState('');
  const [cameras, setCameras] = useState<any[]>([]);
  const [activeLensIndex, setActiveLensIndex] = useState(0);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const scanner = new Html5Qrcode("barcode-reader");
    scannerRef.current = scanner;
    let isMounted = true;

    Html5Qrcode.getCameras().then(devices => {
      if (!isMounted) return;
      
      if (devices && devices.length > 0) {
        setCameras(devices);
        // Default to the 2nd camera in the array (usually the 1.0x standard lens on 4-camera setups)
        const startIndex = devices.length > 1 ? 1 : 0;
        setActiveLensIndex(startIndex);
        igniteCamera(scanner, devices[startIndex].id);
      } else {
        setError('No cameras detected on this device.');
      }
    }).catch(err => {
      if (isMounted) setError('Failed to retrieve camera list. Please ensure browser permissions are granted.');
    });

    return () => {
      isMounted = false;
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [onScanSuccess]);

  const igniteCamera = (scanner: Html5Qrcode, cameraId: string) => {
    const startSequence = () => {
      scanner.start(
        cameraId,
        { fps: 15, qrbox: { width: 280, height: 120 } },
        (decodedText) => {
          scanner.stop().then(() => onScanSuccess(decodedText)).catch(console.error);
        },
        () => {} // Silently ignore frame errors
      ).catch(() => {
        setError('Lens failed to ignite. Please check browser permissions.');
      });
    };

    if (scanner.isScanning) {
      scanner.stop().then(startSequence).catch(console.error);
    } else {
      startSequence();
    }
  };

  const cycleLens = () => {
    if (cameras.length < 2 || !scannerRef.current) return;
    const nextIndex = (activeLensIndex + 1) % cameras.length;
    setActiveLensIndex(nextIndex);
    igniteCamera(scannerRef.current, cameras[nextIndex].id);
  };

  return (
    <div style={{ zIndex: 2147483647, isolation: 'isolate' }} className="fixed inset-0 flex items-center justify-center bg-black animate-in fade-in">
      <div className="w-full h-full flex flex-col relative bg-black">
        
        {/* Header */}
        <div className="p-5 flex justify-between items-center border-b border-gray-900 bg-black shrink-0">
          <h3 className="text-sky-500 font-bold tracking-widest text-xs uppercase">Scan ISBN Barcode</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        
        {/* Camera Feed Container */}
        <div className="relative w-full flex-grow bg-black flex items-center justify-center overflow-hidden">
          {error ? (
             <div className="p-8 text-center flex flex-col items-center">
               <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
               <p className="text-red-400 text-sm font-mono leading-relaxed mb-6">{error}</p>
             </div>
          ) : (
             <div id="barcode-reader" className="w-full h-full [&>video]:object-cover [&>video]:h-full flex items-center justify-center"></div>
          )}
        </div>
        
        {/* Footer & Controls */}
        <div className="p-8 text-center bg-black border-t border-gray-900 shrink-0 flex flex-col items-center gap-4">
          <p className="text-xs text-sky-500 uppercase tracking-widest font-bold">Align barcode within the frame</p>
          
          {cameras.length > 1 && (
            <button 
              onClick={cycleLens}
              className="px-6 py-3 bg-gray-900 border border-gray-700 text-white rounded-full font-bold text-xs tracking-widest uppercase flex items-center gap-2 hover:bg-gray-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              Switch Lens ({activeLensIndex + 1}/{cameras.length})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}