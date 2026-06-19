'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '../../lib/supabase';
import FloatingMenu from '../../components/FloatingMenu';
import { SpeedInsights } from "@vercel/speed-insights/next"

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
          const extractedBooks = data.map(row => row.books).flat() as Book[];
          setWishlistBooks(extractedBooks);
        }
      }
      setIsLoading(false);
    }
    fetchWishlist();
  }, []);

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col py-8 pb-32">
      
      <header className="flex flex-col justify-center items-center mb-12 w-full max-w-7xl mx-auto px-6 relative">
        <div className="w-full flex justify-start mb-6">
          <Link href="/" className="px-6 py-2 rounded-full font-bold flex items-center transition-all hover:-translate-x-1 bg-gray-800 text-white hover:bg-gray-700">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg> 
            Back to Storefront
          </Link>
        </div>
        
        <h1 className="text-4xl font-extrabold tracking-tight text-emerald-400">
          🎯 My Wishlist
        </h1>
        <p className="text-gray-400 mt-2 font-mono text-sm">Tracking targets for price drops</p>
      </header>

      <div className="w-full relative z-10 max-w-7xl mx-auto px-6">
        {isLoading ? (
          <div className="text-center py-12 text-emerald-400 animate-pulse font-mono">[ Syncing Wishlist... ]</div>
        ) : wishlistBooks.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-gray-800 rounded-2xl bg-gray-900/50">
            <h3 className="text-xl font-bold text-gray-500 mb-2">Your radar is clear.</h3>
            <p className="text-gray-600">You are not currently tracking any books.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlistBooks.map(book => (
              <div key={book.id} className="p-6 rounded-2xl border bg-gray-900 border-gray-800 flex flex-col items-center text-center shadow-sm relative overflow-hidden">
                <div className="absolute top-4 right-4 z-20">
                  <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2 py-1 rounded-md border border-emerald-500/30">TRACKING</span>
                </div>
                
                <div className="w-32 h-48 shrink-0 rounded-md mb-4 shadow-lg flex flex-col items-center justify-center z-10 overflow-hidden relative border border-gray-700 bg-gray-800">
                  {book.cover_image_url ? (
                    <Image src={book.cover_image_url} alt={book.title} width={128} height={192} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-500 text-xs font-mono uppercase tracking-widest z-10">Cover</span>
                  )}
                </div>
                
                <h3 className="font-bold text-lg mb-1 leading-tight line-clamp-2 w-full z-10">{book.title}</h3>
                <p className="text-sm text-gray-400 line-clamp-1 w-full z-10">{book.author}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* THE GLOBAL MENU INJECTION */}
      <FloatingMenu />
      <SpeedInsights />
    </main>
  );
}