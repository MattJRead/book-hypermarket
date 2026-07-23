'use client';

import { useState } from 'react';

export default function StickyNote({ quote }: { quote: any }) {
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <div className="bg-yellow-200 text-gray-900 p-5 shadow-lg rounded-sm transform transition hover:-translate-y-1 hover:shadow-xl w-full -rotate-1 hover:rotate-0 relative">
      
      {/* Tape Graphic for visual flair */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 w-16 h-5 bg-white/40 backdrop-blur-sm border border-white/20 rotate-2 shadow-sm"></div>

      {/* Header */}
      <div className="flex justify-between items-center mb-3 border-b border-yellow-300 pb-2 mt-2">
        <span className="text-xs font-bold uppercase tracking-wider text-yellow-700">Chapter {quote.chapter}</span>
        <span className="text-xs text-yellow-600 font-medium">Reader {quote.user_id.substring(0,5)}</span>
      </div>

      {/* The Spoiler Lock */}
      {!isRevealed ? (
        <div 
          onClick={() => setIsRevealed(true)}
          className="bg-yellow-300/60 backdrop-blur-sm h-32 flex flex-col items-center justify-center cursor-pointer rounded border border-yellow-400 border-dashed hover:bg-yellow-300 transition"
        >
          <span className="text-xl mb-2">🔒</span>
          <span className="text-sm font-bold text-yellow-800 text-center px-4">
            Click to reveal quote
            <br />
            <span className="text-xs font-normal">May contain Chapter {quote.chapter} spoilers</span>
          </span>
        </div>
      ) : (
        <div className="min-h-[8rem] flex flex-col justify-between">
          <p className="font-serif text-lg leading-relaxed mb-4 text-gray-800">
            "{quote.quote_text}"
          </p>
          {quote.character_attribution && (
            <p className="text-right text-sm font-bold text-yellow-800">
              — {quote.character_attribution}
            </p>
          )}
          
          {/* Reaction Bar (Foundation for the emoji system) */}
          <div className="mt-4 pt-3 border-t border-yellow-300/50 flex gap-2">
            <button className="text-sm hover:scale-125 transition bg-yellow-300/50 rounded px-2 py-1">🔥</button>
            <button className="text-sm hover:scale-125 transition bg-yellow-300/50 rounded px-2 py-1">🤯</button>
            <button className="text-sm hover:scale-125 transition bg-yellow-300/50 rounded px-2 py-1">😭</button>
          </div>
        </div>
      )}
    </div>
  );
}