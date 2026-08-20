'use client';

import { useState, useEffect } from 'react';

type ProgressModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (progress: { format: string; percentage: number; chapter: number }) => void;
  initialPercentage?: number;
  initialChapter?: number;
  initialFormat?: string;
};

export default function ProgressModal({
  isOpen,
  onClose,
  onSave,
  initialPercentage = 0,
  initialChapter = 0,
  initialFormat = 'Physical Book'
}: ProgressModalProps) {
  const [format, setFormat] = useState(initialFormat);
  const [percentage, setPercentage] = useState(initialPercentage);
  const [chapter, setChapter] = useState(initialChapter);

  useEffect(() => {
    if (isOpen) {
      setFormat(initialFormat);
      setPercentage(initialPercentage);
      setChapter(initialChapter);
    }
  }, [isOpen, initialFormat, initialPercentage, initialChapter]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="theme-element w-full max-w-sm p-6 rounded-3xl border flex flex-col gap-6">
        <h3 className="text-xl font-bold tracking-tight border-b pb-2 border-inherit">Log Your Progress</h3>
        
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-widest opacity-70">Reading Format</label>
          <div className="relative">
            <select 
              value={format} 
              onChange={(e) => setFormat(e.target.value)}
              className="w-full theme-element border rounded-xl p-3 pr-10 focus:outline-none focus:border-[#00bfff] transition cursor-pointer appearance-none"
            >
              <option value="Physical Book">📖 Physical Book</option>
              <option value="E-Book">📱 E-Book</option>
              <option value="Audiobook">🎧 Audiobook</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none opacity-50">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-widest opacity-70">Percentage Complete: {percentage}%</label>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={percentage} 
            onChange={(e) => setPercentage(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#00bfff]"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-widest opacity-70">Current Chapter</label>
          <input 
            type="number" 
            min="0"
            value={chapter} 
            onChange={(e) => setChapter(Number(e.target.value))}
            placeholder="e.g., 5"
            className="w-full theme-element border rounded-xl p-3 focus:outline-none focus:border-[#00bfff] transition"
          />
          <p className="text-[10px] opacity-50 mt-1">This powers the Smart Auto-Unlock for spoiler threads.</p>
        </div>

        <div className="flex gap-3 mt-4">
          <button 
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-bold transition-all border border-inherit hover:opacity-70"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              onSave({ format, percentage, chapter });
              onClose();
            }}
            className="flex-1 py-3 rounded-xl font-bold transition-all bg-[#00bfff] text-white hover:bg-[#009acd] border border-transparent"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}