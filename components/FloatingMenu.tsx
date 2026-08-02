'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import { useTheme } from 'next-themes';

export default function FloatingMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(true);
  const [isAppearanceOpen, setIsAppearanceOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // THE FAILSAFE: Prevents build crashes if Next.js caches an old layout or renders a raw page
  let safeTheme = 'dark';
  let safeSetTheme = (t: string) => {};
  try {
    const themeContext = useTheme();
    safeTheme = themeContext.theme || 'dark';
    safeSetTheme = themeContext.setTheme;
  } catch (error) {
    console.warn("FloatingMenu: ThemeProvider is missing on this specific page.");
  }

  const theme = safeTheme;
  const setTheme = safeSetTheme;

  useEffect(() => {
    setMounted(true);
  }, []);

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
        
        {/* The Expanded Nested Menu */}
        {isOpen && (
          <div className="mb-6 bg-gray-900/95 border border-gray-700 p-5 md:p-6 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.8)] flex flex-col w-[320px] max-h-[75vh] overflow-y-auto">
            
            <ul className="w-full flex flex-col gap-4">
              
              {/* 1. MY ACCOUNT SECTION */}
              <li className="w-full">
                <button 
                  onClick={() => setIsAccountOpen(!isAccountOpen)}
                  className="w-full flex justify-between items-center text-gray-300 font-bold px-2 py-2 hover:text-white transition-colors border-b border-gray-700/50"
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    My Account
                  </span>
                  <svg className={`w-4 h-4 transition-transform ${isAccountOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>

                {isAccountOpen && (
                  <ul className="w-full flex flex-col gap-3 mt-4 px-2">
                    <li>
                      <Link href="/bookshelf" onClick={() => setIsOpen(false)} className="block w-full text-center bg-gray-800 hover:bg-cyan-600 text-cyan-400 hover:text-white font-bold py-3 px-6 rounded-full transition-colors border border-gray-700 hover:border-cyan-500 shadow-sm">
                        My Bookshelf
                      </Link>
                    </li>
                    <li>
                      <Link href="/club" onClick={() => setIsOpen(false)} className="block w-full text-center bg-gray-800 hover:bg-purple-600 text-purple-400 hover:text-white font-bold py-3 px-6 rounded-full transition-colors border border-gray-700 hover:border-purple-500 shadow-sm">
                        My Book Clubs
                      </Link>
                    </li>
                    <li>
                      <Link href="/profile" onClick={() => setIsOpen(false)} className="block w-full text-center bg-gray-800 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full transition-colors border border-gray-700 hover:border-blue-500 shadow-sm">
                        Profile
                      </Link>
                    </li>
                    <li>
                      <Link href="/wishlist" onClick={() => setIsOpen(false)} className="block w-full text-center bg-gray-800 hover:bg-emerald-600 text-emerald-400 hover:text-white font-bold py-3 px-6 rounded-full transition-colors border border-gray-700 hover:border-emerald-500 shadow-sm">
                        My Wishlist
                      </Link>
                    </li>
                    <li>
                      <button onClick={handleSignOut} className="w-full text-center bg-gray-800 hover:bg-red-600 text-red-400 hover:text-white font-bold py-3 px-6 rounded-full transition-colors border border-gray-700 hover:border-red-500 shadow-sm">
                        Sign Out
                      </button>
                    </li>
                  </ul>
                )}
              </li>

              {/* 2. MAIN LINKS SECTION */}
              <li className="w-full flex flex-col gap-3 px-2 mt-2">
                <Link href="/" onClick={() => setIsOpen(false)} className="block w-full text-center bg-gray-800 hover:bg-blue-500 text-blue-400 hover:text-white font-bold py-3 px-6 rounded-full transition-colors border border-gray-700 hover:border-blue-400 shadow-sm">
                  Storefront Home
                </Link>
                <Link href="/partners" onClick={() => setIsOpen(false)} className="block w-full text-center bg-gray-800 hover:bg-gray-600 text-gray-300 hover:text-white font-bold py-3 px-6 rounded-full transition-colors border border-gray-700 shadow-sm">
                  Trusted Partners
                </Link>
                <Link href="/retailers" onClick={() => setIsOpen(false)} className="block w-full text-center bg-gray-800 hover:bg-gray-600 text-gray-300 hover:text-white font-bold py-3 px-6 rounded-full transition-colors border border-gray-700 shadow-sm">
                  For Retailers
                </Link>
                <Link href="/about" onClick={() => setIsOpen(false)} className="block w-full text-center bg-gray-800 hover:bg-gray-600 text-gray-300 hover:text-white font-bold py-3 px-6 rounded-full transition-colors border border-gray-700 shadow-sm">
                  About Us
                </Link>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full text-center bg-gray-800 hover:bg-pink-600 text-pink-400 hover:text-white font-bold py-3 px-6 rounded-full transition-colors border border-gray-700 hover:border-pink-500 shadow-sm">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  Instagram
                </a>
              </li>

              {/* 3. APPEARANCE SECTION */}
              <li className="w-full mt-2 border-t border-gray-700/50 pt-4">
                <button 
                  onClick={() => setIsAppearanceOpen(!isAppearanceOpen)}
                  className="w-full flex justify-between items-center text-gray-300 font-bold px-2 py-2 hover:text-white transition-colors"
                >
                  <span className="text-xs uppercase tracking-widest">Appearance</span>
                  <svg className={`w-4 h-4 transition-transform ${isAppearanceOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>

                {isAppearanceOpen && mounted && (
                  <ul className="w-full flex flex-col gap-3 mt-4 px-2 pb-2">
                    <li>
                      <button 
                        onClick={() => setTheme('light')} 
                        className={`w-full text-center font-bold py-3 px-6 rounded-full transition-colors border shadow-sm ${theme === 'light' ? 'bg-yellow-600 text-white border-yellow-500' : 'bg-gray-800 hover:bg-yellow-600 text-yellow-400 hover:text-white border-gray-700 hover:border-yellow-500'}`}
                      >
                        Bright Light
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => setTheme('cream')} 
                        className={`w-full text-center font-bold py-3 px-6 rounded-full transition-colors border shadow-sm ${theme === 'cream' ? 'bg-orange-600 text-white border-orange-500' : 'bg-gray-800 hover:bg-orange-600 text-orange-400 hover:text-white border-gray-700 hover:border-orange-500'}`}
                      >
                        Cream Light
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => setTheme('dark')} 
                        className={`w-full text-center font-bold py-3 px-6 rounded-full transition-colors border shadow-sm ${theme === 'dark' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-gray-800 hover:bg-indigo-600 text-indigo-400 hover:text-white border-gray-700 hover:border-indigo-500'}`}
                      >
                        Dark Mode
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => setTheme('true-dark')} 
                        className={`w-full text-center font-bold py-3 px-6 rounded-full transition-colors border shadow-sm ${theme === 'true-dark' ? 'bg-black text-white border-gray-600' : 'bg-gray-800 hover:bg-gray-900 text-gray-400 hover:text-white border-gray-700 hover:border-gray-600'}`}
                      >
                        True Dark
                      </button>
                    </li>
                  </ul>
                )}
              </li>

            </ul>
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