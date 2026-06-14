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
    const html5QrCode = new Html5Qrcode("barcode-reader");
    let isComponentMounted = true;

    // 1. Manually interrogate the phone's hardware for its exact camera IDs
    Html5Qrcode.getCameras().then(devices => {
      if (!isComponentMounted) return;
      
      if (devices && devices.length > 0) {
        // 2. Scan the hardware list to find the back camera. 
        // If it isn't explicitly named, default to the last camera in the array (standard for Android main lenses).
        let targetCameraId = devices[0].id;
        for (const device of devices) {
          if (device.label.toLowerCase().includes('back') || device.label.toLowerCase().includes('environment')) {
            targetCameraId = device.id;
            break;
          }
        }
        
        if (targetCameraId === devices[0].id && devices.length > 1) {
            targetCameraId = devices[devices.length - 1].id;
        }

        // 3. Ignite the exact camera ID, bypassing the browser's confusion
        html5QrCode.start(
          targetCameraId,
          {
            fps: 10, 
            qrbox: { width: 250, height: 150 } 
          },
          (decodedText) => {
            if (isComponentMounted) {
                html5QrCode.stop().then(() => {
                  onScanSuccess(decodedText);
                }).catch(console.error);
            }
          },
          (errorMessage) => {
            // Ignore background frame errors
          }
        ).catch((err) => {
          if (isComponentMounted) setError('Camera failed to ignite. Please check browser permissions.');
          console.error(err);
        });
      } else {
         if (isComponentMounted) setError('No cameras detected on this device.');
      }
    }).catch(err => {
      if (isComponentMounted) setError('Failed to retrieve camera list. Please ensure browser permissions are granted.');
      console.error(err);
    });

    return () => {
      isComponentMounted = false;
      if (html5QrCode.isScanning) {
        html5QrCode.stop().catch(console.error);
      }
    };
  }, [onScanSuccess]);

  return (
    <div style={{ zIndex: 2147483647 }} className="fixed inset-0 flex items-center justify-center bg-black/95 p-0 sm:p-4 backdrop-blur-sm animate-in fade-in">
      <div className="w-full h-full sm:h-auto sm:max-w-md bg-gray-950 sm:rounded-3xl overflow-hidden shadow-2xl relative flex flex-col">
        <div className="p-5 flex justify-between items-center border-b border-gray-900 bg-black shrink-0">
          <h3 className="text-sky-500 font-bold tracking-widest text-xs uppercase">Scan ISBN Barcode</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        
        <div className="relative w-full flex-grow bg-black flex items-center justify-center overflow-hidden" style={{ minHeight: '50vh' }}>
          {error ? (
             <div className="p-8 text-center flex flex-col items-center">
               <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
               <p className="text-red-400 text-sm font-mono leading-relaxed mb-6">{error}</p>
               <button 
                onClick={() => window.location.reload()} 
                className="px-6 py-2 bg-sky-600 rounded-full font-bold text-white text-sm"
               >
                 Refresh & Retry Camera
               </button>
             </div>
          ) : (
             <div id="barcode-reader" className="w-full h-full [&>video]:object-cover [&>video]:h-full"></div>
          )}
        </div>
        
        <div className="p-8 text-center bg-black border-t border-gray-900 shrink-0">
          <p className="text-xs text-sky-500 uppercase tracking-widest font-bold mb-2">Align barcode within the frame</p>
          <p className="text-[10px] text-gray-500">Hold phone 6 to 8 inches away for auto-focus</p>
        </div>
      </div>
    </div>
  );
}