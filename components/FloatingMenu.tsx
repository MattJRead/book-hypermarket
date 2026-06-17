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
      <div className={`fixed bottom-28 left-1/2 -translate-x-1/2 z-40 w-64 rounded-2xl shadow-2xl border overflow-hidden transition-all duration-300 ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'} ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex flex-col max-h-[60vh] overflow-y-auto">
          
          {/* THE SIGNED-IN USER HUB (ACCORDION) */}
          {userId ? (
            <>
              <button 
                onClick={() => setIsAccountOpen(!isAccountOpen)} 
                className={`px-6 py-4 font-bold text-center border-b flex justify-between items-center transition-colors ${isDarkMode ? 'border-gray-800 text-white hover:bg-gray-800' : 'border-gray-100 text-gray-900 hover:bg-gray-50'}`}
              >
                <span>👤 My Account</span>
                <svg className={`w-4 h-4 transition-transform ${isAccountOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
              </button>
              
              <div className={`overflow-hidden transition-all bg-black/10 ${isAccountOpen ? 'max-h-64' : 'max-h-0'}`}>
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
            <Link href="/login" className={`px-6 py-4 font-bold text-center border-b text-sky-400 transition-colors ${isDarkMode ? 'border-gray-800 hover:bg-gray-800' : 'border-gray-100 hover:bg-gray-50'}`}>
              Sign in / Sign up
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
            <button onClick={() => { toggleTheme(); setIsMenuOpen(false); }} className={`px-6 py-4 font-bold text-center transition-colors ${isDarkMode ? 'text-gray-400 hover:bg-gray-800 hover:text-white' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
              {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
          )}
        </div>
      </div>

      <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 p-4 rounded-full shadow-[0_0_30px_rgba(14,165,233,0.3)] transition-transform hover:scale-110 active:scale-95 flex items-center justify-center ${isDarkMode ? 'bg-sky-500 text-white' : 'bg-gray-900 text-white'}`}>
        {isMenuOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 8h16M4 16h16" /></svg>
        )}
      </button>

      {isMenuOpen && <div className="fixed inset-0 z-30" onClick={() => setIsMenuOpen(false)}></div>}
    </>
  );
}