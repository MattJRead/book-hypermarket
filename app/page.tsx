'use client';

import FloatingMenu from '../components/FloatingMenu';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '../lib/supabase';

// 🚨 UPGRADED: Added the cover_image_url to the Blueprint
type Book = {
  id: string;
  title: string;
  author: string;
  isbn13: string;
  category: string;
  cover_image_url?: string; 
};

// ==========================================
// 1. THE BOOK CARD ENGINE
// ==========================================
function BookCard({ book, isDarkMode, userId, initiallyOwned }: { book: Book, isDarkMode: boolean, userId: string | null, initiallyOwned: boolean }) {
  const [prices, setPrices] = useState<{ waterstones: string, blackwells: string } | null>(null);
  const [isLoadingPrice, setIsLoadingPrice] = useState(true);
  
  const [isOwned, setIsOwned] = useState(initiallyOwned);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setIsOwned(initiallyOwned);
  }, [initiallyOwned]);

  const cleanPrice = (raw: string) => {
    if (!raw || raw === 'Out of Stock') return 'N/A';
    const match = raw.match(/[£$€][\d.]+/);
    return match ? match[0] : raw.substring(0, 10);
  };

  const sovrnKey = 'YOUR_SOVRN_API_KEY'; 
  const amazonTag = 'YOUR_AMAZON_TAG-21'; 

  const targetWaterstones = `https://www.waterstones.com/books/search/term/${book.isbn13}`;
  const targetBlackwells = `https://blackwells.co.uk/bookshop/search/?keyword=${book.isbn13}`;

  const waterstonesLink = `https://redirect.viglink.com?key=${sovrnKey}&u=${encodeURIComponent(targetWaterstones)}`;
  const blackwellsLink = `https://redirect.viglink.com?key=${sovrnKey}&u=${encodeURIComponent(targetBlackwells)}`;
  const amazonLink = `https://www.amazon.co.uk/s?k=${book.isbn13}&tag=${amazonTag}`;

  useEffect(() => {
    async function fetchPrices() {
      try {
        const res = await fetch(`/api/prices?isbn=${book.isbn13}`);
        const data = await res.json();
        setPrices(data);
      } catch (error) {
        console.error("Failed to fetch prices");
      }
      setIsLoadingPrice(false);
    }
    fetchPrices();
  }, [book.isbn13]);

  const toggleLibrary = async () => {
    if (!userId) return;
    setIsUpdating(true);
    
    const newStatus = !isOwned;
    setIsOwned(newStatus); 

    try {
      if (newStatus) {
        await supabase.from('user_libraries').insert({ user_id: userId, book_id: book.id });
      } else {
        await supabase.from('user_libraries').delete().match({ user_id: userId, book_id: book.id });
      }
    } catch (error) {
      console.error("Failed to update vault", error);
      setIsOwned(!newStatus); 
    }
    setIsUpdating(false);
  };

  return (
    <div className={`p-6 rounded-2xl border flex flex-col items-center text-center transition-all hover:scale-[1.02] shadow-sm h-full relative overflow-hidden ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} ${isOwned ? 'ring-2 ring-emerald-500' : ''}`}>
      {isOwned && <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none"></div>}

      {/*  NEW: The Image Display */}
      <div className={`w-32 h-48 shrink-0 rounded-md mb-4 shadow-lg flex flex-col items-center justify-center z-10 overflow-hidden relative ${!book.cover_image_url ? 'border-2 border-dashed' : 'border border-gray-700'} ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-300'}`}>
        {book.cover_image_url ? (
           <Image 
             src={book.cover_image_url.replace('http:', 'https:')} 
             alt={`Cover of ${book.title}`}
             width={128}
             height={192}
             className="w-full h-full object-cover"
           />
        ) : (
          <span className="text-gray-500 text-xs font-mono uppercase tracking-widest mb-2 z-10">Cover</span>
        )}
      </div>
      
      <h3 className="font-bold text-lg mb-1 leading-tight line-clamp-2 break-words w-full z-10" title={book.title}>
        {book.title}
      </h3>
      <p className={`text-sm mb-4 line-clamp-1 break-words w-full z-10 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} title={book.author}>
        {book.author}
      </p>
      
      <div className="mt-auto w-full pt-4 border-t border-gray-800/30 z-10 flex flex-col gap-3">
        {userId && (
          <button 
            onClick={toggleLibrary}
            disabled={isUpdating}
            className={`w-full py-2 rounded-lg font-bold text-sm transition-colors flex items-center justify-center ${
              isOwned 
                ? 'bg-emerald-900/40 text-emerald-400 hover:bg-emerald-900/60 border border-emerald-800/50' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            {isOwned ? (
              <><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg> ON YOUR BOOKSHELF</>
            ) : (
              <><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg> Add to Bookshelf</>
            )}
          </button>
        )}

        {isOwned ? (
          <div className="text-xs font-mono text-emerald-500/70 mt-1">Purchase options hidden.</div>
        ) : isLoadingPrice ? (
          <div className="text-xs font-mono text-gray-500 animate-pulse">Scanning prices...</div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
             <a href={waterstonesLink} target="_blank" rel="noopener noreferrer" className={`flex flex-col items-center p-2 rounded-lg transition-colors hover:bg-sky-500/10 cursor-pointer`}>
                <span className="font-serif font-bold text-lg leading-none mb-1 text-gray-400">W</span>
                <span className={`font-bold text-xs ${prices?.waterstones && prices.waterstones !== 'Out of Stock' ? 'text-sky-500' : 'text-gray-500'}`}>
                  {cleanPrice(prices?.waterstones || '')}
                </span>
             </a>
             <a href={blackwellsLink} target="_blank" rel="noopener noreferrer" className={`flex flex-col items-center p-2 rounded-lg transition-colors hover:bg-sky-500/10 cursor-pointer`}>
                <span className="font-sans font-bold text-lg leading-none mb-1 text-gray-400">B</span>
                <span className={`font-bold text-xs ${prices?.blackwells && prices.blackwells !== 'Out of Stock' ? 'text-sky-500' : 'text-gray-500'}`}>
                  {cleanPrice(prices?.blackwells || '')}
                </span>
             </a>
             <a href={amazonLink} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center p-2 rounded-lg transition-colors hover:bg-sky-500/10 cursor-pointer">
                <span className="font-sans font-bold text-lg leading-none mb-1 text-gray-400">a</span>
                <span className="font-bold text-xs text-sky-500">Check</span>
             </a>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 2. THE CATEGORY VAULT ENGINE
// ==========================================
function CategoryVault({ title, books, isDarkMode, colorClass, onViewAll, userId, userLibrary }: { title: string, books: Book[], isDarkMode: boolean, colorClass: string, onViewAll: () => void, userId: string | null, userLibrary: string[] }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -800 : 800;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (books.length === 0) return null;

  return (
    <div className="mb-14 w-full relative group">
      <div className="flex justify-between items-end mb-6 px-8 max-w-7xl mx-auto">
        <h2 className={`text-2xl font-extrabold italic border-l-4 ${colorClass} pl-3 tracking-tight`}>{title}</h2>
        <button onClick={onViewAll} className={`text-sm font-bold flex items-center transition-all hover:translate-x-1 ${isDarkMode ? 'text-sky-400 hover:text-sky-300' : 'text-sky-600 hover:text-sky-500'}`}>
          View All <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

      <div className="relative w-full max-w-[1400px] mx-auto">
        <button onClick={() => scroll('left')} className={`absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110 ${isDarkMode ? 'bg-gray-800 text-white hover:bg-gray-600' : 'bg-white text-gray-900 hover:bg-gray-100'}`}><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg></button>
        <button onClick={() => scroll('right')} className={`absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110 ${isDarkMode ? 'bg-gray-800 text-white hover:bg-gray-600' : 'bg-white text-gray-900 hover:bg-gray-100'}`}><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg></button>
        <div className={`absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l ${isDarkMode ? 'from-gray-950 to-transparent' : 'from-white to-transparent'} pointer-events-none`}></div>
        <div className={`absolute left-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-r ${isDarkMode ? 'from-gray-950 to-transparent' : 'from-white to-transparent'} pointer-events-none`}></div>
        
        <div ref={scrollContainerRef} className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory px-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {books.map(book => (
            <div key={book.id} className="snap-start shrink-0 w-72">
              <BookCard book={book} isDarkMode={isDarkMode} userId={userId} initiallyOwned={userLibrary.includes(book.id)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. THE MAIN PAGE (Storefront HQ)
// ==========================================
export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeCategoryView, setActiveCategoryView] = useState<{name: string, books: Book[]} | null>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [userLibrary, setUserLibrary] = useState<string[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: bookData } = await supabase.from('books').select('*');
        if (bookData) setBooks(bookData);

        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUserId(session.user.id);
          const { data: libraryData } = await supabase
            .from('user_libraries')
            .select('book_id')
            .eq('user_id', session.user.id);
            
          if (libraryData) {
            setUserLibrary(libraryData.map(row => row.book_id));
          }
        }
      } catch (err) {
        console.error("Critical Vault Error: ", err);
      } finally {
        setIsLoading(false); 
      }
    }
    fetchData();
  }, []);

  const coreColors: Record<string, string> = {
    'Fiction': 'border-purple-500',
    'Non-Fiction': 'border-yellow-500',
    'Horror': 'border-red-500',
    'Learning / Educational': 'border-green-500'
  };

  const uniqueCategories = Array.from(new Set(books.map(b => b.category).filter(c => c && c !== 'General')));

  const dynamicCategories = uniqueCategories.map(catName => ({
    name: catName,
    color: coreColors[catName] || 'border-sky-500'
  }));

  const getBooksForCategory = (categoryName: string) => {
    return books.filter(b => b.category === categoryName);
  };

  const searchResults = books.filter((book) => {
    return book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           book.author.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <main className={`min-h-screen flex flex-col py-8 pb-32 transition-colors duration-300 overflow-hidden ${isDarkMode ? 'bg-gray-950 text-white' : 'bg-white text-gray-900'}`}>
      
      <header className="flex justify-center items-center mb-12 w-full relative">
        <button onClick={() => { setActiveCategoryView(null); setSearchQuery(""); }} className="hover:opacity-80 transition-opacity">
          <h1 className="flex items-baseline font-extrabold tracking-tighter">
            <span className="text-4xl lowercase">book</span>
            <span className="relative mx-1 text-5xl text-sky-400 italic inline-block px-1">
              Hyper
              <span className={`absolute left-0 right-0 h-[4px] top-[54%] -translate-y-1/2 ${isDarkMode ? 'bg-gray-950' : 'bg-white'}`}></span>
            </span>
            <span className="text-4xl lowercase">-market</span>
          </h1>
        </button>
      </header>

      {activeCategoryView ? (
        <div className="w-full relative z-10 max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b pb-4 border-gray-800">
            <h2 className="text-4xl font-extrabold tracking-tight mb-4 md:mb-0">{activeCategoryView.name}</h2>
            <button onClick={() => setActiveCategoryView(null)} className={`px-6 py-2 rounded-full font-bold flex items-center transition-all hover:-translate-x-1 ${isDarkMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg> Back to Storefront
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {activeCategoryView.books.map(book => <BookCard key={book.id} book={book} isDarkMode={isDarkMode} userId={userId} initiallyOwned={userLibrary.includes(book.id)} />)}
          </div>
        </div>
      ) : (
        <>
          <div className="w-full mb-12 flex flex-col items-center gap-6 px-4">
            <input type="text" placeholder="Search entire vault..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`w-full max-w-2xl p-4 rounded-xl border text-lg focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-xl z-20 relative ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`} />
          </div>

          <div className="w-full relative z-10">
            {isLoading ? (
              <div className="text-center py-12 text-sky-400 animate-pulse font-mono">[ Syncing Database... ]</div>
            ) : searchQuery ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto px-6">
                {searchResults.length === 0 ? <p className="col-span-full text-center">No results.</p> : searchResults.map(book => <BookCard key={book.id} book={book} isDarkMode={isDarkMode} userId={userId} initiallyOwned={userLibrary.includes(book.id)} />)}
              </div>
            ) : (
              <>
                {dynamicCategories.map(cat => {
                  const catBooks = getBooksForCategory(cat.name);
                  return <CategoryVault key={cat.name} title={cat.name} books={catBooks} isDarkMode={isDarkMode} colorClass={cat.color} onViewAll={() => setActiveCategoryView({ name: cat.name, books: catBooks })} userId={userId} userLibrary={userLibrary} />
                })}
                <CategoryVault title="All Inventory" books={books} isDarkMode={isDarkMode} colorClass="border-gray-500" onViewAll={() => setActiveCategoryView({ name: 'All Inventory', books: books })} userId={userId} userLibrary={userLibrary} />
              </>
            )}
          </div>
        </>
      )}

      {/* Floating Menu Hub */}
      <div className={`fixed bottom-28 left-1/2 -translate-x-1/2 z-40 w-64 rounded-2xl shadow-2xl border overflow-hidden transition-all duration-300 ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'} ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex flex-col">
          <Link href="/login" className={`px-6 py-4 font-bold text-center border-b text-sky-400 transition-colors ${isDarkMode ? 'border-gray-800 hover:bg-gray-800' : 'border-gray-100 hover:bg-gray-50'}`}>
            {userId ? 'My Account' : 'Sign in/Sign up'}
          </Link>
          <Link href="/retailers" className={`px-6 py-4 font-bold text-center border-b transition-colors ${isDarkMode ? 'border-gray-800 text-white hover:bg-gray-800' : 'border-gray-100 text-gray-900 hover:bg-gray-50'}`}>
            For Retailers
          </Link>
          <Link href="/about" className={`px-6 py-4 font-bold text-center border-b transition-colors ${isDarkMode ? 'border-gray-800 text-white hover:bg-gray-800' : 'border-gray-100 text-gray-900 hover:bg-gray-50'}`}>
            About Us
          </Link>
          <button onClick={() => { setIsDarkMode(!isDarkMode); setIsMenuOpen(false); }} className={`px-6 py-4 font-bold text-center transition-colors ${isDarkMode ? 'text-gray-400 hover:bg-gray-800 hover:text-white' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
            {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
          {userId && (
            <button onClick={async () => { await supabase.auth.signOut(); window.location.reload(); }} className={`px-6 py-4 font-bold text-center text-red-400 transition-colors ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}>
              Sign Out
            </button> 
          )}
        </div>
      </div>

      <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 p-4 rounded-full shadow-[0_0_30px_rgba(14,165,233,0.3)] transition-transform hover:scale-110 active:scale-95 flex items-center justify-center ${isDarkMode ? 'bg-sky-500 text-white' : 'bg-gray-900 text-white'}`}>
        {isMenuOpen ? <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg> : <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 8h16M4 16h16" /></svg>}
      </button> 

      {isMenuOpen && <div className="fixed inset-0 z-30" onClick={() => setIsMenuOpen(false)}></div>}
    <FloatingMenu />
    </main>
  );
}