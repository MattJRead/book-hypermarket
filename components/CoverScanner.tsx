'use client';

import { useState, useRef, useEffect } from 'react';

export default function CoverScanner({ isDarkMode, onScan }: { isDarkMode: boolean, onScan: (text: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const openCamera = async () => {
    setIsOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" } 
      });
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities ? track.getCapabilities() : null;
      if (capabilities && (capabilities as any).torch) {
        setHasTorch(true);
      }
    } catch (err) {
      console.error("Camera error:", err);
      alert("Camera access denied or unavailable.");
      setIsOpen(false);
    }
  };

  const toggleTorch = async () => {
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      try {
        await track.applyConstraints({
          advanced: [{ torch: !torchOn }] as any
        });
        setTorchOn(!torchOn);
      } catch (err) {
        console.error("Torch failed", err);
      }
    }
  };

  const closeCamera = () => {
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      track.applyConstraints({ advanced: [{ torch: false }] as any }).catch(() => {});
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    setTorchOn(false);
    setIsOpen(false);
  };

  const takeSnapshot = async () => {
    if (!videoRef.current) return;
    setIsAnalyzing(true);

    const canvas = document.createElement('canvas');
    const MAX_WIDTH = 800;
    const scaleSize = MAX_WIDTH / videoRef.current.videoWidth;
    
    canvas.width = MAX_WIDTH;
    canvas.height = videoRef.current.videoHeight * scaleSize;
    
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.filter = 'brightness(1.2) contrast(1.1)';
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    }
    
    const base64Image = canvas.toDataURL('image/jpeg', 0.8);

    try {
      const response = await fetch('/api/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64Image })
      });
      const data = await response.json();
      
      if (data.success && data.extractedText) {
        closeCamera();
        onScan(data.extractedText);
      } else {
        alert(`Scanner Failure: ${data.error || 'Could not detect text. Try better lighting.'}`);
      }
    } catch (error) {
      alert("Network timeout. The local engine is unreachable.");
    }
    setIsAnalyzing(false);
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <>
      <button
        onClick={openCamera}
        className={`absolute right-14 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors flex items-center gap-2 ${isDarkMode ? 'text-gray-400 hover:text-purple-400 hover:bg-gray-800' : 'text-gray-500 hover:text-purple-600 hover:bg-gray-200'}`}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
      </button>

      {isOpen && (
        <div style={{ zIndex: 2147483647, isolation: 'isolate' }} className="fixed inset-0 flex items-center justify-center bg-black animate-in fade-in">
          <div className="w-full h-full flex flex-col relative bg-black">
            
            <div className="p-5 flex justify-between items-center border-b border-gray-900 bg-black shrink-0">
              <h3 className="text-purple-500 font-bold tracking-widest text-xs uppercase">Optical Cover Scanner</h3>
              <button onClick={closeCamera} className="text-gray-500 hover:text-white transition-colors">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            
            <div className="relative w-full flex-grow bg-black flex items-center justify-center overflow-hidden">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              
              {hasTorch && (
                <button 
                  onClick={toggleTorch} 
                  className={`absolute top-4 right-4 p-4 rounded-full backdrop-blur-md border ${torchOn ? 'bg-yellow-400/20 border-yellow-400 text-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]' : 'bg-black/50 border-white/20 text-white'}`}
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </button>
              )}

              {isAnalyzing && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center backdrop-blur-sm z-10">
                  <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                  <span className="text-purple-400 font-mono text-sm tracking-widest uppercase animate-pulse drop-shadow-md text-center px-4">
                    [ Analyzing Cover Art... ]
                  </span>
                </div>
              )}
            </div>
            
            <div className="p-8 bg-black flex flex-col items-center justify-center gap-4 border-t border-gray-900 shrink-0">
              <button 
                onClick={takeSnapshot}
                disabled={isAnalyzing}
                className="w-24 h-24 rounded-full bg-purple-600 border-4 border-gray-900 hover:bg-purple-500 transition-colors shadow-[0_0_30px_rgba(168,85,247,0.4)] disabled:opacity-50 ring-2 ring-purple-400"
              ></button>
              <span className="text-xs text-gray-600 uppercase tracking-widest font-bold mt-2">Tap to Scan Cover</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}