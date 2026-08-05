'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '../../lib/supabase';
import FloatingMenu from '../../components/FloatingMenu';
import { SpeedInsights } from "@vercel/speed-insights/next";

type Book = {
  id: string;
  title: string;
  author: string;
  isbn13: string;
  category: string;
  cover_image_url?: string; 
};

export default function Wishlist() {
  const [wishlistBooks, setWishlistBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 1. Native Theme Engine replaces useTheme to prevent build crashes
  const [isDarkUI, setIsDarkUI] = useState(true);

  useEffect(() => {
    // 2. Safely check the local storage on the client side
    const savedTheme = typeof window !== 'undefined' ? localStorage.getItem('network-theme') || 'dark' : 'dark';
    setIsDarkUI(savedTheme === 'dark' || savedTheme === 'true-dark');
  }, []);

  useEffect(() => {
    async function fetchWishlist() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Query the new wishlist table and join it with the books table
        const { data, error } = await supabase
          .from('user_wishlists')
          .select('book_id, books(*)')
          .eq('user_id', session.user.id);
          
        if (data && !error) {
          // Safely extract the nested book objects and filter out any potential nulls
          const extractedBooks = data
            .map(row => row.books)
            .flat()
            .filter(Boolean) as Book[];
            
          setWishlistBooks(extractedBooks);
        } else if (error) {
          console.error("Error fetching wishlist:", error);
        }
      }
      setIsLoading(false);
    }
    fetchWishlist();
  }, []);

  return (
    <main className={`min-h-screen flex flex-col py-12 transition-colors ${isDarkUI ? 'bg-gray-950 text-white' : 'bg-white text-gray-900'}`}>  
      
      {/* Centered Logo Section */}
      <div className="w-full flex justify-center mb-8">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <div className="flex items-baseline font-extrabold tracking-tighter">
            <span className={`text-4xl lowercase ${isDarkUI ? 'text-white' : 'text-gray-900'}`}>book</span>
            <span className="relative mx-1 text-5xl text-sky-400 italic inline-block px-1">
              Hyper
              <span className={`absolute left-0 right-0 h-[4px] top-[54%] -translate-y-1/2 ${isDarkUI ? 'bg-gray-950' : 'bg-white'}`}></span>
            </span>
            <span className={`text-4xl lowercase ${isDarkUI ? 'text-white' : 'text-gray-900'}`}>-market</span>
          </div>
        </Link>
      </div>

      <header className="flex flex-col justify-center items-center mb-12 w-full max-w-7xl mx-auto px-6 relative">
        <div className="w-full flex justify-start mb-6">
          <Link href="/" className={`px-6 py-2 rounded-full font-bold flex items-center transition-all hover:-translate-x-1 border shadow-sm ${isDarkUI ? 'bg-gray-800 text-white hover:bg-gray-700 border-gray-700' : 'bg-white text-gray-900 hover:bg-gray-50 border-gray-200'}`}>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg> 
            Back to Storefront
          </Link>
        </div>
        
        <h2 className="text-4xl font-extrabold tracking-tight text-emerald-400">
          🎯 My Wishlist
        </h2>
        <p className={`mt-2 font-mono text-sm ${isDarkUI ? 'text-gray-400' : 'text-gray-500'}`}>Tracking targets for price drops</p>
      </header>

      <div className="w-full relative z-10 max-w-7xl mx-auto px-6">
        {isLoading ? (
          <div className="text-center py-12 text-emerald-400 animate-pulse font-mono">[ Syncing Wishlist... ]</div>
        ) : wishlistBooks.length === 0 ? (
          <div className={`text-center py-20 border-2 border-dashed rounded-2xl ${isDarkUI ? 'border-gray-800 bg-gray-900/50' : 'border-gray-300 bg-gray-50'}`}>
            <h3 className={`text-xl font-bold mb-2 ${isDarkUI ? 'text-gray-500' : 'text-gray-600'}`}>Your radar is clear.</h3>
            <p className={isDarkUI ? 'text-gray-600' : 'text-gray-500'}>You are not currently tracking any books.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlistBooks.map(book => (
              <div key={book.id} className={`p-6 rounded-2xl border flex flex-col items-center text-center shadow-sm relative overflow-hidden transition-colors ${isDarkUI ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 hover:shadow-md'}`}>
                <div className="absolute top-4 right-4 z-20">
                  <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2 py-1 rounded-md border border-emerald-500/30">TRACKING</span>
                </div>
                
                <div className={`w-32 h-48 shrink-0 rounded-md mb-4 shadow-lg flex flex-col items-center justify-center z-10 overflow relative border ${isDarkUI ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-100'}`}>
                  {book.cover_image_url && book.cover_image_url !== 'UNAVAILABLE' ? (
                    <Image src={book.cover_image_url} alt={book.title} width={128} height={192} className="w-full h-full object-cover" />
                  ) : (
                    <Image src="/fox.png" alt="Cover Unavailable" width={128} height={192} className="w-full h-full object-cover p-2 opacity-50" />
                  )}
                </div>
                
                <h3 className={`font-bold text-lg mb-1 leading-tight line-clamp-2 w-full z-10 ${isDarkUI ? 'text-white' : 'text-gray-900'}`}>{book.title}</h3>
                <p className={`text-sm line-clamp-1 w-full z-10 ${isDarkUI ? 'text-gray-400' : 'text-gray-500'}`}>{book.author}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <FloatingMenu />
      <SpeedInsights />
    </main>
  );
}