'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '../lib/supabase'; // Adjust path if your supabase client is elsewhere

type Book = {
  id: string;
  title: string;
  author: string;
  category: string;
  cover_image_url?: string; 
};

export default function GlobalVaultFeed() {
  const [vaultBooks, setVaultBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchGlobalVault() {
      // Fetch the 10 most recently saved books across the entire platform
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false }) 
        .limit(10);
        
      if (data && !error) {
        setVaultBooks(data);
      } else if (error) {
        console.error("[Vault Feed] Error reading global catalogue:", error);
      }
      setIsLoading(false);
    }
    fetchGlobalVault();
  }, []);

  if (isLoading) {
    return <div className="animate-pulse text-emerald-400 font-mono text-center py-12">[ Syncing Global Vault... ]</div>;
  }
  
  // If the vault is completely empty, the component hides itself so it doesn't break your UI
  if (vaultBooks.length === 0) return null; 

  return (
    <section className="w-full max-w-7xl mx-auto px-6 my-12 relative z-10">
      
      {/* Sleek Section Header */}
      <div className="flex items-center space-x-3 mb-8">
        <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <h2 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
          Recently Vaulted
        </h2>
      </div>

      {/* Horizontal Scrolling Carousel (Hides scrollbar for a clean look) */}
      <div className="flex overflow-x-auto pb-8 space-x-4 sm:space-x-6 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
        {vaultBooks.map(book => (
          <div key={book.id} className="snap-start shrink-0 w-36 sm:w-48 group relative flex flex-col bg-gray-900/60 backdrop-blur-md rounded-2xl border border-gray-700/50 hover:border-emerald-500/50 transition-all duration-300 overflow-hidden shadow-lg hover:shadow-emerald-500/10 cursor-pointer">
            
            {/* Image Container */}
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
                  width={60} 
                  height={60} 
                  className="opacity-40 transition-transform duration-500 group-hover:scale-110" 
                />
              )}
              {/* Sleek shadow overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-90"></div>
            </div>
            
            {/* Text Overlay */}
            <div className="flex flex-col flex-grow p-4 relative z-10 -mt-8">
              <h3 className="font-bold text-gray-100 text-xs sm:text-sm leading-tight line-clamp-2 mb-1 drop-shadow-md">
                {book.title}
              </h3>
              <p className="text-[10px] sm:text-xs text-gray-400 line-clamp-1">
                {book.author}
              </p>
            </div>
            
          </div>
        ))}
      </div>
    </section>
  );
}