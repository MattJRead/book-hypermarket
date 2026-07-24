'use client';

import { useTheme } from '../components/ThemeProvider';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

export default function FloatingMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isAppearanceOpen, setIsAppearanceOpen] = useState(false); // Added Appearance State
  const [userId, setUserId] = useState<string | null>(null);
  
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) setUserId(session.user.id);
    }
    checkUser();
  }, []);

  const isDarkUI = theme === 'dark' || theme === 'true-dark';

  return (
    <>
      <div className={`fixed bottom-28 left-1/2 -translate-x-1/2 z-40 w-72 rounded-2xl shadow-2xl border overflow-hidden transition-all duration-300 ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'} ${isDarkUI ? 'bg-[#111827] border-gray-800' : 'bg-white border-gray-200'}`}>
        <div className="flex flex-col max-h-[75vh] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-700 [&::-webkit-scrollbar-track]:bg-transparent">
          
          {/* THE SIGNED-IN USER HUB */}
          {userId ? (
            <>
              <button 
                type="button"
                onClick={() => setIsAccountOpen(!isAccountOpen)} 
                className={`px-6 py-4 font-bold text-center border-b flex justify-between items-center transition-colors ${isDarkUI ? 'border-gray-800 text-white hover:bg-gray-800' : 'border-gray-100 text-gray-900 hover:bg-gray-50'}`}
              >
                <span className="flex items-center"><svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> My Account</span>
                <svg className={`w-4 h-4 transition-transform ${isAccountOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
              </button>
              
              {/* Upgraded from max-h-64 to max-h-[500px] to prevent clipping */}
              <div className={`overflow-hidden transition-all bg-black/20 ${isAccountOpen ? 'max-h-[500px]' : 'max-h-0'}`}>
                <Link href="/bookshelf" className={`block px-6 py-3 font-bold text-sm text-center border-b transition-colors ${isDarkUI ? 'border-gray-800 text-sky-400 hover:bg-gray-800' : 'border-gray-100 text-sky-600 hover:bg-gray-50'}`}>
                  My Bookshelf
                </Link>
                
                {/* 🔽 INJECTED BOOK CLUB LINK */}
                <Link href="/club" className={`block px-6 py-3 font-bold text-sm text-center border-b transition-colors ${isDarkUI ? 'border-gray-800 text-indigo-400 hover:bg-gray-800' : 'border-gray-100 text-indigo-600 hover:bg-gray-50'}`}>
                  My Book Clubs
                </Link>

                <Link href="/wishlist" className={`block px-6 py-3 font-bold text-sm text-center border-b transition-colors ${isDarkUI ? 'border-gray-800 text-emerald-400 hover:bg-gray-800' : 'border-gray-100 text-emerald-600 hover:bg-gray-50'}`}>
                  My Wishlist
                </Link>
                <button type="button" onClick={async () => { await supabase.auth.signOut(); window.location.href='/'; }} className={`w-full px-6 py-3 font-bold text-sm text-center text-red-400 transition-colors ${isDarkUI ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}>
                  Sign Out
                </button> 
              </div>
            </>
          ) : (
            <Link href="/login" className={`px-6 py-4 font-bold flex items-center justify-center border-b transition-colors ${isDarkUI ? 'text-white border-gray-800 hover:bg-gray-800' : 'text-gray-900 border-gray-100 hover:bg-gray-50'}`}>
              <svg className="w-5 h-5 mr-3 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              Sign In / Account
            </Link>
          )}

          {/* GLOBAL LINKS */}
          <Link href="/" className={`px-6 py-4 font-bold text-center border-b transition-colors ${isDarkUI ? 'border-gray-800 text-sky-400 hover:bg-gray-800' : 'border-gray-100 text-sky-600 hover:bg-gray-50'}`}>
            Storefront Home
          </Link>
          <Link href="/partners" className={`px-6 py-4 font-bold text-center border-b transition-colors ${isDarkUI ? 'border-gray-800 text-white hover:bg-gray-800' : 'border-gray-100 text-gray-900 hover:bg-gray-50'}`}>
            Trusted Partners
          </Link>
          <Link href="/retailers" className={`px-6 py-4 font-bold text-center border-b transition-colors ${isDarkUI ? 'border-gray-800 text-white hover:bg-gray-800' : 'border-gray-100 text-gray-900 hover:bg-gray-50'}`}>
            For Retailers
          </Link>
          <Link href="/about" className={`px-6 py-4 font-bold text-center border-b transition-colors ${isDarkUI ? 'border-gray-800 text-white hover:bg-gray-800' : 'border-gray-100 text-gray-900 hover:bg-gray-50'}`}>
            About Us
          </Link>

          {/* INSTAGRAM LINK */}
          <a 
            href="https://www.instagram.com/bookhypermarket/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className={`px-6 py-4 font-bold flex items-center justify-center border-b transition-colors ${isDarkUI ? 'border-gray-800 text-pink-400 hover:bg-gray-800' : 'border-gray-100 text-pink-600 hover:bg-gray-50'}`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            Instagram
          </a>

          {/* 🔽 UPGRADED APPEARANCE ACCORDION */}
          <button 
            type="button"
            onClick={() => setIsAppearanceOpen(!isAppearanceOpen)} 
            className={`w-full px-6 py-4 font-bold flex justify-between items-center transition-colors ${isDarkUI ? 'bg-black/30 text-gray-400 hover:bg-gray-800' : 'bg-gray-50/50 text-gray-500 hover:bg-gray-100'}`}
          >
            <span className="text-[10px] font-black uppercase tracking-widest">Appearance</span>
            <svg className={`w-4 h-4 transition-transform ${isAppearanceOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
          </button>
          
          <div className={`overflow-hidden transition-all ${isDarkUI ? 'bg-black/30' : 'bg-gray-50/50'} ${isAppearanceOpen ? 'max-h-[400px]' : 'max-h-0'}`}>
            <div className="p-4 pt-2 grid grid-cols-2 gap-2">
              
              <button type="button" onClick={() => setTheme('light')} className={`p-3 rounded-xl text-xs font-bold flex flex-col items-center gap-2 transition-all ${theme === 'light' ? 'bg-sky-500 text-white shadow-md ring-2 ring-sky-500 ring-offset-2 ring-offset-gray-900' : isDarkUI ? 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                Soft Light
              </button>

              <button type="button" onClick={() => setTheme('true-light')} className={`p-3 rounded-xl text-xs font-bold flex flex-col items-center gap-2 transition-all ${theme === 'true-light' ? 'bg-sky-500 text-white shadow-md ring-2 ring-sky-500 ring-offset-2 ring-offset-gray-900' : isDarkUI ? 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364 6.364l-1.414-1.414M7.05 7.05L5.636 5.636m12.728 0l-1.414 1.414M7.05 16.95l-1.414 1.414M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                Pure White
              </button>

              <button type="button" onClick={() => setTheme('dark')} className={`p-3 rounded-xl text-xs font-bold flex flex-col items-center gap-2 transition-all ${theme === 'dark' ? 'bg-sky-500 text-white shadow-md ring-2 ring-sky-500 ring-offset-2 ring-offset-gray-900' : isDarkUI ? 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                Soft Dark
              </button>

              <button type="button" onClick={() => setTheme('true-dark')} className={`p-3 rounded-xl text-xs font-bold flex flex-col items-center gap-2 transition-all ${theme === 'true-dark' ? 'bg-sky-500 text-white shadow-md ring-2 ring-sky-500 ring-offset-2 ring-offset-gray-900' : isDarkUI ? 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" /></svg>
                OLED Black
              </button>

            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bookOpen {
          0% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.1) rotate(-5deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        .open-state .animate-book {
          animation: bookOpen 0.6s ease-in-out;
        }
      `}</style>

      <button 
        type="button"
        onClick={() => setIsMenuOpen(!isMenuOpen)} 
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 p-5 rounded-2xl shadow-[0_10px_30px_rgba(14,165,233,0.4)] transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center ${isMenuOpen ? 'open-state' : ''} ${isDarkUI ? 'bg-[#0ea5e9] text-white' : 'bg-gray-900 text-white'}`}
      >
        <div className="relative w-8 h-8">
          <div className="relative w-8 h-8">
          <svg 
            className={`absolute inset-0 w-full h-full transition-all duration-300 transform ${isMenuOpen ? 'opacity-0 scale-50 rotate-90' : 'opacity-100 scale-100 rotate-0'} animate-book`} 
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
          
          <svg 
            className={`absolute inset-0 w-full h-full transition-all duration-300 transform ${isMenuOpen ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 -rotate-90'}`} 
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </div>
        </div>
      </button>

      {isMenuOpen && <div className="fixed inset-0 z-30" onClick={() => setIsMenuOpen(false)}></div>}
    </>
  );
}