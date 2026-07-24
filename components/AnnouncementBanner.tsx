'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AnnouncementBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if the user already dismissed the banner
    const dismissed = localStorage.getItem('dismissed_club_banner');
    if (!dismissed) {
      setIsVisible(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem('dismissed_club_banner', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-blue-900/80 to-indigo-900/80 border-b border-blue-500/30 px-4 py-2.5 flex justify-between items-center text-sm backdrop-blur-md relative z-50">
      <div className="flex-1 text-center text-blue-100">
        <span className="mr-2">📚</span>
        <span className="font-bold text-white tracking-wide">NEW:</span> You can now create and join private Book Clubs on Book Hypermarket! 
        <Link href="/club" className="ml-4 font-bold text-sky-400 hover:text-sky-300 underline decoration-sky-400/50 underline-offset-4 transition-colors">
          Explore Hub
        </Link>
      </div>
      <button 
        onClick={dismiss} 
        className="text-blue-300 hover:text-white transition-colors px-3 text-lg font-bold"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}