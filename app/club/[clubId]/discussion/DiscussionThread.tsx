'use client';

import { useState } from 'react';

export default function DiscussionThread({ review }: { review: any }) {
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <div className="bg-gray-800 rounded-lg p-5 shadow-md border border-gray-700 w-full mb-4">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
          Chapter {review.chapter} Discussion
        </span>
        <span className="text-xs text-gray-400 font-medium">
          Reader {review.user_id.substring(0,5)}
        </span>
      </div>

      {/* The Spoiler Lock */}
      {!isRevealed ? (
        <div 
          onClick={() => setIsRevealed(true)}
          className="bg-gray-900/50 h-24 flex flex-col items-center justify-center cursor-pointer rounded border border-gray-600 border-dashed hover:bg-gray-700 transition"
        >
          <span className="text-sm font-bold text-gray-300 text-center px-4 flex items-center gap-2">
            <span>🔒</span> Click to unlock this review
          </span>
          <span className="text-xs text-gray-500 mt-1">
            Contains spoilers for Chapter {review.chapter}
          </span>
        </div>
      ) : (
        <div className="animate-in fade-in duration-300">
          <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">
            {review.review_text}
          </p>
          
          {/* Foundation for the reply system we will build later */}
          <div className="mt-4 pt-3 border-t border-gray-700 flex justify-end">
            <button className="text-xs font-bold text-blue-400 hover:text-blue-300 uppercase tracking-wide">
              Reply to Thread
            </button>
          </div>
        </div>
      )}
    </div>
  );
}