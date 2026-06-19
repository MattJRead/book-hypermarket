'use client';
import FloatingMenu from '../../components/FloatingMenu';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SpeedInsights } from "@vercel/speed-insights/next"
import { useTheme } from '@/components/ThemeProvider';

type Book = {
  id: string;
  title: string;
  author: string;
  isbn13: string;
  category: string;
};

export default function PersonalLibrary() {
  const [myBooks, setMyBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchMyLibrary() {
      const { data: { session } } = await supabase.auth.getSession();
      
      // If not logged in, bounce them to the login page immediately
      if (!session?.user) {
        router.push('/login');
        return;
      }

      // 1. Get the IDs of the books they own
      const { data: ownedData } = await supabase
        .from('user_libraries')
        .select('book_id')
        .eq('user_id', session.user.id);

      if (ownedData && ownedData.length > 0) {
        const ownedBookIds = ownedData.map(row => row.book_id);

        // 2. Fetch the actual book details matching those IDs
        const { data: booksData } = await supabase
          .from('books')
          .select('*')
          .in('id', ownedBookIds);

        if (booksData) setMyBooks(booksData);
      }
      setIsLoading(false);
    }

    fetchMyLibrary();
  }, [router]);

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <header className="flex justify-between items-center mb-12 max-w-6xl mx-auto border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-emerald-400 flex items-center">
            <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            My Private Catalogue
          </h1>
          <p className="text-gray-400 mt-2">Books securely locked in your vault.</p>
        </div>
        <Link href="/" className="px-6 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 font-bold transition-colors">
          Return to Storefront
        </Link>
      </header>

      <div className="max-w-6xl mx-auto">
        {isLoading ? (
          <div className="text-center py-12 text-sky-400 animate-pulse font-mono">[ Accessing Vault Records... ]</div>
        ) : myBooks.length === 0 ? (
          <div className="text-center py-24 bg-gray-900 rounded-2xl border border-gray-800 border-dashed">
            <p className="text-xl text-gray-400 mb-4">Your vault is currently empty.</p>
            <Link href="/" className="text-sky-400 hover:text-sky-300 font-bold">
              Browse the Storefront to start adding books →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {myBooks.map(book => (
              <div key={book.id} className="bg-gray-900 p-4 rounded-xl border border-gray-800 flex flex-col items-center text-center shadow-lg hover:border-emerald-500/50 transition-colors">
                <div className="w-24 h-36 bg-gray-800 rounded mb-4 flex items-center justify-center border border-gray-700">
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest">Cover</span>
                </div>
                <h3 className="font-bold text-sm mb-1 leading-tight line-clamp-2">{book.title}</h3>
                <p className="text-xs text-gray-400">{book.author}</p>
                
                {/* Instant Remove Button */}
                <button 
                  onClick={async () => {
                    await supabase.from('user_libraries').delete().eq('book_id', book.id);
                    setMyBooks(myBooks.filter(b => b.id !== book.id));
                  }}
                  className="mt-4 text-xs font-bold text-red-500/70 hover:text-red-400 transition-colors pt-3 border-t border-gray-800 w-full"
                >
                  Remove from Vault
                </button>
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