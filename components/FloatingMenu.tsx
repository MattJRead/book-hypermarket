'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

export default function FloatingMenu({ isDarkMode = true, toggleTheme }: { isDarkMode?: boolean, toggleTheme?: () => void }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) setUserId(session.user.id);
    }
    checkUser();
  }, []);

  return (
    <>
      <div className={`fixed bottom-28 left-1/2 -translate-x-1/2 z-40 w-72 rounded-2xl shadow-2xl border overflow-hidden transition-all duration-300 ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'} ${isDarkMode ? 'bg-[#111827] border-gray-800' : 'bg-white border-gray-200'}`}>
        <div className="flex flex-col max-h-[60vh] overflow-y-auto">
          
          {/* THE SIGNED-IN USER HUB (ACCORDION) */}
          {userId ? (
            <>
              <button 
                onClick={() => setIsAccountOpen(!isAccountOpen)} 
                className={`px-6 py-4 font-bold text-center border-b flex justify-between items-center transition-colors ${isDarkMode ? 'border-gray-800 text-white hover:bg-gray-800' : 'border-gray-100 text-gray-900 hover:bg-gray-50'}`}
              >
                <span className="flex items-center"><svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> My Account</span>
                <svg className={`w-4 h-4 transition-transform ${isAccountOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
              </button>
              
              <div className={`overflow-hidden transition-all bg-black/20 ${isAccountOpen ? 'max-h-64' : 'max-h-0'}`}>
                <Link href="/bookshelf" className={`block px-6 py-3 font-bold text-sm text-center border-b transition-colors ${isDarkMode ? 'border-gray-800 text-sky-400 hover:bg-gray-800' : 'border-gray-100 text-sky-600 hover:bg-gray-50'}`}>
                  My Bookshelf
                </Link>
                <Link href="/wishlist" className={`block px-6 py-3 font-bold text-sm text-center border-b transition-colors ${isDarkMode ? 'border-gray-800 text-emerald-400 hover:bg-gray-800' : 'border-gray-100 text-emerald-600 hover:bg-gray-50'}`}>
                  My Wishlist
                </Link>
                <button onClick={async () => { await supabase.auth.signOut(); window.location.href='/'; }} className={`w-full px-6 py-3 font-bold text-sm text-center text-red-400 transition-colors ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}>
                  Sign Out
                </button> 
              </div>
            </>
          ) : (
            <Link href="/login" className={`px-6 py-4 font-bold flex items-center justify-center border-b text-white transition-colors ${isDarkMode ? 'border-gray-800 hover:bg-gray-800' : 'border-gray-100 hover:bg-gray-50'}`}>
              <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              My Account
            </Link>
          )}

          {/* GLOBAL LINKS */}
          <Link href="/partners" className={`px-6 py-4 font-bold text-center border-b transition-colors ${isDarkMode ? 'border-gray-800 text-white hover:bg-gray-800' : 'border-gray-100 text-gray-900 hover:bg-gray-50'}`}>
            Partners
          </Link>
          <Link href="/retailers" className={`px-6 py-4 font-bold text-center border-b transition-colors ${isDarkMode ? 'border-gray-800 text-white hover:bg-gray-800' : 'border-gray-100 text-gray-900 hover:bg-gray-50'}`}>
            For Retailers
          </Link>
          <Link href="/about" className={`px-6 py-4 font-bold text-center border-b transition-colors ${isDarkMode ? 'border-gray-800 text-white hover:bg-gray-800' : 'border-gray-100 text-gray-900 hover:bg-gray-50'}`}>
            About Us
          </Link>

          {/* CONTROLS */}
          {toggleTheme && (
            <button onClick={() => { toggleTheme(); setIsMenuOpen(false); }} className={`px-6 py-4 font-bold flex items-center justify-center transition-colors ${isDarkMode ? 'text-gray-400 hover:bg-gray-800 hover:text-white' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
          )}
        </div>
      </div>

      <button 
        onClick={() => setIsMenuOpen(!isMenuOpen)} 
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 p-4 rounded-full shadow-[0_0_30px_rgba(14,165,233,0.3)] transition-transform hover:scale-110 active:scale-95 flex items-center justify-center ${isDarkMode ? 'bg-[#0ea5e9] text-white' : 'bg-gray-900 text-white'}`}
      >
        <div className="relative w-7 h-7">
          {/* Closed Book Icon */}
          <svg 
            className={`absolute inset-0 w-full h-full transition-all duration-300 transform ${isMenuOpen ? 'opacity-0 scale-50 rotate-90' : 'opacity-100 scale-100 rotate-0'}`} 
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
          </svg>
          
          {/* Open Book / X Icon */}
          <svg 
            className={`absolute inset-0 w-full h-full transition-all duration-300 transform ${isMenuOpen ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 -rotate-90'}`} 
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            <path d="M12 3v18" />
          </svg>
        </div>
      </button>

      {isMenuOpen && <div className="fixed inset-0 z-30" onClick={() => setIsMenuOpen(false)}></div>}
    </>
  );
}