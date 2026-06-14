'use client';

import { useState, useRef } from 'react';

export default function CoverScanner({ isDarkMode, onScan }: { isDarkMode: boolean, onScan: (text: string) => void }) {
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);

    // Compress and convert the image to raw data for the AI
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64data = reader.result;

      try {
        // Beam the image to our Gemini API route
        const response = await fetch('/api/vision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64data })
        });

        const data = await response.json();

        if (data.success && data.extractedText) {
          // Send the AI's findings back to the storefront search bar
          onScan(data.extractedText);
        } else {
          console.error("Vision API Error:", data.error);
          alert("The AI could not read the cover. Please ensure the text is clear.");
        }
      } catch (error) {
        console.error("Network error:", error);
      }

      setIsScanning(false);
      // Reset the input so they can take another photo if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
  };

  return (
    <>
      {/* This hidden input is the secret weapon. 
        "capture=environment" forces mobile devices to open the rear camera natively. 
      */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isScanning}
        className={`absolute right-14 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors flex items-center gap-2 ${isDarkMode ? 'text-gray-400 hover:text-purple-400 hover:bg-gray-800' : 'text-gray-500 hover:text-purple-600 hover:bg-gray-200'} ${isScanning ? 'animate-pulse opacity-50 cursor-not-allowed' : ''}`}
        title="Scan Book Cover with AI"
      >
        {isScanning ? (
          <span className="text-[10px] font-bold tracking-widest text-purple-500 uppercase mt-1">
            [ Scanning... ]
          </span>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        )}
      </button>
    </>
  );
}