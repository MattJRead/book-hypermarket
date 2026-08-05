'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

export default function FloatingMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(true);
  const [isAppearanceOpen, setIsAppearanceOpen] = useState(false);
  
  const [currentTheme, setCurrentTheme] = useState('dark');
  const [mounted, setMounted] = useState(false);

  // Native Theme Engine: Bypasses Next.js build constraints entirely
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('network-theme') || 'dark';
    setCurrentTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const changeTheme = (newTheme: string) => {
    setCurrentTheme(newTheme);
    localStorage.setItem('network-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center">
        
        {isOpen && (
          <div className="mb-6 bg-gray-900/95 border border-gray-700 p-5 md:p-6 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.8)] flex flex-col w-[320px] max-h-[75vh] overflow-y-auto">
            
            <ul className="w-full flex flex-col gap-4">
              
              {/* MY ACCOUNT */}
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
                    <li><Link href="/bookshelf" onClick={() => setIsOpen(false)} className="block w-full text-center bg-gray-800 hover:bg-cyan-600 text-cyan-400 hover:text-white font-bold py-3 px-6 rounded-full transition-colors border border-gray-700 hover:border-cyan-500 shadow-sm">My Bookshelf</Link></li>
                    <li><Link href="/club" onClick={() => setIsOpen(false)} className="block w-full text-center bg-gray-800 hover:bg-purple-600 text-purple-400 hover:text-white font-bold py-3 px-6 rounded-full transition-colors border border-gray-700 hover:border-purple-500 shadow-sm">My Book Clubs</Link></li>
                    <li><Link href="/profile" onClick={() => setIsOpen(false)} className="block w-full text-center bg-gray-800 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full transition-colors border border-gray-700 hover:border-blue-500 shadow-sm">Profile</Link></li>
                    <li><Link href="/wishlist" onClick={() => setIsOpen(false)} className="block w-full text-center bg-gray-800 hover:bg-emerald-600 text-emerald-400 hover:text-white font-bold py-3 px-6 rounded-full transition-colors border border-gray-700 hover:border-emerald-500 shadow-sm">My Wishlist</Link></li>
                    <li><button onClick={handleSignOut} className="w-full text-center bg-gray-800 hover:bg-red-600 text-red-400 hover:text-white font-bold py-3 px-6 rounded-full transition-colors border border-gray-700 hover:border-red-500 shadow-sm">Sign Out</button></li>
                  </ul>
                )}
              </li>

              {/* MAIN LINKS */}
              <li className="w-full flex flex-col gap-3 px-2 mt-2">
                <Link href="/" onClick={() => setIsOpen(false)} className="block w-full text-center bg-gray-800 hover:bg-blue-500 text-blue-400 hover:text-white font-bold py-3 px-6 rounded-full transition-colors border border-gray-700 hover:border-blue-400 shadow-sm">Storefront Home</Link>
                <Link href="/partners" onClick={() => setIsOpen(false)} className="block w-full text-center bg-gray-800 hover:bg-gray-600 text-gray-300 hover:text-white font-bold py-3 px-6 rounded-full transition-colors border border-gray-700 shadow-sm">Trusted Partners</Link>
                <Link href="/retailers" onClick={() => setIsOpen(false)} className="block w-full text-center bg-gray-800 hover:bg-gray-600 text-gray-300 hover:text-white font-bold py-3 px-6 rounded-full transition-colors border border-gray-700 shadow-sm">For Retailers</Link>
                <Link href="/about" onClick={() => setIsOpen(false)} className="block w-full text-center bg-gray-800 hover:bg-gray-600 text-gray-300 hover:text-white font-bold py-3 px-6 rounded-full transition-colors border border-gray-700 shadow-sm">About Us</Link>
              </li>

              {/* APPEARANCE */}
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
                    <li><button onClick={() => changeTheme('light')} className={`w-full text-center font-bold py-3 px-6 rounded-full transition-colors border shadow-sm ${currentTheme === 'light' ? 'bg-yellow-600 text-white border-yellow-500' : 'bg-gray-800 hover:bg-yellow-600 text-yellow-400 hover:text-white border-gray-700 hover:border-yellow-500'}`}>Bright Light</button></li>
                    <li><button onClick={() => changeTheme('cream')} className={`w-full text-center font-bold py-3 px-6 rounded-full transition-colors border shadow-sm ${currentTheme === 'cream' ? 'bg-orange-600 text-white border-orange-500' : 'bg-gray-800 hover:bg-orange-600 text-orange-400 hover:text-white border-gray-700 hover:border-orange-500'}`}>Cream Light</button></li>
                    <li><button onClick={() => changeTheme('dark')} className={`w-full text-center font-bold py-3 px-6 rounded-full transition-colors border shadow-sm ${currentTheme === 'dark' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-gray-800 hover:bg-indigo-600 text-indigo-400 hover:text-white border-gray-700 hover:border-indigo-500'}`}>Dark Mode</button></li>
                    <li><button onClick={() => changeTheme('true-dark')} className={`w-full text-center font-bold py-3 px-6 rounded-full transition-colors border shadow-sm ${currentTheme === 'true-dark' ? 'bg-black text-white border-gray-600' : 'bg-gray-800 hover:bg-gray-900 text-gray-400 hover:text-white border-gray-700 hover:border-gray-600'}`}>True Dark</button></li>
                  </ul>
                )}
              </li>

            </ul>
          </div>
        )}

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