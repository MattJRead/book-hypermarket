'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

export default function FloatingMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [currentTheme, setCurrentTheme] = useState('black');

  useEffect(() => {
    // Determine Auth State
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Initialize Theme
    const savedTheme = typeof window !== 'undefined' ? localStorage.getItem('network-theme') || 'black' : 'black';
    setCurrentTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    return () => subscription.unsubscribe();
  }, []);

  const changeTheme = (newTheme: string) => {
    setCurrentTheme(newTheme);
    localStorage.setItem('network-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsOpen(false);
    window.location.href = '/';
  };

  return (
    <>
      {/* Background Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Menu Container */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3">
        
        {isOpen && (
          <div className="flex flex-col w-[300px] gap-3 max-h-[75vh] overflow-y-auto px-2 pb-2 scrollbar-hide">
            
            {/* 1. Conditional Profile Dropdown */}
            <div className="flex flex-col gap-2 w-full">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)} 
                className="theme-element w-full px-6 py-4 rounded-full font-bold text-center border flex justify-between items-center"
              >
                <span>Profile</span>
                <span className="text-xs">{isProfileOpen ? '▲' : '▼'}</span>
              </button>
              
              {isProfileOpen && (
                <div className="flex flex-col gap-2 w-[90%] self-end">
                  {!session ? (
                    <>
                      <Link href="/login" onClick={() => setIsOpen(false)} className="theme-element w-full px-6 py-3 rounded-full font-bold text-center border text-sm">Sign In</Link>
                      <Link href="/signup" onClick={() => setIsOpen(false)} className="theme-element w-full px-6 py-3 rounded-full font-bold text-center border text-sm">Sign Up</Link>
                    </>
                  ) : (
                    <>
                      <Link href="/profile" onClick={() => setIsOpen(false)} className="theme-element w-full px-6 py-3 rounded-full font-bold text-center border text-sm">My Profile</Link>
                      <Link href="/club" onClick={() => setIsOpen(false)} className="theme-element w-full px-6 py-3 rounded-full font-bold text-center border text-sm">Book Clubs</Link>
                      <Link href="/wishlist" onClick={() => setIsOpen(false)} className="theme-element w-full px-6 py-3 rounded-full font-bold text-center border text-sm">Wishlist</Link>
                      <Link href="/bookshelf" onClick={() => setIsOpen(false)} className="theme-element w-full px-6 py-3 rounded-full font-bold text-center border text-sm">Book Shelf</Link>
                      <button onClick={handleSignOut} className="theme-element w-full px-6 py-3 rounded-full font-bold text-center border text-sm text-red-500 hover:text-red-400">Sign Out</button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* 2. Main Navigation Links */}
            <Link href="/" onClick={() => setIsOpen(false)} className="theme-element w-full px-6 py-4 rounded-full font-bold text-center border">Home</Link>
            <Link href="/partners" onClick={() => setIsOpen(false)} className="theme-element w-full px-6 py-4 rounded-full font-bold text-center border">Trusted Partners</Link>
            <Link href="/about" onClick={() => setIsOpen(false)} className="theme-element w-full px-6 py-4 rounded-full font-bold text-center border">About Us</Link>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="theme-element w-full px-6 py-4 rounded-full font-bold text-center border">Instagram</a>

            {/* 3. Appearance Switcher */}
            <div className="theme-element w-full p-4 border rounded-full flex justify-center items-center gap-4 mt-2">
              <button onClick={() => changeTheme('black')} className={`w-8 h-8 rounded-full bg-black border-[3px] ${currentTheme === 'black' ? 'border-[#00bfff] scale-110' : 'border-gray-600'}`} title="Black" />
              <button onClick={() => changeTheme('dark-grey')} className={`w-8 h-8 rounded-full bg-[#1f2937] border-[3px] ${currentTheme === 'dark-grey' ? 'border-[#00bfff] scale-110' : 'border-gray-500'}`} title="Dark Grey" />
              <button onClick={() => changeTheme('light-grey')} className={`w-8 h-8 rounded-full bg-[#f3f4f6] border-[3px] ${currentTheme === 'light-grey' ? 'border-[#00bfff] scale-110' : 'border-gray-400'}`} title="Light Grey" />
              <button onClick={() => changeTheme('white')} className={`w-8 h-8 rounded-full bg-white border-[3px] ${currentTheme === 'white' ? 'border-[#00bfff] scale-110' : 'border-gray-300'}`} title="White" />
            </div>
          </div>
        )}

        {/* Master Toggle Button */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="theme-element w-16 h-16 rounded-full border-2 flex items-center justify-center transition-transform hover:scale-105 z-50"
        >
          {isOpen ? (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
          ) : (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          )}
        </button>
      </div>
    </>
  );
}