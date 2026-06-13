'use client';

import { useState, useRef } from 'react';
import Tesseract from 'tesseract.js';

export default function CoverScanner({ onScan, isDarkMode }: { onScan: (text: string) => void, isDarkMode: boolean }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);

    try {
      // Engage the Tesseract Neural Network
      const { data: { text } } = await Tesseract.recognize(
        file,
        'eng',
        { logger: m => console.log("OCR Progress:", m.status, Math.round(m.progress * 100) + "%") }
      );

      // Clean the extracted data (remove line breaks and excessive spaces)
      const cleanedText = text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();

      if (cleanedText) {
        onScan(cleanedText);
      } else {
        alert("The AI could not read the text on this cover. Please try a different angle.");
      }
    } catch (error) {
      console.error("AI Misfire:", error);
    }

    setIsAnalyzing(false);
    
    // Reset the input so the user can scan another book immediately
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      {/* The hidden native mobile camera trigger */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={fileInputRef}
        onChange={handleCapture}
        className="hidden"
      />
      
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isAnalyzing}
        className={`absolute right-14 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors ${isDarkMode ? 'text-gray-400 hover:text-purple-400 hover:bg-gray-800' : 'text-gray-500 hover:text-purple-600 hover:bg-gray-200'} ${isAnalyzing ? 'animate-pulse text-purple-500' : ''}`}
        title="Scan Book Cover (AI OCR)"
      >
        {isAnalyzing ? (
           <svg className="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        ) : (
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        )}
      </button>
    </>
  );
}