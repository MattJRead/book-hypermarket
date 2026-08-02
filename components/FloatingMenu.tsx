'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

export default function FloatingMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <>
      {/* Background Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Menu Container */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center">
        
        {/* The Expanded Pill Menu */}
        {isOpen && (
          <div className="mb-6 bg-gray-900/95 border border-gray-700 p-6 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.8)] flex flex-col items-center gap-3 w-[300px]">
            
            <h3 className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2">Navigation</h3>
            
            <Link href="/profile" onClick={() => setIsOpen(false)} className="w-full text-center bg-gray-800 hover:bg-[#00bfff] text-white font-bold py-3.5 px-6 rounded-full transition-colors border border-gray-700 hover:border-[#00bfff]">
              Profile 👤
            </Link>
            
            <Link href="/bookshelf" onClick={() => setIsOpen(false)} className="w-full text-center bg-gray-800 hover:bg-blue-600 text-white font-bold py-3.5 px-6 rounded-full transition-colors border border-gray-700 hover:border-blue-500">
              My Bookshelf
            </Link>

            <Link href="/club" onClick={() => setIsOpen(false)} className="w-full text-center bg-gray-800 hover:bg-blue-600 text-white font-bold py-3.5 px-6 rounded-full transition-colors border border-gray-700 hover:border-blue-500">
              My Book Clubs
            </Link>

            <Link href="/wishlist" onClick={() => setIsOpen(false)} className="w-full text-center bg-gray-800 hover:bg-blue-600 text-white font-bold py-3.5 px-6 rounded-full transition-colors border border-gray-700 hover:border-blue-500">
              My Wishlist
            </Link>

            <div className="w-2/3 h-px bg-gray-700 my-2"></div>

            <Link href="/" onClick={() => setIsOpen(false)} className="w-full text-center bg-gray-800 hover:bg-blue-600 text-white font-bold py-3.5 px-6 rounded-full transition-colors border border-gray-700 hover:border-blue-500">
              Storefront Home
            </Link>

            <button onClick={handleSignOut} className="w-full text-center bg-red-900/20 hover:bg-red-600 text-red-400 hover:text-white font-bold py-3.5 px-6 rounded-full transition-colors border border-red-900/50 hover:border-red-500 mt-2">
              Sign Out
            </button>
          </div>
        )}

        {/* The Toggle Button */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="bg-[#00bfff] hover:bg-blue-400 text-white w-14 h-14 rounded-2xl shadow-[0_0_20px_rgba(0,191,255,0.4)] transition-transform hover:scale-110 flex items-center justify-center border border-[#00bfff]/50 z-50"
        >
          {isOpen ? (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
          ) : (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
          )}
        </button>
      </div>
    </>
  );
}