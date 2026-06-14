'use client';

import { useState, useRef, useEffect } from 'react';

export default function CoverScanner({ isDarkMode, onScan }: { isDarkMode: boolean, onScan: (text: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const openCamera = async () => {
    setIsOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" } // Let the phone pick the safest resolution
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      alert("Camera access denied. Please allow camera permissions in your browser settings.");
      setIsOpen(false);
    }
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsOpen(false);
  };

  const takeSnapshot = async () => {
    if (!videoRef.current) return;
    setIsAnalyzing(true);

    // 🔽 THE INVISIBLE COMPRESSOR
    const canvas = document.createElement('canvas');
    // Shrink the massive camera feed down to a web-safe 800px width
    const MAX_WIDTH = 800;
    const scaleSize = MAX_WIDTH / videoRef.current.videoWidth;
    
    canvas.width = MAX_WIDTH;
    canvas.height = videoRef.current.videoHeight * scaleSize;
    
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    // Convert to a lightweight JPEG (80% quality)
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
        alert("The AI could not read the cover. Please try again in better lighting.");
      }
    } catch (error) {
      alert("Network error contacting the AI Engine.");
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
        title="Scan Book Cover with AI"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
      </button>

      {isOpen && (
        /* z-[9999] completely covers the menu and notification bell */
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black p-0 sm:p-4 animate-in fade-in">
          <div className="w-full h-full sm:h-auto sm:max-w-md bg-gray-950 sm:rounded-3xl overflow-hidden border-0 sm:border border-gray-800 shadow-2xl relative flex flex-col">
            <div className="p-5 flex justify-between items-center border-b border-gray-900 bg-black">
              <h3 className="text-purple-500 font-bold tracking-widest text-xs uppercase">AI Cover Scanner</h3>
              <button onClick={closeCamera} className="text-gray-500 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            
            <div className="relative w-full flex-grow bg-black flex items-center justify-center overflow-hidden" style={{ minHeight: '50vh' }}>
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              
              {isAnalyzing && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center backdrop-blur-sm z-10">
                  <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(168,85,247,0.5)]"></div>
                  <span className="text-purple-400 font-mono text-sm tracking-widest uppercase animate-pulse drop-shadow-md text-center px-4">
                    [ Interrogating Gemini AI... ]<br/>
                    <span className="text-[10px] text-gray-500 mt-2 block">Analyzing text and artwork</span>
                  </span>
                </div>
              )}
            </div>
            
            <div className="p-8 bg-black flex flex-col items-center justify-center gap-4 border-t border-gray-900">
              <button 
                onClick={takeSnapshot}
                disabled={isAnalyzing}
                className="w-20 h-20 rounded-full bg-purple-600 border-4 border-gray-900 hover:bg-purple-500 transition-colors shadow-[0_0_30px_rgba(168,85,247,0.4)] disabled:opacity-50 ring-2 ring-purple-400"
              ></button>
              <span className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">Tap to Scan Cover</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}