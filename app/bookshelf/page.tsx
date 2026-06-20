'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '../../lib/supabase';
import FloatingMenu from '../../components/FloatingMenu';
import { SpeedInsights } from "@vercel/speed-insights/next";
import { useTheme } from '../../components/ThemeProvider';

type Book = {
  id: string;
  title: string;
  author: string;
  isbn13: string;
  category: string;
  cover_image_url?: string; 
};

export default function PrivateCatalogue() {
  const [libraryBooks, setLibraryBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  useEffect(() => {
    async function fetchLibrary() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data, error } = await supabase
          .from('user_libraries')
          .select('book_id, books(*)')
          .eq('user_id', session.user.id);
          
        if (data && !error) {
          const extractedBooks = data
            .map(row => row.books)
            .flat()
            .filter(Boolean) as Book[];
            
          setLibraryBooks(extractedBooks);
        }
      }
      setIsLoading(false);
    }
    fetchLibrary();
  }, []);

  // Sleek removal function to match your UI needs
  const removeFromVault = async (bookId: string) => {
    // Optimistically update UI instantly for a snappy feel
    setLibraryBooks(prev => prev.filter(b => b.id !== bookId));
    
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase
        .from('user_libraries')
        .delete()
        .match({ user_id: session.user.id, book_id: bookId });
    }
  };

  return (
    <main className="min-h-screen flex flex-col pb-24">  
      
      {/* Top Header & Navigation Section */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        
        {/* Back Button - Now correctly positioned on the top left */}
        <div className="flex justify-start mb-10">
          <Link href="/" className="group flex items-center space-x-2 text-gray-400 hover:text-emerald-400 transition-colors bg-gray-800/40 hover:bg-gray-800/80 px-5 py-2.5 rounded-xl backdrop-blur-md border border-white/5 shadow-sm">
            <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-semibold text-sm tracking-wide">Return to Storefront</span>
          </Link>
        </div>

        {/* Beautiful Modern Title Area */}
        <header className="mb-12">
          <div className="flex items-center space-x-4 mb-2">
            <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              My Private Catalogue
            </h1>
          </div>
          <p className="text-gray-400 text-lg font-medium max-w-2xl">
            Books securely locked in your vault.
          </p>
        </header>

        {/* Database Content Rendering */}
        <div className="w-full relative z-10">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-emerald-400 animate-pulse">
              <svg className="w-12 h-12 mb-4 animate-spin opacity-50" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="font-mono text-sm uppercase tracking-widest">Decrypting Vault...</span>
            </div>
          ) : libraryBooks.length === 0 ? (
            <div className="flex flex-col items-center text-center py-24 border border-dashed border-gray-700 rounded-3xl bg-gray-900/20 backdrop-blur-sm">
              <svg className="w-16 h-16 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 className="text-2xl font-bold text-gray-400 mb-2">Your vault is empty</h3>
              <p className="text-gray-500">Return to the storefront to start securing titles.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
              {libraryBooks.map(book => (
                <div key={book.id} className="group relative flex flex-col bg-gray-900/60 backdrop-blur-md rounded-2xl border border-gray-700/50 hover:border-emerald-500/50 transition-all duration-300 overflow-hidden shadow-lg hover:shadow-emerald-500/10">
                  
                  {/* Subtle Top Badge */}
                  <div className="absolute top-3 right-3 z-20 pointer-events-none">
                    <span className="bg-emerald-500/20 text-emerald-400 text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full border border-emerald-500/20 shadow-sm backdrop-blur-md">
                      Vaulted
                    </span>
                  </div>
                  
                  {/* Image Container with precise aspect ratio */}
                  <div className="relative w-full aspect-[2/3] bg-gray-950 flex items-center justify-center overflow-hidden">
                    {book.cover_image_url && book.cover_image_url !== 'UNAVAILABLE' ? (
                      <Image 
                        src={book.cover_image_url} 
                        alt={book.title} 
                        fill 
                        className="object-cover transition-transform duration-500 group-hover:scale-105" 
                      />
                    ) : (
                      <Image 
                        src="/fox.png" 
                        alt="Cover Unavailable" 
                        width={80} 
                        height={80} 
                        className="opacity-40 transition-transform duration-500 group-hover:scale-110" 
                      />
                    )}
                    {/* Dark gradient overlay to make bottom of image look sleek */}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-80"></div>
                  </div>
                  
                  {/* Text Content */}
                  <div className="flex flex-col flex-grow p-4 relative z-10 -mt-8">
                    <h3 className="font-bold text-gray-100 text-sm sm:text-base leading-tight line-clamp-2 mb-1 drop-shadow-md">
                      {book.title}
                    </h3>
                    <p className="text-xs text-gray-400 line-clamp-1 mb-4">
                      {book.author}
                    </p>
                    
                    {/* Modern Action Button */}
                    <div className="mt-auto pt-4 border-t border-gray-700/50">
                      <button 
                        onClick={() => removeFromVault(book.id)}
                        className="w-full py-2.5 text-xs font-bold tracking-wider text-red-400/80 hover:text-red-400 bg-red-400/5 hover:bg-red-500/10 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>REMOVE</span>
                      </button>
                    </div>
                  </div>
                  
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <FloatingMenu />
      <SpeedInsights />
    </main>
  );
}