'use client';
import { useState } from 'react';

export default function StickyNote({ quote, index }: { quote: any, index: number }) {
  const [isUnlocked, setIsUnlocked] = useState(false);

  const colors = [
    'bg-yellow-300', 
    'bg-pink-400', 
    'bg-green-400', 
    'bg-blue-300', 
    'bg-orange-400'
  ];
  const colorClass = colors[index % colors.length];

  const rotations = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2', '-rotate-3', 'rotate-3'];
  const rotationClass = rotations[index % rotations.length];

  const handwritingStyle = { fontFamily: '"Comic Sans MS", "Chalkboard SE", "Comic Neue", cursive' };

  if (!isUnlocked) {
    return (
      <div 
        onClick={() => setIsUnlocked(true)}
        className={`${colorClass} ${rotationClass} p-5 rounded-sm shadow-[3px_4px_10px_rgba(0,0,0,0.4)] cursor-pointer transition-transform hover:scale-105 flex flex-col items-center justify-center min-h-[140px] relative overflow-hidden text-gray-900 border-t border-white/40`}
      >
        <div className="absolute top-0 right-0 w-6 h-6 bg-black/10 rounded-bl-lg shadow-sm"></div>
        
        <span className="text-3xl mb-2 drop-shadow-md">🔒</span>
        <p className="font-bold text-center text-sm uppercase tracking-widest drop-shadow-sm">Spoiler</p>
        <p className="text-sm text-center font-bold drop-shadow-sm">Chapter {quote.chapter || '?'}</p>
      </div>
    );
  }

  return (
    <div 
      className={`${colorClass} ${rotationClass} p-5 rounded-sm shadow-[3px_4px_10px_rgba(0,0,0,0.4)] min-h-[140px] relative text-gray-900 border-t border-white/40 flex flex-col justify-between`}
    >
      <div className="absolute top-0 right-0 w-6 h-6 bg-black/10 rounded-bl-lg shadow-sm"></div>
      
      <div className="mb-4">
        {/* Removed the hardcoded quotes so manual punctuation looks perfect */}
        <p style={handwritingStyle} className="text-lg leading-relaxed font-semibold">
          {quote.quote_text}
        </p>
        
        {/* Only renders the speaker line if they actually typed one */}
        {quote.speaker && (
          <p style={handwritingStyle} className="text-right text-md font-bold mt-2 opacity-90">
            - {quote.speaker}
          </p>
        )}
      </div>
      
      <p style={handwritingStyle} className="text-right text-sm font-black opacity-70">
        Ch. {quote.chapter || '?'}
      </p>
    </div>
  );
}